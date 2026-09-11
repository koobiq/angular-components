# state-saving-default

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports the consequences of `kbq-tab-group`, `kbq-sidebar` and
`kbq-content-panel-container` persisting the state a user changes, with `useStateSaving` defaulting to
`true` on all three. It never writes to the tree.

## Background

All three gained the same state saving the accordion and the tree already have, applied through the
`KbqStateSaving` host directive, and it is on by default. With no `stateSavingKey` the key is derived from
where the component sits in the document — the chain of tag names up to `<body>`, cut short by the first
author-written `id`, which becomes the anchor.

Each of them keeps out of the store while the application drives the state, so the change only reaches
markup that says nothing about it:

| Component                     | Persists                                                 | Stays out of it while                            |
| ----------------------------- | -------------------------------------------------------- | ------------------------------------------------ |
| `kbq-tab-group`               | the selected tab, by `tabId` and by position             | `selectedIndex` or `activeTab` is bound          |
| `kbq-sidebar`                 | whether it was open, and the width it was last closed at | `opened` is bound                                |
| `kbq-content-panel-container` | whether it was open, and the dragged width               | `opened` is bound — the width is restored anyway |

## What it reports

- **The default flip**, once per component, for a file that renders one and neither opts out nor binds
  the state the application would own.
- **Tabs with no `tabId`.** The selection then falls back to the position, which survives a reload but
  not a reordering; a dev-mode warning says so at runtime too.
- **`KbqContentPanelContainer.opened` read programmatically.** It is `openedInput` now and reads
  `undefined` while nothing binds it, which is how the panel tells a bound `opened` from an unbound one.
  Templates are unaffected; `isOpened()` is the public read.

Each check is evaluated against the whole file, matching the other warn-only migrations in this
collection. A file holding two tab groups where only one opts out is not reported — inspect it by hand.

## What it does _not_ do

It does not insert `[useStateSaving]="false"`. The markup whose behaviour changed is exactly the markup
that says nothing about the input, so opting every component out would be a rewrite of every consumer
template that also withholds the feature this release is shipping.

It also says nothing about `kbq-tab-nav-bar`, which deliberately never persists: it is the navigation
variant, where the router decides which link is active and the URL is the state worth restoring.

## Behaviour worth knowing without a report

- **A component rendered inside an overlay does not persist.** It is not in the document when it
  initializes and so has no stable key.
- **The content panel's width is restored even when `[opened]` is bound.** There is no `widthChange`
  output, so a drag never reached the application; `[width]` is the width the panel starts at. A
  double-click on the resizer restores that declared width, and the reset is persisted too.
- **The sidebar's width is the one it had when last closed** — the same width it already reuses when
  reopening. Dragging it wider and reloading without closing keeps the previous width.

## Storage format

Entries are written under a `kbq.state.` prefix and carry a `savedAt` timestamp, so an entry stranded by a
markup change is collected once it outlives `KBQ_STATE_SAVING_TTL` (90 days by default). Reading an entry
refreshes it, so state that is visited but never changed does not expire under an active user.

## Related tokens

- `KBQ_STATE_STORE` — where state is persisted. `KbqSessionStorageStateStore` is bundled for state that
  should live no longer than the tab session.
- `KBQ_STATE_SAVING_KEY_RESOLVER` — how the key is derived when no `stateSavingKey` is given.
- `KBQ_STATE_SAVING_TTL` — how long an entry survives without being written or read.
