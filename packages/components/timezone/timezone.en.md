`kbq-timezone-select` is a timezone selection component that extends `kbq-select`. It has the same capabilities, except for multiple selection — `[multiple]="true"` is rejected with an error rather than half-rendered. It can work with both `kbq-timezone-option` and `kbq-option`.

`kbq-timezone-option` is a timezone list item that extends `kbq-option`. It has the same capabilities but its own display template. Import it together with `KbqTimezoneOptionTooltip` (both come with `KbqTimezoneModule`): the directive is what shows the full city list when the option clamps it.

<!-- example(timezone-overview) -->

### Zone data

`KbqTimezoneZone.offset` is optional, and leaving it out is the safer choice: the offset is then resolved from the IANA `id` every time the option renders, so a zone that observes daylight saving time is labelled correctly on both sides of the change. A string supplied there is rendered verbatim and never recomputed — keeping it current is up to you.

Grouping is done by three pure helpers, so the same data produces the same list on the server and in the browser:

```ts
// One group per country, ordered by country name.
const groups = getZonesGroupedByCountry(zones);

// The user's own country first, the rest in place.
promoteCountry(groups, kbqResolveHostCountry(zones));

// The user's own country first, every other country behind one label.
collapseOtherCountries(groups, 'ru', 'Other countries');
```

`kbqResolveHostCountry` is the only one that reads `Intl`, and it is kept separate for that reason: on the server it resolves the server's time zone, not the user's.

### Dropdown menu size

The menu width is configured exactly as on the [select](/en/components/select), with the same attributes: by default the menu grows with its content, never gets narrower than the field or than 200 pixels, and stops at 640 pixels.

```html
<!-- Match the field exactly -->
<kbq-timezone-select panelWidth="auto" />

<!-- A fixed width; panelMinWidth is not applied to it -->
<kbq-timezone-select [panelWidth]="800" />

<!-- Let the menu grow further with its content -->
<kbq-timezone-select [panelMaxWidth]="800" />
```

### Search

Search splits a multi-word query into parts and searches for them independently, trims leading and trailing spaces, is case-insensitive, and folds diacritics. The algorithm is described in the [Smart search guide](/en/other/search-smart).

The placeholder of the search field comes from the active locale unless you bind one yourself.

<!-- example(timezone-search-overview) -->

### Custom trigger

`kbq-timezone-select-trigger` is a directive that allows you to define a custom display for the selected value.

<!-- example(timezone-trigger-overview) -->
