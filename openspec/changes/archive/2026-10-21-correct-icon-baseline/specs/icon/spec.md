# Spec Delta

## MODIFIED Requirements

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
