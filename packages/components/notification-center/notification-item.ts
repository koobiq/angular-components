import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import { DateAdapter, KbqReadStateDirective, PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqToastStyle } from '@koobiq/components/toast';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { filter } from 'rxjs/operators';
import { KbqNotificationCenterService, KbqNotificationItem } from './notification-center.service';
import { KBQ_NOTIFICATION_CENTER_PANEL } from './notification-center.tokens';

/** @docs-private */
@Component({
    selector: 'kbq-notification-item',
    imports: [
        NgTemplateOutlet,
        KbqIconModule,
        KbqTitleModule,
        KbqButtonModule,
        KbqTooltipTrigger
    ],
    templateUrl: './notification-item.html',
    styleUrls: ['./notification-item.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-notification-item',
        '[class]': 'styleClass',
        'data-testid': 'kbq-notification-item'
    },
    hostDirectives: [KbqReadStateDirective]
})
export class KbqNotificationItemComponent {
    private readonly adapter: DateAdapter<unknown> = inject(DateAdapter);
    protected readonly service = inject(KbqNotificationCenterService);
    protected readonly readStateDirective = inject<KbqReadStateDirective>(KbqReadStateDirective, { host: true });
    protected readonly panel = inject(KBQ_NOTIFICATION_CENTER_PANEL);

    protected popUpPlacements = PopUpPlacements;

    /** Time of day the notification happened; empty when its `date` could not be parsed. */
    protected time: string;

    /** Style modifier class of the host, recomputed with `data` instead of allocated on every check. */
    protected styleClass: string = '';

    /** Context handed to the consumer's templates. Exposes the item only, never this component. */
    protected context: { $implicit: KbqNotificationItem };

    // `KbqToastService` used to write these defaults into the item handed to `push()`; it now leaves the
    // caller's object untouched, so the row resolves them itself instead of rendering an unstyled,
    // icon-less notification.
    protected get style(): string | KbqToastStyle {
        return this.data.style || KbqToastStyle.Contrast;
    }

    protected get icon(): boolean | TemplateRef<unknown> {
        return this.data.icon ?? true;
    }

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get data(): KbqNotificationItem {
        return this._data;
    }

    set data(value: KbqNotificationItem) {
        this._data = value;
        this.context = { $implicit: value };
        // Through `style`, so an item pushed without one still gets the contrast modifier rather than
        // no class at all.
        this.styleClass = `kbq-notification-item_${this.style}`;

        // `DateAdapter.parse` returns null for anything it does not recognise, and every adapter throws
        // when that null reaches `format` — which would take the whole panel down with it.
        const parsed = this.adapter.parse(value.date, '');

        this.time = parsed !== null && this.adapter.isValid(parsed) ? this.adapter.format(parsed, 'HH:mm') : '';
    }

    private _data: KbqNotificationItem;

    constructor() {
        this.readStateDirective.read
            .pipe(
                filter((value: boolean) => value),
                takeUntilDestroyed()
            )
            .subscribe(() => {
                if (this.data.read) {
                    return;
                }

                this.data.read = true;

                this.service.onRead.next(this.data);
            });
    }

    /** Removes this notification, keeping keyboard focus inside the panel once the button unmounts. */
    protected remove(): void {
        this.panel.restoreFocusAfterRemove();

        this.service.remove(this.data);
    }

    protected isTemplateRef(value: unknown): boolean {
        return value instanceof TemplateRef;
    }
}
