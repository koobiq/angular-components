import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, signal, TemplateRef } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { KbqTimeRangeLocaleConfig } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { merge, skip } from 'rxjs';
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
    readonly timeRange = input<KbqTimeRangeRange>();
    readonly titleTemplate = input<TemplateRef<any>>();
    readonly localeConfiguration = input.required<KbqTimeRangeLocaleConfig>();

    protected readonly formattedDate = signal<string | undefined>(undefined);

    private readonly timeRangeService = inject(KbqTimeRangeService);

    constructor() {
        merge(toObservable(this.context), toObservable(this.localeConfiguration).pipe(skip(1)))
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

        if (!context) {
            this.formattedDate.set('');

            return;
        }

        const timeRangeUnit = this.timeRangeService.getTimeRangeUnitByType(context.type);
        const localeConfig = this.localeConfiguration();

        if (timeRangeUnit === 'other') {
            switch (context.type) {
                case 'range': {
                    this.formattedDate.set(
                        localeConfig.title.for +
                            ' ' +
                            this.timeRangeService.dateFormatter.rangeLongDate(
                                this.timeRangeService.fromISO(context.startDateTime ?? ''),
                                this.timeRangeService.fromISO(context.endDateTime ?? '')
                            )
                    );
                    break;
                }
                case 'allTime': {
                    this.formattedDate.set(localeConfig.editor.allTime);
                    break;
                }
                case 'currentQuarter': {
                    this.formattedDate.set(localeConfig.editor.currentQuarter);
                    break;
                }
                case 'currentYear': {
                    this.formattedDate.set(localeConfig.editor.currentYear);
                    break;
                }
            }

            return;
        }

        if (!context.startDateTime) {
            this.formattedDate.set('');

            return;
        }

        this.formattedDate.set(
            localeConfig.title.for +
                ' ' +
                this.timeRangeService.dateFormatter.duration(
                    this.timeRangeService.fromISO(context.startDateTime),
                    this.timeRangeService.dateAdapter.today(),
                    [timeRangeUnit],
                    false,
                    localeConfig.durationTemplate
                )
        );
    };
}
