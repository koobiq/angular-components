# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/username/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/username`, and verify the username unit suite passes on the baseline commit with its snapshots unchanged
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/username` and verify both screenshot tests pass. They back the display mode, truncation, visual style, compact mode and right-to-left requirements
- [ ] 1.3 For each requirement in `specs/username/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

`yarn run dev:username` exists in `package.json` and serves the docs examples on http://localhost:3003. Change an example's data from the browser console with `ng.getComponent(<example element>)`, set the field, then call `ng.applyChanges(<component>)`. The e2e scenarios are served by `yarn run dev:e2e` on http://localhost:4200.

- [ ] 2.1 In the overview example of the dev app, verify:
    - with `userInfo` set to `{ lastName: 'Root', site: 'corp' }`, the username reads "Root" and has no site hint and no hidden label;
    - with `userInfo` set to `undefined`, `kbq-username` has no child elements;
    - with the original profile, the `cdk-visually-hidden` element holds the `ru-RU` `siteLabel`, because the dev app has no locale service
- [ ] 2.2 In the playground example, choose `stacked` and `error` and verify the host has `kbq-username_stacked` and `kbq-username_error`. Verify in `username.ts` that `isCompact` uses the `booleanAttribute` transform
- [ ] 2.3 Verify the tooltip texts:
    - in `/E2eUsernameStateAndStyle` of the e2e app, hovering the cut name of the 120 px `inline` cell shows the long profile's last, first and middle names in full;
    - hovering the cut login of the same cell shows the whole login followed by "(corp)";
    - in the playground, with `isCompact` checked, `userInfo` given the site `corp` and the host narrowed to 60 px in the devtools, hovering shows "Maxwell Alan Root (corp)"
- [ ] 2.4 In the custom example, verify:
    - choosing `stacked` puts the login under the name inside the custom view;
    - with `userInfo` set to `{ lastName: 'Root' }` and the format `L f. m.` typed into the format field, the name reads "Root . .";
    - in `username.html` the only `<ng-content>` selects `kbq-username-custom-view,[kbq-username-custom-view]`
- [ ] 2.5 In the playground, choose `stacked` and `inherit` and verify whether the login is still under the name. The spec states that it is not, because `inherit` takes the parent's `display`. Then narrow the host in the devtools and verify that no ellipsis appears
- [ ] 2.6 Verify in `username.pipe.ts`:
    - the pipes pass their mapping argument on and fall back to the injected mapping only when it is falsy;
    - neither pipe is `@Injectable`;
    - the warning is guarded by `isDevMode()`;
    - `kbqInjectUsernameFormatter()` calls `inject()`, which throws outside an injection context;
    - an empty `formatLogin` or `formatSite` result is filtered out
- [ ] 2.7 In the docs site (`yarn run docs`), open the Username page, switch the examples to `en-US` and verify the hidden label of the overview reads "site". Verify in `packages/components/core/locales/configuration.ts` that the locale configuration merges an enclosing `kbqLocaleOverrides`

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-username-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-username-baseline` once the checks pass. This creates `openspec/specs/username/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The `inherit` style replacing the layout of `stacked` and the `TypeError` on a `null` format are the most user-visible ones.
