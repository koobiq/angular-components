# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Aspect ratio input": the `[style.--kbq-flag-aspect-ratio]` host binding in `flag.ts` line 40, which Angular sets without `!important` unless the value ends with `!important`, and the `aspect-ratio: var(--kbq-flag-aspect-ratio)` rule in `flag.scss` line 10; verify the delta limits the precedence of the input to rules without `!important`
- [ ] 1.2 Re-read the evidence for "Proportions from a stylesheet": the zero-specificity `:where()` declarations in `flag-tokens.scss` lines 4-18 and the same inline binding in `flag.ts` line 40, which wins over a plain class rule; verify the delta excludes flags that have `aspectRatio`
- [ ] 1.3 Run `openspec validate correct-flag-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
