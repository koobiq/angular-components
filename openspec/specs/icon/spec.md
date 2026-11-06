# icon Specification

## Purpose

Describes what `@koobiq/components/icon` guarantees to consumers: how `kbq-icon`, `kbq-icon-button` and `kbq-icon-item` render a font glyph or an inline SVG, how the icon registry finds SVG icons, and how icons behave for size, color, accessibility and interaction.

## Requirements

### Requirement: Icon name renders as a font class

`kbq-icon` SHALL apply the value of its `kbq-icon` attribute or binding to the host verbatim as a CSS class, next to the `kbq` and `kbq-icon` classes, while no inline SVG is shown. A namespaced name SHALL be applied unchanged. A new name SHALL replace the previous class, and an `undefined` name SHALL leave no name class.

#### Scenario: Font icon

- **WHEN** the template renders `<i kbq-icon="kbq-plus_16"></i>` and no SVG is registered for that name
- **THEN** the host has the classes `kbq`, `kbq-icon` and `kbq-plus_16`

#### Scenario: Namespaced name

- **WHEN** the name is `brand:logo_24` and it does not resolve to an SVG
- **THEN** the host has the class `brand:logo_24`

#### Scenario: Changing the name

- **WHEN** the bound name changes from `kbq-plus_16` to `kbq-play_64`
- **THEN** the host has `kbq-play_64` and no longer has `kbq-plus_16`

#### Scenario: Name turns undefined

- **WHEN** the bound name changes from `kbq-plus_16` to `undefined`
- **THEN** the host no longer has `kbq-plus_16`

### Requirement: Size taken from the name

Unless `iconSize` is set, `kbq-icon` SHALL set an inline `max-height` on its host equal to the leading integer of the text after the last underscore of the name, or of the whole name when it has no underscore, ignoring a namespace prefix. A name without such an integer SHALL get no `max-height`, and switching to such a name SHALL remove the previous one. It SHALL be written at initialization and when the lookup of a new name ends, so a pending asynchronous lookup keeps the previous value.

#### Scenario: Sized names

- **WHEN** the name is `kbq-plus_16`, `ns:plus_24` or `brand_2024`
- **THEN** the host has `max-height` of `16px`, `24px` or `2024px` respectively

#### Scenario: Names without a size

- **WHEN** the name is `logo` or `check-16`
- **THEN** the host has no inline `max-height`

#### Scenario: Switching to an unsized name

- **WHEN** the name changes from `kbq-plus_16` to `logo`
- **THEN** the `16px` `max-height` is removed

#### Scenario: Name without an underscore

- **WHEN** the name is `3d-view`
- **THEN** the host has `max-height: 3px`

#### Scenario: New name still loading

- **WHEN** an icon rendered with `kbq-plus_16`, whose lookup has ended, gets the name `kbq-play_64`, whose SVG is fetched by URL
- **THEN** the host keeps `max-height: 16px` until the request ends
- **AND** then has `max-height: 64px`

### Requirement: Explicit icon size

`iconSize` SHALL take precedence over the size in the name for the host's `max-height` and SHALL be followed when it changes after initialization. A value that does not parse as a number SHALL be ignored, so the size in the name applies.

#### Scenario: Size input wins over the name

- **WHEN** the name is `kbq-plus_16` and `iconSize` is 32
- **THEN** the host has `max-height: 32px`

#### Scenario: Size changed after initialization

- **WHEN** an icon rendered with `kbq-plus_16` gets `iconSize` 48
- **THEN** the host has `max-height: 48px`

### Requirement: Projected content is kept

Content projected into the host of an icon, including an `<svg>` of the consumer's own, SHALL stay in place whatever the name resolves to. The icon SHALL add or remove only the SVG it inserted itself.

#### Scenario: Unresolved name next to a projected SVG

- **WHEN** an icon with an unregistered name has an `<svg>` projected into it
- **THEN** that `<svg>` stays and is the only `<svg>` in the host

#### Scenario: Name resolves and then stops resolving

- **WHEN** the name of an icon holding a projected `<svg>` changes to a registered name and then to an unregistered one
- **THEN** the projected `<svg>` is still there and is the only `<svg>` in the host

### Requirement: Registered names render as inline SVG

When the icon registry resolves the name, the icon SHALL insert the resolved `<svg>` as the first child of its host and SHALL drop the font class while the SVG is shown.

#### Scenario: Registered literal

