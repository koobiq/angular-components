import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KBQ_LOCALE_SERVICE,
    KbqFormattersModule,
    KbqLocaleService,
    KbqNormalizeWhitespace
} from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTableModule } from '@koobiq/components/table';
import { delay } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * @title Number-formatter
 */
@Component({
    selector: 'number-formatter-overview-example',
    imports: [
        FormsModule,
        KbqFormattersModule,
        KbqInputModule,
        KbqNormalizeWhitespace,
        KbqTableModule
    ],
    template: `
        <kbq-form-field style="margin-bottom: 16px; max-width: 200px">
            <input kbqNormalizeWhitespace kbqNumberInput placeholder="Number" [(ngModel)]="value" />
        </kbq-form-field>

        <table kbq-table disableHover>
            <thead>
                <tr>
                    <th>digitsInfo</th>
                    <th>kbqNumber</th>
                    <th>kbqTableNumber</th>
                </tr>
            </thead>
            <tbody>
                @for (digitsInfo of digitsInfoList; track digitsInfo) {
                    <tr>
                        <td>{{ digitsInfo || '—' }}</td>
                        <td>{{ value | kbqNumber: digitsInfo }}</td>
                        <td>{{ value | kbqTableNumber: digitsInfo }}</td>
                    </tr>
                }
            </tbody>
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberFormatterOverviewExample {
    protected localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE);
    protected changeDetectorRef = inject(ChangeDetectorRef);

    protected value = 1000.123;
    protected readonly digitsInfoList = ['', '5.5-5', '4.5-5', '4.0-2', '4.0-2-false', '4.0-0'];

    constructor() {
        this.localeService.changes
            .pipe(distinctUntilChanged(), delay(0))
            .subscribe(() => this.changeDetectorRef.markForCheck());
    }
}
