Search fields in the kit's components leave matching entirely to the consumer, and the default reach-for is substring search.

Substring search breaks down on multi-word queries. For example, the query `10.125 all` won't find `10.125.123.0/24 - all` — the string doesn't contain it as one continuous substring. Yet that's exactly what the user meant.

Below are the principles we implemented for search in the kit. Their reference implementation is `normalizeSearchValue`, `tokenizeSearchQuery` and `createSearchPredicate` from `@koobiq/components/core`. The implementation is opt-in and doesn't change how any component behaves by default — wire it into your own filtering code the same way you'd wire up a substring search today.

### Case shouldn't matter

A case-sensitive search skips matches purely because of a case difference, even though the strings are otherwise identical. Comparison treats `WORLD`, `world` and `World` as the same value.

### Trimming the ends, not the middle

Only the ends of a string are trimmed. Whitespace in the middle of a value is left untouched: collapsing it could turn two separate words into one and change what a phrase means.

### Tokenizing the query, matching every token

A multi-word query is split into independent tokens that are matched separately; a value counts as a match only if every token is found (AND across tokens). This is what actually fixes the motivating example: `10.125` and `all` are each substrings of `10.125.123.0/24 - all`, even though the two-word query never appears there as one continuous run.

Tokens wrapped in double quotes are a single unbreakable phrase. This lets a query require an exact run of characters, spaces included, when plain tokenizing isn't precise enough.

### Diacritics are folded, not ignored

<div class="kbq-callout">
<div class="kbq-callout__header">What a diacritic is</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

A diacritic is a mark added above, below, or through a letter. It indicates pronunciation — for example, the accent in `é`, the umlaut in `ü`, or the cedilla in `ç`. Such a mark can be separated from its base letter with Unicode normalization (`é` → `e` plus a separate floating accent), then stripped.

</div>
</div>

Users often don't type accents, and data doesn't always carry them consistently either. That's why `cafe` and `café` should find each other — no matter which one was typed and which one was stored.

A diacritic is folded down to its base letter rather than stripped along with everything else. Punctuation like `/`, `-` and `.` is left untouched, so IP ranges and similar values aren't mangled by the same pass.

Highlighting the match, if your UI does that, needs to know about the folding too — a highlighter that compares literally has nothing to mark on a folded hit, since the token and the value differ by exactly the accent that made them match. `kbqHighlightBackground`/`mcHighlight` take a `foldDiacritics` argument for this: pass `true` when the keywords were matched with folding (e.g. via `createSearchPredicate`), and searching `cafe` will mark `Café` rather than leave it bare, as the examples below do.

### A token can be checked against several fields at once

Which fields belong in a search is a decision for the calling code, not the matching logic itself: it depends on the shape of the data. A token counts as found if it matches any one of several fields (OR across fields, AND across tokens):

```ts
const matches = createSearchPredicate('10.125 guest');
matches(['10.125.11.0/24', 'guest network']); // true — "10.125" is found in the first field, "guest" in the second
matches(['10.125.11.0/24', 'production']); // false — "guest" isn't found in either field
```

### Relevance ranking

The matching logic only answers "does it match" — it doesn't rank results. Ranking can be added on top when result order matters, for example by a separate scoring library used alongside `createSearchPredicate`/`tokenizeSearchQuery`:

```ts
const tokens = tokenizeSearchQuery(query);
options.filter(createSearchPredicate(query)).sort(rankByRelevance(tokens));
```

### What's intentionally out of scope

/* cspell:disable-next-line */
Typo tolerance isn't part of these principles — for example, edit-distance matching where `developr` finds `developer`. It's a separate and much larger problem. If a product genuinely needs it, reach for a dedicated fuzzy-search library rather than extending this matching logic.

### Examples by component

Live examples and code live on each component's own page:

- [Select](/en/components/select/overview#list-with-search)
- [Tree-select](/en/components/tree-select/examples#smart-search)
- [Filter-bar](/en/components/filter-bar/examples#smart-search)
- [Timezone](/en/components/timezone/examples#smart-search)
