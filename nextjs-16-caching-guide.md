# Next.js 16 Caching — Cache Components, `use cache`, and Prefetching

This reflects the current Next.js docs (v16.3.1, updated August 2026). Caching in v16 works nothing like v13–15 — if you've read older tutorials or even asked an LLM trained on older data, throw that mental model out. The core change: **caching used to be automatic and you had to opt out. Now it's off by default and you opt in.**

---

## 1. The one thing to understand before anything else

Before v16, the App Router cached a lot of things silently — fetches, whole routes — and you had to learn a pile of rules to figure out why something was stale or why a page rendered statically when you expected it fresh. It was a constant source of "wait, why is this cached?" bugs.

Next.js 16 introduces **Cache Components**, which flips that default entirely. Once enabled:

- Every page, layout, and route runs dynamically (fresh, per request) by default.
- Nothing is cached unless you explicitly mark it with `'use cache'`.

Everything else in this doc — `cacheLife`, `cacheTag`, prefetching — is built on top of that one rule.

## 2. Turning it on

It's a flag in your config:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig
```

If you're adding this to an existing app, expect a performance dip right after — pages that used to be cached automatically now render dynamically until you go back and cache the parts that matter.

## 3. `use cache` — the core directive

This one directive marks a function, component, or entire file as cacheable. It works at three levels.

**File level** — put it at the top of the file, every exported function in that file gets cached:

```tsx
'use cache'

export default async function BlogPage() {
  const posts = await getAllPosts()
  return (
    <main>
      {posts.map((post) => (
        <ArticleCard key={post.id} post={post} />
      ))}
    </main>
  )
}
```

Good for pages with zero per-user content — marketing pages, docs, a blog index.

**Component level** — cache just one piece, leave the rest of the page dynamic:

```tsx
async function ProductGrid({ category }: { category: string }) {
  'use cache'
  const products = await getProducts(category)
  return <Grid items={products} />
}
```

This is where it gets useful — a product grid can sit right next to a "logged in as X" banner that stays fully dynamic, on the same page.

**Function level** — cache raw data-fetching, no UI involved:

```tsx
async function getSettings() {
  'use cache'
  return db.settings.findFirst()
}
```

Handy when the same data gets read from more than one place — cache it once at the source.

One rule applies everywhere: **anything using `use cache` must be `async`.**

### Cache keys are automatic

You never write a cache key by hand. Next.js builds one from the build ID, a hash of where the function lives in your code, and its arguments — including anything it closes over from an outer scope:

```tsx
async function Product({ id }: { id: string }) {
  const getReviews = async (sort: string) => {
    'use cache'
    return db.reviews.find({ productId: id, sort })
  }

  return getReviews('newest')
}
```

`id` comes from the closure, `sort` is a normal argument — both become part of `getReviews`'s cache key. Different `id` + `sort` pairs each get their own entry, automatically.

### What it can't touch

Cached functions run in an isolated scope — they can't call `cookies()`, `headers()`, or read `searchParams` directly. Next.js throws if you try. That's on purpose: those values are per-request, and the whole point of a cached function is to be reused across requests.

If you need one of those values inside cached logic, read it outside the cache boundary first and pass it in:

```tsx
async function ProfilePage() {
  const sessionId = (await cookies()).get('session')?.value
  return <CachedProfile sessionId={sessionId} />
}