- **WHEN** `kbq-plus_16` is registered as an SVG literal and an icon renders that name
- **THEN** the host contains an `<svg>` and does not have the class `kbq-plus_16`

### Requirement: SVG that arrives later

While the SVG of a URL-backed name is loading, the icon SHALL keep what it showed before: the font class of that name when no SVG was shown, or the SVG of the previous name, with no font class, when the name changed from one shown as an SVG. Once the response arrives, it SHALL show the new SVG and drop the font class.

#### Scenario: Icon registered by URL

- **WHEN** `kbq-plus_16` is registered by URL and an icon renders that name
- **THEN** the host has the class `kbq-plus_16` and no `<svg>` until the response arrives
- **AND** after the response the host contains the `<svg>` and no longer has the class

#### Scenario: Switching from an SVG to a URL-backed name

- **WHEN** an icon showing the SVG of the registered literal `kbq-plus_16` gets the name `kbq-play_64`, registered by URL
- **THEN** until the response arrives the host still holds the `<svg>` of `kbq-plus_16` and has neither `kbq-plus_16` nor `kbq-play_64` as a class
- **AND** after the response it holds only the `<svg>` of `kbq-play_64`

### Requirement: Fallback to the font class

When the name cannot be resolved — the registry does not know it, its request fails, its markup has no `<svg>`, or a resolver throws — the icon SHALL show the font class without an SVG and MUST NOT throw. The next name SHALL be resolved again.

#### Scenario: Unknown name

- **WHEN** an icon renders a name the registry does not know
- **THEN** the host has the name as a class and contains no `<svg>`

#### Scenario: Resolver that throws

- **WHEN** a resolver throws for `kbq-boom_16` and an icon renders that name, then a registered name
- **THEN** the first name shows as the font class `kbq-boom_16`
- **AND** the registered name renders as an `<svg>`

#### Scenario: Unregistered name before a registered one

- **WHEN** an icon renders an unregistered name and then a registered one
- **THEN** the registered name renders as an `<svg>`

### Requirement: A new name replaces the SVG

When the name changes, the icon SHALL replace the SVG it inserted rather than add another. It SHALL remove that SVG and show the font class when the new name does not resolve, and SHALL remove it when the name turns `undefined`. A resolution still pending for the previous name SHALL be dropped.

#### Scenario: Switching between registered names

- **WHEN** the name changes from one registered SVG to another
- **THEN** the host holds exactly one `<svg>`, the one of the new name

#### Scenario: Switching to an unregistered name

- **WHEN** the name changes from a registered SVG to `kbq-missing_16`
- **THEN** the host holds no `<svg>` and has the class `kbq-missing_16`

#### Scenario: Name turns undefined

- **WHEN** the name of an icon showing an SVG turns `undefined`
- **THEN** the host holds no `<svg>`

### Requirement: Size of the inline SVG

The inserted SVG SHALL get `width` and `height` attributes equal to `iconSize` when it is set, or else to the size in the name. When neither gives a size, the icon SHALL write no size attributes.

#### Scenario: Size from the name

- **WHEN** a registered `kbq-plus_16` renders as an SVG
- **THEN** the `<svg>` has `width="16"` and `height="16"`

#### Scenario: Size from the input

- **WHEN** the same icon gets `iconSize` 24
- **THEN** the `<svg>` has `width="24"`

### Requirement: Inserted SVG is hidden from assistive technology

Every SVG the registry produces SHALL carry `aria-hidden="true"` and `focusable="false"`, whatever the `aria-hidden` of the icon's host.

#### Scenario: Resolved SVG

- **WHEN** an icon renders a registered SVG
- **THEN** the inserted `<svg>` has `aria-hidden="true"` and `focusable="false"`

### Requirement: Already rendered SVG is kept

When the host already holds the SVG inserted for the current name, including one left by server-side rendering, resolving that name again SHALL keep that element instead of inserting a duplicate, and the font class SHALL stay off.

#### Scenario: Repeat resolution of the same name

- **WHEN** an icon showing the SVG of `kbq-plus_16` resolves `kbq-plus_16` again
- **THEN** the host holds one `<svg>`, the same element as before
- **AND** the host does not have the class `kbq-plus_16`

### Requirement: Name set in code before initialization

A name assigned to `iconName` before the content of the icon is initialized, for example in the constructor of a subclass, SHALL be resolved and rendered like a bound name.

#### Scenario: Subclass assigns the name

