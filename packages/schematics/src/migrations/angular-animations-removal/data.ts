import { WarnPattern } from '../../utils/warn-only-migration';

/**
 * Data for the `angular-animations-removal` migration.
 *
 * Koobiq components no longer use `@angular/animations`: they animate with CSS and wait for its end
 * themselves. The animation triggers they exported and the members that carried an `AnimationEvent` are
 * removed. Warn-only: what replaces a member depends on what the code did with the event.
 */

/**
 * A file that imports the entry point, names one of its `Kbq…` / `kbq…` symbols or renders its element. The stem
 * ends at a capital or at the end of the word, so `Tab` does not take `KbqTable`.
 */
const owner = (entryPoint: string, stem: string, element = entryPoint): string =>
    String.raw`@koobiq/components/${entryPoint}\b|\b[Kk]bq${stem}(?:[A-Z]\w*)?\b|<kbq-${element}\b`;

const DROPDOWN = owner('dropdown', 'Dropdown');
const SIDEBAR = owner('sidebar', 'Sidebar');
const TABS = owner('tabs', 'Tabs?', 'tab');
const TOAST = owner('toast', 'Toast');
const SIDEPANEL = owner('sidepanel', 'Sidepanel');
const ACTIONS_PANEL = owner('actions-panel', 'ActionsPanel');
const CONTENT_PANEL = owner('content-panel', 'ContentPanel');
const MODAL = owner('modal', 'Modal');
const POP_UP = [
    String.raw`\bKbqPopUp\w*`,
    owner('tooltip', 'Tooltip'),
    owner('popover', 'Popover'),
    owner('app-switcher', 'AppSwitcher'),
    owner('notification-center', 'NotificationCenter')
].join('|');

/**
 * The anchor is left out where the pattern names Koobiq alone, and for Angular's animation providers, which
 * `app.config.ts` and specs declare without naming a component.
 */
export const warnPatterns: WarnPattern[] = [
    {
        // kbqSelectAnimations is ours whatever the file imports it from.
        anchor: String.raw`@koobiq/components/core\b|\bkbqSelectAnimations\b`,
        pattern: '\\b(fadeAnimation|kbqSelectAnimations)\\b',
        message:
            'fadeAnimation and kbqSelectAnimations were removed from @koobiq/components/core: the components no ' +
            'longer declare @angular/animations triggers. Animate your own elements with CSS, or with ' +
            '`animate.enter` / `animate.leave` in the template.'
    },
    {
        anchor: DROPDOWN,
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
        pattern:
            '\\b(kbqPopoverAnimations|kbqDatepickerAnimations|KbqNotificationCenterAnimations|' +
            'kbqAppSwitcherAnimations)\\b',
        message:
            'kbqPopoverAnimations, kbqDatepickerAnimations, KbqNotificationCenterAnimations and ' +
            'kbqAppSwitcherAnimations were removed from @koobiq/components/popover, /datepicker, ' +
            '/notification-center and /app-switcher: their panels animate with CSS. Animate your own elements ' +
            'with CSS, or with `animate.enter` / `animate.leave` in the template.'
    },
    {
        anchor: MODAL,
        pattern: '\\bMODAL_ANIMATE_DURATION\\b',
        message:
            'MODAL_ANIMATE_DURATION was removed from @koobiq/components/modal: the dialog animates with CSS and ' +
            'waits for the end of the animation itself. Instead of a timer of that length, act on afterOpen / ' +
            'afterClose of the KbqModalRef.'
    },
    {
        pattern: '\\bKbqSidepanelAnimationState\\b',
        message:
            'KbqSidepanelAnimationState is no longer exported from @koobiq/components/sidepanel. Follow a sidepanel ' +
            'through KbqSidepanelRef: afterOpened(), beforeClosed() and afterClosed().'
    },
    {
        anchor: POP_UP,
        pattern: '\\.(animationStart|animationDone)\\s*\\(',
        message:
            'KbqPopUp.animationStart() and animationDone() were removed: a pop-up animates in with CSS. A subclass ' +
            'acting once it has appeared overrides the protected afterShowAnimation() instead.'
    },
    {
        anchor: DROPDOWN,
        pattern: '\\b(isAnimating|panelAnimationState|startAnimation|resetAnimation)\\b',
        message:
            'KbqDropdown lost isAnimating, panelAnimationState, startAnimation() and resetAnimation() along with ' +
            'animationDone: the panel no longer animates, so it is closed as soon as the trigger reports it, and a ' +
            'custom trigger tells it about an attached panel with setOpened().'
    },
    {
        anchor: DROPDOWN,
        pattern: '\\.animationDone\\s*\\.\\s*(pipe|subscribe)\\b',
        message:
            'KbqDropdown.animationDone was removed: the panel no longer animates, so the trigger attaches and ' +
            'detaches it at once. Listen to the dropdownOpened / dropdownClosed outputs of KbqDropdownTrigger, or ' +
            'its openedChange, which emit right after. The animationDone of KbqTabGroup and of the actions panel ' +
            'container stays: ignore this for them.'
    },
    {
        anchor: [DROPDOWN, SIDEBAR, TABS, TOAST, SIDEPANEL, ACTIONS_PANEL].join('|'),
        pattern: '\\b(onAnimationStart|onAnimationDone|onAnimation|onTranslateTabStarted|onTranslateTabComplete)\\b',
        message:
            'The animation callbacks taking an AnimationEvent were removed (KbqDropdown, KbqSidebar, KbqTabBody, ' +
            'KbqToastComponent, the sidepanel and actions panel containers). Use the outputs instead: ' +
            'KbqSidebar.stateChanged, KbqTabGroup.animationDone, and the afterOpened() / afterClosed() of a ref.'
    },
    {
        anchor: [SIDEPANEL, ACTIONS_PANEL].join('|'),
        pattern: '\\banimationStateChanged\\b',
        message:
            'animationStateChanged no longer emits an AnimationEvent: the actions panel container emits the state ' +
            'it reached through animationDone, and the one of the sidepanel container is internal. Follow both ' +
            'through their ref: afterOpened(), beforeClosed() and afterClosed().'
    },
    {
        anchor: [SIDEPANEL, SIDEBAR, TOAST].join('|'),
        pattern: '\\b(setAnimationState|animationTransform)\\b|\\.animationState\\b',
        message:
            'The animation state of KbqSidepanelContainerComponent (animationState, animationTransform, ' +
            'setAnimationState()), KbqSidebar and KbqToastComponent was removed. Follow a sidepanel through ' +
            'KbqSidepanelRef: afterOpened(), beforeClosed() and afterClosed(); a sidebar through stateChanged. ' +
            'Ignore this if animationState is a member of your own component.'
    },
    {
        anchor: CONTENT_PANEL,
        pattern: '\\bcontentAnimationState\\b',
        message:
            'KbqContentPanelContainer.contentAnimationState was removed with the @contentAnimation trigger it fed: ' +
            'the content makes room for the opened panel with a CSS transition. Read isOpened() for the state of ' +
            'the panel.'
    },
    {
        anchor: TOAST,
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
