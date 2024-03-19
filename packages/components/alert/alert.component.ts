import {
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    Directive,
    ViewEncapsulation
} from '@angular/core';
import { KbqIconItem } from '@koobiq/components/icon';


@Directive({
    selector: '[kbq-alert-title]',
    host: {
        class: 'kbq-alert__title'
    }
})
export class KbqAlertTitle {}

@Directive({
    selector: '[kbq-alert-close-button]',
    host: {
        class: 'kbq-alert-close-button'
    }
})
export class KbqAlertCloseButton {}

@Directive({
    selector: '[kbq-alert-control]',
    host: {
        class: 'kbq-alert-control'
    }
})
export class KbqAlertControl {}

@Component({
    selector: 'kbq-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['alert.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-alert',
        '[class.kbq-alert_dismissible]': 'closeButton'
    }
})
export class KbqAlert {
    @ContentChild(KbqIconItem) iconItem: KbqIconItem;
    @ContentChild(KbqAlertTitle) title: KbqAlertTitle;
    @ContentChild(KbqAlertControl) control: KbqAlertControl;
    @ContentChild(KbqAlertCloseButton) closeButton: KbqAlertCloseButton;
}
