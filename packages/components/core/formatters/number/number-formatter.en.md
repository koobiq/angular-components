Every language has its own norms for writing numbers: the decimal separator, digit grouping, the labels for thousands and millions. Formatters apply the norms of the current locale and update the output when the language changes. Use them anywhere a user reads numbers.

### Digit grouping

In large numbers, digits are grouped in threes, counting from the right. Use the `kbqNumber` pipe in text and `kbqTableNumber` in tables. The pipes differ in the threshold at which grouping starts.

The examples below follow the norms of the Russian locale: a thin space as the group separator, and a threshold in text. In other locales the pipes use the separator of that locale and always separate digit groups.

`kbqNumber` groups digits in numbers from 10&#8239;000 up, that is, starting from five digits: 1234, 56&#8239;789, 987&#8239;654, 1&#8239;000&#8239;000&#8239;000. In running text, a short number reads more naturally without a separator.

`kbqTableNumber` always separates digit groups: 1&#8239;234, 56&#8239;789, 987&#8239;654, 1&#8239;000&#8239;000&#8239;000. In a table, even columns make it easier to compare values by digit place from top to bottom.

### Formatting

Both pipes accept an optional `digitsInfo` string that sets the number of integer and fraction digits:

```
{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}-{useGrouping}
```

| Parameter           | Default | Description                       |
| ------------------- | ------- | --------------------------------- |
| `minIntegerDigits`  | `1`     | Minimum number of integer digits  |
| `minFractionDigits` | `0`     | Minimum number of fraction digits |
| `maxFractionDigits` | `3`     | Maximum number of fraction digits |
| `useGrouping`       | `true`  | Turns digit grouping on or off    |

For example, `'4.0-2-false'` keeps 4 integer and up to 2 fraction digits and disables grouping.

<!-- example(number-formatter-overview) -->

### Abbreviated numbers

The `kbqRoundNumber` pipe displays large numbers in a short form: a thousand as `K`, a million as `M`, a billion as `B`, and so on.

<!-- example(number-formatter-rounding) -->

### Choosing a locale

By default the pipes use the current application locale. Pass a locale code as the last argument to format a value in the specified locale regardless of the active one.

<!-- example(number-formatter-locale) -->
