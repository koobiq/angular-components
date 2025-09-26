import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, TemplateRef } from '@angular/core';
import { KbqTimeRangeLocaleConfig } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTimeRangeService } from './time-range.service';
import { KbqTimeRangeCustomizableTitleContext, KbqTimeRangeRange, KbqTimeRangeTitleContext } from './types';

/** @docs-private */
@Component({
    standalone: true,
    selector: 'kbq-time-range-title',
    imports: [
        KbqLinkModule,
        KbqIconModule,
        NgTemplateOutlet
    ],
    template: `
        @if (titleTemplate()) {
            <ng-container *ngTemplateOutlet="titleTemplate()!; context: titleContext() ?? null" />
        } @else {
            <a kbq-link pseudo>
                <span class="kbq-link__text">{{ formattedDate() }}</span>

                <i kbq-icon="kbq-calendar-o_16"></i>
            </a>
        }
    `
})
export class KbqTimeRangeTitle {
    private readonly timeRangeService = inject(KbqTimeRangeService);

    readonly timeRange = input<KbqTimeRangeRange>();
    readonly titleTemplate = input<TemplateRef<any>>();
    readonly localeConfiguration = input.required<KbqTimeRangeLocaleConfig>();

    protected readonly context = computed<KbqTimeRangeTitleContext | undefined>(() => {
        const timeRange = this.timeRange();

        if (!timeRange) return undefined;

        return {
            ...timeRange,
            ...this.timeRangeService.getTimeRangeTypeUnits(timeRange.type)
        };
    });

    protected readonly titleContext = computed<KbqTimeRangeCustomizableTitleContext | undefined>(() => {
        const context = this.context();
        const formattedDate = this.formattedDate();

        if (!context) return undefined;

        return {
            $implicit: { ...context, formattedDate },
            formattedDate,
            ...context
        };
    });

    protected readonly formattedDate = computed(() => {
        const context = this.context();

        if (!context) {
            return '';
        }

        const timeRangeUnit = this.timeRangeService.getTimeRangeUnitByType(context.type);
        const localeConfiguration = this.localeConfiguration();

        if (timeRangeUnit === 'other') {
            switch (context.type) {
                case 'range': {
                    return (
                        localeConfiguration.title.for +
                        ' ' +
                        this.timeRangeService.dateFormatter.rangeLongDate(
                            this.timeRangeService.dateAdapter.deserialize(context.startDateTime ?? ''),
                            this.timeRangeService.dateAdapter.deserialize(context.endDateTime ?? '')
                        )
                    );
                }
                case 'allTime': {
                    return localeConfiguration.editor.allTime;
                }
                case 'currentQuarter': {
                    return localeConfiguration.editor.currentQuarter;
                }
                case 'currentYear': {
                    return localeConfiguration.editor.currentYear;
                }
                default: {
                    return '';
                }
            }
        }

        if (!context.startDateTime) return '';

        return (
            localeConfiguration.title.for +
            ' ' +
            this.timeRangeService.dateFormatter.duration(
                this.timeRangeService.dateAdapter.deserialize(context.startDateTime),
                this.timeRangeService.dateAdapter.today(),
                [timeRangeUnit],
                false,
                localeConfiguration.durationTemplate.title
            )
        );
    });
}
