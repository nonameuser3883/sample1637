# Button: Buttons

## Variants

- **Kind**: `primary` | `secondary` | `text` | `link`
- **Size**: `small` | `large`
- **State**: `default` | `pressed` | `disabled`
## Structure by shape

### primary / small

- **Anatomy:** horizontal-layout, w hug, h 32px, padding 0px 24px, gap 6px, radius 8px
- **Label:** `subhead.bold`

| State | Fill | Border | Text |
|-------|------|--------|------|
| `default` | #4500FF | — | `text.base-default` |
| `pressed` | #4E45FF | — | `text.base-default` |
| `disabled` | #363842 | — | `text.base-disabled` |

### primary / large

- **Anatomy:** horizontal-layout, w hug, h 48px, padding 0px 24px, gap 6px, radius 8px
- **Label:** `title4.bold`

| State | Fill | Border | Text |
|-------|------|--------|------|
| `default` | #4500FF | — | `text.base-default` |
| `pressed` | #4E45FF | — | `text.base-default` |
| `disabled` | #363842 | — | `text.base-disabled` |

### secondary / small

- **Anatomy:** horizontal-layout, w hug, h 32px, padding 0px 24px, gap 6px, radius 8px
- **Label:** `subhead.bold`

| State | Fill | Border | Text |
|-------|------|--------|------|
| `default` | — | #9499A3 | `text.lighter` |
| `pressed` | — | #363842 | `text.lighter` |
| `disabled` | — | #363842 | `text.base-disabled` |

### secondary / large

- **Anatomy:** horizontal-layout, w hug, h 48px, padding 0px 24px, gap 6px, radius 8px
- **Label:** `title4.bold`

| State | Fill | Border | Text |
|-------|------|--------|------|
| `default` | — | #9499A3 | `text.lighter` |
| `pressed` | — | #363842 | `text.lighter` |
| `disabled` | — | #363842 | `text.base-disabled` |

### text / small

- **Anatomy:** horizontal-layout, w hug, h 32px, padding 0px, gap 6px, radius 8px
- **Label:** `subhead.semibold`

| State | Fill | Border | Text |
|-------|------|--------|------|
| `default` | — | — | `text.base-default` |
| `pressed` | — | — | `text.lighter` |
| `disabled` | — | — | `text.base-disabled` |

### text / large

- **Anatomy:** horizontal-layout, w hug, h 48px, padding 0px, gap 6px, radius 8px
- **Label:** `title4.bold`

| State | Fill | Border | Text |
|-------|------|--------|------|
| `default` | — | — | `text.base-default` |
| `pressed` | — | — | `text.lighter` |
| `disabled` | — | — | `text.base-disabled` |

### link / small

- **Anatomy:** horizontal-layout, w hug, h hug, padding 0px, gap 6px, radius 8px
- **Label:** `subhead.link`

| State | Fill | Border | Text |
|-------|------|--------|------|
| `default` | — | — | `text.base-default` |
| `pressed` | — | — | `text.on-color` |
| `disabled` | — | — | `text.base-disabled` |

### link / large

- **Anatomy:** horizontal-layout, w hug, h hug, padding 0px, gap 6px, radius 8px
- **Label:** `title4.link`

| State | Fill | Border | Text |
|-------|------|--------|------|
| `default` | — | — | `text.base-default` |
| `pressed` | — | — | `text.on-color` |
| `disabled` | — | — | `text.base-disabled` |

## Tokens used

`subhead.bold`, `text.base-default`, `text.base-disabled`, `title4.bold`, `text.lighter`, `subhead.semibold`, `subhead.link`, `text.on-color`, `title4.link`
