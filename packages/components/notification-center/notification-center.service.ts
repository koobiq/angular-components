import { computed, inject, Injectable, Signal, signal, TemplateRef, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateAdapter, DateFormatter, KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { map, skip } from 'rxjs/operators';

/** A single notification rendered by the notification center. */
export interface KbqNotificationItem {
    /**
     * Identity of the notification, unique across the list — it is the list's track key and the key
     * the toast is matched back by. Generated on ingestion when omitted, and replaced by a generated
     * one when the supplied value is already taken by another notification.
     */
    id?: string;

    /** Numeric id of the shown toast, set by `push()` and consumed by `hideToast()`. */
    toastId?: number;

    /** Heading of the notification. */
    title?: string | TemplateRef<unknown>;
    /** Visual style; also selects the built-in icon when `icon` is `true`. */
    style?: string | KbqToastStyle;

    /** `true` renders the built-in icon for `style`; a template renders that template instead. */
    icon?: boolean | TemplateRef<unknown>;
    /** Extra classes for the built-in icon. */
    iconClass?: string;
    /** Secondary line below the title. */
    caption?: string | TemplateRef<unknown>;

    /** Body of the notification. */
    content?: string | TemplateRef<unknown>;
    /** Template with the notification's action controls. */
    actions?: TemplateRef<unknown>;

    /**
     * When the notification happened. Any value the configured `DateAdapter` parses without an explicit
     * format — ISO 8601, RFC 2822 or SQL for the Luxon adapter. The value drives both the day group and
     * the ordering; values the adapter cannot parse are shown verbatim in their own group instead of
     * breaking the list.
     */
    date: string;

    /** Whether the user has already read the notification. Defaults to `false` on ingestion. */
    read?: boolean;
}

/** Number of unread notifications above which the trigger counter switches to `"99+"`. */
export const maxUnreadItemsLength = 99;

/** Notifications that happened on the same day, as rendered by one sub-header of the panel. */
export type KbqNotificationsGroup = {
    /** Stable identity of the day group; used as the list's track key. */
    id: string;
    /** Localized day heading. */
    title: string;
    /** Notifications of that day, newest first. */
    items: KbqNotificationItem[];
};

type KbqNotificationsGroups = Record<string, KbqNotificationsGroup>;

/**
 * Everything derived from a notification's `date`, cached per item so each value is parsed once
 * instead of once per grouping pass plus twice per sort comparison.
 *
 * Only locale-independent values live here. The day heading is localized and `DateFormatter`
 * re-localizes at runtime, so caching it would freeze a group in the locale it was first rendered in.
 */
type KbqParsedNotificationDate = {
    /** Raw `date` this entry was derived from; a changed value invalidates the cache. */
    source: string;
    /** Day key, built from adapter accessors so it means the same under every date adapter. */
    groupId: string;
    /** Parsed value passed to `DateAdapter.compareDateTime`, or `null` when unparsable. */
    value: unknown;
};

/** Payload emitted by `KbqNotificationCenterService.onDelete`. */
export type KbqNotificationDeleteEvent = {
    /** What was removed: a single item, a whole date group, or all notifications. */
    type: 'item' | 'group' | 'all';
    /** The notification items that were removed. */
    items: KbqNotificationItem[];
};

/** Suffix appended to a generated id so items ingested within the same millisecond stay distinct. */
let uniqueIdCounter = 0;

/** State and commands of the notification center: the list itself, its modes, and the removal events. */
@Injectable({ providedIn: 'root' })
export class KbqNotificationCenterService {
    /** @docs-private */
    private readonly adapter: DateAdapter<unknown> = inject(DateAdapter);
    /** @docs-private */
    private readonly formatter: DateFormatter<unknown> = inject(DateFormatter);
    /** @docs-private */
    private readonly toastService = inject(KbqToastService);
    /** @docs-private */
    private readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });

    /** Parsed `date` per item. Keyed by the item itself, so no consumer-owned object is written to. */
    private readonly parsedDates = new WeakMap<KbqNotificationItem, KbqParsedNotificationDate>();

    private readonly _silentMode = signal(false);
    private readonly _loadingMode = signal(false);
    private readonly _errorMode = signal(false);
    private readonly _loadingMore = signal(false);
    private readonly _loadMoreErrorMode = signal(false);
    private readonly _hasMore = signal(true);
    private readonly originalItems = signal<KbqNotificationItem[]>([]);

    /**
     * Bumped on every `onRead` emission: `read` is flipped in place on the consumer's object, so the list
     * itself does not change when a notification is read.
     */
    private readonly readVersion = signal(0);

    /** Pinged by every state setter; `changes` merges it with `onRead`. */
    private readonly stateChanges = new Subject<void>();

    /** @docs-private */
    readonly silentMode: Signal<boolean> = this._silentMode.asReadonly();
    /** @docs-private */
    readonly loadingMode: Signal<boolean> = this._loadingMode.asReadonly();
    /** @docs-private */
    readonly errorMode: Signal<boolean> = this._errorMode.asReadonly();
    /**
     * Whether the bottom "load more" spinner is shown while the next page is being loaded.
     * Note: this is the infinite-scroll indicator and is distinct from `loadingMode`,
     * which renders the full-screen loader instead of the list. Set it with `setLoadingMore()`.
     */
    readonly loadingMore: Signal<boolean> = this._loadingMore.asReadonly();
    /**
     * Whether the bottom "load more" error row (with a retry button) is shown.
     * Distinct from `errorMode`, which replaces the whole list with the full-screen error state.
     * Set it with `setLoadMoreErrorMode()`.
     */
    readonly loadMoreErrorMode: Signal<boolean> = this._loadMoreErrorMode.asReadonly();
    /**
     * Whether there are more notifications to load. While `true`, scrolling to the bottom
     * emits `onNextPage`; set it to `false` with `setHasMore()` to stop further infinite-scroll requests.
     */
    readonly hasMore: Signal<boolean> = this._hasMore.asReadonly();

    /** Emits a notification the moment it flips from unread to read. */
    readonly onRead = new BehaviorSubject<KbqNotificationItem | null>(null);

    /** Triggers an event when the user presses the reload button. */
    readonly onReload = new Subject<void>();

    /** Triggers an event when the list is scrolled to the bottom and the next page should be loaded. */
    readonly onNextPage = new Subject<void>();

    /** Triggers an event when an item, a group, or all notifications are removed. */
    readonly onDelete = new Subject<KbqNotificationDeleteEvent>();

    /**
     * Grouped notifications, always ordered from newest to oldest: day groups are sorted by date
     * descending, and notifications within each day are sorted by date descending. Notifications whose
     * `date` the adapter cannot parse keep their raw value as a group heading and sort last.
     * @docs-private
     */
    readonly groupedItems: Signal<KbqNotificationsGroup[]> = computed(() => {
        // The day headings are localized, so a runtime `setLocale()` has to rebuild them.
        this.localeService?.localeId();

        const result: KbqNotificationsGroups = {};

        this.originalItems().forEach((item) => this.makeGroup(item, result));

        const groups = Object.values(result);

        // Newest notifications first within each day.
        groups.forEach((group) => group.items.sort(this.compareByDateDesc));

        // Newest day first.
        return groups.sort((a, b) => this.compareByDateDesc(a.items[0], b.items[0]));
    });

    /**
     * Emits whenever any part of the center's state changes. Carries no payload — it is a ping — and
     * emits nothing on subscription.
     */
    readonly changes: Observable<void> = merge(
        this.stateChanges,
        // The replayed current value is not a change.
        this.onRead.pipe(skip(1))
    ).pipe(map(() => undefined));

    /**
     * Number of unread notifications, formatted for the trigger badge: empty while nothing is unread,
     * and `"99+"` above `maxUnreadItemsLength`.
     */
    readonly unreadItemsCounter: Signal<string> = computed(() => {
        this.readVersion();

        const value = this.originalItems().filter((item) => item.read === false).length;

        if (value > maxUnreadItemsLength) {
            return `${maxUnreadItemsLength}+`;
        }

        return value ? value.toString() : '';
    });

    /** Notification items */
    get items() {
        return this.originalItems();
    }

    set items(values: KbqNotificationItem[]) {
        this.setItems(this.setReadState(this.setIds(values)));
    }

    /** true if there are no notifications. */
    get isEmpty() {
        return this.originalItems().length === 0;
    }

    constructor() {
        this.onRead.pipe(takeUntilDestroyed()).subscribe(() => this.readVersion.update((version) => version + 1));

        this.toastService?.read.pipe(takeUntilDestroyed()).subscribe((toastData) => {
            const item = this.currentItems().find((item) => item.id === toastData?.id);

            if (item && !item.read) {
                item.read = true;

                this.onRead.next(item);
            }
        });
    }

    /**
     * Whether a notification is read, for a view to follow: `read` is flipped in place on the consumer's object,
     * so a view handed that object is not told.
     * @internal
     */
    isRead(item: KbqNotificationItem): boolean {
        this.readVersion();
        // The list handed back with `read` flipped in place.
        this.originalItems();

        return !!item.read;
    }

    /** Set silent mode */
    setSilentMode(value: boolean) {
        this._silentMode.set(value);
        this.stateChanges.next();
    }

    /** Set loading mode */
    setLoadingMode(value: boolean) {
        this._loadingMode.set(value);
        this.stateChanges.next();
    }

    /** Set error mode */
    setErrorMode(value: boolean) {
        this._errorMode.set(value);
        this.stateChanges.next();
    }

    /** Set the bottom "load more" spinner visibility. */
    setLoadingMore(value: boolean) {
        this._loadingMore.set(value);
        this.stateChanges.next();
    }

    /** Set the bottom "load more" error state visibility. */
    setLoadMoreErrorMode(value: boolean) {
        this._loadMoreErrorMode.set(value);
        this.stateChanges.next();
    }

    /** Set whether there are more notifications to load via infinite scroll. */
    setHasMore(value: boolean) {
        this._hasMore.set(value);
        this.stateChanges.next();
    }

    /**
     * Adds a notification to the list and, unless silent mode is on, shows it as a toast.
     * Re-pushing the very same notification object is a no-op: a duplicate would show a second toast
     * and produce a colliding list key. A different notification carrying an `id` the list already
     * uses is added under a freshly generated one instead of being dropped.
     */
    push(item: KbqNotificationItem) {
        if (this.currentItems().includes(item)) {
            return;
        }

        this.setReadState(this.setIds([item], this.currentItems()));

        if (!untracked(this.silentMode)) {
            item.toastId = this.toastService.show(item).id;
        }

        this.setItems([...this.currentItems(), item]);
    }

    /** Hides the toast that corresponds to the given notification item. */
    hideToast(item: KbqNotificationItem): void {
        if (item.toastId === undefined) {
            return;
        }

        this.toastService.hide(item.toastId);
        item.toastId = undefined;
    }

    /** Removes a notification. Removing one that is not in the list is a no-op and emits nothing. */
    remove(removedItem: KbqNotificationItem) {
        if (!this.currentItems().includes(removedItem)) {
            return;
        }

        this.hideToast(removedItem);

        this.setItems(this.currentItems().filter((item) => removedItem !== item));

        this.onDelete.next({ type: 'item', items: [removedItem] });
    }

    /**
     * Removes a whole day group. Only the notifications that are actually in the list are removed and
     * reported; a group holding none of them — a stale reference kept from an earlier `groupedItems`
     * value — is a no-op and emits nothing.
     */
    removeGroup(group: KbqNotificationsGroup) {
        const removedItems = group.items.filter((item) => this.currentItems().includes(item));

        if (removedItems.length === 0) {
            return;
        }

        removedItems.forEach((item) => this.hideToast(item));

        this.setItems(this.currentItems().filter((item) => !removedItems.includes(item)));

        this.onDelete.next({ type: 'group', items: removedItems });
    }

    /** Removes every notification. Removing from an already empty list is a no-op and emits nothing. */
    removeAll() {
        const items = this.currentItems();

        if (items.length === 0) {
            return;
        }

        items.forEach((item) => this.hideToast(item));

        this.setItems([]);

        this.onDelete.next({ type: 'all', items });
    }

    /**
     * The list as the commands see it: untracked, so a command called from a reactive context does not
     * make it depend on the list it is about to write.
     */
    private currentItems(): KbqNotificationItem[] {
        return untracked(this.originalItems);
    }

    private setItems(items: KbqNotificationItem[]): void {
        this.originalItems.set(items);
        this.stateChanges.next();
    }

    private makeGroup = (item: KbqNotificationItem, groups: KbqNotificationsGroups) => {
        const { groupId, source, value } = this.getParsedDate(item);

        if (groups[groupId]) {
            groups[groupId].items.push(item);
        } else {
            groups[groupId] = {
                id: groupId,
                // Formatted on every recomputation rather than cached with the parsed value: the heading is
                // localized, and a cached one would leave the group in the locale it was built in while
                // a group created afterwards renders in the current one.
                title: value === null ? source : this.formatter.absoluteLongDate(value),
                items: [item]
            };
        }
    };

    /**
     * Parses a notification's `date` once and remembers the result.
     *
     * `DateAdapter.parse` returns `null` for anything it does not recognise, and both the Luxon and the
     * Moment adapter throw when a `null` is passed on to `format`, so every derived value is resolved
     * here behind a single validity check.
     */
    private getParsedDate(item: KbqNotificationItem): KbqParsedNotificationDate {
        const source = String(item.date ?? '');
        const cached = this.parsedDates.get(item);

        if (cached?.source === source) {
            return cached;
        }

        const parsed = this.adapter.parse(source, '');
        const isValid = parsed !== null && this.adapter.isValid(parsed);
        const entry: KbqParsedNotificationDate = isValid
            ? {
                  source,
                  // Built from adapter accessors instead of a format string: format tokens are not
                  // portable, e.g. `'yyyyMMdd'` keys every day of a week identically under Moment.
                  groupId: `date:${this.adapter.getYear(parsed)}-${this.adapter.getMonth(parsed)}-${this.adapter.getDate(parsed)}`,
                  value: parsed
              }
            : { source, groupId: `raw:${source}`, value: null };

        this.parsedDates.set(item, entry);

        return entry;
    }

    /** Compares two notifications by date so the newest comes first; unparsable dates sort last. */
    private compareByDateDesc = (a: KbqNotificationItem, b: KbqNotificationItem): number => {
        const parsedA = this.getParsedDate(a).value;
        const parsedB = this.getParsedDate(b).value;

        if (parsedA === null || parsedB === null) {
            return Number(parsedA === null) - Number(parsedB === null);
        }

        return this.adapter.compareDateTime(parsedB, parsedA);
    };

    /**
     * Fills in the missing ids of `items` and re-keys the ones already taken, so that every ingested
     * notification ends up with an id of its own.
     *
     * @param existing notifications `items` is joining, whose ids are therefore taken as well; empty
     * when the list is being replaced wholesale.
     */
    private setIds(items: KbqNotificationItem[], existing: KbqNotificationItem[] = []) {
        const takenIds = new Set(existing.map((item) => item.id));

        items.forEach((item) => {
            // A supplied id is taken on trust only while it is free: a backend that repeats one across
            // pages would otherwise collide on the list's track key and on the toast-to-item lookup in
            // the constructor. `Date.now()` alone collides for every item ingested in the same tick.
            if (item.id === undefined || takenIds.has(item.id)) {
                item.id = `${Date.now()}-${uniqueIdCounter++}`;
            }

            takenIds.add(item.id);
        });

        return items;
    }

    private setReadState(items: KbqNotificationItem[]) {
        items.forEach((item) => (item.read = item.read ?? false));

        return items;
    }
}
