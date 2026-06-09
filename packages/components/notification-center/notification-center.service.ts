import { EventEmitter, inject, Injectable, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateAdapter, DateFormatter } from '@koobiq/components/core';
import { KbqToastData, KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { BehaviorSubject, combineLatestWith, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface KbqNotificationItem extends Omit<KbqToastData, 'closeButton'> {
    id?: string;

    /** Numeric id of the shown toast, set by `push()` and consumed by `hideToast()`. */
    toastId?: number;

    title?: string | TemplateRef<unknown>;
    style?: string | KbqToastStyle;

    icon?: boolean | TemplateRef<unknown>;
    iconClass?: string;
    caption?: string | TemplateRef<unknown>;

    content?: string | TemplateRef<unknown>;
    actions?: TemplateRef<unknown>;

    date: string;
    read?: boolean;
}

export const maxUnreadItemsLength = 99;

type KbqNotificationsGroup = { title: string; items: KbqNotificationItem[] };

type KbqNotificationsGroups = Record<string, KbqNotificationsGroup>;

/** Payload emitted by `KbqNotificationCenterService.onDelete`. */
export type KbqNotificationDeleteEvent = {
    /** What was removed: a single item, a whole date group, or all notifications. */
    type: 'item' | 'group' | 'all';
    /** The notification items that were removed. */
    items: KbqNotificationItem[];
};

@Injectable({ providedIn: 'root' })
export class KbqNotificationCenterService {
    /** @docs-private */
    private readonly adapter = inject(DateAdapter);
    /** @docs-private */
    private readonly formatter = inject(DateFormatter);
    /** @docs-private */
    private readonly toastService = inject(KbqToastService);

    /** @docs-private */
    readonly silentMode = new BehaviorSubject(false);
    /** @docs-private */
    readonly loadingMode = new BehaviorSubject(false);
    /** @docs-private */
    readonly errorMode = new BehaviorSubject(false);
    /**
     * Whether the bottom "load more" spinner is shown while the next page is being loaded.
     * Note: this is the infinite-scroll indicator and is distinct from `loadingMode`,
     * which renders the full-screen loader instead of the list.
     */
    readonly loadingMore = new BehaviorSubject(false);
    /**
     * Whether the bottom "load more" error row (with a retry button) is shown.
     * Distinct from `errorMode`, which replaces the whole list with the full-screen error state.
     */
    readonly loadMoreErrorMode = new BehaviorSubject(false);
    /**
     * Whether there are more notifications to load. While `true`, scrolling to the bottom
     * emits `onNextPage`; set it to `false` to stop further infinite-scroll requests.
     */
    readonly hasMore = new BehaviorSubject(true);
    /** @docs-private */
    readonly onRead = new BehaviorSubject<KbqNotificationItem | null>(null);

    /** Triggers an event when the user presses the reload button. */
    readonly onReload = new EventEmitter<void>();

    /** Triggers an event when the list is scrolled to the bottom and the next page should be loaded. */
    readonly onNextPage = new EventEmitter<void>();

    /** Triggers an event when an item, a group, or all notifications are removed. */
    readonly onDelete = new EventEmitter<KbqNotificationDeleteEvent>();

    private originalItems = new BehaviorSubject([] as KbqNotificationItem[]);

    /**
     * Grouped notifications, always ordered from newest to oldest: day groups are sorted by date
     * descending, and notifications within each day are sorted by date descending.
     * @docs-private
     */
    readonly groupedItems = this.originalItems.pipe(
        map((items) => {
            const result: KbqNotificationsGroups = {};

            items.forEach((item) => this.makeGroup(item, result));

            const groups = Object.values(result);

            // Newest notifications first within each day.
            groups.forEach((group) => group.items.sort(this.compareByDateDesc));

            // Newest day first.
            return groups.sort((a, b) => this.compareByDateDesc(a.items[0], b.items[0]));
        })
    );

    /** Emits an event whenever the changes. */
    readonly changes = merge(
        this.silentMode,
        this.loadingMode,
        this.errorMode,
        this.loadingMore,
        this.loadMoreErrorMode,
        this.hasMore,
        this.originalItems,
        this.onRead
    );

    /** Notification items */
    get items() {
        return this.originalItems.value;
    }

    set items(values: KbqNotificationItem[]) {
        this.originalItems.next(this.setReadState(this.setIds(values)));
    }

    /** Number of unread notifications */
    get unreadItemsCounter(): Observable<string> {
        return this.originalItems.pipe(map((items) => items.filter((item) => item.read === false).length)).pipe(
            combineLatestWith(this.onRead),
            map(([value]) => {
                if (value < maxUnreadItemsLength) {
                    return value ? value.toString() : '';
                } else {
                    return `${maxUnreadItemsLength}+`;
                }
            })
        );
    }

    /** true if there are no notifications. */
    get isEmpty() {
        return this.originalItems.value.length === 0;
    }

    constructor() {
        this.toastService?.read.pipe(takeUntilDestroyed()).subscribe((toastData) => {
            const item = this.items.find((item) => item.id === toastData?.id);

            if (item && !item.read) {
                item.read = true;

                this.onRead.next(toastData as KbqNotificationItem);
            }
        });
    }

    /** Set silent mode */
    setSilentMode(value: boolean) {
        this.silentMode.next(value);
    }

    /** Set loading mode */
    setLoadingMode(value: boolean) {
        this.loadingMode.next(value);
    }

    /** Set error mode */
    setErrorMode(value: boolean) {
        this.errorMode.next(value);
    }

    /** Set the bottom "load more" spinner visibility. */
    setLoadingMore(value: boolean) {
        this.loadingMore.next(value);
    }

    /** Set the bottom "load more" error state visibility. */
    setLoadMoreErrorMode(value: boolean) {
        this.loadMoreErrorMode.next(value);
    }

    /** Set whether there are more notifications to load via infinite scroll. */
    setHasMore(value: boolean) {
        this.hasMore.next(value);
    }

    /** Push new notification item in center */
    push(item: KbqNotificationItem) {
        this.setReadState(this.setIds([item]));

        if (!this.silentMode.value) {
            item.toastId = this.toastService.show(item).id;
        }

        return this.originalItems.next([...this.originalItems.value, item]);
    }

    /** Hides the toast that corresponds to the given notification item. */
    hideToast(item: KbqNotificationItem): void {
        if (item.toastId === undefined) {
            return;
        }

        this.toastService.hide(item.toastId);
        item.toastId = undefined;
    }

    /** Remove notification item */
    remove(removedItem: KbqNotificationItem) {
        this.hideToast(removedItem);

        this.originalItems.next(this.originalItems.value.filter((item) => removedItem !== item));

        this.onDelete.emit({ type: 'item', items: [removedItem] });
    }

    /** Remove group of notification items */
    removeGroup(group: KbqNotificationsGroup) {
        group.items.forEach((item) => this.hideToast(item));

        this.originalItems.next(this.originalItems.value.filter((item) => !group.items.includes(item)));

        this.onDelete.emit({ type: 'group', items: [...group.items] });
    }

    /** Remove all notification items */
    removeAll() {
        const items = this.originalItems.value;

        items.forEach((item) => this.hideToast(item));

        this.originalItems.next([]);

        this.onDelete.emit({ type: 'all', items });
    }

    private makeGroup = (item: KbqNotificationItem, groups: KbqNotificationsGroups) => {
        const parsedDate = this.adapter.parse(item.date, '');
        const groupId = this.adapter.format(parsedDate, 'yyyyMMdd');
        const groupTitle = this.formatter.absoluteLongDate(parsedDate);

        if (groups[groupId]) {
            groups[groupId].items.push(item);
        } else {
            groups[groupId] = {
                title: groupTitle,
                items: [item]
            };
        }
    };

    /** Compares two notifications by date so the newest comes first. */
    private compareByDateDesc = (a: KbqNotificationItem, b: KbqNotificationItem): number => {
        const parsedA = this.adapter.parse(a.date, '');
        const parsedB = this.adapter.parse(b.date, '');

        if (!parsedA || !parsedB) {
            return 0;
        }

        return this.adapter.compareDateTime(parsedB, parsedA);
    };

    private setIds(items: KbqNotificationItem[]) {
        items.forEach((item) => (item.id = item.id ?? new Date().getTime().toString()));

        return items;
    }

    private setReadState(items: KbqNotificationItem[]) {
        items.forEach((item) => (item.read = item.read ?? false));

        return items;
    }
}
