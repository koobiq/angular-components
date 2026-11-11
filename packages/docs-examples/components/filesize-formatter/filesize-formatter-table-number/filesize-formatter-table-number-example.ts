import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE, KbqDataSizePipe, KbqDecimalPipe, KbqTableNumberPipe } from '@koobiq/components/core';
import { KbqTableModule } from '@koobiq/components/table';
import { injectExampleText } from './l10n';

/**
 * @title Filesize formatter Table Number
 */
@Component({
    selector: 'filesize-formatter-table-number-example',
    imports: [
        KbqDataSizePipe,
        KbqTableModule
    ],
    template: `
        <table kbq-table>
            <thead>
                <tr>
                    <th>{{ text().file }}</th>
                    <th>{{ text().size }}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ text().fileN(1) }}</td>
                    <td class="kbq-tabular-normal">
                        <div>{{ 1024 * 2048 | kbqDataSize }}</div>
                    </td>
                </tr>
                <tr>
                    <td>{{ text().fileN(2) }}</td>
                    <td class="kbq-tabular-normal">{{ 1024 * 1536 | kbqDataSize }}</td>
                </tr>
                <tr>
                    <td>{{ text().fileN(3) }}</td>
                    <td class="kbq-tabular-normal">{{ 1024 * 1024 | kbqDataSize }}</td>
                </tr>
            </tbody>
        </table>
    `,
    providers: [
        { provide: KbqDecimalPipe, useClass: KbqTableNumberPipe }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilesizeFormatterTableNumberExample {
    protected readonly text = injectExampleText();

    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    protected readonly cdr = inject(ChangeDetectorRef);

    constructor() {
        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(() => this.cdr.markForCheck());
    }
}
