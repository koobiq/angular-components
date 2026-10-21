---
paths:
    - 'packages/components/**/*.ts'
    - 'packages/components/**/*.html'
    - 'packages/components-experimental/**/*.ts'
    - 'packages/components-experimental/**/*.html'
---

# Component code

## Packaging and typings

- Every component keeps a `Kbq<Name>Module` that imports and re-exports its standalone components and directives. A new directive has to be added there too, or NgModule consumers will not see it.
- `@internal` removes a declaration from the published typings: `stripInternal` is on in the config that emits the typings of every published package (its `tsconfig.lib.json`, `packages/cli/tsconfig.release.json` for the CLI), while the JavaScript still contains it. The API tab of the docs site hides such declarations too, so they need no `@docs-private`. TypeScript strips a declaration when any comment in front of it contains the text `@internal`, `//` comments included. Moving a public member under `@internal` removes it for consumers, so it is a breaking change.
- Entry points are compiled against each other's typings, so an `@internal` declaration may be used only inside its own entry point: using or overriding it from another one, or referencing it from a public signature, breaks the build or leaves invalid typings, which `check-typings` catches. A member has to stay in the typings when it implements an interface (`ngOnInit`, `writeValue`, `stateChanges`) or when a type requires it structurally without an `implements` clause (`KbqOption.setActiveStyles`, which the `Highlightable` of core's `ActiveDescendantKeyManager` requires in autocomplete). A declaration re-exported by name (`export { X } from './x'`) cannot be stripped either: the typings bundler fails on the dangling export, while `export *` is fine.
- `@docs-private` only hides a declaration from the API tab of the docs site and keeps it in the typings. It is the tag for what consumers can reach but should not rely on, including everything the previous rule keeps out of `@internal`.
- A directive that a public component lists in `hostDirectives` stays exported from its entry point, or the build fails with NG3001. Write each `hostDirectives` entry inline: a const from another entry point is read from `.d.ts` without its initializer, and a nested array is never flattened (both NG1010).
- Removing `!` from a public or protected `inject(X, { optional: true })!` field widens its type to nullable, which is a breaking change; drop it freely only on private fields.
- Before deleting an unused public member, look for a promise that it stays: `docs/guides/migration.{en,ru}.mdx`, the migrations' `data.ts` and "Kept for back-compatibility" comments. Keep cheap `@docs-private` helpers: removing them breaks consumers and gains nothing.
- For option-like state that consumers read as a property (`KbqOption.value`, `viewValue`, `disabled`), put a `@docs-private` `xInput = input(..., { alias: 'x' })` behind a public getter. Make an API fully signal-based only for contracts the library itself reacts to.

## JSDoc

- ESLint checks the JSDoc of `packages/components` with `eslint-plugin-jsdoc`. TypeScript reads a `@word` that starts a line as a tag and keeps the text after it in that tag, so an unknown tag, a block `@link` (write a Markdown link or `{@link Name}`), `@property` or `@todo` takes that text out of the generated docs.
- `docs:api-gen` compiles the JSDoc with the MDX compiler of the docs pages, and its errors name the declaration: `{@link Name}` becomes inline code, a block of code has to stand on its own rather than inside a list or a quote, and an `@example` without a fence of its own is taken as TypeScript. The MDX rules of the pages apply to JSDoc prose too: a literal `{` or `<` is escaped with a backslash (`Array\<string>`), HTML outside the compiler's short element list is rejected, and `<br />` needs the slash.

## Angular

