# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Routing through the item": `breadcrumbs.html` lines 51 and 97 bind only `item.routerLink?.urlTree`, and `RouterLink.createUrlTree` and `onClick` in `@angular/router` build the URL tree from the commands, `queryParams`, `fragment`, `queryParamsHandling`, `preserveFragment` and `relativeTo` while `target`, `state`, `info`, `replaceUrl` and `skipLocationChange` stay on the item's own link; verify the delta names both lists
- [ ] 1.2 Re-read the evidence for "Single tab stop": the host `tabIndex` and `handleFocus` in `roving-focus-group.directive.ts` lines 87-89 and 100-124, the expand button's `[focusable]="!disabled()"` in `breadcrumbs.html` line 38, and the two `[attr.tabindex]` host bindings of `roving-focus-item.directive.ts` line 23 and `button.component.ts` lines 319 and 432-436, each written only when its own value changes; verify the delta states the hidden expand button and the re-enabled entries
- [ ] 1.3 Re-read the evidence for "Arrow keys move between entries": the candidate list and the modifier check in `roving-focus-item.directive.ts` lines 112-147, and the capture-phase keydown halt of a disabled `kbq-button` in `button.component.ts` lines 479-480 and 598-605; verify the delta scopes the arrows to enabled participants
- [ ] 1.4 Re-read the evidence for "Home and End": the reversed candidate list in `roving-focus-item.directive.ts` lines 130-133 and the `[focusable]` binding of default entries in `breadcrumbs.html` line 96; verify the delta's End scenario with a disabled third item
- [ ] 1.5 Re-read the evidence for "Pointer focus": the pointer-press handler in `roving-focus-item.directive.ts` lines 27 and 89-98, which only `kbqBreadcrumb` elements carry, and the custom template rendered as authored in `breadcrumbs.html` lines 89-90; verify the delta limits the press handling to `kbqBreadcrumb` elements
- [ ] 1.6 Run `openspec validate correct-breadcrumbs-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
