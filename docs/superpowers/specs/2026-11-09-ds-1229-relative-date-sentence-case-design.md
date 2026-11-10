# DS-1229: relative date case mid-sentence

## Intent

Let a relative date start with a lowercase letter when it sits mid-sentence — «Обновлено вчера, 14:48» / «Updated yesterday, 14:48» — in the Long and Short relative formats. Today the words «Вчера»/«Yesterday» are hardcoded capitalized in the templates, so consumers either live with the wrong case or lowercase the whole string, which also lowercases English month names («december 10»).

## Goals

- Opt-in flag on the relative formats, default unchanged (back-compatible, byte-identical default output).
- Lowercasing applies only to the word branches (yesterday / today / tomorrow). Date branches keep their rendering: the English month stays capitalized mid-sentence («Updated December 10, 14:48»), Russian months are already lowercase.
- Works across all seven formatter locales; `zh-CN`/`fa-IR` have no case and are unaffected.
- The four `kbqRelative*Date[Time]` pipes in angular-components pass the flag through.

## Non-goals and anti-goals

- No automatic detection of the position in a sentence — a formatter cannot know it; the caller declares it with the flag.
- No changes to absolute, range or duration formats; they ignore the flag.
- No new parameters on the deprecated unprefixed pipes (removed in 22.0.0).
- Do not touch the date branches (`BEFORE_YESTERDAY` / `AFTER_TOMORROW`) — lowercasing them is exactly the reported bug for English months.

## Approaches

1. **Chosen: fix in `@koobiq/date-formatter`, pass through in angular-components.** The strings live in that package; direct consumers (including react-components) get the feature too. `relativeDate()` records which template branch was selected and, when it is one of the word branches and the flag is off, lowercases the first character of the compiled result. Verified: in all seven locales the word-branch templates start with the literal word, so lowering the first character is safe.
2. **Rejected: post-process the result in the angular-components wrapper.** The wrapper cannot tell a word branch from a date branch, so it would lowercase «December 10» as well — the reported bug — or it would have to duplicate template knowledge from the package.

## Design

date-formatters repo (`koobiq/date-formatters`):

- `DateTimeOptions` gains `sentenceStart?: boolean` (documented as relative-only). Reusing the single options bag follows the existing precedent: the relative DateTime methods already accept and ignore `currYear`.
- `relativeShortDate` / `relativeLongDate` gain a trailing `options?: DateTimeOptions`; `relativeShortDateTime` / `relativeLongDateTime` pass the new field through the options they already take.
- `relativeDate()` gains a trailing `sentenceStart = true` parameter. When `false` and the selected branch is `YESTERDAY` / `TODAY` / `TOMORROW`, the first character of the result is lowercased. Absolute/range/duration methods ignore the option.
- Release via the normal nx-release flow (maintainer-only), then bump the dependency in angular-components.

angular-components repo:

- Bump `@koobiq/date-formatter` everywhere it is declared (root `package.json`, `packages/components/package.json`, `tools/check-angular`, the docs StackBlitz manifest).
- `KbqRelativeLongDatePipe` / `KbqRelativeShortDatePipe` gain an optional `options?: DateTimeOptions` transform argument; the two DateTime pipes forward `sentenceStart` through their existing options. The impure-pipe cache keys already include the args, so caching needs no change.
- Refresh the API snapshots (`approve-api` for `components/core`).
- Extend the relative date formatter docs example and the en/ru MDX pages with a mid-sentence demo.

Sequencing: the package release must land before the angular-components PR merges, because CI installs `@koobiq/date-formatter` from npm. Two PRs in two repos.

## Verification

- date-formatters: extend the parametrized locale specs and the per-format specs with both flag values across adapters and locales; assert the word branches change case and the date branches do not. Default-flag snapshots must stay identical.
- angular-components: unit-test the new pipe argument (word vs date branch, both locales via the existing spec setup), run the formatter unit suite, `check-api` after `approve-api`, lint and formatting.

Exact JSDoc wording and the shape of the docs demo are left to the implementer.
