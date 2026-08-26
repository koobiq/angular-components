import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import { DateAdapter, KbqReadStateDirective, PopUpPlacements, ThemePalette } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqToastStyle } from '@koobiq/components/toast';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { filter } from 'rxjs/operators';
import { KbqNotificationCenterComponent } from './notification-center';
import { KbqNotificationCenterService, KbqNotificationItem } from './notification-center.service';

let id = 0;

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
    private readonly adapter = inject(DateAdapter);
    protected readonly service = inject(KbqNotificationCenterService);
    protected readonly readStateDirective = inject<KbqReadStateDirective>(KbqReadStateDirective, { host: true });
    protected readonly center = inject(KbqNotificationCenterComponent, { host: true });

    protected popUpPlacements = PopUpPlacements;

    themePalette = ThemePalette;
    id = id++;

    time: string;

    $implicit;

    // `KbqToastService` used to write these defaults into the item handed to `push()`; it now leaves the
    // caller's object untouched, so the row resolves them itself instead of rendering an unstyled,
    // icon-less notification.
    protected get style(): string | KbqToastStyle {
        return this.data.style || KbqToastStyle.Contrast;
    }

    protected get icon(): boolean | TemplateRef<unknown> {
        return this.data.icon ?? true;
    }

    protected get styleClass(): string {
        return `kbq-notification-item_${this.style}`;
    }

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get data(): KbqNotificationItem {
        return this._data;
    }

    set data(value: KbqNotificationItem) {
        this._data = value;

        this.time = this.adapter.format(this.adapter.parse(value.date, ''), 'HH:mm');
    }

    private _data: KbqNotificationItem;

    constructor() {
        this.$implicit = this;

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

    isTemplateRef(value): boolean {
        return value instanceof TemplateRef;
    }
}
