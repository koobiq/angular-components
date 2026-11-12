import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE, KbqDataSizePipe, KbqDecimalPipe, KbqTableNumberPipe } from '@koobiq/components/core';
import { KbqTableModule } from '@koobiq/components/table';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

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
                    <th>{{ t().file }}</th>
                    <th>{{ t().size }}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>File 1</td>
                    <td class="kbq-tabular-normal">
                        <div>{{ 1024 * 2048 | kbqDataSize }}</div>
                    </td>
                </tr>
                <tr>
                    <td>File 2</td>
                    <td class="kbq-tabular-normal">{{ 1024 * 1536 | kbqDataSize }}</td>
                </tr>
                <tr>
                    <td>File 3</td>
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
export class FilesizeFormatterTableNumberExample extends BaseLocalizedExample<ExampleTranslation> {
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    protected readonly cdr = inject(ChangeDetectorRef);

    constructor() {
        super(TRANSLATIONS);
        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(() => this.cdr.markForCheck());
    }
}
