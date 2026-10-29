# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Default view of a profile": the secondary part with the site hint inside it is rendered only in the branch of `username.html` lines 5-36, taken when `isCompact()` is false, while the compact branch of lines 37-65 renders a single `kbqUsernamePrimary` holding the name or the login and the site hint; verify the delta limits the layout to outside compact mode
- [ ] 1.2 Re-read the evidence for "Nothing to render": `username.html` line 4 renders nothing without a profile, lines 6 and 14 render no part outside compact mode for a profile with neither a name nor a login, and lines 39 and 52 render the `kbqUsernamePrimary` span of compact mode unconditionally, with the site of lines 46-49 and 59-62; the unit test "should render a compact profile with nothing at all" asserts only the empty text; verify the delta and its two new scenarios
- [ ] 1.3 Re-read the evidence for "Visual styles": in compact mode `username.html` lines 42-43 and 55-56 put a login without a name directly inside `kbqUsernamePrimary`, which takes the host color of `_username-theme.scss` line 3 rather than the secondary color of lines 5-8 and 14-19, and the baseline `__screenshots__/01-light.png` shows the compact login-only cell of the fourth row in the color of the name and the non-compact login-only cells of the third row in the secondary color; verify the delta and its new scenario
- [ ] 1.4 Run `openspec validate correct-username-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
