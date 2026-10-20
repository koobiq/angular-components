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

| Pattern                                                                                                          | Manual migration                                                              |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `fadeAnimation`, `kbqSelectAnimations`                                                                           | Animate with CSS, or `animate.enter` / `animate.leave`                        |
| `kbqDropdownAnimations`, `fadeInItems`, `transformDropdown`                                                      | Remove: the dropdown panel no longer animates                                 |
| `kbqTabsAnimations`                                                                                              | Remove: a tab body translates with a CSS transition                           |
| `kbqPopoverAnimations`, `kbqDatepickerAnimations`, `KbqNotificationCenterAnimations`, `kbqAppSwitcherAnimations` | Animate with CSS, or `animate.enter` / `animate.leave`                        |
| `MODAL_ANIMATE_DURATION`                                                                                         | `afterOpen` / `afterClose` of `KbqModalRef` instead of a timer                |
| `KbqSidepanelAnimationState`                                                                                     | `afterOpened()`, `beforeClosed()`, `afterClosed()` of `KbqSidepanelRef`       |
| `.animationStart()`, `.animationDone()` of a pop-up                                                              | Override the protected `afterShowAnimation()`                                 |
| `isAnimating`, `panelAnimationState`, `startAnimation()`, `resetAnimation()`                                     | Remove; a custom dropdown trigger calls `setOpened()`                         |
| `.animationDone.pipe()` / `.subscribe()` of a dropdown                                                           | `dropdownOpened` / `dropdownClosed` or `openedChange` of `KbqDropdownTrigger` |
| `onAnimationStart`, `onAnimationDone`, `onAnimation`, `onTranslateTab*`                                          | `KbqSidebar.stateChanged`, `KbqTabGroup.animationDone`, the ref's outputs     |
| `animationStateChanged`                                                                                          | The ref: `afterOpened()`, `beforeClosed()`, `afterClosed()`                   |
| `animationState`, `animationTransform`, `setAnimationState()`                                                    | The ref's outputs; `KbqSidebar.stateChanged`                                  |
| `contentAnimationState` of `KbqContentPanelContainer`                                                            | `isOpened()`                                                                  |
| `KbqToastService.animation`                                                                                      | Remove: the overlay detaches once the last exit has ended                     |
| `NoopAnimationsModule`, `provideNoopAnimations()`                                                                | `{ provide: KBQ_ANIMATIONS_CONFIG, useValue: { animationsDisabled: true } }`  |
| `provideAnimations()`, `provideAnimationsAsync()`, `BrowserAnimationsModule`                                     | Remove, unless the application declares `animations: [...]` itself            |

A pattern that does not name Koobiq itself is checked only in a file that also names the component it is
about — its entry point, one of its `Kbq…` / `kbq…` symbols or its element — so an application component
that declares its own `isAnimating` or `onAnimationDone()` stays quiet. Angular's animation providers and
modules are reported wherever they appear: `app.config.ts` and a spec seldom name a Koobiq component.

## Running it manually

```
ng generate @koobiq/components:angular-animations-removal --project my-app
```
