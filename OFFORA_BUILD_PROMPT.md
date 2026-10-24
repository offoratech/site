# Offora Tech - Website Build Prompt

Copy everything below into a fresh Claude Code session to build (or rebuild) this site from scratch.

---

## Role

You are an elite, Awwwards-winning frontend developer and UI/UX visionary. Build a complete, production-ready React + Vite frontend for **Offora Tech**. There is no backend - this is a fully polished, zero-compromise static site ready for deployment.

## Design mission

Do not build a standard, boring corporate SaaS template. The audience is high-ticket business owners, so the site must feel premium, avant-garde, and highly professional - **Apple meets creative design agency**, in the register of an Awwwards "Site of the Day" winner, not a generic AI-generated template. Concretely:

- **Ditch cards and grids.** No standard white-background cards with drop shadows. No boring 3/4-column card grids. Prefer asymmetrical layouts, overlapping elements, numbered lists, and sticky/interactive sections over boxed cards.
- **Aggressive typography.** Hero type should span roughly 70–80% of viewport width, tight letter-spacing on large headings, extreme contrast between huge display type and small uppercase tracked-out labels. At least 2x the whitespace a "safe" template would use between sections.
- **High-end motion.** Custom cursor that reacts to hoverable elements, magnetic buttons that pull toward the cursor near CTAs, scroll-linked parallax on background elements, and text that reveals via masked word/line animations on scroll - not simple fades.
- **Texture.** Subtle film-grain/noise overlay across the whole page. Deep off-black background (`#0a0a0b`, not flat `#000`). Ultra-blurred glowing gradient blobs behind key sections for depth.
- **A real signature motif, not decoration for its own sake.** This project used a recurring **corner-bracket frame** (`⌐...⌐` / `[ ]`) wherever something needed framing - around kicker labels, team photos, gallery items. It reads as both code-syntax brackets (technical) and camera-viewfinder brackets (creative), which maps directly onto the "Technical & Digital Marketing" duality of the brand. Invent your own equivalent signature device if you want - the point is *pick one motif with a real conceptual reason to exist, and repeat it everywhere* - that's what makes a site feel designed rather than templated. Don't skip this step.

## Tech stack

- Vite + React 19
- **Tailwind CSS v4** - this is CSS-first. There is no `tailwind.config.js` by default; use `@theme { ... }` inside `index.css` to define design tokens (colors, fonts, custom animations). Use the `@tailwindcss/vite` plugin in `vite.config.js`, not the PostCSS plugin - it's simpler and is the v4-recommended path.
- Framer Motion for all animation
- React Router (`react-router-dom`) for `/`, `/about`, `/services`, `/gallery`, `/contact`
- `lucide-react` for icons - **but note**: recent `lucide-react` versions removed all brand/social icons (`Instagram`, `Linkedin`, `Github`, `Twitter`, etc. do not exist anymore). If you need social icons, hand-write small inline SVGs matching lucide's stroke style (`viewBox 0 0 24 24`, `stroke="currentColor"`, `strokeWidth={2}`) instead of importing them.
- `clsx` + `tailwind-merge` combined into a `cn()` utility in `src/utils/cn.js`

## Company details

- Name: **Offora Tech**
- Tagline: "We Don't Follow Trends. We Create Them."
- Brand color: vibrant lime green, **`#7ED957`**. Build it as a full shade scale (`50`–`900`) as `@theme` tokens (e.g. `--color-offora-green-500: #7ED957`, generate lighter/darker steps around it), then point a semantic `--color-brand` token at the `500` step so components can reference `bg-brand` / `text-brand` / `border-brand` everywhere without hardcoding hex values.
  - **Contrast rule:** any text placed directly on a filled `bg-brand` background must be near-black (`text-ink`, `#0a0a0b`), never white.
  - Use it for: primary filled CTA buttons, active states, the bracket motif accents, glow blobs (low opacity, heavily blurred), the custom cursor accent, selection highlight color.
- Goal: generate qualified B2B leads.
- Founders (use their real names in **UPPERCASE** in the large display heading treatment):
  - **HARIHARAPRABU B** - Founder & CEO - `+91 6369492510` - `ceo@offoratech.com`
  - **MUGILAN S** - Co-Founder & CTO - `+91 8903215065` - `cto@offoratech.com`

## Sitemap & page requirements

