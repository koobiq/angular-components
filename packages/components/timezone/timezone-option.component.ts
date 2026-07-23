import { KeyValuePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    Input,
    input,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqHighlightBackgroundPipe, KbqOption } from '@koobiq/components/core';
import { CitiesByFilterPipe } from './cities-by-filter.pipe';
import { KbqTimezoneZone } from './timezone.models';
import { offsetFormatter } from './timezone.utils';
import { UtcOffsetPipe } from './utc-offset.pipe';

@Component({
    selector: 'kbq-timezone-option',
    imports: [
        UtcOffsetPipe,
        KeyValuePipe,
        KbqHighlightBackgroundPipe,
        CitiesByFilterPipe
    ],
    templateUrl: 'timezone-option.component.html',
    styleUrls: ['../core/option/option.scss', 'timezone-option.component.scss', 'timezone-option-tokens.scss'],
    providers: [
        {
            provide: KbqOption,
            useExisting: forwardRef(() => KbqTimezoneOption)
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-timezone-option'
    },
    exportAs: 'kbqTimezoneOption'
})
export class KbqTimezoneOption extends KbqOption {
    readonly tooltipContentWrapper = viewChild.required<ElementRef<HTMLElement>>('tooltipContentWrapper');
    readonly tooltipContent = viewChild.required<ElementRef<HTMLElement>>('tooltipContent');

    readonly highlightText = input<string>(undefined!);

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
