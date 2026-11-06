# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Disabled anchor" and "Disabled anchor ignores activation keys": the capture-phase listeners `button.component.ts` registers on the host (lines 479-480, 590-605) and the capture-phase `click` listener of the CDK overlay's outside-click dispatcher on `<body>`; verify the delta names the capture-phase exception
- [ ] 1.2 Re-read the evidence for "Keyboard focus ring": `_button-theme.scss` lines 99-109 draw the outline only for `filled`, `outline` and `transparent`, and `_button-base.scss` lines 97-99 remove the native outline; verify the delta limits the ring to the built-in styles
- [ ] 1.3 Re-read the evidence for "Label truncation": the `:has(> .kbq-icon)` flex rule in `_button-base.scss` lines 124-133 and the `e2eButtonTruncationLegacy` button in `__screenshots__/05-light.png`, clipped without an ellipsis; verify the delta states that exception
- [ ] 1.4 Re-read the evidence for "Icons are centred": the `.wrapper` rule and its comment in `e2e.ts` lines 403-408, which the wrapped icon-only checks of `e2e.playwright-spec.ts` rely on; verify the delta leaves centring inside the wrapper to the consumer
- [ ] 1.5 Re-read the evidence for "Right-to-left layout": the physical `border-right-color` and `left` rules in `button-group.scss` lines 169-171 and 201-211 and the `__screenshots__/06-rtl.png` baseline (open outer right border of the outline groups, divider on the outer left edge of the `filled` `contrast-fade` groups); verify the delta describes them
- [ ] 1.6 Run `openspec validate correct-button-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
