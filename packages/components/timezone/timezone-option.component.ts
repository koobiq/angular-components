import { KeyValuePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    Input,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqHighlightPipe, KbqOption } from '@koobiq/components/core';
import { CitiesByFilterPipe } from './cities-by-filter.pipe';
import { KbqTimezoneZone } from './timezone.models';
import { offsetFormatter } from './timezone.utils';
import { UtcOffsetPipe } from './utc-offset.pipe';

@Component({
    selector: 'kbq-timezone-option',
    imports: [
        UtcOffsetPipe,
        KeyValuePipe,
        KbqHighlightPipe,
        CitiesByFilterPipe
    ],
    templateUrl: 'timezone-option.component.html',
    styleUrls: ['../core/option/option.scss', 'timezone-option.component.scss', 'timezone-option-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqTimezoneOption',
    host: {
        class: 'kbq-timezone-option'
    },
    providers: [
        {
            provide: KbqOption,
            useExisting: forwardRef(() => KbqTimezoneOption)
        }
    ]
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
