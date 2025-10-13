import { EventEmitter, inject, Injectable, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateAdapter, DateFormatter } from '@koobiq/components/core';
import { KbqToastData, KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { BehaviorSubject, combineLatestWith, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface KbqNotificationItem extends Omit<KbqToastData, 'closeButton'> {
    id?: string;

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

type KbqNotificationsGroup = { title: string; items: KbqNotificationItem[] };

type KbqNotificationsGroups = Record<string, KbqNotificationsGroup>;

@Injectable({ providedIn: 'root' })
export class KbqNotificationCenterService<D> {
    /** @docs-private */
    private readonly adapter = inject(DateAdapter<D>);
    /** @docs-private */
    private readonly formatter = inject(DateFormatter<D>);
    /** @docs-private */
    private readonly toastService = inject(KbqToastService);

    readonly silentMode = new BehaviorSubject(false);
    readonly loadingMode = new BehaviorSubject(false);
    readonly errorMode = new BehaviorSubject(false);

    readonly onRead = new BehaviorSubject<KbqNotificationItem | null>(null);

    readonly onReload = new EventEmitter<void>();

    private originalItems = new BehaviorSubject([] as KbqNotificationItem[]);

    readonly itemsForView = this.originalItems.pipe(
        map((items) => {
            const result: KbqNotificationsGroups = {};

            items.map((item) => this.makeGroup(item, result));

            return Object.values(result).reverse();
        })
    );

    readonly changes = merge(this.silentMode, this.loadingMode, this.errorMode, this.originalItems, this.onRead);

    get items() {
        return this.originalItems.value;
    }

    set items(values: KbqNotificationItem[]) {
        this.originalItems.next(this.setReadState(this.setIds(values)));
    }

    get unreadItems(): Observable<number> {
        return this.originalItems.pipe(map((items) => items.filter((item) => item.read === false).length)).pipe(
            combineLatestWith(this.onRead),
            map(([value]) => value)
        );
    }

    get isEmpty() {
        return this.originalItems.value.length === 0;
    }

    constructor() {
        this.toastService?.read.pipe(takeUntilDestroyed()).subscribe((toastData) => {
            const item = this.originalItems.value.find((item) => item.id === toastData?.id);

            if (item && !item.read) {
                item.read = true;

                this.onRead.next(toastData as KbqNotificationItem);
            }
        });
    }

    setSilentMode(value: boolean) {
        this.silentMode.next(value);
    }

    setLoadingMode(value: boolean) {
        this.loadingMode.next(value);
    }

    setErrorMode(value: boolean) {
        this.errorMode.next(value);
    }

    push(item: KbqNotificationItem) {
        this.setReadState(this.setIds([item]));

        if (!this.silentMode.value) {
            this.toastService.show(item);
        }

        return this.originalItems.next([...this.originalItems.value, item]);
    }

    remove(removedItem: KbqNotificationItem) {
        this.originalItems.next(this.originalItems.value.filter((item) => removedItem !== item));
    }

    removeGroup(group: KbqNotificationsGroup) {
        this.originalItems.next(this.originalItems.value.filter((item) => !group.items.includes(item)));
    }

    removeAll() {
        this.originalItems.next([]);
    }

    private makeGroup = (item: KbqNotificationItem, groups: KbqNotificationsGroups) => {
        const parsedDate = this.adapter.parse(item.date, '');
        const groupId = this.adapter.format(parsedDate, 'MMdd');
        const groupTitle = this.formatter.absoluteLongDate(parsedDate);

        if (groups[groupId]) {
            groups[groupId].items.unshift(item);
        } else {
            groups[groupId] = {
                title: groupTitle,
                items: [item]
            };
        }
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
