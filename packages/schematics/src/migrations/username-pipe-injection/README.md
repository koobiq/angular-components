# username-pipe-injection

Migration schematic invoked automatically by `ng update @koobiq/components@21`
(registered for `21.0.0-0`). Reports the call sites that obtained `KbqUsernamePipe` or
`KbqUsernameCustomPipe` through dependency injection, which stopped resolving in the username review.
It never writes to the tree.

## Background

Both pipe classes carried two decorators: `@Injectable({ providedIn: 'root' })` on top of `@Pipe`. That
produced two instantiation paths with two different injectors. Used in a template, a pipe is created
against the node injector, so a component- or route-level `{ provide: KBQ_PROFILE_MAPPING, … }` applies.
Obtained with `inject(KbqUsernamePipe)`, it was the **root** singleton, and its own
`inject(KBQ_PROFILE_MAPPING)` resolved at the root injector — the scoped mapping was invisible. The same
class therefore produced two different strings for the same profile depending on how you got hold of it,
and the search guide recommended exactly the path that ignored the override.

`providedIn: 'root'` is gone. In a template nothing changes; through DI the pipes no longer resolve.

| Before                                                  | After                                                                |
| ------------------------------------------------------- | -------------------------------------------------------------------- |
| `inject(KbqUsernamePipe).transform(user)`               | `kbqInjectUsernameFormatter()` → `formatUsername(user)`              |
| `inject(KbqUsernameCustomPipe).transform(user, format)` | `kbqFormatUsernameCustom(user, format, inject(KBQ_PROFILE_MAPPING))` |
| `constructor(private pipe: KbqUsernamePipe)`            | `private readonly formatUsername = kbqInjectUsernameFormatter()`     |
| `KbqMappingMissingError`                                | Removed; both pipes fall back to `kbqDefaultProfileMapping`          |

`kbqInjectUsernameFormatter()` must run in an injection context. It resolves `KBQ_PROFILE_MAPPING` where
_you_ call it, which is what makes the string it returns match the one `kbq-username` renders next to it.

## What it does _not_ do

Nothing is rewritten. `kbqInjectUsernameFormatter()` returns a function rather than an object with a
`transform` method, and it has to be evaluated in an injection context — neither can be derived from the
call site.

## Notes with no call site to point at

- The shipped `KBQ_PROFILE_MAPPING` now maps the uppercase keys `F` / `M` / `L` as well, so
  `{{ user | kbqUsernameCustom }}` with the library's own default format renders the surname instead of a
  literal capital `L`. Spread `kbqDefaultProfileMapping` to pick the uppercase keys up in a mapping of
  your own.
- `kbq-username` renders the name of a profile that carries only some of the name fields. It used to
  require both `firstName` and `lastName`, so `{ lastName, login }` rendered the login alone and
  `{ firstName, middleName }` rendered an empty element.
- `KbqUsernameSecondaryHint` is exported by `KbqUsernameModule`. It was declared, documented and used by
  the component's own template but missing from the module, so inside a `<kbq-username-custom-view>` the
  directive silently did not apply and the hint rendered in the primary color.
- The secondary color no longer hangs off an adjacent-sibling selector, so a login with no name in front
  of it renders in the secondary color as intended.
- Initials are taken by code point, so a name starting outside the BMP no longer abbreviates to a lone
  surrogate.
- `kbq-title` is not attached in `mode="text"`, which applies no ellipsis for it to detect.
- The site hint carries a visually hidden label from the new `username.siteLabel` locale key.

## Running it manually

```
ng generate @koobiq/components:username-pipe-injection --project my-app
```
