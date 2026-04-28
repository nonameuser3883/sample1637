# Covers — Reference Library

The `./covers/` folder contains series cover art for visual reference — posters, key art, promotional imagery used across the product. File names can be anything; no naming convention required.

## Strict rule: aspect ratio

**Cover artwork is always portrait 2:3**, regardless of the screen or context in which it's used (home feed, hero, player, cards, modals, thumbnails — everywhere). Do not crop, stretch, or re-frame to any other ratio. If a layout needs a different shape, fit the cover inside a 2:3 container (letterbox/background fill) — never distort the image itself.

Use this folder when generating UI that involves series artwork (home feed, hero banners, episode players, content cards). The agent can open any image in `./covers/` to study the visual language: composition, lighting, color, typography, mood. Mimic the style when rendering mock artwork or placeholder visuals.

## Cover URLs (hosted on GitHub Pages)

Base URL: `https://alex03292303.github.io/My-Drama-Design-System-MD/covers/`

Files: `10.jpg`, `11.jpg`, `12.jpg`, `13.jpg`, `14.jpg`, `15.jpg`, `16.jpg`, `17.jpg`, `18.jpg`, `19.jpg` — all portrait 2:3 JPEG.

Usage in generated HTML/React:

```html
<img src="https://alex03292303.github.io/My-Drama-Design-System-MD/covers/10.jpg" alt="cover" />
```

These URLs work everywhere — Claude Code preview, Gemini Canvas, Figma Make, v0, CodeSandbox. Nothing to download, no manifest to read: just drop the file name into the URL template.

## What's typical in these covers

- **Format:** portrait 2:3, full-bleed cinematic
- **Genres:** romance, CEO, werewolf / supernatural, revenge, fantasy, melodrama
- **Mood range:** emotional, dramatic, high-contrast, sensual, moody
- **Composition:** usually close-ups or two-shots of the leads, strong eye contact or silhouette, heavy atmospheric lighting
- **Palette leans:** deep reds, blacks, cool blues, gold accents, warm ambers — saturated and moody rather than pastel
- **Typography on covers:** bold serif or condensed sans, centered, often with slight glow or texture

## How to use

- Treat anything in `./covers/` as the authoritative visual reference for series artwork
- When generating screens that show cover art, either insert a real file from the folder or render a placeholder in the same visual style
- Don't invent cover styles that clash with what's in the folder — match the mood, contrast level, and composition patterns you see there
