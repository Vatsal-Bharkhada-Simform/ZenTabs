/**
 * DESIGN SYSTEM SHOWCASE — Phase 0 review page
 * ───────────────────────────────────────────────
 * Temporary route at /design-system for visual inspection.
 * DELETE this route group after Phase 0 sign-off.
 */

import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Kbd } from "@/components/ui/Kbd";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section style={{ marginBottom: "var(--space-16)" }}>
    <p
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        textTransform: "uppercase",
        letterSpacing: "var(--tracking-widest)",
        color: "var(--color-text-muted)",
        marginBottom: "var(--space-6)",
        borderBottom: "1px solid var(--color-border-strong)",
        paddingBottom: "var(--space-3)",
      }}
    >
      {title}
    </p>
    {children}
  </section>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "var(--space-3)",
      marginBottom: "var(--space-4)",
    }}
  >
    {children}
  </div>
);

export default function DesignSystemPage() {
  return (
    <main
      style={{
        maxWidth: "var(--prose-max-width)",
        margin: "0 auto",
        padding: "var(--space-16) var(--space-6)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "var(--space-16)" }}>
        <Badge variant="default" style={{ marginBottom: "var(--space-4)" }}>
          Phase 0 — Design System
        </Badge>
        <h1
          style={{
            fontSize: "var(--text-4xl)",
            fontWeight: 800,
            letterSpacing: "var(--tracking-tight)",
            marginBottom: "var(--space-3)",
            lineHeight: "var(--leading-tight)",
          }}
        >
          Component Library
        </h1>
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "40ch" }}>
          Visual reference for all primitive components. Delete this route after
          Phase 0 sign-off.
        </p>
      </div>

      {/* ── COLORS ── */}
      <Section title="Color Palette">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {[
            { label: "Canvas", value: "var(--color-canvas)" },
            { label: "Surface", value: "var(--color-surface)", bordered: true },
            { label: "Surface Alt", value: "var(--color-surface-alt)" },
            { label: "CTA", value: "var(--color-cta-bg)" },
            { label: "Red", value: "var(--color-accent-red-bg)" },
            { label: "Blue", value: "var(--color-accent-blue-bg)" },
            { label: "Green", value: "var(--color-accent-green-bg)" },
            { label: "Yellow", value: "var(--color-accent-yellow-bg)" },
          ].map(({ label, value, bordered }) => (
            <div key={label}>
              <div
                style={{
                  height: 56,
                  borderRadius: "var(--radius-md)",
                  background: value,
                  border: bordered
                    ? "1px solid var(--color-border-strong)"
                    : "none",
                  marginBottom: "var(--space-2)",
                }}
              />
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── TYPOGRAPHY ── */}
      <Section title="Typography">
        {[
          { size: "var(--text-7xl)", weight: 800, label: "Display — 72px / 800" },
          { size: "var(--text-5xl)", weight: 700, label: "H1 — 48px / 700" },
          { size: "var(--text-3xl)", weight: 700, label: "H2 — 30px / 700" },
          { size: "var(--text-xl)", weight: 600, label: "H3 — 20px / 600" },
          { size: "var(--text-base)", weight: 400, label: "Body — 16px / 400" },
          { size: "var(--text-sm)", weight: 400, label: "Small — 14px / 400" },
          { size: "var(--text-xs)", weight: 400, label: "Micro — 12px / 400" },
        ].map(({ size, weight, label }) => (
          <p
            key={label}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: size,
              fontWeight: weight,
              letterSpacing: "var(--tracking-tight)",
              lineHeight: "var(--leading-tight)",
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-3)",
            }}
          >
            {label}
          </p>
        ))}
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
            background: "var(--color-surface-alt)",
            display: "inline-block",
            padding: "var(--space-1) var(--space-2)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border-strong)",
          }}
        >
          Space Mono — code / metadata
        </p>
      </Section>

      {/* ── BUTTONS ── */}
      <Section title="Button">
        <Row>
          <Button variant="primary" id="btn-primary">Primary</Button>
          <Button variant="secondary" id="btn-secondary">Secondary</Button>
          <Button variant="ghost" id="btn-ghost">Ghost</Button>
          <Button variant="destructive" id="btn-destructive">Destructive</Button>
        </Row>
        <Row>
          <Button variant="primary" size="sm" id="btn-sm">Small</Button>
          <Button variant="primary" size="md" id="btn-md">Medium</Button>
          <Button variant="primary" size="lg" id="btn-lg">Large</Button>
        </Row>
        <Row>
          <Button variant="primary" withArrow id="btn-arrow">
            Get started
          </Button>
          <Button variant="secondary" withArrow id="btn-arrow-sec">
            Learn more
          </Button>
        </Row>
        <Row>
          <Button variant="primary" loading id="btn-loading">
            Loading
          </Button>
          <Button variant="primary" disabled id="btn-disabled">
            Disabled
          </Button>
        </Row>
      </Section>

      {/* ── BADGES ── */}
      <Section title="Badge">
        <Row>
          <Badge variant="default" id="badge-default">Default</Badge>
          <Badge variant="red" id="badge-red">Deleted</Badge>
          <Badge variant="blue" id="badge-blue">Active</Badge>
          <Badge variant="green" id="badge-green">Saved</Badge>
          <Badge variant="yellow" id="badge-yellow">Draft</Badge>
        </Row>
      </Section>

      {/* ── INPUT ── */}
      <Section title="Input">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-6)",
            maxWidth: 640,
          }}
        >
          <Input
            id="input-default"
            label="Bookmark title"
            placeholder="My favourite article"
          />
          <Input
            id="input-leading"
            label="URL"
            placeholder="https://example.com"
            leadingIcon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6.5 9.5L9.5 6.5M7 4.5L5.5 3a2.121 2.121 0 0 0-3 3L4 7.5M9 11.5l1.5 1.5a2.121 2.121 0 0 0 3-3L12 8.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
          <Input
            id="input-error"
            label="Email"
            placeholder="name@example.com"
            error="Please enter a valid email address."
            defaultValue="invalid-email"
          />
          <Input
            id="input-hint"
            label="Description"
            placeholder="Optional note..."
            hint="Shown only to you. Max 200 characters."
          />
          <Input
            id="input-disabled"
            label="Read-only field"
            defaultValue="Cannot edit this"
            disabled
          />
        </div>
      </Section>

      {/* ── KBD ── */}
      <Section title="Keyboard Shortcuts">
        <Row>
          <Kbd id="kbd-cmd-k">⌘K</Kbd>
          <Kbd id="kbd-ctrl-s">Ctrl+S</Kbd>
          <Kbd id="kbd-esc">Esc</Kbd>
          <Kbd id="kbd-enter">↵ Enter</Kbd>
          <Kbd id="kbd-tab">Tab</Kbd>
        </Row>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
          Press <Kbd>⌘K</Kbd> to open the command palette.
        </p>
      </Section>

      {/* ── CARD ── */}
      <Section title="Card">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {/* Default bezel card */}
          <Card id="card-default">
            <CardHeader>
              <Badge variant="blue">Article</Badge>
              <h3
                style={{
                  fontSize: "var(--text-base)",
                  fontWeight: 600,
                  marginTop: "var(--space-2)",
                }}
              >
                Double-Bezel Card
              </h3>
            </CardHeader>
            <CardBody>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Outer shell with surface-alt background wraps an inner core
                with white surface and inset highlight.
              </p>
            </CardBody>
            <CardFooter>
              <Button variant="ghost" size="sm" id="card-btn-visit">Visit</Button>
              <Button variant="secondary" size="sm" id="card-btn-edit">Edit</Button>
            </CardFooter>
          </Card>

          {/* Flat card */}
          <Card bezel={false} id="card-flat">
            <CardHeader>
              <Badge variant="green">Collection</Badge>
              <h3
                style={{
                  fontSize: "var(--text-base)",
                  fontWeight: 600,
                  marginTop: "var(--space-2)",
                }}
              >
                Flat Card
              </h3>
            </CardHeader>
            <CardBody>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Single container with border-strong border. Used in dense
                list layouts where Double-Bezel adds too much padding depth.
              </p>
            </CardBody>
          </Card>

          {/* Elevated card */}
          <Card variant="elevated" id="card-elevated">
            <CardHeader>
              <Badge variant="yellow">Tag</Badge>
              <h3
                style={{
                  fontSize: "var(--text-base)",
                  fontWeight: 600,
                  marginTop: "var(--space-2)",
                }}
              >
                Elevated — hover me
              </h3>
            </CardHeader>
            <CardBody>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Elevates on hover via ultra-diffuse box-shadow and a
                1px translate-y. Pure transform — no layout reflow.
              </p>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* ── MOTION TOKENS ── */}
      <Section title="Motion Tokens">
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-secondary)",
            lineHeight: 2,
          }}
        >
          <p>--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)</p>
          <p>--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1)</p>
          <p>--ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1)</p>
          <p>--duration-fast: 150ms &nbsp;&nbsp; --duration-base: 250ms &nbsp;&nbsp; --duration-slow: 400ms &nbsp;&nbsp; --duration-reveal: 600ms</p>
        </div>
      </Section>
    </main>
  );
}
