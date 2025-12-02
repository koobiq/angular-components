import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTimeRangeModule } from '@koobiq/components/time-range';

/**
 * @title Time range as form field
 */
@Component({
    selector: 'time-range-as-form-field-example',
    imports: [
        ReactiveFormsModule,
        KbqTimeRangeModule,
        LuxonDateModule,
        KbqIconModule,
        KbqFormFieldModule,
        TitleCasePipe
    ],
    template: `
        <ng-template #titleAsFormField let-context>
            <kbq-form-field>
                <kbq-time-range-title-as-control>
                    @if (!context.type) {
                        <span kbqTimeRangeTitlePlaceholder>{{ context.formattedDate }}</span>
                    } @else {
                        {{ context.formattedDate[0] | titlecase }}{{ context.formattedDate.slice(1) }}
                    }
                </kbq-time-range-title-as-control>
                <i kbq-icon="kbq-chevron-down-s_16" kbqSuffix [color]="'contrast-fade'"></i>
            </kbq-form-field>
        </ng-template>

        <kbq-time-range [titleTemplate]="titleAsFormField" [arrow]="false" [nonNullable]="false" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] }],
    host: {
        class: 'layout-flex layout-row layout-align-center-center layout-gap-3xl'
    }
})
export class TimeRangeAsFormFieldExample {}
