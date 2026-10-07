/**
 * Data for the `angular-animations-removal` migration.
 *
 * Koobiq components no longer use `@angular/animations`: they animate with CSS and wait for its end
 * themselves. The animation triggers they exported and the members that carried an `AnimationEvent` are
 * removed. Warn-only: what replaces a member depends on what the code did with the event.
 */

export interface WarnPattern {
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        pattern: '\\b(fadeAnimation|kbqSelectAnimations)\\b',
        message:
            'fadeAnimation and kbqSelectAnimations were removed from @koobiq/components/core: the components no ' +
            'longer declare @angular/animations triggers. Animate your own elements with CSS, or with ' +
            '`animate.enter` / `animate.leave` in the template.'
    },
    {
        pattern: '\\b(kbqDropdownAnimations|fadeInItems|transformDropdown)\\b',
        message:
            'kbqDropdownAnimations, fadeInItems and transformDropdown were removed from @koobiq/components/dropdown: ' +
            'the panel opens and closes without an animation.'
    },
    {
        pattern: '\\bkbqTabsAnimations\\b',
        message:
            'kbqTabsAnimations was removed from @koobiq/components/tabs: a tab body translates with a CSS ' +
            'transition that lasts `animationDuration`.'
    },
    {
        pattern: '\\bKbqSidepanelAnimationState\\b',
        message:
            'KbqSidepanelAnimationState is no longer exported from @koobiq/components/sidepanel. Follow a sidepanel ' +
            'through KbqSidepanelRef: afterOpened(), beforeClosed() and afterClosed().'
    },
    {
        pattern: '\\.(animationStart|animationDone)\\s*\\(',
        message:
            'KbqPopUp.animationStart() and animationDone() were removed: a pop-up animates in with CSS. A subclass ' +
            'acting once it has appeared overrides the protected afterShowAnimation() instead.'
    },
    {
        pattern: '\\b(isAnimating|panelAnimationState|startAnimation|resetAnimation)\\b',
        message:
            'KbqDropdown lost isAnimating, panelAnimationState, startAnimation() and resetAnimation() along with ' +
            'animationDone: the panel no longer animates, so it is closed as soon as the trigger reports it, and a ' +
            'custom trigger tells it about an attached panel with setOpened().'
    },
    {
        pattern: '\\b(onAnimationStart|onAnimationDone|onAnimation|onTranslateTabStarted|onTranslateTabComplete)\\b',
        message:
            'The animation callbacks taking an AnimationEvent were removed (KbqDropdown, KbqSidebar, KbqTabBody, ' +
            'KbqToastComponent, the sidepanel and actions panel containers). Use the outputs instead: ' +
            'KbqSidebar.stateChanged, KbqTabGroup.animationDone, and the afterOpened() / afterClosed() of a ref.'
    },
    {
        pattern: '\\banimationStateChanged\\b',
        message:
            'animationStateChanged no longer emits an AnimationEvent: the actions panel container emits the state ' +
            'it reached through animationDone, and the one of the sidepanel container is internal. Follow both ' +
            'through their ref: afterOpened(), beforeClosed() and afterClosed().'
    },
    {
        pattern: '\\.animation\\s*\\.\\s*(pipe|subscribe|next)\\b',
        message:
            'KbqToastService.animation (and KbqToastStack.animation) were removed: a toast plays its exit animation ' +
            'before it is taken out, and the overlay detaches once the last exit has ended.'
    },
    {
        pattern: '\\b(NoopAnimationsModule|provideNoopAnimations)\\b',
        message:
            'Koobiq components still skip their motion under NoopAnimationsModule / provideNoopAnimations(), but ' +
            'that is @angular/animations, which is deprecated: provide ' +
            '`{ provide: KBQ_ANIMATIONS_CONFIG, useValue: { animationsDisabled: true } }` from ' +
            '@koobiq/components/core instead. In jsdom nothing animates either way.'
    },
    {
        pattern: '\\b(provideAnimations|provideAnimationsAsync|BrowserAnimationsModule)\\b',
        message:
            'Koobiq components no longer need Angular animations. Remove the provider, and @angular/animations, ' +
            'unless the components of the application declare `animations: [...]` themselves.'
    }
];

export const SUMMARY = [
    'Koobiq components animate with CSS and no longer depend on @angular/animations, see "Animations without',
    '@angular/animations" in the migration guide. A spec that waited for an animation callback now waits for the',
    'next render: fixture.detectChanges() or await fixture.whenStable().'
];
