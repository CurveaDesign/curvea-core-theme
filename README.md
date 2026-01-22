# Curvea Core — Shopify Theme Framework

Curvea Core is a **modular, editor-first Shopify theme framework** built on top of Dawn.

It is designed to be:
- reusable across multiple client stores
- non-destructive to Shopify defaults
- fast, structured, and scalable
- **design-agnostic at the core level**

Curvea Core is **not a one-off theme**.  
It is a **system** intended to be extended, branded, and polished later.

---

## What Curvea Core Is (and Is Not)

### ✅ Curvea Core **IS**
- a structural framework
- editor-first by design
- safe to update and maintain
- suitable for client work at scale
- intentionally minimal in visuals

### ❌ Curvea Core **IS NOT**
- a finished branded theme
- a design system (yet)
- a marketing showcase
- a replacement for Dawn internals

Design is a **separate layer** added later.

---

## Foundation

- Forked from Shopify Dawn
- Clean Git history
- Shopify CLI connected to a dev store
- Runs correctly in the Shopify editor
- Dawn files are left untouched unless intentionally overridden

All Curvea additions are namespaced and isolated.

---

## Naming & Structure Conventions (LOCKED)

- All Curvea sections and snippets are prefixed with `cc-`
- Dawn files must not be modified casually
- Shared logic lives in snippets
- Sections are **structure-first**, not design-first
- Editor usability always comes before visuals

These rules are non-negotiable.

---

## Tailwind v4 Pipeline (Shopify-Safe)

Tailwind is used **locally only**.

- No runtime Tailwind
- No CDN
- No editor performance impact

### Files
- `assets/cc.tailwind.css` → source
- `assets/cc.build.css` → compiled output (linked in theme head)

Compilation is done via local scripts using `npx`.

This setup is production-safe and Shopify-compliant.

---

## Core Layout Snippet

### `snippets/cc-container.liquid`

Centralized layout control used by all Curvea sections.

- Consistent width handling
- Consistent horizontal padding
- Size options:
  - `sm`
  - `md`
  - `lg`
  - `xl`

This guarantees layout consistency across the entire system.

---

## Core Sections (Structure Complete)

All sections:
- are editor-first
- use configurable blocks
- include presets
- contain **no hard branding**
- use Tailwind utility classes only
- have no per-section CSS files

### Implemented Sections

- `cc-hero-core` (reference pattern)
- `cc-feature-grid`
- `cc-image-with-text`
- `cc-logo-cloud`
- `cc-testimonials`
- `cc-faq`
- `cc-cta`
- `cc-rich-text`
- `cc-announcement-bar`
- `cc-header-shell`
- `cc-footer-shell`
- `cc-breadcrumbs`

`cc-hero-core` defines the architectural pattern that **all future sections must follow**.

---

## Cart & Catalog Logic

Curvea Core supports advanced commerce modes without breaking Shopify defaults.

### Global Add-to-Cart Toggle
- Theme setting: `settings.cc_disable_atc_global`

### Product-Level Override
- Metafield: `product.metafields.custom.disable_atc`

### Behavior When Disabled
- Add-to-Cart button is hidden
- Optional CTA mode can be enabled:
  - custom label
  - custom link (Contact, Inquiry, WhatsApp, etc.)

### Use Cases
- catalog-only sites
- wholesale stores
- inquiry-based businesses
- service-driven shops

---

## Cart Mode

Theme setting: `settings.cc_cart_mode`

Supported modes:
- cart drawer
- full cart page

Required data attributes are already wired.  
Visual polish is intentionally deferred.

---

## Buy Buttons

`snippets/buy-buttons.liquid` has been corrected:

- valid Liquid syntax only
- no unsupported expressions
- no invalid comment syntax
- Theme Check safe

---

## JSON Templates

All required JSON templates are present.

- No missing template errors
- Theme editor loads correctly
- Codex task merged successfully

---

## CI & Theme Check

- Lighthouse checks are disabled
- Theme Check is the only enforced CI

Current state:
- no blocking syntax errors
- warnings remain (mostly Dawn defaults)

Theme Check cleanup is intentionally deferred to a later phase.

---

## What Is Intentionally Not Done

### Design Layer
Not started yet:
- typography system
- spacing rhythm
- color tokens
- motion / animation layer

This is intentional.

### UX Polish
Not yet implemented:
- cart animations
- CTA variants
- empty states
- visual hierarchy refinement

### Theme Check Cleanup
Deferred to a single, final cleanup pass.

---

## Planned Phases

### Phase 1 — Structure Lock
- finalize all required sections
- ensure editor usability
- no design decisions

### Phase 2 — Design Tokens
- typography scale
- spacing system
- button primitives
- color strategy
- Curvea visual language

### Phase 3 — UX & Polish
- cart interactions
- CTA variants
- catalog UX improvements
- micro-interactions

### Phase 4 — Cleanup
- Theme Check warnings
- final CI green
- framework considered stable

---

## Rules for Contributors

- Do **not** hardcode branding
- Do **not** mix design into logic
- Follow the `cc-hero-core` pattern for all new sections
- Tailwind must be compiled — never runtime
- Editor-first always

If a change violates these rules, it does not belong in Curvea Core.

---

## Repository

https://github.com/CurveaDesign/curvea-core-theme