- **WHEN** a component extending `KbqIcon` sets `iconName` to a registered name in its constructor
- **THEN** the host contains the `<svg>` of that name and does not have its font class

### Requirement: Order of SVG lookup

The registry SHALL look a name up in this order: icons registered for it by name in its namespace; then the resolvers in registration order until one answers with a non-null value; then the sprites of its namespace. When none of them matches and the namespace has no sprite, the lookup SHALL fail with `KbqIconRegistry: no icon registered for "<name>".`, where the name keeps its namespace prefix.

#### Scenario: Nothing registered

- **WHEN** `getNamedSvgIcon('missing')` is called on a registry with nothing registered
- **THEN** the returned observable fails with an error naming `missing`

#### Scenario: Resolver before sprites

- **WHEN** a resolver answers for every name and a sprite is registered in the default namespace
- **THEN** names are resolved through the resolver and the sprite is never fetched

### Requirement: Namespaces

The registry SHALL split a name at its first colon into a namespace and an icon name. A name without a colon SHALL use the namespace passed as the second argument of `getNamedSvgIcon`, which defaults to the empty namespace, and a colon in the name SHALL take precedence over that argument. An icon registered in one namespace MUST NOT be found in another.

#### Scenario: Namespace in the name

- **WHEN** `logo` is registered in the `brand` namespace and `brand:logo` is looked up
- **THEN** the lookup returns an `SVGElement`

#### Scenario: Namespace as an argument

- **WHEN** the same icon is looked up as `getNamedSvgIcon('logo', 'brand')`
- **THEN** the lookup returns an `SVGElement`

#### Scenario: Wrong namespace

- **WHEN** it is looked up as `getNamedSvgIcon('logo', 'other')`
- **THEN** the lookup fails with an error

#### Scenario: Colon and argument together

- **WHEN** it is looked up as `getNamedSvgIcon('brand:logo', 'other')`
- **THEN** the lookup returns an `SVGElement`

### Requirement: Sprite icon sets

`addSvgIconSet` and `addSvgIconSetInNamespace` SHALL register an SVG sprite whose `<symbol>` ids are icon names. The icon SHALL be the `<symbol>` whose id equals the name exactly, whatever characters the id has, copied into a new `<svg>`. A sprite that has loaded SHALL be kept, so its URL is not requested again, but a failed request SHALL be made again by the next lookup. A URL already registered in the namespace SHALL be ignored.

#### Scenario: Symbol from a sprite

- **WHEN** a sprite with a `check_16` symbol is registered and `check_16` is looked up
- **THEN** the sprite is fetched and the lookup returns an `SVGElement`

#### Scenario: Symbol id that is not a CSS identifier

- **WHEN** the sprite has a symbol with the id `3d-view_16` and that name is looked up
- **THEN** the lookup returns an `SVGElement`

#### Scenario: Same sprite registered twice

- **WHEN** the same sprite URL is registered twice and a name missing from it is looked up
- **THEN** the sprite is requested exactly once

#### Scenario: Name missing from the sprite

- **WHEN** a name that is not a symbol of the only registered sprite is looked up
- **THEN** the lookup fails with an error

#### Scenario: Failed sprite request

- **WHEN** the request for the only registered sprite fails and a name is then looked up again
- **THEN** the sprite is requested a second time

### Requirement: View box of sprite icons

The `<svg>` of a sprite icon SHALL take the `viewBox` of its `<symbol>`, or else the `viewBox` of the sprite's root element, or else `0 0 24 24`.

#### Scenario: Symbol with its own view box

- **WHEN** the `check_16` symbol has `viewBox="0 0 16 16"`
- **THEN** the returned `<svg>` has `viewBox="0 0 16 16"`

### Requirement: Several sprites in one namespace

When a namespace has several sprites, the registry SHALL search them from the last registered to the first and SHALL return the first match. A name found in none of them SHALL fail with `KbqIconRegistry: icon "<name>" not found in any registered icon set.`

#### Scenario: Two sprites hold the same id

- **WHEN** two sprites in the default namespace both have a `plus_16` symbol
- **THEN** `plus_16` resolves to the symbol of the sprite registered last

### Requirement: Sprites from providers

`kbqIconsProvider(...sprites)` SHALL register each `{ spriteUrl, namespace }` entry as a sprite in its namespace, or in the default one when `namespace` is left out, when the registry is created. It provides a single value, so a later `kbqIconsProvider` in the same injector SHALL replace an earlier one.

