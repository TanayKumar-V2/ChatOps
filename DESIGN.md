# ChatOps Design System

## Direction

ChatOps uses an operate-mode “signal workbench”: a dark, quiet technical workspace where room navigation, live conversation, and room context remain visible together. The visual system is deliberately restrained so real-time state can carry the energy.

## Palette

- Background: `#101416`
- Panel: `#151b1e`
- Surface: `#1b2427`
- Border: `#293337`
- Primary text: `#f1f5f4`
- Muted text: `#7d8a8e`
- Signal accent: `#42d9bd`
- Warm secondary signal: `#e5a35c`

## Typography

DM Sans is used for interface copy, with IBM Plex Mono reserved for timestamps, counts, status labels, and keyboard hints. Headings use compact sizing and negative tracking rather than oversized display treatment.

## Shape and depth

The system uses a consistent soft geometry: 8px controls, 9–14px panels and avatars, and restrained borders. Depth comes from dark surface changes and subtle shadows, not glowing cards.

## Layout

Desktop uses a three-column workbench: 252px room rail, flexible conversation, and 264px detail rail. At 1100px the detail rail collapses; at 700px the room rail collapses and the conversation becomes the primary mobile surface.

## Interaction

Motion communicates state: room hover, send feedback, typing cadence, and focus. `prefers-reduced-motion` disables nonessential animation. Every icon-only control has an accessible label.

## Content states

The chat surface includes demo messages, empty-capable message history, typing feedback, presence, message actions, and a composer. Demo mode is explicit until the JWT/auth service is connected.
