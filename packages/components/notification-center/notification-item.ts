import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import { DateAdapter, KbqReadStateDirective, PopUpPlacements, ThemePalette } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { filter } from 'rxjs/operators';
import { KbqNotificationCenterComponent } from './notification-center';
import { KbqNotificationCenterService, KbqNotificationItem } from './notification-center.service';

let id = 0;

/** @docs-private */
@Component({
    standalone: true,
    imports: [
        NgTemplateOutlet,
        KbqIconModule,
        NgClass,
        KbqTitleModule,
        KbqButtonModule,
        KbqTooltipTrigger
    ],
    selector: 'kbq-notification-item',
    templateUrl: './notification-item.html',
    styleUrls: ['./notification-item.scss'],
    host: {
        class: 'kbq-notification-item',
        '[class]': 'style'
    },
    hostDirectives: [KbqReadStateDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqNotificationItemComponent<D> {
    private readonly adapter = inject(DateAdapter<D>);
    protected readonly service = inject(KbqNotificationCenterService<D>);
    protected readonly readStateDirective = inject<KbqReadStateDirective>(KbqReadStateDirective, { host: true });
    protected readonly center = inject(KbqNotificationCenterComponent, { host: true });

    protected popUpPlacements = PopUpPlacements;

    themePalette = ThemePalette;
    id = id++;

    time: string;

    $implicit;

    get style() {
        return {
            [`kbq-notification-item_${this.data.style}`]: !!this.data.style
        };
    }

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
                this.data.read = true;

                this.service.onRead.next(this.data);
            });
    }

    isTemplateRef(value): boolean {
        return value instanceof TemplateRef;
    }
}