#### Scenario: Default and named sprites

- **WHEN** the application provides `kbqIconsProvider({ spriteUrl: '/icons.svg' }, { spriteUrl: '/brand.svg', namespace: 'brand' })`
- **THEN** `plus_16` is looked up in `/icons.svg` and `brand:logo_24` in `/brand.svg`

### Requirement: Resolvers

`kbqIconsResolverProvider(resolver)` SHALL add a resolver, and several resolvers SHALL be tried in registration order. Each SHALL be called with the name without its namespace, and an answer of `null` SHALL pass the name on. A non-null answer SHALL be remembered for that name, so later lookups of it do not call the resolvers again. An answer that does not start with `<` SHALL be fetched as a URL.

#### Scenario: URL resolver

- **WHEN** the resolver maps every name to `/assets/icons/<name>.svg` and an icon renders `plus_16`
- **THEN** `/assets/icons/plus_16.svg` is requested and its SVG is shown

#### Scenario: Namespaced name

- **WHEN** an icon renders `kbq:plus_16` and no icon is registered by that name
- **THEN** the resolvers are called with `plus_16`

#### Scenario: Resolver declines a name

- **WHEN** the first resolver answers `null` for a name and the second answers with a URL
- **THEN** the URL of the second resolver is requested

### Requirement: Resolver answers that are markup

A resolver answer that starts with `<` SHALL be taken as markup and passed through Angular's HTML sanitizer as untrusted text. The sanitizer removes `<svg>` elements, so the icon SHALL fall back to its font class.

#### Scenario: Resolver returns SVG markup

- **WHEN** a resolver answers with an `<svg>…</svg>` string for a name an icon renders
- **THEN** the host shows the font class and contains no inserted `<svg>`

### Requirement: Dictionary of icon URLs

`kbqIconsDictProvider(record)` SHALL add a resolver that answers with the record's value for a name the record holds and with `null` for any other name, except a name inherited from `Object.prototype`, such as `constructor`: the record is read as a plain object, so that name gets a value that is not a string, `getNamedSvgIcon` throws a `TypeError` instead of passing it on, and an icon shows its font class.

#### Scenario: Name in the record

- **WHEN** the record maps `plus_16` to `/assets/icons/plus_16.svg` and an icon renders `plus_16`
- **THEN** that URL is requested

#### Scenario: Name not in the record

- **WHEN** an icon renders a name the record does not hold
- **THEN** the lookup continues with the next resolver and then the sprites

#### Scenario: Name inherited from `Object.prototype`

- **WHEN** a dictionary is the first resolver, nothing is registered as `constructor`, and `getNamedSvgIcon('constructor')` is called
- **THEN** it throws a `TypeError` without trying the next resolver or the sprites
- **AND** an icon that renders `constructor` has it as a font class and no `<svg>`

### Requirement: Inline SVG literals

`addSvgIconLiteral` and `addSvgIconLiteralInNamespace` SHALL register an icon from markup, with no request. Every lookup SHALL return a new copy of the SVG element.

#### Scenario: Registered literal

- **WHEN** `check` is registered as a trusted literal and looked up
- **THEN** the lookup returns an `<svg>` `SVGElement` without any request

#### Scenario: Two lookups

- **WHEN** `check` is looked up twice
- **THEN** the two lookups return different elements

### Requirement: Literals are sanitized

A literal that is not `SafeHtml` the application marked as trusted SHALL pass through Angular's HTML sanitizer, which removes the `<svg>` element and its unsafe content. When nothing is left, registration SHALL throw `KbqIconRegistry: literal for icon "<name>" sanitized to empty string.`

#### Scenario: Script-only literal

- **WHEN** an untrusted `<script>` string is registered as a literal
- **THEN** registration throws the "sanitized to empty string" error

#### Scenario: Untrusted SVG markup

- **WHEN** an untrusted `<svg>` string with a `<script>` child or an `on*` handler is registered as a literal
- **THEN** registration throws

### Requirement: Icons loaded from a URL

`addSvgIcon` and `addSvgIconInNamespace` SHALL register an icon whose markup is fetched as text through Angular's `HttpClient` when it is first looked up. Concurrent lookups of the same URL SHALL share one request, and once the icon has loaded, later lookups SHALL return copies of it without another request.

#### Scenario: Fetching an icon

- **WHEN** `check` is registered with the URL `/icons/check.svg` and looked up
- **THEN** `/icons/check.svg` is requested and the lookup returns an `SVGElement`

