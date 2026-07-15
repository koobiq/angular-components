import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { KBQ_LOCALE_SERVICE, KbqFormattersModule, KbqLocaleService } from '@koobiq/components/core';
import { KbqTableModule } from '@koobiq/components/table';
import { delay } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * @title Number-formatter rounding
 */
@Component({
    selector: 'number-formatter-rounding-example',
    imports: [KbqFormattersModule, KbqTableModule],
    template: `
        <table kbq-table disableHover>
            <thead>
                <tr>
                    <th>Full number</th>
                    <th>Formatted value</th>
                </tr>
            </thead>
            <tbody>
                @for (number of numbers; track number) {
                    <tr>
                        <td>{{ number | kbqTableNumber }}</td>
                        <td>{{ number | kbqRoundNumber }}</td>
                    </tr>
                }
            </tbody>
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberFormatterRoundingExample {
    protected localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE);
    protected changeDetectorRef = inject(ChangeDetectorRef);

    protected readonly numbers = [1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000];

    constructor() {
        this.localeService.changes
            .pipe(distinctUntilChanged(), delay(0))
            .subscribe(() => this.changeDetectorRef.markForCheck());
    }
}
