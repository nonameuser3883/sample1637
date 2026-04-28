# Working rules for this project

Reference files for UI generation. Read the relevant ones before drawing anything. "DS" below = **Design System**.

**This file does not contain tokens, hex values, font sizes, button dimensions, or radii.** Those live in the specialised md files listed below. This file only tells you *where* to find them and *that* you must use them as-is. If you find yourself writing a specific value (padding, radius, weight, hex) from memory or by guess, stop — look it up in the right file.

## Hard specs (must not break)

- **Screen width: exactly 375px.** Never wider, never narrower (mobile portrait, iPhone 11/12/13/14).
- **Height: 812px recommended** for above-the-fold. Taller is fine if the screen scrolls vertically.
- **Portrait only**, never landscape.
- **No horizontal scroll.** If content overflows, use vertical stacking or a horizontal carousel that stays within 375px.
- **Design frame: no border/stroke and no corner radius.**
- **All UI copy in English.** No language mixing, no lorem ipsum. Proper nouns keep their original casing.

## Core enforcement rules

These are project-level rules about *how* to use the DS files. The actual values they refer to live in the DS files — do not re-derive them here.

### Typography
- Every text element must map to an exact named style from [text and colors styles.md](text%20and%20colors%20styles.md). Don't invent sizes, weights, or line-heights.
- Font-family: Albert Sans only.
- **Extrabold (800) is banned everywhere.** Even when a `.extrabold` style name exists in the DS file, you may not use it. Maximum weight on any element is Bold (700). For more emphasis, go larger in size — never heavier in weight.
- Text colors come from the `text.*` / `grey.*` tokens in [text and colors styles.md](text%20and%20colors%20styles.md). No raw hex for text.

### Buttons & interactive components
- Every button (primary, secondary, text, link, in any size or state) must match the exact spec in [Buttons.md](Buttons.md) — height, padding, radius, label style, fill, border, and state colors. No deviation.
- Before writing a `<button>` or CTA, open [Buttons.md](Buttons.md) and copy the values from the correct variant row. Do not approximate.
- No shadows, no gradients, no glows on buttons (see Mode A in [design-principles.md](design-principles.md)).

### Radii, surfaces, spacing
- Card / modal / sheet / chip / input radii are defined in [design-principles.md](design-principles.md) (surfaces section) and [Buttons.md](Buttons.md) (for buttons). Pick the radius from the element's spec; don't choose a number that "looks close".
- Surface fills, borders, and stacking rules all come from [design-principles.md](design-principles.md). Gradients, glows, and effects are restricted per the two-mode system described there.

### Colors
- Every color you place must be a token from [text and colors styles.md](text%20and%20colors%20styles.md). If you can't name the token, don't use the color.

## Source-of-truth files — what to take from each

Read in this order: **principles → product context → copy → tokens → components → assets.** Tokens answer "what hex", principles answer "why and how used". Principles win when a token choice would make the screen flat/generic.

- [design-principles.md](design-principles.md) — **take:** the top-level visual language. Two-mode system (flat chrome vs 3D spotlight), depth, dominant background proportions, how violet and gold accents are used, fill/gradient catalogue, card/modal/hero anatomy, radius scale for surfaces, anti-patterns, self-check list. **Read this first, before touching tokens.** Explains the *feeling* the screen must have; tokens exist to serve it.
- [ux-copy.md](ux-copy.md) — **take:** how to write every piece of UI text. Tone, CTA phrasing, error/empty-state patterns, button casing rules, good/bad examples. Read before writing any label, heading, or message.
- [product-context.md](product-context.md) — **take:** what My Drama is, who uses it, how competitors behave, brand personality. Read before making product/feature/audience/tone decisions — not for visual values.
- [text and colors styles.md](text%20and%20colors%20styles.md) — **take:** every color token (exact hex) and every text style (family, size, weight, line-height, letter-spacing). Authoritative for all color and text values. **Always look up the exact named style here — do not write sizes or hex from memory.**
- [Buttons.md](Buttons.md) — **take:** full button spec. Variants (primary/secondary/text/link), sizes (small/large), states (default/pressed/disabled), exact anatomy (height, padding, radius) and token mapping per state. **Required reading before you write any `<button>` or CTA. All dimensions are enforced exactly as written there.**
- [icons.md](icons.md) — **take:** the project icon library. Always search here first when picking an icon.
- [covers.md](covers.md) — **take:** the visual language of series cover art (composition, palette, mood) + the public GitHub Pages URL template for embedding covers in HTML.
- **DS exports pasted into the chat** (any `ds-*.md` the user attaches to the conversation, e.g. a Figma export) — **take:** authoritative tokens and component specs. These override local md files when they conflict.

## Icons

Always look in [icons.md](icons.md) first. A custom icon (inline SVG, external library) is allowed **only if** nothing in `icons.md` matches in meaning and style. Never mix icons from different sources in one screen.

## Cover images

For any `<img>` with a cover, use the public GitHub Pages URL from [covers.md](covers.md) (`https://alex03292303.github.io/My-Drama-Design-System-MD/covers/<file>.jpg`). Do not use local paths like `covers/10.jpg` and do not embed data URIs.

## File organization — where to put generated screens

All generated UI HTML lives under `screens/`. **Never** drop HTML files at the project root.

- Each feature/screen = its own folder: `screens/<feature-slug>/`
  - Slug is short, kebab-case, descriptive — e.g. `screens/part-2-coming-soon/`, `screens/onboarding-paywall/`, `screens/episode-player/`
- Inside the folder:
  - One file per variant: `variant-1.html`, `variant-2.html`, …
  - Optional `all-variants.html` with every variant side-by-side for comparison
  - Any feature-specific notes or snippets stay in the same folder
- For a new feature → create a new folder before writing files.
- For iteration on an existing feature → keep all new work inside that feature's folder; don't scatter files.

This keeps each feature self-contained and easy to find.

## Preview behavior

- After creating an HTML file, **do NOT open it in an external browser** (no `open -a "Google Chrome"`, `open file.html`, `xdg-open`).
- The host environment will pick up the file and render it automatically (Claude Code preview panel, Cursor preview, v0, Figma Make, etc.). Just **write the file and stop.**
- If the user explicitly asks to open in a browser, do it.

## Conflict priorities

- Visual values (colors, fonts, sizes, spacing) → DS export pasted in chat wins over local DS files
- Screen dimensions / copy / tone / language → this file + [ux-copy.md](ux-copy.md) win
- Product decisions (features, audience, positioning) → [product-context.md](product-context.md) wins
- Figma component pulled via MCP → above any md
