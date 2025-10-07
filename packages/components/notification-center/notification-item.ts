import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    Inject,
    Input,
    TemplateRef,
    ViewEncapsulation
} from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { ThemePalette } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqToastData } from './../toast/toast.type';
import { KbqNotificationCenterService } from './notification-center.service';

let id = 0;

@Component({
    standalone: true,
    imports: [
        NgTemplateOutlet,
        KbqIconModule,
        NgClass,
        KbqTitleModule,
        KbqButtonModule
    ],
    selector: 'kbq-notification-item',
    templateUrl: './notification-item.html',
    styleUrls: ['./notification-item.scss'],
    host: {
        class: 'kbq-notification-item',
        '[class]': 'style',
        '[class.kbq-notification-item_dismissible]': 'true'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqNotificationItem {
    themePalette = ThemePalette;
    id = id++;

    $implicit;

    get style() {
        return {
            [`kbq-notification-item_${this.data?.style}`]: true
        };
    }

    @Input() data: KbqToastData;

    constructor(
        @Inject(forwardRef(() => KbqNotificationCenterService)) readonly service: KbqNotificationCenterService,
        public elementRef: ElementRef<HTMLElement>
    ) {
        this.$implicit = this;

        // this.data.style = this.data?.style || KbqToastStyle.Contrast;
        // this.data.icon = this.data?.icon !== undefined ? this.data.icon : true;
        // this.data.iconClass = this.data?.iconClass || undefined;
        // this.data.closeButton = this.data?.closeButton !== undefined ? this.data.closeButton : true;
    }

    close(): void {
        this.service.delete(this.id);
    }

    isTemplateRef(value): boolean {
        return value instanceof TemplateRef;
    }
}
