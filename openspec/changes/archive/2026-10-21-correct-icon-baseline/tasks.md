# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Size taken from the name": `parseIconSize` in `icon.component.ts` lines 306-312 reads the size with `parseInt` from the last `_`-separated part, which is the whole name when it has no underscore, and the `max-height` is written only from `ngAfterContentInit`, an `iconSize` change and `renderSvgIcon` (lines 221, 226-231, 256-300); verify the delta states the parse and the lag while a lookup is pending
- [ ] 1.2 Re-read the evidence for "SVG that arrives later": the `[class]` host binding (line 42) depends on `svgIcon`, which `resolveSvgIcon` (lines 234-253) leaves set until `renderSvgIcon` runs; verify the delta keeps the previous SVG during the load that follows a name shown as an SVG
- [ ] 1.3 Re-read the evidence for "Namespaces": `getNamedSvgIcon` in `icon-registry.ts` lines 110-127 starts from the `namespace` argument and replaces it with the prefix before the first colon, and the unit test "resolves by explicit namespace arg" looks up `logo` in `brand`; verify the delta describes the argument and its precedence
- [ ] 1.4 Re-read the evidence for "Sprite icon sets": `loadIconSet` in `icon-registry.ts` lines 249-280 caches a sprite only after a successful response, and `loadIconFromSets` (line 242) swallows a failed request; verify the delta says a failed request is made again
- [ ] 1.5 Re-read the evidence for "Dictionary of icon URLs": `dict[name] ?? null` in `icon-registry-providers.ts` line 49 and `result.trimStart()` in `icon-registry.ts` line 149; verify the delta names the names inherited from `Object.prototype`
- [ ] 1.6 Re-read the evidence for "Icons loaded from a URL": `loadIcon` in `icon-registry.ts` lines 192-201 maps the shared response once per lookup, and line 178 copies the cached element afterwards; verify the delta no longer claims a single parse
- [ ] 1.7 Re-read the evidence for "URL icons without an HTTP client": the `HttpClient` error of `fetchUrl` (lines 327-333) is caught by `catchError` in `loadIconFromSets` (lines 227-246), which ends with the "not found in any registered icon set" error; verify the delta limits the `HttpClient` error to icons registered by URL and resolver URLs
- [ ] 1.8 Run `openspec validate correct-icon-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
