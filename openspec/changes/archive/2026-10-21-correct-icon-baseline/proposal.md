# Proposal

## Why

The baseline spec of `icon` states behaviour the code does not have. A static audit of `openspec/specs/icon/spec.md` against `packages/components/icon` on `c9c196a9b` found seven requirements whose wording contradicts the source or the unit tests; this change corrects them so the spec describes what ships.

## What Changes

- **Size taken from the name**: the size is the leading integer `parseInt` reads after the last underscore, or from the whole name when it has no underscore (`3d-view` gives `3px`), and it is written only at initialization and when the lookup of a new name ends, so a pending asynchronous lookup keeps the previous `max-height`.
- **SVG that arrives later**: the font class shows during loading only when no SVG was shown before; after a switch from a name shown as an SVG, the previous SVG stays, without any font class, until the response arrives.
- **Namespaces**: a name without a colon uses the namespace passed as the second argument of `getNamedSvgIcon`, which only defaults to the empty one, and a colon in the name takes precedence over that argument.
- **Sprite icon sets**: a sprite is kept once it has loaded, but a failed request is made again by the next lookup, so a sprite URL is not always fetched once.
- **Dictionary of icon URLs**: the record is read as a plain object, so a name inherited from `Object.prototype`, such as `constructor`, does not get `null` and makes the lookup throw.
- **Icons loaded from a URL**: concurrent lookups each parse the shared response; what holds is that later lookups copy the loaded icon without another request.
- **URL icons without an HTTP client**: a sprite lookup without `HttpClient` fails with the "not found in any registered icon set" error, not with the "HttpClient is required" one.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `icon`: corrects the requirements "Size taken from the name", "SVG that arrives later", "Namespaces", "Sprite icon sets", "Dictionary of icon URLs", "Icons loaded from a URL" and "URL icons without an HTTP client".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-icon-baseline/` and, once archived, `openspec/specs/icon/spec.md`. No source, test, documentation or public API changes.
