# Ferienhof Oltmanns — Hugo Site

A modern, mobile-first Hugo static site for **Ferienhof Oltmanns**, a holiday farm in Ostfriesland near the North Sea (Esens, Germany).

## Design

- **Aesthetic**: editorial coastal — warm bone/cream base with deep forest green and terracotta accents
- **Typography**: Fraunces (display serif with optical sizing) paired with Inter Tight (body)
- **Mobile-first**: designed from the smallest breakpoint up; all layouts work from ~320px
- **Performance**: no build tooling, no CSS frameworks, no images required — ~20 KB total payload
- **Accessibility**: semantic HTML, respects `prefers-reduced-motion`, proper focus states, aria attributes on mobile nav
- **SEO**: LodgingBusiness JSON-LD structured data, Open Graph tags, clean meta

## Structure

```
ferienhof-oltmanns/
├── hugo.toml                 # Site config
├── layouts/
│   ├── _default/baseof.html  # Base HTML shell
│   ├── index.html            # Homepage with all sections
│   └── partials/
│       ├── header.html       # Sticky header + mobile nav
│       └── footer.html       # CTA + contact footer
├── static/
│   ├── css/main.css          # All styles (mobile-first)
│   └── js/main.js            # Progressive enhancement (nav, reveal)
└── content/                  # Currently empty; site content lives in index.html
```

## Requirements

- [Hugo](https://gohugo.io/installation/) v0.110.0 or newer (extended not required)

## Run locally

```bash
cd ferienhof-oltmanns
hugo server
```

Then open http://localhost:1313

## Build for production

```bash
hugo --minify
```

The output is written to `./public/` — drop this on any static host (Netlify, Cloudflare Pages, GitHub Pages, a plain Apache/nginx server, etc.).

## Customisation

- **Email / contact**: edit `[params]` in `hugo.toml`
- **Copy / sections**: edit `layouts/index.html`
- **Colours**: edit the `:root` tokens at the top of `static/css/main.css`
- **Fonts**: swap the Google Fonts link in `layouts/_default/baseof.html` and update `--f-display` / `--f-body` variables

## Adding photos

There are currently no photos bundled — the hero uses a gradient + grain texture, and the farm section uses an SVG illustration. To add real photos:

1. Drop images into `static/images/`
2. Reference them in `layouts/index.html` (e.g. the hero `.hero__media` div can be swapped for an `<img>` or a `background-image`)

Suggested shots: the farmhouse exterior, an apartment interior, cows on the pasture, the dyke at sunset, a wide landscape with the farm in the distance.

## Map

The location section includes an interactive map powered by **[VersaTiles](https://versatiles.org)** + **[MapLibre GL JS](https://maplibre.org)** — a fully open-source map stack using OpenStreetMap data.

**How it works**

- Both libraries are **self-hosted** under `static/vendor/` — no runtime CDN dependency for rendering the map shell
- Vector tiles, sprites and glyphs stream from the free `tiles.versatiles.org` public demo server
- The `graybeard` style is used (neutral greyscale) so the terracotta marker reads clearly against it
- Map initialises lazily via IntersectionObserver — it only boots when the section scrolls into view
- `cooperativeGestures: true` — on mobile, one-finger scroll moves the page, two fingers pan the map
- Labels are in German (`language: 'de'`)

**Changing the marker location**

Edit `data-lat`, `data-lng` and `data-zoom` attributes on the `#map` element in `layouts/index.html`. Current values point to the northern edge of Esens (53.6603°N, 7.6118°E) per the PDF — adjust once the exact address is known.

**Switching the map style**

In `static/js/main.js`, swap `VersaTilesStyle.graybeard(...)` for any of: `colorful`, `eclipse`, `neutrino`, `shadow`, or `satellite`. Each takes the same config object (`language`, `recolor`, etc.).

**Going fully self-hosted (optional)**

For complete independence from `tiles.versatiles.org`, you can host the tiles yourself. See the [VersaTiles docs](https://github.com/versatiles-org/versatiles-documentation) — roughly: download a `.versatiles` tile archive (Germany ~5 GB), run `versatiles-rs` as a tile server, then rebuild the style pointing at your own host.

**Bundled library versions**

- MapLibre GL JS 5.21 — `static/vendor/maplibre-gl/`
- VersaTiles Style 5.10.2 — `static/vendor/versatiles-style/`

To upgrade, replace these files with new versions from [MapLibre releases](https://github.com/maplibre/maplibre-gl-js/releases) and the `versatiles-style.tar.gz` asset in [VersaTiles Style releases](https://github.com/versatiles-org/versatiles-style/releases).

## Content sections

1. **Hero** — headline, lede, CTAs, quick facts
2. **Intro** — welcome statement from the Oltmanns family
3. **Apartments** — four apartment cards (2 ground floor, 2 upper floor) with details and included amenities
4. **Farm life** — the livestock, play areas, and rural atmosphere
5. **Location** — travel times to the spa, the sea, and the beach towns, followed by an interactive VersaTiles map
6. **Season** — year-round availability and off-season discounts
7. **Footer / Contact** — email CTA and meta info