async function CachedProfile({ sessionId }: { sessionId?: string }) {
  'use cache'
  const data = await getUserData(sessionId)
  return <div>{data.name}</div>
}
```

`sessionId` becomes part of the cache key, so each user gets their own entry — the cookie read itself just happens outside the cached scope.

(There's also `'use cache: private'`, a variant for when you genuinely can't restructure code this way and need to read `cookies()`/`headers()` inside the cached scope. It only caches in the browser, never on the server. It's still experimental — reach for the pattern above first.)

## 4. `cacheLife` — how long something stays cached

Three knobs, and they answer three different questions:

- **stale** — how long the browser can reuse what it already has without asking the server at all.
- **revalidate** — how often the server quietly refreshes its own copy in the background.
- **expire** — the hard cutoff. Past this, the next request has to wait for a fresh copy instead of getting a fast-but-old one.

```tsx
async function getData() {
  'use cache'
  cacheLife({ stale: 3600, revalidate: 900, expire: 86400 })
  return fetch('/api/data').then((r) => r.json())
}
```

Reading that: the browser can reuse this for an hour without checking in. The server refreshes its own copy every 15 minutes in the background. If literally nobody hits this for a full day, the next person waits for a fresh fetch instead of getting stale data.

### Preset profiles

You'll use these way more often than inline objects:

| Profile | Good for | stale | revalidate | expire |
|---|---|---|---|---|
| `default` | anything with no explicit profile | 5 min | 15 min | never |
| `seconds` | live data — scores, prices | 30 sec | 1 sec | 1 min |
| `minutes` | social feeds, news | 5 min | 1 min | 1 hour |
| `hours` | inventory, weather | 5 min | 1 hour | 1 day |
| `days` | blog posts | 5 min | 1 day | 1 week |
| `weeks` | newsletters, podcasts | 5 min | 1 week | 30 days |
| `max` | legal pages, stuff that rarely changes | 5 min | 30 days | 1 year |

```tsx
async function BlogPost({ slug }: { slug: string }) {
  'use cache'
  cacheLife('days')
  return getPost(slug)
}
```

Pick the name that matches how often the underlying data actually changes — don't overthink it.

### Custom profiles

If the presets don't fit, define your own in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    editorial: { stale: 600, revalidate: 3600, expire: 86400 },
  },
}
```

Then `cacheLife('editorial')` anywhere in your app.

**Always set `cacheLife` explicitly.** Skip it and the `default` profile applies silently — fine for a prototype, but it means you can't look at a function and know its behavior without checking what nested caches it depends on.

## 5. Invalidating on demand: `cacheTag`, `revalidateTag`, `updateTag`

`cacheLife` handles stuff that goes stale on a schedule. A lot of data doesn't work that way — it changes because of a specific action (someone edits a post, updates their name). For that, tag the cache and invalidate the tag when the action happens.

Tag it:

```tsx
async function getProducts() {
  'use cache'
  cacheLife('hours')
  cacheTag('products')
  return db.product.findMany()
}
```

Invalidate it from wherever the write happens. There are two ways to do this, and picking the wrong one is a real, common bug:

**`revalidateTag(tag, profile)`** — marks the tag stale. The very next visitor still gets the old cached version instantly; Next.js fetches a fresh copy in the background for whoever comes after. Use `'max'` as the profile for the recommended stale-while-revalidate behavior.

```tsx
'use server'

export async function renameProduct(id: string, name: string) {
  await db.product.update({ where: { id }, data: { name } })
  revalidateTag('products', 'max')
}
```

**`updateTag(tag)`** — expires the tag immediately. The very next request waits for fresh data, no stale version served. Only callable from Server Actions.

```tsx
'use server'

export async function renameProduct(id: string, name: string) {
  await db.product.update({ where: { id }, data: { name } })
  updateTag('products')
}
```

One question tells you which to use: **does the person who just made the change need to see it right away?**

| | `updateTag` | `revalidateTag` |
|---|---|---|
| Callable from | Server Actions only | Server Actions & Route Handlers |
| Next request | waits for fresh data | serves stale, refreshes in the background |
| Best for | read-your-own-writes — a form save, a toggle | webhooks, background/scheduled updates |

Someone renaming a product from an admin panel expects the new name to show up immediately after they hit save → `updateTag`. A webhook from your CMS telling you a post changed, with nobody actively staring at the page → `revalidateTag('posts', 'max')`.

## 6. Letting the genuinely dynamic stuff stream in

Not everything belongs in a cache — a live cart total, "welcome back" text, anything that must be correct on every single request. Wrap that in `Suspense` instead:

```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      <BlogPosts />
      <Suspense fallback={<p>Loading your cart...</p>}>
        <CartSummary />
      </Suspense>
    </>
  )
}
```

`BlogPosts` (cached) and the fallback text both ship instantly as part of the page's static shell. `CartSummary` — uncached, reading live data — streams in right after, once it actually resolves on the server.

