import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE, KbqMultipleFileUploadLocaleConfiguration } from '@koobiq/components/core';
import { KbqMultipleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';
import { of, skip } from 'rxjs';
import { enUSFileUploadLocaleData } from '../en-US';
import { esLAFileUploadLocaleData } from '../es-LA';
import { ptBRFileUploadLocaleData } from '../pt-BR';
import { ruRUFileUploadLocaleData } from '../ru-RU';
import { tkTMFileUploadLocaleData } from '../tk-TM';

const localeData: Record<string, KbqMultipleFileUploadLocaleConfiguration> = {
    'en-US': enUSFileUploadLocaleData,
    'es-LA': esLAFileUploadLocaleData,
    'pt-BR': ptBRFileUploadLocaleData,
    'ru-RU': ruRUFileUploadLocaleData,
    'tk-TM': tkTMFileUploadLocaleData
};

/**
 * @title File-upload multiple custom text
 */
@Component({
    selector: 'file-upload-multiple-custom-text-overview-example',
    imports: [
        KbqIconModule,
        KbqMultipleFileUploadComponent
    ],
    template: `
        <kbq-multiple-file-upload [localeOverrides]="localeOverrides()">
            <ng-template #kbqFileIcon>
                <i kbq-icon="kbq-file-o_16"></i>
            </ng-template>
        </kbq-multiple-file-upload>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleCustomTextOverviewExample {
    private readonly exampleDefaultLocale = 'en-US';
    protected readonly localeId = toSignal(
        inject(KBQ_LOCALE_SERVICE, { optional: true })?.changes.pipe(skip(1)) ?? of(this.exampleDefaultLocale),
        { initialValue: this.exampleDefaultLocale }
    );
    // Recomputed from the active locale rather than provided once, so the labels follow `setLocale()`.
    // `KBQ_LOCALE_DATA` would be the other way to say this, but it is read only by `KbqLocaleService`, from
    // the injector that created it — a component-level provider for it never reaches the root service.
    protected readonly localeOverrides = computed(() => ({
        fileUpload: { multiple: localeData[this.localeId()] ?? localeData[this.exampleDefaultLocale] }
    }));
}
