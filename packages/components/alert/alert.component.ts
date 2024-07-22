import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    Directive,
    Input,
    ViewEncapsulation
} from '@angular/core';
import { KbqIcon, KbqIconItem } from '@koobiq/components/icon';

export enum KbqAlertStyles {
    Default = 'default',
    Colored = 'colored'
}

export enum KbqAlertColors {
    Contrast = 'contrast',
    Error = 'error',
    Warning = 'warning',
    Success = 'success',
    Theme = 'theme'
}

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
        '[class]': 'alertColor',
        '[class.kbq-alert_normal]': '!compact',
        '[class.kbq-alert_compact]': 'compact',
        '[class.kbq-alert_default]': '!isColored',
        '[class.kbq-alert_colored]': 'isColored',
        '[class.kbq-alert_dismissible]': 'closeButton'
    }
})
export class KbqAlert implements AfterContentInit {
    @ContentChild(KbqIconItem) iconItem: KbqIconItem;
    @ContentChild(KbqIcon) icon: KbqIcon;
    @ContentChild(KbqAlertTitle) title: KbqAlertTitle;
    @ContentChild(KbqAlertControl) control: KbqAlertControl;
    @ContentChild(KbqAlertCloseButton) closeButton: KbqAlertCloseButton;

    @Input() compact: boolean = false;
    @Input() alertStyle: KbqAlertStyles | string = KbqAlertStyles.Default;

    @Input()
    get alertColor(): string {
        return `kbq-alert_${this._alertColor}`;
    }

    set alertColor(value: string | KbqAlertColors) {
        this._alertColor = value || KbqAlertColors.Contrast;
    }

    private _alertColor: string | KbqAlertColors = KbqAlertColors.Contrast;

    get isColored(): boolean {
        return this.alertStyle === KbqAlertStyles.Colored;
    }

    ngAfterContentInit(): void {
        const icon = this.icon || this.iconItem;

        if (icon) {
            icon.color = this._alertColor;
        }
    }
}