#### Scenario: Concurrent lookups

- **WHEN** `check` is looked up twice before the response arrives
- **THEN** only one request for `/icons/check.svg` is made

#### Scenario: Lookup after loading

- **WHEN** `check` is looked up again after its response arrived
- **THEN** no request is made and the lookup returns a new `SVGElement`

### Requirement: URL icons without an HTTP client

When no `HttpClient` is available, looking up an icon registered by URL, or a name a resolver maps to a URL, SHALL fail through the returned observable with an error saying that `HttpClient` is required, and MUST NOT throw where `getNamedSvgIcon` is called. A name looked up in sprites SHALL fail with the "not found in any registered icon set" error instead. Angular provides `HttpClient` in the root injector, so only an injector that replaces it with `null` reaches this case.

#### Scenario: HTTP client removed

- **WHEN** `HttpClient` is provided as `null` and a URL-backed icon is looked up
- **THEN** the call returns without throwing and the observable fails with "HttpClient is required"

#### Scenario: Sprite without an HTTP client

- **WHEN** `HttpClient` is provided as `null` and a name is looked up in a registered sprite
- **THEN** the call returns without throwing and the observable fails with `KbqIconRegistry: icon "<name>" not found in any registered icon set.`

### Requirement: Icon options

`KbqIconOptions.viewBox` SHALL replace the `viewBox` of an icon registered by literal or URL, and of the root element of a sprite. `KbqIconOptions.withCredentials` SHALL send the request for a URL icon or a sprite with credentials.

#### Scenario: View box override

- **WHEN** a literal is registered with `{ viewBox: '0 0 24 24' }`
- **THEN** the returned `<svg>` has `viewBox="0 0 24 24"`

### Requirement: Registry configuration is per injector

`KbqIconRegistry` SHALL be provided in the root injector, and each registry SHALL read the sprite and resolver providers of the injector it is created in. Resolvers or sprites provided in a component or route SHALL take effect there only when `KbqIconRegistry` is provided there as well.

#### Scenario: Resolver scoped to a component

- **WHEN** a component provides `KbqIconRegistry` together with `kbqIconsResolverProvider`
- **THEN** icons inside it resolve through that resolver
- **AND** icons outside it do not

### Requirement: Icons are decorative by default

`kbq-icon` and `kbq-icon-item` SHALL set `aria-hidden="true"` on their host unless `aria-hidden` is given. An explicit value SHALL be reflected as `"true"` or `"false"`, and a `null` or `undefined` binding SHALL mean the default. A bare icon SHALL pass the axe checks.

#### Scenario: Bare icon

- **WHEN** `<i kbq-icon="kbq-plus_16"></i>` renders
- **THEN** the host has `aria-hidden="true"` and the page has no axe violations

#### Scenario: Meaningful icon

- **WHEN** the icon has `role="img"`, `aria-hidden="false"` and `aria-label="Add"`
- **THEN** the host has `aria-hidden="false"`

#### Scenario: Null binding

- **WHEN** `[aria-hidden]` is bound to `null` and later to `false`
- **THEN** the host first has `aria-hidden="true"` and then `aria-hidden="false"`

### Requirement: Color class

`kbq-icon`, `kbq-icon-button` and `kbq-icon-item` SHALL render their `color` as a `kbq-<color>` host class without removing the host's other classes. While `color` is unset or falsy, the class SHALL be `kbq-empty`. A color set in code through the `color` signal SHALL hold until the bound `color` changes.

#### Scenario: Theme color

- **WHEN** an icon button has `color` set to `theme`
- **THEN** the host has `kbq-theme` and keeps a class added to it before

#### Scenario: No color

- **WHEN** an icon renders without `color`
- **THEN** the host has `kbq-empty`

#### Scenario: Color set in code

- **WHEN** an icon with no bound color gets `color.set('error')` in code
- **THEN** the host has `kbq-error`

### Requirement: Error class

The host SHALL carry `kbq-error` while `color` is `error`, while `hasError` is `true` whatever the color, or while the automatic error color applies. With `hasError`, the `kbq-<color>` class of a non-error color SHALL stay.

#### Scenario: Error color and back

- **WHEN** `color` is bound to `error` and then to `theme`
- **THEN** the host first has `kbq-error` and then has `kbq-theme` without `kbq-error`

#### Scenario: Error flag on a themed icon

