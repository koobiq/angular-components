import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    KBQ_DEFAULT_LOCALE_ID,
    KBQ_LOCALE_SERVICE,
    KbqLocaleService,
    KbqMultipleFileUploadLocaleConfiguration
} from '@koobiq/components/core';
import { KBQ_FILE_UPLOAD_CONFIGURATION, KbqMultipleFileUploadComponent } from '@koobiq/components/file-upload';
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

class FileUploadConfiguration implements KbqMultipleFileUploadLocaleConfiguration {
    [k: string | number | symbol]: unknown;
    captionText: string;
    captionTextOnlyFolder: string;
    captionTextWithFolder: string;
    captionTextWhenSelected: string;
    captionTextForCompactSize: string;
    browseLink: string;
    browseLinkFolder: string;
    title: string;

    constructor(localeService: KbqLocaleService) {
        localeService.changes.subscribe(this.update);
    }

    update = (locale: string) => {
        // A consumer can register a locale this example knows nothing about.
        const data = localeData[locale] ?? localeData[KBQ_DEFAULT_LOCALE_ID];

        this.captionText = data.captionText;
        this.captionTextOnlyFolder = data.captionTextOnlyFolder;
        this.captionTextWithFolder = data.captionTextWithFolder;
        this.captionTextWhenSelected = data.captionTextWhenSelected;
        this.captionTextForCompactSize = data.captionTextForCompactSize;
        this.browseLink = data.browseLink;
        this.browseLinkFolder = data.browseLinkFolder;
        this.title = data.title;
    };
}

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
    providers: [
        {
            provide: KBQ_FILE_UPLOAD_CONFIGURATION,
            useClass: FileUploadConfiguration,
            deps: [KBQ_LOCALE_SERVICE]
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleCustomTextOverviewExample {}
