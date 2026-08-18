/**
 * Multi-tier favicon and page metadata extractor.
 * 
 * 1. HTML <link rel="icon" | "apple-touch-icon" | "shortcut icon"> scraping (High-Res SVG/PNG)
 * 2. Root /favicon.ico fallback
 * 3. DuckDuckGo Icon Service fallback
 * 4. Google S2 Favicons fallback
 */

export interface PageMetadata {
  title?: string | null;
  description?: string | null;
  faviconUrl?: string | null;
}

export function getFallbackFaviconUrl(url: string, provider: "duckduckgo" | "google" = "duckduckgo"): string | null {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, "");
    if (!domain) return null;
    if (provider === "duckduckgo") {
      return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    }
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}

export async function extractPageMetadata(urlStr: string): Promise<PageMetadata> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlStr);
  } catch {
    return { title: null, description: null, faviconUrl: null };
  }

  const defaultDuckDuckGo = `https://icons.duckduckgo.com/ip3/${parsedUrl.hostname.replace(/^www\./, "")}.ico`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(urlStr, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        title: null,
        description: null,
        faviconUrl: defaultDuckDuckGo,
      };
    }

    const html = await response.text();

    // 1. Extract Title
    let title: string | null = null;
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
      // Decode HTML entities if any
      title = title
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&mdash;/g, "—")
        .replace(/&ndash;/g, "–");
    }

    // 2. Extract Description
    let description: string | null = null;
    const descMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i) ||
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    if (descMatch && descMatch[1]) {
      description = descMatch[1].trim();
    }

    // 3. Extract Favicon
    let faviconUrl: string | null = null;

    // Prioritize SVG, apple-touch-icon, and high-res icons
    const linkMatches = Array.from(html.matchAll(/<link[^>]+>/gi));
    const iconLinks: { href: string; rel: string; sizes?: string; type?: string }[] = [];

    for (const match of linkMatches) {
      const tag = match[0];
      const relMatch = tag.match(/rel=["']([^"']+)["']/i);
      const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
      const sizesMatch = tag.match(/sizes=["']([^"']+)["']/i);
      const typeMatch = tag.match(/type=["']([^"']+)["']/i);

      if (relMatch && hrefMatch) {
        const rel = relMatch[1].toLowerCase();
        if (
          rel.includes("icon") ||
          rel.includes("apple-touch-icon") ||
          rel.includes("shortcut") ||
          rel.includes("fluid-icon")
        ) {
          iconLinks.push({
            href: hrefMatch[1],
            rel,
            sizes: sizesMatch ? sizesMatch[1] : undefined,
            type: typeMatch ? typeMatch[1] : undefined,
          });
        }
      }
    }

    if (iconLinks.length > 0) {
      // Find best icon candidate:
      // Prefer SVG > apple-touch-icon > standard icon > shortcut icon
      const svgIcon = iconLinks.find((l) => l.type?.includes("svg") || l.href.endsWith(".svg"));
      const appleIcon = iconLinks.find((l) => l.rel.includes("apple-touch-icon"));
      const standardIcon = iconLinks.find((l) => l.rel === "icon");
      const anyIcon = iconLinks[0];

      const bestCandidate = svgIcon || appleIcon || standardIcon || anyIcon;
      if (bestCandidate?.href) {
        try {
          faviconUrl = new URL(bestCandidate.href, response.url || parsedUrl.origin).href;
        } catch {
          // If relative URL fails to parse
          faviconUrl = null;
        }
      }
    }

    // If no HTML link found, fallback to root /favicon.ico or DuckDuckGo
    if (!faviconUrl) {
      faviconUrl = `${parsedUrl.origin}/favicon.ico`;
    }

    return {
      title,
      description,
      faviconUrl,
    };
  } catch (error) {
    // Network / timeout failure fallback to DuckDuckGo
    return {
      title: null,
      description: null,
      faviconUrl: defaultDuckDuckGo,
    };
  }
}