- **WHEN** an icon with `color` `theme` gets `hasError = true`
- **THEN** the host has both `kbq-error` and `kbq-theme`

### Requirement: Automatic error color

With `autoColor` set, an icon inside a form field SHALL carry `kbq-error` while the field's control is in an error state, following every change of that state and a replaced control. `autoColor` SHALL be off by default and accept boolean attribute values; turning it off or binding `undefined` SHALL drop the error class. Outside a form field, `autoColor` SHALL have no effect.

#### Scenario: Invalid field

- **WHEN** a prefix icon with `[autoColor]="true"` sits in a form field whose control becomes invalid and touched
- **THEN** the icon has `kbq-error`

#### Scenario: Auto color off

- **WHEN** `autoColor` is false and the field's control is in an error state
- **THEN** the icon does not have `kbq-error`

#### Scenario: Turned off again

- **WHEN** `autoColor` changes from `true` to `false` or `undefined` while the control is in an error state
- **THEN** the icon no longer has `kbq-error`

### Requirement: Icon button renders its icon

`kbq-icon-button` SHALL take its icon name from the `kbq-icon-button` attribute and render it like `kbq-icon`, as a font class or an inline SVG, with the `kbq-icon-button` host class. It MUST NOT set a `max-height` on its host.

#### Scenario: Font icon button

- **WHEN** `<i kbq-icon-button="kbq-chevron-down-s_16" aria-label="Collapse"></i>` renders with no SVG registered
- **THEN** the host has the classes `kbq-icon-button` and `kbq-chevron-down-s_16` and no inline `max-height`

### Requirement: Icon button size

The `size` of an icon button SHALL default to `normal`. `compact` SHALL add the `kbq-icon-button_compact` host class, and returning to `normal` SHALL remove it.

#### Scenario: Default size

- **WHEN** an icon button renders without `size`
- **THEN** the host does not have `kbq-icon-button_compact`

#### Scenario: Compact and back

- **WHEN** `size` changes to `compact` and then to `normal`
- **THEN** the host first has `kbq-icon-button_compact` and then does not

### Requirement: Button role

Once its view is initialized, the icon button SHALL set `role="button"` on a host that is not a `<button>`, an `<input>` or an `<a>` with `href`, and that has no `role`. A native button or a link that navigates, including one whose `href` is bound, SHALL keep its own role, and a `role` set by the caller MUST NOT be overwritten.

#### Scenario: Generic host

- **WHEN** the icon button is an `<i>` element
- **THEN** the host has `role="button"`

#### Scenario: Native button

- **WHEN** the icon button is a `<button>` element
- **THEN** the host has no `role` attribute

#### Scenario: Link with a bound href

- **WHEN** the icon button is an `<a>` whose `href` is bound with `[attr.href]`
- **THEN** the host has an `href` and no `role` attribute

#### Scenario: Role set by the caller

- **WHEN** the icon button has `role="switch"`
- **THEN** the host keeps `role="switch"`

### Requirement: Icon button is exposed to assistive technology

`kbq-icon-button` MUST NOT set `aria-hidden` on its host by default. An explicit `aria-hidden="true"` SHALL be reflected. An icon button with an `aria-label` SHALL pass the axe checks.

#### Scenario: Default icon button

- **WHEN** an icon button renders on an `<i>` and on a `<button>` without `aria-hidden`
- **THEN** neither host has an `aria-hidden` attribute

#### Scenario: Hidden on request

- **WHEN** an icon button has `aria-hidden="true"`
- **THEN** the host has `aria-hidden="true"`

### Requirement: Warning for an unnamed icon button

In dev mode, an icon button whose host has no text content, `aria-label`, `aria-labelledby` or `title` once its view is initialized SHALL log the console warning "KbqIconButton has no accessible name. Add [aria-label] or [aria-labelledby] to it." together with the host element. A host with `aria-hidden="true"` SHALL stay silent.

#### Scenario: No accessible name

- **WHEN** `<i kbq-icon-button="kbq-chevron-down-s_16"></i>` renders in dev mode
- **THEN** a console warning containing "no accessible name" is logged

#### Scenario: Named or hidden button

- **WHEN** the icon button has an `aria-label`, or has `aria-hidden="true"` and no name
- **THEN** no warning is logged

### Requirement: Icon button tab order

The icon button SHALL have `tabindex="0"` by default and SHALL use a bound `tabindex`. Binding `undefined` or `null` SHALL restore `0`, and a value that does not parse as a number SHALL render no `tabindex` attribute.

