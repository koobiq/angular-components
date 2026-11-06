# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/resizer/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Handle needs a resizable container": verify that `KbqResizer` in `packages/components/resizer/resizer.ts` injects `KbqResizable` with a plain `inject()`, and that `KbqSplitterPanel` in `packages/components/splitter/splitter.ts` applies `KbqResizable` through `hostDirectives` while its own template holds the `[kbqResizer]` separator, which the splitter unit specs create without an error
- [ ] 1.2 "Starting size in the element's box model": in `resizer.ts`, verify that `getResizableSize()` returns `getBoundingClientRect()` under `border-box` and the parsed computed `width` and `height` otherwise, with `0` for a value that is not a number
- [ ] 1.3 "Size is not clamped": in `resizer.ts`, verify that `updateSize()` writes `coerceCssPixelValue(width)` and `coerceCssPixelValue(height)` through `Renderer2.setStyle()` with no clamping and no check for a negative value, and that the DOM renderer assigns the style property directly, which ignores a value that is not valid for it
- [ ] 1.4 "No keyboard or assistive-technology support": in `resizer.ts`, verify that the `host` metadata of both directives binds only their class and, for `KbqResizer`, the `cursor` style, and that neither directive listens to keyboard events
- [ ] 1.5 Run `openspec validate correct-resizer-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/resizer/spec.md`.
