# Assets Catalog

> Все обложки, иконки и 3D-рендеры проекта. Превью подгружаются с GitHub. Используй колонку **slug** как идентификатор в коде/промптах.

## Story Covers — usage rules

The `Assets/story-covers/` folder contains series cover art for visual reference — posters, key art, promotional imagery used across the product.

### Strict rule: aspect ratio

**Cover artwork is always portrait 2:3**, regardless of the screen or context in which it's used (home feed, hero, player, cards, modals, thumbnails — everywhere). Do not crop, stretch, or re-frame to any other ratio. If a layout needs a different shape, fit the cover inside a 2:3 container (letterbox/background fill) — never distort the image itself.

Use this folder when generating UI that involves series artwork (home feed, hero banners, episode players, content cards). The agent can open any image in `Assets/story-covers/` to study the visual language: composition, lighting, color, typography, mood. Mimic the style when rendering mock artwork or placeholder visuals.

### Cover URLs

Direct links to every cover file. Copy any URL into an `<img src="...">` — works everywhere (Claude Code preview, Gemini Canvas, Figma Make, v0, CodeSandbox).

- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/01.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/02.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/03.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/04.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/05.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/06.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/07.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/08.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/09.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/10.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/11.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/12.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/13.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/14.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/15.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/16.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/17.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/18.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/19.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/20.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/21.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/22.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/23.png`
- `https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/24.png`

Usage in generated HTML/React:

```html
<img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/01.png" alt="cover" />
```

### What's typical in these covers

- **Format:** portrait 2:3, full-bleed cinematic
- **Genres:** romance, CEO, werewolf / supernatural, revenge, fantasy, melodrama
- **Mood range:** emotional, dramatic, high-contrast, sensual, moody
- **Composition:** usually close-ups or two-shots of the leads, strong eye contact or silhouette, heavy atmospheric lighting
- **Palette leans:** deep reds, blacks, cool blues, gold accents, warm ambers — saturated and moody rather than pastel
- **Typography on covers:** bold serif or condensed sans, centered, often with slight glow or texture

### How to use

- Treat anything in `Assets/story-covers/` as the authoritative visual reference for series artwork
- When generating screens that show cover art, either insert a real file from the folder or render a placeholder in the same visual style
- Don't invent cover styles that clash with what's in the folder — match the mood, contrast level, and composition patterns you see there

---

## Asset previews

### 3d-icons

| Preview | Slug |
|---|---|
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/3d-icons/hand.png" width="120"> | `hand` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/3d-icons/play-unlimited.png" width="120"> | `play-unlimited` |

### coin

| Preview | Slug |
|---|---|
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/coin/1-coin.png" width="120"> | `1-coin` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/coin/coin-pack-01.png" width="120"> | `coin-pack-01` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/coin/coin-pack-02.png" width="120"> | `coin-pack-02` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/coin/coin-pack-03.png" width="120"> | `coin-pack-03` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/coin/coin-pack-04.png" width="120"> | `coin-pack-04` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/coin/coin-pack-05.png" width="120"> | `coin-pack-05` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/coin/coin-pack-06.png" width="120"> | `coin-pack-06` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/coin/lots-coins.png" width="120"> | `lots-coins` |

### image-background

| Preview | Slug |
|---|---|
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/image-background/blue.png" width="120"> | `blue` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/image-background/brown.png" width="120"> | `brown` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/image-background/orange.png" width="120"> | `orange` |

### logo

| Preview | Slug |
|---|---|
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/logo/app-logo.png" width="120"> | `app-logo` |

### story-covers

| Preview | Slug |
|---|---|
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/01.png" width="120"> | `01` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/02.png" width="120"> | `02` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/03.png" width="120"> | `03` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/04.png" width="120"> | `04` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/05.png" width="120"> | `05` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/06.png" width="120"> | `06` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/07.png" width="120"> | `07` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/08.png" width="120"> | `08` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/09.png" width="120"> | `09` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/10.png" width="120"> | `10` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/11.png" width="120"> | `11` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/12.png" width="120"> | `12` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/13.png" width="120"> | `13` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/14.png" width="120"> | `14` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/15.png" width="120"> | `15` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/16.png" width="120"> | `16` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/17.png" width="120"> | `17` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/18.png" width="120"> | `18` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/19.png" width="120"> | `19` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/20.png" width="120"> | `20` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/21.png" width="120"> | `21` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/22.png" width="120"> | `22` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/23.png" width="120"> | `23` |
| <img src="https://raw.githubusercontent.com/alex03292303/My-Drama-Design-System-MD/main/Assets/story-covers/24.png" width="120"> | `24` |

---

_Generated automatically. Total assets: 38._
