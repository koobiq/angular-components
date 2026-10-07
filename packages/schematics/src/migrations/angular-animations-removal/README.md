# angular-animations-removal

Migration schematic invoked automatically by `ng update @koobiq/components@21`
(registered for `21.0.0-0`). Reports the uses of the animation triggers the library exported and of the
members that carried an `AnimationEvent`. It never writes to the tree.

## Background

Koobiq components no longer use `@angular/animations`, which Angular deprecated. They animate with CSS,
wait for the end of an animation themselves, and skip the motion under `prefers-reduced-motion: reduce`
or `KBQ_ANIMATIONS_CONFIG`. `@angular/animations` is no longer a peer dependency, and an application no
longer needs `provideAnimations()` for the components.

## What it does _not_ do

Nothing is rewritten: what replaces a member depends on what the code did with the event.

| Pattern                                                                      | Manual migration                                                             |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `fadeAnimation`, `kbqSelectAnimations`                                       | Animate with CSS, or `animate.enter` / `animate.leave`                       |
| `kbqDropdownAnimations`, `fadeInItems`, `transformDropdown`                  | Remove: the dropdown panel no longer animates                                |
| `kbqTabsAnimations`                                                          | Remove: a tab body translates with a CSS transition                          |
| `KbqSidepanelAnimationState`                                                 | `afterOpened()`, `beforeClosed()`, `afterClosed()` of `KbqSidepanelRef`      |
| `.animationStart()`, `.animationDone()` of a pop-up                          | Override the protected `afterShowAnimation()`                                |
| `isAnimating`, `panelAnimationState`, `startAnimation()`, `resetAnimation()` | Remove; a custom dropdown trigger calls `setOpened()`                        |
| `onAnimationStart`, `onAnimationDone`, `onAnimation`, `onTranslateTab*`      | `KbqSidebar.stateChanged`, `KbqTabGroup.animationDone`, the ref's outputs    |
| `animationStateChanged`                                                      | The ref: `afterOpened()`, `beforeClosed()`, `afterClosed()`                  |
| `KbqToastService.animation`                                                  | Remove: the overlay detaches once the last exit has ended                    |
| `NoopAnimationsModule`, `provideNoopAnimations()`                            | `{ provide: KBQ_ANIMATIONS_CONFIG, useValue: { animationsDisabled: true } }` |
| `provideAnimations()`, `provideAnimationsAsync()`, `BrowserAnimationsModule` | Remove, unless the application declares `animations: [...]` itself           |

## Running it manually

```
ng generate @koobiq/components:angular-animations-removal --project my-app
```