### 1. Home
- Hero: massive type (70–80vw), staggered word-by-word mask reveal on load (not on scroll - this is above the fold, so animate on mount), a small bracket-framed uppercase kicker line above it, parallax glow blobs behind, a scroll-cue indicator (small bouncing chevron) that fades out once the user starts scrolling.
- "Trusted By" section: seamless infinite marquee/ticker of client logos (duplicate the list 3–4x for a seamless loop), grayscale-until-hover.
- Dual-expertise teaser (Technical vs. Digital Marketing): **not** hover cards - a two-row list with big numbered entries (`01`, `02`), giant title text that shifts on hover, tags/description off to the side. Each row links to `/services`.
- Strong CTA section (can live in a global `Footer` component so every page ends with it): big scroll-revealed headline, a magnetic filled CTA button, secondary text link.

### 2. About (includes Team)
- Persuasive copy (use almost verbatim): *"Offora Tech empowers visionary business owners to dominate their digital landscape. We engineer powerful technical infrastructures and architect magnetic personal and brand identities that scale."*
- A 3-item "pillars/values" row with a scroll-linked horizontal line that draws in (`scaleX` 0→1, `transform-origin: left`) above the row.
- **Team section**: this is the part most likely to need real photo assets. If you get real photos, check their actual composition before designing around them - a photo that already has a circular badge, colored ring, and the person's name arced/baked into the image (a pre-made "profile card" graphic) needs a *different* layout than a plain full-bleed portrait photo. For a plain portrait: full-bleed image, editorial oversized overlapping name typography works well. For a pre-designed square badge graphic: **do not** overlap giant text on top of it - that collides and looks broken. Instead use a clean two-column layout (image in a fixed-size framed square card with a soft shadow/offset background card behind it, name/role/bio in a normal-sized adjacent column, no overlap). When in doubt, build the simpler non-overlapping layout first.
- Uppercase the founders' names in the display heading.
- Frame each photo with the site's signature motif (e.g. corner brackets).

### 3. Services
- **Not tabs, not a static grid.** Build an interactive vertical list: every service across both groups (Technical, Digital Marketing) is one row with an index number, a large title, and a description. On desktop, hovering a row reveals a small floating panel that follows the cursor position (icon + service name), and the description text fades/slides in; on mobile/tablet there is no hover, so **the description must be visible by default** below `lg` and only becomes hover-gated at `lg:` and up.
- Group with a small kicker + divider line before each group's block (`01 - Engineering`, `02 - Branding & Growth`), not with clickable tabs - tabs invite AnimatePresence bugs (see Pitfalls below) and a plain scrollable list is more in line with the "ditch grids/tabs" mandate anyway.
- Services to include:
  - **Technical**: Customized Software Development, Website Development, E-commerce, Mobile App Development, Inventory/Stock Management.
  - **Digital Marketing**: Social Media Management, Meta Ads Management, Content Creation, Ads Strategy, Video Shoot, Video Edit, Theatrical Ads, Graphic Design, Personal Branding, Social Branding, Service Branding, Product Branding.
- Give every row a scroll-triggered stagger-in entrance (`whileInView`, small per-row delay) in addition to the hover interaction.

### 4. Gallery
- Sections: "Instagram Reels", "Video Edit Works", "Behind the Scenes / Business Pictures".
- **Not a static masonry grid** - build each category as a full-bleed horizontal auto-scrolling marquee row (duplicate the item list for a seamless loop), alternating scroll direction per row for rhythm. Pause the marquee on mouse hover **and** on `touchstart`/`touchend` (CSS `:hover` does nothing for touch users - you need real state for the touch case, or the marquee is unusable to read/tap on a phone).
- Clicking/tapping an item opens a lightbox/modal with prev/next navigation (arrow keys + on-screen buttons) and a close button.
- Give each row a very subtle scroll-linked parallax drift for depth.

### 5. Contact
- A UI-only form (no backend) with: name, email, phone, company, a couple of pill-style selectable options (e.g. "interested in" / "budget"), and a message textarea. On submit, `preventDefault()` and show an animated success state in place of the form - do not fake a network call.
- Contact details with icons for both founders (phone + email, tappable `tel:`/`mailto:` links).
- Keep form fields underline-style (bottom border only) rather than boxed inputs, to stay consistent with the "no cards" mandate.

## Assets

- All images live in `src/assets/`. If real assets aren't available yet, don't ship broken `<img>` tags - generate small inline SVG placeholders (initials on a brand-toned gradient for people, simple wordmarks for client logos) so the site never looks broken, and clearly tell the user which files to swap in later.
- **Compress real photos before committing them.** A raw phone/design-export PNG can easily be 1.5–2MB; at the display sizes used here (a few hundred px, mostly under 400px wide) that's 15–20x oversized. Resize to roughly 1000×1000 and re-encode (e.g. via a quick `sharp` script - install it as a dev dependency, run the resize once, then uninstall it, don't leave it as a permanent dependency for a one-off task).