- Declare every `input()` and `model()` as `public`: a `protected` one passes the specs and the partial library build but fails consumer builds with TS2445. Only an application build (`ng build dev-e2e`, the docs) checks it, so a Playwright webServer timeout is the usual symptom. `protected` is for a component's own template bindings.
- Type a boolean input as `input<boolean, boolean | string | null | undefined>(…, { transform: booleanAttribute })`: consumers write the bare attribute (`<kbq-x disabled>`) or bind a string, and only the second type parameter lets that type-check.
- Extend a `@Directive()` base class directly, not through a mixin factory: AOT builds lose its inherited `viewChild` queries.
- A `model()` has no `fooChange` property, so subscribe to the model itself and declare no separate `fooChange` output.
- A subscription made in a base constructor binds the base method, not a subclass override: a subclass that overrides the method keeps its own subscription, so do not delete it as a duplicate.
- A subclass with its own decorator does not inherit `providers`, so repeat the base class's providers. It does inherit `hostDirectives`, so never list one again (NG0309).
- NG0309 also fires when a directive carried in `hostDirectives` matches again through its selector: a carrier re-exposes the selector-named input under another name (`'kbqTooltip: tooltipText'`), which `host-directives.spec.ts` checks; and two directives that can sit on one element must not carry the same host directive. The check runs only in dev mode.
- Feed a kept accessor from a signal input in `ngOnChanges`, not in an `effect`: the effect runs after every `ngOnInit` of the view, too late for directives that read the value first.
- Do not read a `viewChild.required` or `contentChild.required` from a getter or a `computed` that a template binds: it throws NG0951 before the query resolves, in browser builds only, since jsdom hides it. Use an optional query with a guard.
- Call signals in `host` bindings: ngc does not flag an uncalled signal in an `attr.*` binding, which then renders `[Computed: …]`.
- An `effect` must not write plain fields a template reads (NG0100 under the exhaustive check); use signals or `afterRenderEffect`.
- `linkedSignal` drops a `.set()` once one of its sources changes, so order the writes to such a signal after the writes to its sources.
- To query a class declared later in the same file, locate it by template ref (`viewChild<KbqListOption<T>>('ref')`): a class locator reads the class while it is still in its temporal dead zone at module load. `forwardRef(() => X)` in `imports` is fine.
- Never encode host components in a shared directive such as tooltip, popover or dropdown (`:not(kbq-navbar-item)` in its selector). Resolve the conflict in the host by renaming its input or changing composition: an exception leaks into the public selector and couples entry points backwards.

## DOM, SSR and motion

- Measure the DOM (overflow, size) in `afterNextRender`, not in an effect, a Subject callback or `ngAfterContentInit`: those run before host bindings and `@if`-projected content are in place. Content projected inside an `@if` is created detached and measures 0, so measure at interaction time and never keep a size measured at init.
- Without zone.js, use `afterNextRender({ injector })` where code waited for `NgZone.onStable`. A content query over views that a child inserts (tree nodes) refreshes only with the consumer's view, so the owner calls `markForCheck()` in `afterNextRender` after rendering them. What zone rendered inside the event now lands a frame later: write DOM state the next keypress relies on (a tab-out `tabindex`) directly.
- Gate DOM measurement and direct `element.style` writes in the caller (`Platform.isBrowser`, `afterNextRender`): the server DOM has no `getBoundingClientRect`, and style writes made there serialize into the prerendered HTML.
- Null-check `querySelector` results before passing them to `Renderer2`: its methods throw on null since Angular 20, and layout code started from a timer can run before an `@if` block has rendered.
- Motion is CSS: `@angular/animations` is deprecated and banned by ESLint. A component that has to act once an animation ends (a panel detaching after its exit) waits with `kbqAfterAnimations` from `core`, which ends at once when nothing animates; a template element uses `animate.enter` / `animate.leave`. Every animated element binds `[class.kbq-animations-disabled]` to `kbqAnimationsDisabled()` and includes the `kbq-animations-off()` mixin in its most specific animated rule, which also covers `prefers-reduced-motion: reduce`. `animate.leave` applies only to the root node of the removed view.

## Focus and accessibility

- Focus moved later than the user's input — from a timer, after an animation, when a panel closes — goes through `FocusMonitor.focusVia(el, origin)`, not a bare `element.focus()`: by then `FocusMonitor` has no interaction to attribute the focus to, reports `program`, and the ring (`.cdk-keyboard-focused`) stays off. A `focus()` made synchronously inside a keydown handler is attributed to the keyboard on its own. Take the origin from `InputModalityDetector.mostRecentModality ?? 'program'`; `KbqButton.focusViaKeyboard()` is for a restore that always follows a key.
- Use `FocusKeyManager` and `ActiveDescendantKeyManager` from `@koobiq/components/core`, not the CDK ones. The fork takes a `QueryList`, has no `destroy()` and emits `change` only when the index changes; its `activeItem` is a plain field, so whoever resets it calls `markForCheck()`. `onKeydown` ignores ←/→ unless `withHorizontalOrientation()` is set, and native focus (Tab, click) does not move it: sync it from a `(focusin)` listener with `updateActiveItem(index)`. Accordion and the tab header keep the CDK `FocusKeyManager` for its injector-bound `destroy()`; migrate them only together with that cleanup.
- Bind `aria-orientation` only on roles that accept it (`radiogroup`, `toolbar`, `listbox`, `menu`, `tablist`, `slider`), never on `role="group"`, and cover the host with `toHaveNoViolations()`.
- Before removing a `kbq-*` class as dead, also search for the interpolated `` `kbq-${…}` `` form: `KbqColorDirective` builds the `kbq-<color>` classes, and every icon without a color carries `kbq-empty`.