## 7. The static shell, the App Shell, and Partial Prerendering

At build time, Next.js renders as much of a route as it possibly can ahead of time: every `use cache` result that's ready, every Suspense fallback, anything that doesn't depend on the incoming request. That combined output is the route's **static shell** — it can be served straight from a CDN, no server roundtrip.

Now take a route like `/products/[id]` where you haven't pre-generated every possible `id`. Next.js still builds a shell for it — just with the `id`-specific parts left out, sitting behind their Suspense fallbacks. That version, reusable by any link pointing at the route regardless of which specific `id`, is called the **App Shell**. This distinction matters a lot for prefetching, next section.

## 8. Prefetching — what happens before you even click

With Cache Components on, turn on Partial Prefetching too:

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
}
```

With this enabled, every `<Link>` prefetches its destination's **App Shell** the moment it scrolls into the viewport. One shell per route, shared — a page with 50 links to the same product route doesn't trigger 50 downloads, just one shared shell fetched once. Whatever's still missing (the dynamic bits behind Suspense) streams in normally after the actual click.

Without `partialPrefetching`, prefetching goes back to the older all-or-nothing model: static routes get fully prefetched, dynamic routes get skipped unless they have a `loading.js`.

## 9. `prefetch={true}` — resolving URL-specific data ahead of the click

`params` and `searchParams` are what Next.js calls **URL data** — they're different for every link even when the links point at the same route, so they can't live in the one shared App Shell. By default, anything depending on them streams in after the click, same as any other dynamic content.

`<Link prefetch={true}>` changes that for one specific link: Next.js re-runs the destination route's component tree at prefetch time, this time with that link's actual URL already resolved. Any `use cache` function reading the resolved `params`/`searchParams` as arguments can now finish during the prefetch and ride along with it.

```tsx
async function getResults(query: string) {
  'use cache'
  return db.search(query)
}

async function Results({
  searchParams,
}: Pick<PageProps<'/search'>, 'searchParams'>) {
  const { q } = await searchParams
  return <ResultList results={await getResults(q)} />
}

export default function SearchPage({
  searchParams,
}: PageProps<'/search'>) {
  return (
    <Suspense fallback={<Skeleton />}>
      <Results searchParams={searchParams} />
    </Suspense>
  )
}
```

```tsx
<Link href="/search?q=shoes" prefetch={true}>Shoes</Link>
```

Without `prefetch={true}`, this link loads the search page's App Shell instantly, and the result list streams in after the click. With it, Next.js resolves `q=shoes` ahead of time and runs `getResults('shoes')` during the prefetch — the cached results are already sitting in the browser by the time someone actually clicks.

This isn't free — it costs a server invocation per prefetchable link. Slapping `prefetch={true}` on every row of a 500-row table will flood your server with prefetch requests. Save it for links where resolving early actually pays off: a handful of featured queries, category filters, pagination a user is likely to hit next.

One more thing worth knowing: `cookies()`/`headers()` (session data) are not URL data — session content already rides along inside the App Shell itself, since it's the same regardless of which link got clicked. `prefetch={true}` is specifically for `params`/`searchParams`, not for fixing a cookie-dependent component.

## 10. `use cache` vs `prefetch={true}` — when to reach for which

They're not competing options. They solve different problems and usually work together:

- `use cache` decides **whether something gets cached at all**, and for how long.
- `prefetch={true}` decides **whether one specific link resolves that already-cached data ahead of the click**, for content tied to that link's URL.

| Situation | What to do |
|---|---|
| Same content for everyone, no URL dependency | `use cache` + a `cacheLife`. Already in the App Shell — no `prefetch={true}` needed. |
| Depends on `cookies()`/`headers()` (session, not URL) | Read the value outside `use cache`, pass it in as an argument. Still lands in the App Shell on its own. |
| Depends on `params`/`searchParams`, and you want it ready before the click | `use cache` the function reading the resolved value, *then* add `prefetch={true}` on links pointing at it. |
| Depends on URL data, but streaming in after the click is acceptable | `use cache` it for fast repeat visits, skip `prefetch={true}`. |
| Genuinely different every request (live counter, cart) | Don't cache it at all. Suspense only — `prefetch={true}` would just prefetch something stale. |

The short version: **if it isn't cached, `prefetch={true}` has nothing to grab ahead of time.** Cache first, then decide per-link whether resolving early is worth the extra server hit.

## 11. Putting it together

A product page combining most of the above:

```tsx
// app/store/[slug]/page.tsx
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { cacheLife, cacheTag } from 'next/cache'

