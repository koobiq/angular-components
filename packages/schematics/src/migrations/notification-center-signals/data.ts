/**
 * Data for the `notification-center-signals` migration.
 *
 * The notification-center review changed four things a consumer's code can point at, none of which can
 * be rewritten mechanically — every one of them needs a decision the schematic cannot make:
 *
 * - `KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY_FACTORY_PROVIDER` is gone from the entry point. The token
 *   and its factory are still exported, so the provider has to be written out by hand.
 * - `onReload` / `onNextPage` / `onDelete` are `Subject`s instead of `EventEmitter`s, so `.emit()` is
 *   gone. The replacement is `.next()`, but the same member names are common enough elsewhere that a
 *   blind textual rewrite would reach past the notification center.
 * - `backdropClass` / `panelClass` / `offset` / `scrolledToBottomOffset` are `input()` signals: a read
 *   is a call now, and a write has to become a template binding because an `input()` has no `.set()`.
 * - `KbqNotificationCenterService.changes` carries no payload any more.
 */

export interface WarnPattern {
    /** Pattern whose match makes the file worth reporting. */
    pattern: string;
    /** Additional pattern the file must match as well, used to scope a member name to its owner. */
    requires?: string;
    message: string;
}

/** Whether a file is worth looking at at all. */
export const NOTIFICATION_CENTER_REFERENCE =
    '(?:\\bKbqNotificationCenter|\\bKBQ_NOTIFICATION_CENTER_|@koobiq/components/notification-center)';

/**
 * File-scoped patterns, surfaced with file locations. Only evaluated for files that reference the
 * notification center, so the member names below stay scoped to it.
 */
export const warnPatterns: WarnPattern[] = [
    {
        pattern: '\\bKBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY_FACTORY_PROVIDER\\b',
        message:
            'KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY_FACTORY_PROVIDER is no longer exported from ' +
            '@koobiq/components/notification-center, so importing it fails with TS2305. The token and its factory ' +
            'are still exported — provide it yourself: `{ provide: KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY, ' +
            'deps: [Overlay], useFactory: kbqNotificationCenterScrollStrategyFactory }`. The default scroll ' +
            'strategy is already provided in root, so a provider that only reproduced it can be dropped.'
    },
    {
        pattern: '\\bon(?:Reload|NextPage|Delete)\\s*\\.\\s*emit\\s*\\(',
        message:
            'KbqNotificationCenterService.onReload / onNextPage / onDelete are Subjects instead of EventEmitters, ' +
            'so `.emit(…)` no longer exists — call `.next(…)` instead. `.subscribe(…)` is unchanged.'
    },
    {
        pattern: '\\.\\s*(?:backdropClass|panelClass|offset|scrolledToBottomOffset)\\b(?!\\s*\\()',
        requires: '\\bKbqNotificationCenterTrigger\\b',
        message:
            'backdropClass / panelClass / offset / scrolledToBottomOffset on KbqNotificationCenterTrigger are ' +
            'input() signals now: read them as `trigger.offset()`, and replace a programmatic write with the ' +
            'matching template binding — an input() has no `.set()`. Verify the accesses reported here belong to ' +
            'the trigger; the names are matched textually.'
    },
    {
        pattern: '\\.\\s*changes\\s*\\.\\s*subscribe\\s*\\(\\s*(?!\\(\\s*\\))',
        requires: '\\bKbqNotificationCenterService\\b',
        message:
            'KbqNotificationCenterService.changes is an Observable<void> now — it is a ping, and the value handed ' +
            'to a subscriber is always undefined. Read the state you need from the service itself (items, ' +
            'silentMode, loadingMode, errorMode, loadingMore, loadMoreErrorMode, hasMore).'
    }
];
