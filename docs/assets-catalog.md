# Assets Catalog

> Все обложки, иконки и 3D-рендеры проекта. Превью подгружаются с GitHub. Используй колонку **slug** как идентификатор в коде/промптах.

## Story Covers — usage rules

The `Assets/story-covers/` folder contains series cover art for visual reference — posters, key art, promotional imagery used across the product.

### Strict rule: aspect ratio

**Cover artwork is always portrait 2:3**, regardless of the screen or context in which it's used (home feed, hero, player, cards, modals, thumbnails — everywhere). Do not crop, stretch, or re-frame to any other ratio. If a layout needs a different shape, fit the cover inside a 2:3 container (letterbox/background fill) — never distort the image itself.

Use this folder when generating UI that involves series artwork (home feed, hero banners, episode players, content cards). The agent can open any image in `Assets/story-covers/` to study the visual language: composition, lighting, color, typography, mood. Mimic the style when rendering mock artwork or placeholder visuals.

### Cover URLs

Direct links to every cover file. Copy any URL into an `<img src="...">` — works everywhere (Claude Code preview, Gemini Canvas, Figma Make, v0, CodeSandbox).

- `https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/01.png`
- `https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/02.png`
- `https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/03.png`
- `https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/04.png`
- `https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/05.png`
- `https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/06.png`
- `https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/07.png`
- `https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/08.png`
- `https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/09.png`
- `https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/10.png`
- `https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/11.png`
- `https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/12.png`
- `https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/13.png`
- `https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/14.png`
- `https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/15.png`

Usage in generated HTML/React:

```html
<img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/01.png" alt="cover" />
```

### What's typical in these covers

- **Format:** portrait 2:3, full-bleed cinematic
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
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/bag.png" width="120"> | `bag` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/bag2.png" width="120"> | `bag2` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/bell.png" width="120"> | `bell` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/bell2.png" width="120"> | `bell2` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/bookmark.png" width="120"> | `bookmark` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/bookmark2.png" width="120"> | `bookmark2` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/calendar.png" width="120"> | `calendar` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/camera.png" width="120"> | `camera` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/crown.png" width="120"> | `crown` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/crown2.png" width="120"> | `crown2` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/crown3.png" width="120"> | `crown3` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/crown4.png" width="120"> | `crown4` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/download-container.png" width="120"> | `download-container` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/download.png" width="120"> | `download` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/fire.png" width="120"> | `fire` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/fire2.png" width="120"> | `fire2` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/hand.png" width="120"> | `hand` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/heart.png" width="120"> | `heart` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/heart2.png" width="120"> | `heart2` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/heart3.png" width="120"> | `heart3` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/heart4.png" width="120"> | `heart4` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/lock.png" width="120"> | `lock` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/lock2.png" width="120"> | `lock2` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/message.png" width="120"> | `message` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/movie.png" width="120"> | `movie` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/no-internet.png" width="120"> | `no-internet` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/plane.png" width="120"> | `plane` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/play-unlimited.png" width="120"> | `play-unlimited` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/star.png" width="120"> | `star` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/star2.png" width="120"> | `star2` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/ticket.png" width="120"> | `ticket` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/ticket2.png" width="120"> | `ticket2` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/train.png" width="120"> | `train` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/travel.png" width="120"> | `travel` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/3d-icons/yellow-trophy.png" width="120"> | `yellow-trophy` |

### backdrop

| Preview | Slug |
|---|---|
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/backdrop/1.png" width="120"> | `1` |

### coin

| Preview | Slug |
|---|---|
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/coin/1-coin.png" width="120"> | `1-coin` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/coin/coin-pack-01.png" width="120"> | `coin-pack-01` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/coin/coin-pack-02.png" width="120"> | `coin-pack-02` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/coin/coin-pack-03.png" width="120"> | `coin-pack-03` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/coin/coin-pack-04.png" width="120"> | `coin-pack-04` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/coin/coin-pack-05.png" width="120"> | `coin-pack-05` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/coin/coin-pack-06.png" width="120"> | `coin-pack-06` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/coin/lots-coins.png" width="120"> | `lots-coins` |

### image-backgrounds

| Preview | Slug |
|---|---|
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/image-backgrounds/dark-blue.png" width="120"> | `dark-blue` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/image-backgrounds/glow-mixed.png" width="120"> | `glow-mixed` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/image-backgrounds/right-blue.png" width="120"> | `right-blue` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/image-backgrounds/top-blue.png" width="120"> | `top-blue` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/image-backgrounds/top-covers-with-blue.png" width="120"> | `top-covers-with-blue` |

### image-surface

| Preview | Slug |
|---|---|
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/image-surface/blue.png" width="120"> | `blue` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/image-surface/dark-brown.png" width="120"> | `dark-brown` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/image-surface/dark-premium-blue-2.png" width="120"> | `dark-premium-blue-2` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/image-surface/dark-premium-blue.png" width="120"> | `dark-premium-blue` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/image-surface/orange.png" width="120"> | `orange` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/image-surface/square-dark-premium-blue.png" width="120"> | `square-dark-premium-blue` |

### logo

| Preview | Slug |
|---|---|
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/logo/app-logo-golden-only-for-premium.png" width="120"> | `app-logo-golden-only-for-premium` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/logo/app-logo.png" width="120"> | `app-logo` |

### story-covers

| Preview | Slug |
|---|---|
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/01.png" width="120"> | `01` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/02.png" width="120"> | `02` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/03.png" width="120"> | `03` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/04.png" width="120"> | `04` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/05.png" width="120"> | `05` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/06.png" width="120"> | `06` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/07.png" width="120"> | `07` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/08.png" width="120"> | `08` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/09.png" width="120"> | `09` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/10.png" width="120"> | `10` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/11.png" width="120"> | `11` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/12.png" width="120"> | `12` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/13.png" width="120"> | `13` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/14.png" width="120"> | `14` |
| <img src="https://raw.githubusercontent.com/nonameuser3883/sample1637/main/assets/story-covers/15.png" width="120"> | `15` |

---

_Generated automatically. Total assets: 72._
