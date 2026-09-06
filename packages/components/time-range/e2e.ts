import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KbqFormattersModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { DateTime } from 'luxon';
import { KbqTimeRangeModule } from './time-range.module';
import { KbqTimeRangeRange } from './types';

/**
 * Trigger states plus the editor behind them. Every value is pinned: the preset titles are relative
 * to nothing, and `defaultRangeValue` fixes the dates the editor's from/to fields show, so the
 * screenshots do not change from one day to the next.
 */
@Component({
    selector: 'e2e-time-range-states',
    imports: [
        KbqTimeRangeModule,
        KbqLuxonDateModule,
        KbqFormattersModule,
        KbqFormFieldModule,
        KbqIconModule,
        ReactiveFormsModule
    ],
    template: `
        <!-- default -->
        <kbq-time-range
            data-testid="e2eTimeRangeTrigger"
            [defaultRangeValue]="defaultRangeValue"
            [formControl]="control"
        />

        <!-- disabled -->
        <kbq-time-range [defaultRangeValue]="defaultRangeValue" [formControl]="disabledControl" />

        <!-- inside a form field -->
        <ng-template #titleAsFormField let-context>
            <kbq-form-field>
                <kbq-time-range-title-as-control>
                    @if (!context.type) {
                        <span kbqTimeRangeTitlePlaceholder>Period</span>
                    } @else {
                        {{ context.formattedDate }}
                    }
                </kbq-time-range-title-as-control>
                <i kbq-icon="kbq-chevron-down-s_16" kbqSuffix [color]="'contrast-fade'"></i>
            </kbq-form-field>
        </ng-template>

        <kbq-time-range
            [titleTemplate]="titleAsFormField"
            [arrow]="false"
            [nonNullable]="false"
            [defaultRangeValue]="defaultRangeValue"
        />
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-xxs);
            width: 280px;
        }
    `,
    providers: [
        { provide: DateFormatter, deps: [DateAdapter] }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTimeRangeStates'
    }
})
export class E2eTimeRangeStates {
    private readonly adapter = inject(DateAdapter<DateTime>);

    protected readonly defaultRangeValue = {
        fromDate: this.adapter.createDateTime(2024, 8, 1, 10, 0, 0, 0),
        fromTime: this.adapter.createDateTime(2024, 8, 1, 10, 0, 0, 0),
        toDate: this.adapter.createDateTime(2024, 8, 20, 18, 30, 0, 0),
        toTime: this.adapter.createDateTime(2024, 8, 20, 18, 30, 0, 0)
    };

    protected readonly control = new FormControl<KbqTimeRangeRange>({ type: 'lastHour' }, { nonNullable: true });
    protected readonly disabledControl = new FormControl<KbqTimeRangeRange>(
        { value: { type: 'last24Hours' }, disabled: true },
        { nonNullable: true }
    );
}
