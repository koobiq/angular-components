import { KeyValuePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
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

    readonly highlightText = input<string | readonly string[]>(undefined!);

    /** Whether `highlightText` was matched with diacritic folding (e.g. via `createSearchPredicate`) — see `kbqHighlightBackground`. */
    readonly foldDiacritics = input(false);

    /** @docs-private */
    readonly timezoneInput = input<KbqTimezoneZone>(undefined!, { alias: 'timezone' });

    /** The time zone the option stands for. */
    get timezone(): KbqTimezoneZone {
        return this.timezoneInput();
    }

    /** The id of the time zone, unless no time zone is bound. */
    override get value(): string {
        return this.timezone?.id ?? super.value;
    }

    override get viewValue(): string {
        const cities: string = [this.timezone.city, this.timezone.cities].filter(Boolean).join(', ');

        return [offsetFormatter(this.timezone.offset), cities].join(' ');
    }
}