#### Scenario: Bound tab index cleared

- **WHEN** `tabindex` is bound to 5 and then to `undefined`
- **THEN** the host first has `tabindex="5"` and then `tabindex="0"`

#### Scenario: Unparsable tab index

- **WHEN** `tabindex` is bound to an empty string
- **THEN** the host has no `tabindex` attribute

### Requirement: Disabled icon button

A disabled icon button SHALL have the `disabled` attribute, `aria-disabled="true"`, the `kbq-disabled` class and no `tabindex` attribute, and SHALL not react to the pointer. On a native `<button>` this disables the button. `disabled` SHALL accept boolean attribute values and SHALL also be settable in code.

#### Scenario: Disabled generic host

- **WHEN** an `<i>` icon button becomes disabled
- **THEN** the host has `aria-disabled="true"` and no `tabindex` attribute

#### Scenario: Disabled native button

- **WHEN** a `<button>` icon button becomes disabled
- **THEN** the button is disabled and has the class `kbq-disabled`

### Requirement: No keyboard activation of its own

The icon button MUST NOT turn Enter or Space into a click on a host the browser does not activate natively. On such a host, those keys SHALL run only the listeners the consumer binds, such as `(keydown.enter)` and `(keydown.space)`.

#### Scenario: Enter on a generic host

- **WHEN** an `<i>` icon button with only a `(click)` listener has focus and the user presses Enter
- **THEN** the click listener does not run

### Requirement: Focus origin classes

While focus is on the icon button or inside it, the host SHALL carry `cdk-focused` and the class of the focus origin, such as `cdk-keyboard-focused` or `cdk-mouse-focused`. When a rendered icon button becomes disabled, it SHALL lose these classes and MUST NOT get them again until it is enabled.

#### Scenario: Keyboard focus

- **WHEN** the user tabs onto an enabled icon button
- **THEN** the host has `cdk-focused` and `cdk-keyboard-focused`

#### Scenario: Disabled after rendering

- **WHEN** a focused icon button becomes disabled
- **THEN** the host no longer has `cdk-focused`

### Requirement: Icon item

`kbq-icon-item` SHALL take its icon name from the `kbq-icon-item` attribute and render it like `kbq-icon`. It SHALL always carry the `kbq-icon-item` and `kbq-icon-item_filled` classes, SHALL be hidden from assistive technology by default, and MUST NOT set a `max-height` on its host.

#### Scenario: Default icon item

- **WHEN** `<i kbq-icon-item="kbq-plus_16"></i>` renders
- **THEN** the host has `kbq-icon-item`, `kbq-icon-item_filled` and `kbq-plus_16`
- **AND** it has `aria-hidden="true"` and no inline `max-height`

### Requirement: Icon item size

The `big` input of an icon item SHALL default to `false`, which gives the `kbq-icon-item_normal` class. With `big` set to `true`, the host SHALL have `kbq-icon-item_big` instead.

#### Scenario: Big item

- **WHEN** `big` is bound to `true`
- **THEN** the host has `kbq-icon-item_big` and not `kbq-icon-item_normal`

### Requirement: Icon item variant

The `fade` input of an icon item SHALL default to `false`, which gives the `kbq-icon-item_fade-off` class. With `fade` set to `true`, the host SHALL have `kbq-icon-item_fade-on` instead.

#### Scenario: Fade item

- **WHEN** `fade` is bound to `true`
- **THEN** the host has `kbq-icon-item_fade-on` and not `kbq-icon-item_fade-off`

### Requirement: Icon button and icon item are not plain icons

A content query for `KbqIcon` MUST NOT match an icon button or an icon item. A component that needs them SHALL query `KbqIconButton` or `KbqIconItem`.

#### Scenario: Icon button projected into a query host

- **WHEN** a component with `contentChild(KbqIcon)` has an icon button projected into it
- **THEN** the query result is `undefined`

#### Scenario: Icon item projected into a query host

- **WHEN** a component with `contentChild(KbqIcon)` has an icon item projected into it
- **THEN** the query result is `undefined`

### Requirement: Host element access

`getHostElement()` of an icon, an icon button or an icon item SHALL return its host element.

#### Scenario: Reading the host

- **WHEN** a consumer calls `getHostElement()` on a rendered icon
- **THEN** it returns the element the `kbq-icon` attribute is on
