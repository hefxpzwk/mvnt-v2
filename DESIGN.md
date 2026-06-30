# Design

## Source of truth
- Status: Active draft
- Last refreshed: 2026-06-29
- Primary product surfaces: MVNT Studio landing, music-to-dance creation, community exploration, creator studio dashboard, credits, API placeholder.
- Evidence reviewed:
  - Live site text structure from `https://www.mvnt.studio/`: Home / Dance / Credits / API navigation, sign-in entry, “Music in, dance out!”, music link input, dancer picker, community sections.
  - Existing sibling prototype `../mvnt-web/src/main.jsx` and `../mvnt-web/src/styles.css`: React/Vite wireframe with Home/Create/Library/Credits/API, sidebar navigation, dummy generation state, library cards, pricing cards.
  - Existing PWA manifest copied from `../mvnt-web/public/site.webmanifest` and refreshed under `static/site.webmanifest`.

## Brand
- Personality: energetic, creator-first, futuristic, playful, still clear enough for first-time users.
- Trust signals: visible generation steps, mock render queue, API placeholder, analytics/PWA readiness, clear “no backend / dummy demo” labeling.
- Avoid: opaque AI magic, backend-dependent promises, dense enterprise dashboard feel, flat monochrome wireframe visuals.

## Product goals
- Goals:
  - Make the first action obvious: paste music, choose dancer, start dance.
  - Preserve familiar expectations from creator tools: quick creation, browseable templates, visible previews, account/credit/API slots.
  - Create a richer UI foundation that can later connect to auth, billing, generation queue, and APIs.
- Non-goals:
  - Real login, real payment, real backend generation, real upload persistence.
  - Pixel-matching the current production site.
- Success signals:
  - A user can understand the creation flow in under one screen.
  - Backend-required states are represented by dummy values instead of broken controls.
  - YouTube, SoundCloud, PWA, analytics, Three.js, and Lucide affordances are present in the UI architecture.

## Personas and jobs
- Primary personas: short-form video creators, dancers/choreographers, music marketers, technical API evaluators.
- User jobs: turn a music source into dance motion, pick a character/motion style, explore examples, understand credits, assess future API use.
- Key contexts of use: desktop creative work, mobile inspiration browsing, early demo/pitch review.

## Information architecture
- Current primary navigation source of truth: `src/lib/navigation.js`. Runtime tabs are Home, Projects, Search, Explore, and Dance; Credits is a standalone route. Legacy Create and Studio hashes map to Home and Projects for compatibility.
- Core routes/screens: React/Vite single-page app with hash-based in-app routes and `/credits` for pricing.
- Content hierarchy:
  1. Home creation cockpit.
  2. Projects dashboard and visibility controls.
  3. Search across community dance examples.
  4. Explore reels feed.
  5. Dance generator/lab placeholder.
  6. Credits/pricing.

## Design principles
- Principle 1: Jakob’s Law — keep recognizable patterns from popular creator products: left rail, prominent input, template grid, pricing cards, developer quickstart.
- Principle 2: “Backend later” honesty — every backend-like surface must still feel intentional through dummy state and clear microcopy.
- Tradeoffs: one-page speed and visual cohesion are prioritized over production route granularity for this prototype.

## Visual language
- Color: dark studio base with neon lime, cyan, pink, and violet accents.
- Typography: large compressed-feeling hero type via system sans, tight tracking for high-energy branding.
- Spacing/layout rhythm: roomy cards, 14–18px grid gaps, large sectional breathing room.
- Shape/radius/elevation: rounded glass panels, soft borders, deep shadows.
- Motion: lightweight smooth scrolling and CSS/video-driven prototype animation; avoid blocking animation.
- Imagery/iconography: Lucide React icons for interface clarity; community video assets anchor the prototype experience.

## Components
- Existing components to reuse: PWA manifest/favicons and static community media assets.
- New/changed components: side rail, top search, creation composer, community cards, reels feed, project dashboard, plan cards, trend modal.
- Variants and states: active nav/tag/filter, sidebar expanded/collapsed, staged dummy generation status, modal/video playback.
- Token/component ownership: `src/index.css` owns tokens and global component styling; `src/lib/navigation.js` owns route/navigation contracts; `src/lib/dummy.js` owns legacy placeholder content derived from that navigation contract.

## Accessibility
- Target standard: practical WCAG-aware prototype, semantic sections/buttons/labels.
- Keyboard/focus behavior: native buttons/inputs retained; mobile nav uses buttons and close scrim.
- Contrast/readability: dark background with high-contrast text and muted secondary copy.
- Screen-reader semantics: labeled navigation, labeled generator input, stage preview aria label.
- Reduced motion and sensory considerations: global `prefers-reduced-motion` handling exists in `src/index.css`; future production work should also pause nonessential video motion where appropriate.

## Responsive behavior
- Supported breakpoints/devices: desktop/tablet left rail with responsive content grids.
- Layout adaptations: hero and dashboards collapse from multi-column to single-column; grids collapse to 2-column then 1-column where implemented.
- Touch/hover differences: touch targets remain above ~38–50px; hover effects are decorative only.

## Interaction states
- Loading: dummy generation status cycles through Thinking/Composing/Ready with timers cleaned up on unmount/restart.
- Empty: music input accepts pasted links, drag/drop, and uploaded files; search can create a draft from the entered query.
- Error: not modeled because no backend is connected.
- Success: “Draft complete” state after mock generation.
- Disabled: not modeled; future backend wiring should add disabled and quota states.
- Offline/slow network: PWA manifest shell exists; offline behavior is not implemented.

## Content voice
- Tone: confident, creator-friendly, Korean/English hybrid aligned with current “Music in, dance out!” brand phrase.
- Terminology: “dance draft,” “motion,” “dancer,” “credits,” “API sandbox.”
- Microcopy rules: clearly mark mock/demo states; do not imply real processing or saved accounts.

## Implementation constraints
- Framework/styling system: React + Vite, Tailwind CSS v4 via `@tailwindcss/vite`, Radix Dropdown Menu, Lucide React icons.
- Design-token constraints: CSS variables and Tailwind theme tokens in `src/index.css`; keep navigation and route aliases centralized in `src/lib/navigation.js`.
- Performance constraints: static community media is prototype-only; production should lazy/play-gate non-visible videos before expanding media volume.
- Compatibility constraints: backend/auth/payment/upload processing are intentionally absent; uploaded files stay browser-local.
- Test/screenshot expectations: `npm test` covers route parsing regressions; `npm run build` is the current production smoke check.

## Open questions
- [ ] Which production backend API shape will replace dummy generator state? / backend owner / impacts form data model.
- [ ] Should Korean or English be the primary UI language? / product owner / impacts navigation and microcopy.
- [ ] What real character/dance asset pipeline should replace the placeholder Three.js dancer? / 3D owner / impacts performance and loading states.
