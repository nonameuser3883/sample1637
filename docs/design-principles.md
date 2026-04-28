# Design Principles — My Drama

Top-level visual language extracted from real app screens (see `./1 just png app screens/`). Tokens in [text and colors styles.md](text%20and%20colors%20styles.md) and components in [Buttons.md](Buttons.md) must serve these principles, not the other way around.

---

## 1. The one-sentence essence

> A calm, flat near-black stage where **3D illustrations** and **solid violet actions** carry all the weight. The chrome is quiet on purpose — so the hero objects can feel heavy and premium.

This is NOT a gradient-heavy design. This is NOT a minimalist-flat design either. It's a **flat UI stage holding 3D props.** The props provide the volume. Everything else gets out of the way.

---

## 2. The single most important rule — Two-Mode System

Every pixel on the screen belongs to one of two modes. Never mix modes within the same element.

### Mode A — Flat Chrome (≈ 90 % of every screen)

Applies to: **backgrounds, cards, menu rows, list items, CTAs, toggles, stats, numbers, text, hairline borders, tab bar.**

- **Fills are flat.** Solid color, no gradient, no sheen, no inner shadow.
- **Colors come straight from the token palette** — no alpha-blends, no tints, no "lifted" variations of a token.
- **Shadows are minimal to none** on standard cards. A hairline 1 px border carries the separation, not a shadow.
- **Text is flat color** — white, `text.lighter`, or `grey.400`. Never gradient text. Never color-clipped text.
- **CTAs are flat solid** — primary is solid `primary.500` #4500FF, full stop. No linear gradient, no glow, no bevel.

### Mode B — 3D Spotlight (≈ 10 % of a screen, reserved)

Applies to: **3D illustrations (trophy, crown, coin stack, gift box, gold download arrow), hero cover art on paywalls/unlocks, modal head regions.**

- 3D illustrations come with their own rendered lighting, rim-light, and cast shadow — baked into the asset itself
- A **localized glow** lives under each 3D object — warm amber for gold-system objects, soft violet for violet-system objects. This glow does NOT extend to the rest of the screen.
- Modal top sections carry a single violet vertical gradient (lighter at top → fading to the flat card fill around 40–50 % of the modal height). This is the ONLY place a vertical gradient lives in the whole product.
- Cover art on unlock screens sits behind a faint halo, with its own picture fading into the dark screen (masked via black gradient over the cover).

**If you catch yourself adding a gradient, a text fill, a conic ring, or a soft glow on anything in Mode A — stop. Chrome is flat. Volume comes from 3D.**

---

## 3. Color — pigments on a dark stage

### 3.1 Proportions in the frame

