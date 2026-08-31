# Apple Ops design system

## Direction

Minimal Swiss-style internal operations UI: high information clarity, compact but touch-safe density, almost no decorative motion. The UI exposes intent and outcome; workflow complexity stays in server operations.

## Tokens

- Background `#F6F7F9`, surface `#FFFFFF`, foreground `#172033`, muted text `#526176`, border `#DFE4EB`.
- Primary `#175CD3`, hover `#154FB7`, focus ring derived from primary.
- Success, warning and danger always pair color with an icon or text label.
- Fira Sans for interface copy; Fira Code for identifiers, versions and tabular figures.
- 4/8px spacing rhythm, 10px control/card radius, one restrained shadow level.

## Components and behavior

- Desktop uses a persistent 256px sidebar; narrow screens use a horizontally scrollable labeled navigation row.
- Controls are at least 44px high, keyboard reachable, and have visible focus.
- Dialog for short input, sheet for inspection, page for complex management.
- One primary action per view. Destructive actions require explicit confirmation; routine actions do not.
- Use URL state for important search and filters. Respect reduced motion and never use emoji as structural icons.

## Page rules

Tables can scroll inside their surface on narrow screens while the page itself never overflows. Operation status is always text plus an icon. Empty states explain the real next action and never advertise unimplemented features.
