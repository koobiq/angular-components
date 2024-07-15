import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    Input,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { KbqOption } from '@koobiq/components/core';
import { KbqTimezoneZone } from './timezone.models';
import { offsetFormatter } from './timezone.utils';

@Component({
    selector: 'kbq-timezone-option',
    exportAs: 'kbqTimezoneOption',
    host: {
        class: 'kbq-timezone-option',
    },
    templateUrl: 'timezone-option.component.html',
    styleUrls: ['../core/option/option.scss', 'timezone-option.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: KbqOption,
            useExisting: forwardRef(() => KbqTimezoneOption),
        },
    ],
})
export class KbqTimezoneOption extends KbqOption {
    @ViewChild('tooltipContentWrapper', { static: false }) tooltipContentWrapper: ElementRef<HTMLElement>;
    @ViewChild('tooltipContent', { static: false }) tooltipContent: ElementRef<HTMLElement>;

    @Input() highlightText: string;

    @Input()
    get timezone(): KbqTimezoneZone {
        return this._timezone;
    }

    set timezone(zone: KbqTimezoneZone) {
        this._timezone = zone;
        this.value = zone.id;
    }

    private _timezone: KbqTimezoneZone;

    get viewValue(): string {
        const cities: string = [this.timezone.city, this.timezone.cities].filter(Boolean).join(', ');

        return [offsetFormatter(this.timezone.offset), cities].join(' ');
    }
}