- **~80 %** near-black background (flat, slightly indigo: around `#0A0A14` → `#12141E`, depending on where the 3D object's glow reaches)
- **~10 %** solid violet — primary CTAs, selected streak day, active toggle, tab-bar active glyph, modal top
- **~5 %** warm gold — 3D coins, trophy, crown, ticket cards, balance number (the number itself is white, but the coin icon next to it is gold)
- **~5 %** pure white — titles, body text on dark, CTA text
- **0 %** mid-greys in the 40–60 range. The stage is either dark or saturated; it doesn't sit in between.

### 3.2 Two pigment systems

| System | Anchor | Used for |
|---|---|---|
| **Violet** | Solid `primary.500` #4500FF | Every primary action button, selected streak cell, toggle on-state, tab-bar active icon (filled white on violet backdrop where the violet sits under the illustration), modal violet-gradient head, decorative "ambient light" UNDER a violet 3D object only |
| **Gold** | `#FFD179` → `#FF9534` (inside 3D assets) | 3D coins, trophy, crown, ticket/special-offer card fills, balance-with-coin-icon combos, streak bonuses |

**Strict rules:**
- Action buttons are **always violet**, never gold — even on gold-themed screens (the offline paywall has a gold 3D arrow but the CTA "Get Unlimited Downloads" is still solid violet).
- Gold **never appears as a button or an interactive surface**. It's a pigment of value, not a pigment of action.
- Numbers like "2080 balance" are **white**, with a small 3D gold coin beside them. Never gold-gradient text.

### 3.3 Tinted-black is the only exception to "flat"

The black background may carry a very soft, **localized** tint where a 3D object sits — e.g. the trophy illumination bleeds into the upper-right quadrant in warm amber. This is the 3D asset's own light spill, not a design-wide ambient glow. The rest of the screen stays flat black.

---

## 4. Surfaces — cards, rows, modals

### 4.1 Standard card (streak container, menu block)

- Corner radius: 20 px
- Fill: **flat** dark, one step above the screen bg (roughly `#1C1E28` — between `grey.900` and `grey.1000`)
- Border: 1 px hairline `grey.700` `#363842`, slightly warmer where violet ambient reaches it, cooler elsewhere
- No sheen, no gradient, no inset highlight
- Inner strips (e.g. "You're ahead of 76%" row inside streak card) use a slightly darker flat fill to create a nested surface — still flat

### 4.2 List row (settings, rewards benefits)

- Either sits inside a standard card OR directly on the screen bg (benefits list on Rewards sits directly on black — no wrapping container)
- Leading icon: **thin line icon (24 px)** inside a **circle with 1 px hairline border**, circle fill is transparent or flat dark. NOT a violet-filled tile.
- Title: white, 15–16 px, medium/semibold
- Trailing:
  - For settings: muted value text + small chevron `grey.500`
  - For rewards: a small pill/chip with 1 px border containing reward amount + 3D gold coin

### 4.3 Feature card (paywall CTA in-list, "Need help?")

- Uses a soft violet-tinted flat fill (still flat — roughly `primary.900` #1C1559 at low opacity over dark), with hairline violet border
- This is the only place "violet chrome" appears outside of CTAs — and it still isn't a gradient

### 4.4 Ticket / offer card

- Flat solid orange fill (gold system, amber-500 range), NOT a gradient
- Perforation: dotted line dividing deal from countdown
- Countdown in dark rounded pills with white numerals
- Small 3D illustration nested on the left — this is the only volumetric element on the card

### 4.5 Modal / bottom sheet

- Rounded top corners (~24 px)
- **Top 40–50 % of sheet: the one sanctioned vertical gradient** — violet `#4500FF` at top edge fading into the modal's flat dark fill
- Bottom half of sheet: flat dark
- A 3D hero element (cover thumbnail, 3D icon) sits at the top center, often breaking above the sheet's top edge, with its own halo
- Close `×` top-right, muted grey, no background
- Primary CTA at bottom: flat solid violet, full width minus padding

---

## 5. Buttons (the most violated rule)

### Primary CTA

- Fill: **solid `primary.500` #4500FF**. Nothing else. No gradient. No glow. No inner highlight.
- Radius: per [Buttons.md](Buttons.md)
- Height: per [Buttons.md](Buttons.md) (32 small / 48 large)
- Text: white, bold, sentence case
- On pressed: fill swaps to `primary.400` #4E45FF (also flat)
- On disabled: fill swaps to `grey.700` (flat)

### Secondary CTA

- Fill: transparent
- Border: 1 px `grey.400`
- Text: `text.lighter`

### Inline chip / edit pill

- Flat dark fill, hairline border, muted text. No gradient.

**Anti-examples observed on first iteration (DO NOT DO):**
- Linear gradient `#4E45FF → #4500FF` as the CTA fill
- Drop shadow `rgba(69, 0, 255, 0.45)` under the CTA
- Inner white highlight on top of the CTA
- White CTA on violet card with shadow

All wrong. Flat solid, no effects.

---

## 6. Icons

| Role | Style | Container | Stroke / fill |
|---|---|---|---|
| **Utility / nav** (search, settings, close) | 24 px line icon from [icons.md](icons.md) | None | `grey.100` / `grey.200` |
| **List leading** (notification bell in rewards row, partner icon, settings gear) | 18–20 px line icon | Circle 36–40 px with 1 px hairline border, transparent or flat dark fill | Glyph `grey.100` |
| **Tab bar active** | 24 px filled variant | None | `primitives.white` |
| **Tab bar inactive** | 24 px line variant | None | `grey.300` / `grey.400` |
| **Feature-row leading in certain cards** (rare) | Small glyph | Flat circle, slightly tinted | Glyph matches parent |

**Violet-filled rounded tiles are NOT a pattern in this product.** My earlier version used them — that was wrong. Real list rows use a thin-bordered circle with a line icon inside.

---

## 7. 3D illustrations — where the volume lives

This is the only mechanism that brings visual weight. Characteristics:

- **Baked lighting** in the asset itself: rim light, key light from upper-left or upper-right, cast shadow under the object
- **Warm amber palette** for reward/premium objects: trophy, coins, crown, gift box
- **Cool violet palette** for tech / download / feature objects: download arrow, widget mockup, play button medallion
- Often surrounded by **drifting particles**: small stars, falling coins, sparkles — not many, just 3–6 distributed asymmetrically
- Each illustration has a **localized glow halo** beneath it — radial, single color (matching the asset's warm or cool bias), fading to transparent within ~100–130 px
- Illustrations **break the rectangle** of whatever card they belong to — floating above it, overlapping its edge

When a screen needs to feel special, add a 3D illustration. Do NOT try to make the UI chrome itself feel special by piling gradients on it.

---

## 8. Typography

- Font: **Albert Sans** throughout
- Two registers: **heavy display** (bold / extrabold, 22–32 px, tight tracking) for screen titles and hero numbers; **clean body** (regular / medium, 13–16 px) for descriptions and values
- Screen titles: **left-aligned, heavy** — "Profile", "Rewards", "My Account"
- Hero numbers (balance 2080, price $19.99, stats 12/48/163): **flat white, bold, display-sized**, never gradient-filled, never color-clipped
- All-caps only for: "LIMITED TIME", "LIFETIME", eyebrow labels like "NEW USER BENEFITS" — rare, for urgency/framing
- Body copy: `text.lighter` `#DADDE3` — slightly off-white, not pure white
- Muted meta text: `grey.400` #9499A3

---

## 9. Composition

- **Vertical rhythm:** screen title at top-left (big), then hero block, then bands of content. 3–5 bands per screen.
- **20 px side gutter** for content; hero covers break full-bleed past it
- **Section spacing:** 20–24 px between major bands, 12–14 px inside a card between rows
- **Asymmetry in 3D zones:** hero illustrations bias to one side (trophy on right, crown on right edge of VIP card) with composition leaning the other way
- **Tab bar** sits flat at the bottom. No aggressive blur, no floating pill. Simple dark surface with active-state icon filled white.

---

## 10. Anti-patterns — explicit

Everything below is banned. These are mistakes made on the first iteration:

1. ❌ Gradient fills on CTAs (`linear-gradient(180deg, #4E45FF, #4500FF)`) — use **flat** `#4500FF`
2. ❌ Drop-shadow glows under CTAs (`box-shadow: 0 4px 12px rgba(69,0,255,0.45)`) — flat CTAs don't glow
3. ❌ Sheen gradients on cards (lighter top → darker bottom) — cards are flat
4. ❌ Conic-gradient ring around avatars — avatar is a flat circle with the subject inside
5. ❌ Gradient-filled text (`-webkit-text-fill-color: transparent` on numbers) — numbers are flat white
6. ❌ Radial ambient violet glow as a screen-wide background treatment — glow is localized under 3D objects only
7. ❌ Violet-filled rounded tiles as list-row leading icons — use thin-bordered circles with line icons
8. ❌ Inset highlights (`inset 0 1px 0 rgba(255,255,255,0.18)`) on buttons/cards — chrome is flat
9. ❌ Gold used for CTAs — gold is value, not action
10. ❌ Gradient text for balance numbers — flat white number + separate small 3D gold coin icon
11. ❌ Backdrop-blur tab bar with 24px+ saturation boost — tab bar is flat dark
12. ❌ Piling effects on the UI to compensate for the absence of 3D illustrations — if a screen feels empty, it needs a 3D asset, not more gradients

---

## 11. Self-check before declaring a screen done

1. Are all card fills flat (not gradient)?
2. Are all CTAs solid `#4500FF` (not gradient, no shadow)?
3. Are all numbers flat white (not gradient-text)?
4. Is the primary CTA violet (even on gold-themed sections)?
5. Are list-row leading icons line-style inside thin-bordered circles (not violet-filled tiles)?
6. Is there at least one 3D illustration on the screen if it needs to feel premium?
7. Does the glow live only directly under 3D objects (not as a screen-wide ambient)?
8. Is the background ~80 % flat dark?
9. Is gold used only for value (coins, rewards, tickets) — never as a CTA, never as chrome?
10. Does the screen look like a flat stage hosting a few 3D props — rather than a gradient-heavy dark dashboard?

If any answer is wrong, the screen drifts toward the failure mode.
