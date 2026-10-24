# Offora Tech — Design System

This is the identity file for offoratech.com. It documents what already exists and is
already working — it is a record, not a proposal. Redesign work on this project runs in
**preserve mode**: extend and refine what's here, don't replace it.

## 1. Who this is for

Offora Tech is a two-founder technical + digital marketing agency. The audience is
business owners deciding who builds their site/app and runs their marketing — not
developers, not a design-conscious consumer. The brand voice is built around one claim:
one team does both the build and the marketing, so there's no hand-off between agencies.

## 2. Dial reading

`DESIGN_VARIANCE: 6` · `MOTION_INTENSITY: 6` · `VISUAL_DENSITY: 3`

Confident, editorial, restrained — not maximalist, not corporate-safe. Motion is used
deliberately (scroll-linked reveals, a curtain-style hero transition) rather than as
decoration. Layouts favor negative space and large type over cards or grids.

## 3. Color

Dark-first. One accent. No gradients as decoration.

| Token | Value | Use |
|---|---|---|
| `--color-ink` | `#0a0a0b` | Page background |
| `--color-ink-soft` | `#131315` | Footer / secondary surface |
| `--color-panel` | `#17171a` | Card / raised surface |
| `--color-line` | `#2a2a2e` | Hairline borders |
| `--color-paper` | `#f5f4ef` | Light surface (rare — mostly logo/media contexts) |
| `--color-bone` | `#e9e7df` | Primary text on dark |
| `--color-mute` | `#8a8a8f` | Secondary text on dark |
| `--color-brand` | `#7ed957` (offora-green-500) | The one accent — CTAs, active states, bracket motif |

Rules:
- One accent only. `brand` never competes with a second hue anywhere on the page.
- Full `offora-green-50…900` ramp exists for cases needing a tint/shade of the accent
  (hover states, soft backgrounds) — reach for that before inventing a new color.
- No purple, no blue-glow, no decorative gradients. If a glow effect is needed it's a
  soft `blur()` of the brand green at low opacity (see `Parallax` glow blobs), never a
  gradient mesh.

## 4. Typography

Two typefaces, each with a specific job. Loaded via Google Fonts `<link>` in
`index.html` (not `next/font` — this is a Vite SPA, not Next.js).

- **`--font-sans` / `--font-display`**: Plus Jakarta Sans. The workhorse — every page
  heading (About/Services/Gallery hero, section headings, body copy, nav, buttons).
  Weight range 200–800 loaded (both italic and roman).
- **`--font-space`**: Space Grotesk, bold. Reserved for exactly two placements that
  bookend the Home page: the hero headline (`Hero.jsx`, "We Don't Follow Trends. We
  Create Them.") and the closing CTA headline in the footer (`Footer.jsx`, "Got a
  project in mind? Let's hear it."). Chosen from a live six-candidate comparison
  (rendered in the real footer context, not a font browser) against Bricolage
  Grotesque, Unbounded, Instrument Serif, Fraunces (in both its original semibold
  italic and a Black upright variant), and staying on Plus Jakarta Sans. Fraunces
  was the original Hero choice and has been fully retired — no longer loaded or
  referenced anywhere. **Do not extend Space Grotesk to other headings** without the
  same kind of explicit comparison-and-approval — two flagship bookends stay legible
  as "these statements get special treatment," five accent headings reads as
  inconsistency.

Scale in use (Tailwind defaults + a few fluid `clamp()` treatments for the four
sticky-hero headlines): `text-4xl` → `text-7xl` for section/page headings, fluid
`clamp()` sizing specifically for the four page-hero headlines so they scale smoothly
between a floor and a ceiling instead of raw `vw` (which has no ceiling and runs away
on ultra-wide monitors).

Body copy: `text-mute` on `text-bone` headings, generous `leading-relaxed`, max-width
constrained (`max-w-lg`/`max-w-md` typical) rather than running full-width.

## 5. The bracket motif

`[ LABEL ]` — uppercase, wide letter-spacing, brand-green brackets. Lives in
`Kicker.jsx` and is used as the section eyebrow throughout, plus the hero's tag line
(`[ Websites, Apps & Marketing - Built By One Team ]`) and the team index tags.

This is a **signature device**, not a generic AI-eyebrow pattern — it's the one visual
element that ties "technical" (code brackets) and "creative" (viewfinder brackets)
into a single mark. Keep it. Don't remove it in the name of general "eyebrow
restraint" advice — that advice is aimed at templated, meaningless labels; this one
carries brand meaning.

## 6. Spacing & rhythm

Section vertical padding runs in the `py-24` → `py-48` range depending on section
weight (hero-adjacent sections get more air). Content is constrained by
`.container-offora` rather than raw `max-w-*` utilities scattered per component —
reach for that class first.

## 7. Motion

Framer Motion only — no GSAP, deliberately, to keep the dependency surface small.
Every animation in this codebase is considered load-bearing brand identity, not
decoration:

- **Sticky curtain-reveal hero** (`curtainRef` pattern, used on 4 of 5 pages) — the
  next section slides up over the pinned hero with rounded top corners. This is the
  single most fragile piece of the codebase (two past attempts to add a sticky footer
  broke it) — never touch scroll/position/overflow mechanics here without explicit
  sign-off and real browser verification.
- **Navbar shrink-to-pill** — continuous, spring-driven (`useScroll`/`useTransform`/
  `useSpring`), not a CSS-transition-on-boolean-toggle. The toggle version was tried
  and rejected as feeling "sudden."
- `TextReveal` / `Reveal` (`whileInView` triggered), `Parallax` (scroll-linked glow
  blobs), `LimelightNav` (active-item glow that slides), `LogoCarousel` (spring
  blur/cycle transition), `ScrollProgress` (top bar).

None of this motion layer is in scope for "typography/design polish" work. If a task
says "improve the design" without explicitly calling out motion, animations are
off-limits.

## 8. Components

Primitives live in `src/components/ui/` — this is the established, load-bearing
location; new shared primitives go there, not into page-specific folders.

`Cursor` (deliberately minimal — thin ring + dot, no glow/fill on hover — a fancier
version was tried and rejected), `Magnetic` (available, but not used on the four main
CTAs — the cursor-pull was found distracting there), `CtaButton` (shared button:
label fades on hover, icon chip expands to fill), `LimelightNav` (route-driven glow
nav, powers both desktop nav and the mobile bottom dock), `BracketFrame`, `TextReveal`,
`Reveal`, `Parallax`, `ScrollProgress`, `LogoCarousel`, `SocialIcons` (hand-drawn
Instagram/LinkedIn — the installed `lucide-react` version dropped brand icons, so
these are custom, not a library gap to "fix" by installing a different icon set).

Every one of these is a deliberate, previously-validated design decision. "Improve the
design" work extends and refines this set — it does not delete, replace, or
"modernize away" any of it without being asked.

## 9. Copy voice

Plain, direct, founder-voice. No "we architect/engineer magnetic synergies" corporate
AI-speak. Concrete claims over vague ones ("no hand-offs between agencies, no lost
context" rather than "seamless collaborative synergy"). Sentence case, not Title Case,
in body copy; the bracket kickers are the one deliberately-uppercase exception.
