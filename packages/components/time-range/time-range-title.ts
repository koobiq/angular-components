import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Injector, input, TemplateRef } from '@angular/core';
import { KbqTimeRangeLocaleConfig } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqPopoverTrigger } from '@koobiq/components/popover';
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
            <ng-container *ngTemplateOutlet="titleTemplate()!; context: titleContext() ?? null; injector: injector" />
        } @else {
            <a kbq-link pseudo>
                <span class="kbq-link__text">{{ formattedDate() }}</span>

                <i kbq-icon="kbq-calendar-o_16"></i>
            </a>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTimeRangeTitle {
    private readonly timeRangeService = inject(KbqTimeRangeService);
    private readonly popover = inject(KbqPopoverTrigger, { host: true });
    protected readonly injector = inject(Injector);

    readonly timeRange = input.required<KbqTimeRangeRange | null>();
    readonly localeConfiguration = input.required<KbqTimeRangeLocaleConfig>();
    readonly titleTemplate = input<TemplateRef<any>>();

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

        let customizableTitleContext = { formattedDate, popover: this.popover };

        if (context) {
            customizableTitleContext = { ...context, ...customizableTitleContext };
        }

        return {
            $implicit: customizableTitleContext,
            ...customizableTitleContext
        };
    });

    protected readonly formattedDate = computed(() => {
        const context = this.context();
        const localeConfiguration = this.localeConfiguration();

        if (!context) {
            return localeConfiguration.title.placeholder;
        }

        const timeRangeUnit = this.timeRangeService.getTimeRangeUnitByType(context.type);

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
