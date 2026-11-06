# Tasks

## 1. Verify the corrections

- [ ] 1.1 Re-read the evidence for "Fraction separator" (`onKeyDown` and `formatViewValue` in `packages/components/input/input-number.ts`, `normalizeNumber` in `packages/components/core/locales/locale-service.ts`, the `pt-BR` `input.number` data in `packages/components/core/locales/formatters.ts`) and verify a typed `.` is split off as a fraction only when the group separators include a space and the fraction separator is `,`
- [ ] 1.2 Re-read the evidence for "Paste" (`onPaste` in `input-number.ts`, `checkAndNormalizeLocalizedNumber` and `KBQ_DEFAULT_LOCALE_DATA_FACTORY` in `locale-service.ts`) and verify that without a locale service the shipped locales are tried from `en-US` and that the scenarios name the locale service they rely on
- [ ] 1.3 Re-read the evidence for "Stepping from the keyboard" (`stepUp`, `stepDown` and `viewToModelUpdate` in `input-number.ts`) and verify a step reports its result unconditionally while a typed change reports only a different number
- [ ] 1.4 Re-read the evidence for "Caret position after a reformat" (`onInput`, `correctCaretForSeparator` and `setViewValue` in `input-number.ts`, the "caret position" cases in `input-number.spec.ts`) and verify the caret moves by one position whenever the length changes by two, wherever the separator lands
- [ ] 1.5 Re-read the evidence for "Separators follow the locale" (`createLocalizedNumberFromParts` in `input-number.ts`, `formatNumberWithLocale` in `packages/components/core/formatters/number/formatter.ts`) and verify the rendered group separator is `viewGroupSeparator` or the one of `Intl.NumberFormat`
- [ ] 1.6 Re-read the evidence for "Rendering for es-LA" (`resolveIntlLocale` and `createLocalizedNumberFromParts` in `input-number.ts`, the `es-LA` and `ru-RU` `input.number` data in `formatters.ts`) and verify `es-LA` keeps its own section, which has no `startFormattingFrom`
- [ ] 1.7 Run `openspec validate correct-input-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`.
