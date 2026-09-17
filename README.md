# @gratora/ui

The Gratora design system — shared admin UI components, design tokens, and dashboard
widgets used across the Gratora plugin and its add-ons.

## Principle: stick to the designs

Gratora has a deliberate, polished visual language. **Never hand-roll one-off styles
in a consuming plugin.** If a UI piece is missing, add it here, composed from the
existing primitives and tokens. Everything routes through the token catalogue —
no hardcoded colours, spacing, radii, or shadows outside `src/scss/_tokens.scss`.

This is what keeps every product built on it visually identical.

## What's here

- `src/components/` — primitives (Btn, Card, Notice, Dialog, Drawer, Field,
  Segmented, Switch, Slider, ColorInput, ...).
- `src/widgets/` — dashboard widgets (MetricCard, WidgetGrid, RevenueChart, ...).
- `src/styling/` — the brand-panel preview machinery (StylePreview, TokenEditor).
- `src/scss/` — tokens + per-component SCSS partials.
- `src/utils/`: `format` (money and every date shape), `currency`, `countries`, `text`, `download`, `rest`, and the `notify` toast store.

## Consuming it

JavaScript ships **compiled**: `prepare` runs Babel on install, so a consumer
imports plain JS and needs no build configuration for it. SCSS ships as
**source**, so it compiles against the consuming plugin's own token overrides.

Install (git tag, no npm registry yet):

```sh
npm install "git+https://github.com/gratorawp/ui.git#v1.1.0"
```

Name the URL in full rather than the `gratorawp/ui#tag` shorthand: npm expands the
shorthand to `ssh://git@github.com`, which any machine without a GitHub SSH key
fails on, CI runners included.

JS:

```js
import { Btn, Card, Notice, MetricCard } from '@gratora/ui';
```

SCSS (in a page-level stylesheet):

```scss
@import '@gratora/ui/scss/tokens';
@import '@gratora/ui/scss/components/buttons';
```

## Storybook

```sh
npm install
npm run storybook
```

Renders every component against the Gratora tokens. Storybook uses its own Vite
preview; production consumers use their own build.
