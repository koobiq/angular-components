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
    selector: 'kbq-notification-item',
    imports: [
        NgTemplateOutlet,
        KbqIconModule,
        NgClass,
        KbqTitleModule,
        KbqButtonModule,
        KbqTooltipTrigger
    ],
    templateUrl: './notification-item.html',
    styleUrls: ['./notification-item.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-notification-item',
        '[class]': 'style'
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