async function getProduct(slug: string) {
  'use cache'
  cacheLife('hours')
  cacheTag('products', `product-${slug}`)
  return db.product.findUnique({ where: { slug } })
}

async function getCartCount(userId?: string) {
  'use cache'
  cacheLife('minutes')
  return db.cart.count({ where: { userId } })
}

async function ProductDetails({
  params,
}: Pick<PageProps<'/store/[slug]'>, 'params'>) {
  const { slug } = await params
  const product = await getProduct(slug)
  return <Details product={product} />
}

async function CartBadge() {
  const userId = (await cookies()).get('uid')?.value
  const count = await getCartCount(userId)
  return <span>{count}</span>
}

export default function ProductPage({
  params,
}: PageProps<'/store/[slug]'>) {
  return (
    <div>
      <Nav
        cart={
          <Suspense fallback="…">
            <CartBadge />
          </Suspense>
        }
      />
      <Suspense fallback={<Skeleton />}>
        <ProductDetails params={params} />
      </Suspense>
    </div>
  )
}
```

Walking through it: `Nav` and the cart's fallback ship instantly as part of the static shell. `getProduct` is cached per slug for an hour and tagged, so an admin action can call `revalidateTag('product-blue-sneakers', 'max')` and clear just that one product without touching the rest. `getCartCount` is cached per user — `userId` flows in as an argument, so it's part of the cache key, but the cookie read itself stays outside the cached scope. Because `slug` is URL data, `ProductDetails` streams in after navigation by default — link to it with `prefetch={true}` from a product list, and that specific product's cached details are ready before the click lands:

```tsx
<Link href={`/store/${product.slug}`} prefetch={true}>
  {product.name}
</Link>
```

## 12. Gotchas worth knowing up front

- Skipping `cacheLife` doesn't mean "no cache" — it silently applies the `default` profile (15 min server refresh). Set it explicitly.
- A new deploy wipes every cache entry — the build ID is baked into the cache key, always.
- Cached functions can't call `cookies()`, `headers()`, or read `searchParams` directly — pull the value out first, pass it in.
- Nesting a short-lived cache (`cacheLife('seconds')`) inside a cache with no explicit `cacheLife` fails the build outright — Next.js won't let a 1-second cache silently drag its parent down to 1 second too. Give the outer one its own explicit lifetime.
- `prefetch={true}` costs a server round-trip per link. Don't put it on every row of a long list.
- On serverless hosting, the default in-memory cache doesn't reliably survive between requests — each one can land on a different instance. Self-hosted deployments keep it in memory across requests. For a durable shared cache, there's `'use cache: remote'` — still experimental as of this writing.

## Cheat sheet

| Tool | What it does |
|---|---|
| `cacheComponents: true` | turns on the whole opt-in caching model |
| `'use cache'` | marks a function/component/file as cacheable |
| `cacheLife('profile')` | sets stale / revalidate / expire for that cache |
| `cacheTag('name')` | labels a cache entry so you can target it later |
| `revalidateTag(tag, 'max')` | marks a tag stale — next visitor gets old data instantly, fresh loads in the background |
| `updateTag(tag)` | expires a tag immediately — next request waits for fresh data (Server Actions only) |
| `partialPrefetching: true` | `<Link>` prefetches a shared per-route App Shell by default |
| `<Link prefetch={true}>` | resolves that link's specific `params`/`searchParams` ahead of the click |
| `<Suspense>` | fallback boundary for anything left uncached/dynamic |

---

**Sources:** nextjs.org/docs — `use cache` directive, `cacheLife`, `cacheTag`, `updateTag`, `revalidateTag`, Getting Started: Caching, Guides: Prefetching, Adopting Partial Prefetching, Instant Navigation — all current as of Next.js docs version 16.3.1 (August 2026).
