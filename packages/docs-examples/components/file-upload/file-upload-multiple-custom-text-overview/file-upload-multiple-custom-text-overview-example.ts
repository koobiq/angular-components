import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KBQ_LOCALE_DATA, KbqLocaleDataInput, KbqMultipleFileUploadLocaleConfiguration } from '@koobiq/components/core';
import { KbqMultipleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';
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

// Registering the strings as locale data rather than as an override is what makes them follow
// `setLocale()`: an override stays pinned across a locale change, locale data switches with it.
const fileUploadLocaleData: KbqLocaleDataInput = Object.fromEntries(
    Object.entries(localeData).map(([localeId, multiple]) => [localeId, { fileUpload: { multiple } }])
);

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
        <kbq-multiple-file-upload>
            <ng-template #kbqFileIcon>
                <i kbq-icon="kbq-file-o_16"></i>
            </ng-template>
        </kbq-multiple-file-upload>
    `,
    providers: [{ provide: KBQ_LOCALE_DATA, useValue: fileUploadLocaleData }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleCustomTextOverviewExample {}
