import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE, KbqDataSizePipe, KbqDecimalPipe, KbqTableNumberPipe } from '@koobiq/components/core';
import { KbqTableModule } from '@koobiq/components/table';

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
                    <th>File</th>
                    <th>Size</th>
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: KbqDecimalPipe, useClass: KbqTableNumberPipe }]
})
export class FilesizeFormatterTableNumberExample {
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    protected readonly cdr = inject(ChangeDetectorRef);

    constructor() {
        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(() => this.cdr.markForCheck());
    }
}
