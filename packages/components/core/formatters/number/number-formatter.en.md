### Decimal separator

In Russian, a comma is used as the separator in decimal fractions, not a dot.

### Numbers are grouped by digit groups

In large numbers, digit groups are separated by a thin space — they are grouped in threes, counting from the right: in text — starting from 5 digits: 1234, 56 789, 987 654, 1 000 000 000. In tables — always: 1 234, 56 789, 987 654, 1 000 000 000.

### Decimal formatting

Use the `kbqNumber` pipe in text and `kbqTableNumber` in tables. Both accept an optional `digitsInfo` string that controls the number of integer and fraction digits:

```
{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}-{useGrouping}
```

- `minIntegerDigits` — the minimum number of integer digits. Default is `1`.
- `minFractionDigits` — the minimum number of fraction digits. Default is `0`.
- `maxFractionDigits` — the maximum number of fraction digits. Default is `3`.
- `useGrouping` — an optional `true`/`false` flag that turns digit grouping on or off. For example, `'4.0-2-false'` keeps 4 integer and up to 2 fraction digits while disabling the group separators.

<!-- example(number-formatter-overview) -->

### Abbreviated numbers

Use the `kbqRoundNumber` pipe to display large numbers in a short form: a thousand as «K», a million as «M», a billion as «B», and so on.

<!-- example(number-formatter-rounding) -->

### Forcing a locale

By default the pipes use the current application locale. Pass a locale code as the last argument to format a value in a specific locale regardless of the active one.

<!-- example(number-formatter-locale) -->