## Mobile requirements - read this carefully

A design built "hover-first" for desktop will silently break on mobile if you're not deliberate about it. Concretely:

- **Never gate real content behind `:hover` alone.** Anything wrapped in `opacity-0 ... group-hover:opacity-100` with no other trigger is **invisible on every touch device**, permanently, because touch has no hover state. Any pattern like this must default to visible and only become hover-gated from a real desktop breakpoint up (e.g. `lg:opacity-0 lg:group-hover:opacity-100`), or use tap/focus as an alternative trigger.
- Decorative full-bleed background typography (oversized outline wordmarks etc.) should be gated to a proper desktop breakpoint (`lg:` / 1024px), not `sm:` (640px) - a phone in landscape, or a resized browser window, can easily cross 640px and render a giant decorative element cropped and broken in a space that wasn't designed for it.
- Custom cursors should be feature-detected off on touch devices (`window.matchMedia('(pointer: fine)')`), not just hidden with CSS.
- Add real touch affordances where you added mouse-only ones: if a marquee pauses `on:hover`, also pause it `on:touchstart`. If you built a cursor-follow interactive element, make sure its information is still reachable without a cursor.
- Since this is a lead-gen site, consider a small floating "contact" action button on mobile only (hidden on the contact page itself) - mobile users are far more likely to tap-to-call/tap-to-email than fill a long scroll journey.
- Audit for horizontal overflow at both 320px and 375px on every route - check `document.documentElement.scrollWidth` vs `window.innerWidth`, not just visually.
- Bump any interactive tap target under ~40px (pill selectors, icon buttons) toward 44px+ for comfortable thumb use.

## Pitfalls hit during the original build - avoid repeating these

- **Don't scaffold into a non-empty directory carelessly.** `npm create vite@latest . --force` / `--overwrite` will silently delete existing files in the target folder. Check what's already there first, and if anything needs preserving, move it out before scaffolding.
- **A tab/segmented-control pattern driven by `AnimatePresence mode="wait"` around content keyed by the active tab id is fragile** - it's easy to end up with the active-state styling on the tab buttons updating correctly while the actual content pane gets stuck on the old tab (an exit animation that never resolves, or a stale closure). If you want a switchable content pattern, test clicking through it, not just visually inspecting the default state. Given the "no tabs" design mandate anyway, prefer a single scrollable list over tabs entirely - it sidesteps the whole class of bug.
- **Automated browser screenshot tools can silently fail to reflect reality** if the preview pane isn't actually visible/focused on the developer's screen - `requestAnimationFrame`-driven code (scroll-linked Framer Motion values, CSS animations relying on compositing) may not progress at all while a tab is backgrounded, even though the DOM state (e.g. `scrollY`) updates correctly. Don't conclude a scroll-driven animation is broken purely from an automated check in that situation - verify DOM/layout state (which is reliable) and be upfront that pixel-level behavior needs a human to actually look at it.
- Keep visual/interactive verification honest: run the production build, check every route for console errors, check for horizontal overflow at real breakpoints, and say plainly when you can't get a real screenshot rather than claiming success you can't back up.

## Execution instructions

1. Scaffold Vite + React, add Tailwind v4 (`@tailwindcss/vite` plugin), Framer Motion, `react-router-dom`, `lucide-react`, `clsx`, `tailwind-merge`.
2. Folder structure: `/src/components/{layout,ui,home,about,services,gallery,contact}`, `/src/pages`, `/src/data`, `/src/assets`, `/src/utils`.
3. Build the `@theme` design tokens first (colors incl. the full brand green scale, fonts - a display font for headings + a workhorse sans for body, custom marquee keyframes), then the reusable motion primitives (`Cursor`, `Magnetic` button wrapper, `TextReveal` mask-reveal, `Parallax` scroll wrapper, the corner-bracket frame component) before building pages - every page should compose from these.
4. Build `Layout` (Navbar + Footer + page content), wire up React Router, then build the five pages in order: Home, About, Services, Gallery, Contact.
5. Write actual working code for everything - no TODOs, no "fill this in," no placeholder logic. Placeholder *assets* are fine (see Assets section); placeholder *functionality* is not.
6. Run a production build (`npm run build`) and fix everything it flags before calling anything done.
7. Do a real responsive/mobile pass per the Mobile requirements section above - don't treat mobile as an afterthought pass at the very end.
