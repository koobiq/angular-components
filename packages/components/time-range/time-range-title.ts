import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, TemplateRef } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTimeRangeService } from './time-range.service';
import { KbqTimeRange, KbqTimeRangeCustomizableTitleContext, KbqTimeRangeTitleContext } from './types';

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
                <span class="kbq-link__text">Mock Label</span>

                <i kbq-icon="kbq-calendar-o_16"></i>
            </a>
        }
    `
})
export class KbqTimeRangeTitle {
    readonly timeRange = input<KbqTimeRange>();
    readonly titleTemplate = input<TemplateRef<any>>();

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

    private readonly timeRangeService = inject(KbqTimeRangeService);
}
