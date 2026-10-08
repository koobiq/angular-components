import type { AreaData } from '../data';

const NOTIFICATION_CENTER_FLAGS = '(?:silentMode|loadingMode|errorMode|loadingMore|loadMoreErrorMode|hasMore)';

// `.value` / `.getValue()` / `.next()` / `.subscribe()` / `.pipe()` right after the member: what a subject allowed.
const SUBJECT_ACCESS = '\\s*\\.\\s*(?:value\\b|getValue\\s*\\(|next\\s*\\(|subscribe\\s*\\(|pipe\\s*\\()';

/**
 * 21.0.0 turned the state components and services expose for reading into signals. A read cannot be rewritten
 * safely (a signal is called, a subject was subscribed to), so every use is reported.
 */
export const stateSignals: AreaData = {
    warnPatterns: [
        {
            anchor: '@koobiq/components/notification-center',
            pattern: `\\b${NOTIFICATION_CENTER_FLAGS}${SUBJECT_ACCESS}`,
            message:
                'The flags of `KbqNotificationCenterService` (`silentMode`, `loadingMode`, `errorMode`, `loadingMore`, ' +
                '`loadMoreErrorMode`, `hasMore`) are signals: read `service.silentMode()`, write with the matching ' +
                '`set…()` method, and wrap one in `toObservable()` where a stream is needed.'
        },
        {
            anchor: 'kbqNotificationCenter|KbqNotificationCenter',
            pattern: `\\b${NOTIFICATION_CENTER_FLAGS}\\s*\\|\\s*async\\b`,
            message:
                'The flags of `KbqNotificationCenterService` are signals: bind `service.silentMode()` instead of ' +
                'piping them through `async`.'
        },
        {
            pattern: '\\bunreadItemsCounter\\s*\\|\\s*async\\b',
            message:
                '`unreadItemsCounter` of the notification center service and trigger is a signal: bind ' +
                '`trigger.unreadItemsCounter()`, and drop `AsyncPipe` from the imports if nothing else uses it.'
        },
        {
            anchor: '@koobiq/components/notification-center',
            pattern: '\\b(?:unreadItemsCounter|groupedItems)\\s*\\.\\s*(?:subscribe|pipe)\\s*\\(',
            message:
                '`unreadItemsCounter` and `groupedItems` of `KbqNotificationCenterService` are signals: read ' +
                '`service.unreadItemsCounter()`, or wrap one in `toObservable()` where a stream is needed.'
        },
        {
            anchor: 'kbqNotificationCenter|KbqNotificationCenter',
            pattern: '\\bgroupedItems\\s*\\|\\s*async\\b',
            message: '`KbqNotificationCenterService.groupedItems` is a signal: bind `service.groupedItems()`.'
        },
        {
            anchor: '\\bKbqNotificationCenterService\\b',
            pattern: '\\.\\s*changes\\s*\\.\\s*(?:subscribe|pipe)\\s*\\(',
            message:
                'If this subscribes to `KbqNotificationCenterService.changes`: it no longer emits on subscription. ' +
                'A handler that relied on running then has to run once on its own before subscribing.'
        },
        {
            anchor: '@koobiq/components/toast',
            pattern: `\\b(?:hovered|focused)${SUBJECT_ACCESS}`,
            message:
                '`hovered` and `focused` of `KbqToastService` and `KbqToastComponent` are read-only signals: read ' +
                '`toastService.hovered()`; a subclass of the toast sets its hover state with `setHovered()`.'
        },
        {
            anchor: '@koobiq/components/filter-bar',
            pattern: '\\.filteredOptions\\s*(?:\\.\\s*(?:subscribe|pipe)\\s*\\(|=(?!=))',
            message:
                '`filteredOptions` of `KbqFilters`, `KbqPipeSelectComponent` and `KbqPipeMultiSelectComponent` is a ' +
                'read-only signal: read `filteredOptions()`, and filter through the search control or the inputs.'
        },
        {
            anchor: 'kbq-filters|kbqFilters|kbq-pipe',
            pattern: '\\bfilteredOptions\\s*\\|\\s*async\\b',
            message: '`filteredOptions` of the filter bar is a signal: bind `filteredOptions()`.'
        },
        {
            anchor: '\\bextends\\s+KbqPipeSelectComponent\\b',
            pattern: '\\bsuper\\s*\\.\\s*ngOnInit\\s*\\(',
            message: '`KbqPipeSelectComponent` no longer implements `ngOnInit`: remove the `super.ngOnInit()` call.'
        },
        {
            anchor: '\\bextends\\s+KbqPipeDate(?:Base|time)?Component\\b',
            pattern: '\\bthis\\.(?:isListMode|showStartCalendar|showEndCalendar)\\b(?!\\s*\\(|\\.set\\s*\\()',
            message:
                '`isListMode`, `showStartCalendar` and `showEndCalendar` of the date pipes are signals: read ' +
                '`this.isListMode()` and write `this.isListMode.set(value)`.'
        },
        {
            anchor: '@koobiq/components/select',
            pattern: '\\.hiddenItems\\b(?!\\s*\\()',
            message:
                'If this reads `KbqSelect.hiddenItems`: it is a read-only signal, as in `KbqTreeSelect`. Read ' +
                '`select.hiddenItems()`.'
        },
        {
            anchor: '<kbq-select\\b',
            pattern: '\\bhiddenItems\\b(?!\\s*\\()',
            message:
                'If this reads `hiddenItems` of a `kbq-select`: it is a read-only signal, as in `KbqTreeSelect`. Bind ' +
                '`select.hiddenItems()`.'
        },
        {
            anchor: '@koobiq/components/search-expandable|<kbq-search-expandable\\b',
            pattern: '\\.value\\s*\\.\\s*(?:next|getValue|subscribe|pipe|asObservable|value)\\b',
            message:
                'If this uses `KbqSearchExpandable.value`: it is a `WritableSignal<string>`. Read `value()`, write ' +
                '`value.set(text)`, and use an `effect()` or `toObservable()` instead of subscribing.'
        },
        {
            anchor: '\\bextends\\s+KbqDatepickerToggleIconComponent\\b',
            pattern: '\\bsuper\\s*\\.\\s*(?:ngAfterContentInit|ngOnDestroy)\\s*\\(',
            message:
                '`KbqDatepickerToggleIconComponent` no longer implements `ngAfterContentInit` and `ngOnDestroy`: ' +
                'remove the `super` calls.'
        }
    ]
};
