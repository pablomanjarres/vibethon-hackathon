# Chargetrip: design system measured from the screenshots

Not the Refero original (see ../source.txt). Values are read from rental-desktop.jpg and
stations-detail.jpg.

## Colors

| Name | Value | Role |
|---|---|---|
| Canvas | #efece6 | Warm beige page ground behind the cards |
| Surface | #fbfaf6 | Cream panels: hero card, station side panel |
| Surface raised | #ffffff | Inner cards (charger card), nav bar, map controls |
| Tile | #e8e5de | Secondary action tiles (Open maps, Share), filled chips |
| Ink | #1d1c1a | Headlines, primary button fill, count pins |
| Ink muted | #5f5c57 | Supporting text, metadata |
| Hairline | #e3dfd7 | Row dividers in the panel, card borders |
| Accent | #f2541b | Orange dot before the section eyebrow ("Rental") |
| Available | #1f8a57 | "2/2 Available" pill fill and its label, station pins |
| Toast | #3a3936 at 90% | Bottom confirmation toast, white text |

## Type

- Headlines: a light transitional serif, large (56 px hero, weight 300 to 400, tight leading 1.1).
- UI and body: a neutral grotesk, 14 to 16 px, weight 400 body, 500 labels.
- Numbers in the panel (22 kW, prices) use the grotesk at 14 px, medium.

## Shape and depth

- Page cards: 16 px radius, no shadow, sit on the beige canvas with 20 px gutters.
- Station side panel: 16 px radius, floats 10 px from the map edges, soft shadow 0 4 24 rgba(0,0,0,.12).
- Buttons: 8 px radius. Primary is ink-filled with white text; secondary is an outline pill
  (999 px radius, 1 px ink border) or a tile-filled square tile with icon above label.
- Status pill: 6 px radius, green fill with white figures, label in green beside it.
- Map controls: white 8 px rounded column, 32 px buttons, hairline separators.

## Density

Comfortable: 16 to 20 px padding in panels, 44 px accordion rows separated by hairlines,
icon + label rows with 10 px gaps.
