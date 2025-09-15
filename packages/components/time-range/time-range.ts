import { booleanAttribute, computed, Directive, inject, input, TemplateRef } from '@angular/core';
import { KBQ_DEFAULT_TIME_RANGE_TYPES } from './constants';
import { KbqRangeValue } from './types';

@Directive({
    standalone: true,
    selector: 'kbq-time-range',
    exportAs: 'kbqTimeRange',
    host: {}
})
export class KbqTimeRange<T> {
    minDate = input();
    maxDate = input();
    defaultRangeValue = input<KbqRangeValue<T> | undefined>();
    availableTimeRangeTypes = input<any[]>();
    titleTemplate = input<TemplateRef<any>>();
    arrow = input(true, { transform: booleanAttribute });

    resolvedAvailableTimeRangeTypes = computed(() => this.availableTimeRangeTypes() || this.defaultTimeRangeTypes);
    normalizedDefaultRangeValue = computed(() => ({
        ...this.getDefaultRangeValue(),
        ...this.defaultRangeValue()
    }));

    providedDefaultTimeRangeTypes = inject(KBQ_DEFAULT_TIME_RANGE_TYPES);

    private defaultTimeRangeTypes: any[] | undefined;
    private getDefaultRangeValue() {
        return [];
    }
}
