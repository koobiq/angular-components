# accordion-state-saving-default

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Reports the consequences of `KbqAccordion.useStateSaving` defaulting to
`true`. It never writes to the tree.

## Background

`useStateSaving` shipped in 20.2.0 defaulting to `false`, and persisting anything also required a
`stateSavingKey`: the fallback was the accordion's own id, which carries a global instantiation
counter and therefore changes as soon as anything else on the page is created ahead of it. That is why
the previous release warned about a missing key.

Both are gone. An accordion with no `stateSavingKey` derives its key from where it sits in the
document — the chain of tag names up to `<body>`, cut short by the first author-written `id`, which
becomes the anchor. So `<kbq-accordion>` inside `<section id="settings">` persists under
`#settings/kbq-accordion`, and everything above that `id` can be restructured without moving the key.

With a usable key available for free, persistence is on by default.

## What it reports

- **The default flip.** A file that renders `kbq-accordion` and never writes `useStateSaving`.
- **`defaultValue` demoted.** It applies to the first visit only; from the second one on, the sections
  the user left open win.
- **Positional item values.** `KbqAccordionItem.value` falls back to the item's position inside its
  accordion instead of its id, because the position is what survives a reload. Only reported for a file
  whose items carry no `value` at all.

Each check is evaluated against the whole file, matching the other warn-only migrations in this
collection. A file holding two accordions where only one opts out is not reported — inspect it by hand.

## What it does _not_ do

It does not insert `[useStateSaving]="false"`. The markup whose behaviour changed is exactly the markup
that says nothing about the input, so opting every accordion out would be a rewrite of every consumer
template that also withholds the feature this release is shipping. Opting out stays a decision the
application makes.

## Storage format

Entries are written under a `kbq.state.` prefix and carry a `savedAt` timestamp, so an entry stranded
by a markup change is collected once it outlives `KBQ_STATE_SAVING_TTL` (90 days by default). Reading
an entry refreshes it, so state that is visited but never changed does not expire under an active user.

An entry written by 20.2.0 under the bare, unprefixed key is still read, so an upgrade does not reset
what users had. It is never rewritten or removed: an unprefixed key is not necessarily ours, and an
application storing its own `settings` must not lose it to a component keyed `stateSavingKey="settings"`.
The first save moves the state under the prefix and takes over from there.

## Related tokens

- `KBQ_STATE_STORE` — where state is persisted. `KbqSessionStorageStateStore` is bundled for state that
  should live no longer than the tab session.
- `KBQ_STATE_SAVING_KEY_RESOLVER` — how the key is derived when no `stateSavingKey` is given.
- `KBQ_STATE_SAVING_TTL` — how long an entry survives without being written or read.
