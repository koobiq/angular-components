import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, signal, TemplateRef } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { KbqTimeRangeLocaleConfig } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { merge } from 'rxjs';
import { KbqTimeRangeService } from './time-range.service';
import { KbqTimeRange, KbqTimeRangeCustomizableTitleContext, KbqTimeRangeTitleContext } from './types';

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
                <span class="kbq-link__text">{{ localeConfiguration().title.for }} {{ formattedDate() }}</span>

                <i kbq-icon="kbq-calendar-o_16"></i>
            </a>
        }
    `
})
export class KbqTimeRangeTitle {
    readonly timeRange = input<KbqTimeRange>();
    readonly titleTemplate = input<TemplateRef<any>>();
    readonly localeConfiguration = input.required<KbqTimeRangeLocaleConfig>();

    protected readonly timeRangeService = inject(KbqTimeRangeService);

    protected readonly formattedDate = signal<string | undefined>(undefined);

    constructor() {
        merge(toObservable(this.context), toObservable(this.localeConfiguration))
            .pipe(takeUntilDestroyed())
            .subscribe(this.updateFormattedDate);
    }

    protected context = computed<KbqTimeRangeTitleContext | undefined>(() => {
        const timeRange = this.timeRange();

        if (!timeRange) return undefined;

        return {
            ...timeRange,
            ...this.timeRangeService.getTimeRangeTypeUnits(timeRange.type)
        };
    });

    protected titleContext = computed<KbqTimeRangeCustomizableTitleContext | undefined>(() => {
        const context = this.context();

        if (!context) return undefined;

        return {
            $implicit: context,
            ...context
        };
    });

    private updateFormattedDate = () => {
        const context = this.context();

        if (!context || !context.startDateTime) {
            this.formattedDate.set('');

            return;
        }

        this.formattedDate.set(
            this.timeRangeService.dateFormatter.durationLong(
                this.timeRangeService.fromISO(context.startDateTime),
                this.timeRangeService.dateAdapter.today(),
                // @TODO
                ['hours']
            )
        );
    };
}
