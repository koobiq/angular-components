import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KBQ_LOCALE_SERVICE, KbqLocaleService, KbqMultipleFileUploadLocaleConfig } from '@koobiq/components/core';
import { KBQ_FILE_UPLOAD_CONFIGURATION, KbqMultipleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';
import { enUSLocaleData } from '../en-US';
import { esLALocaleData } from '../es-LA';
import { ptBRLocaleData } from '../pt-BR';
import { ruRULocaleData } from '../ru-RU';

const localeData = {
    'en-US': enUSLocaleData,
    'es-LA': esLALocaleData,
    'pt-BR': ptBRLocaleData,
    'ru-RU': ruRULocaleData
};

class FileUploadConfiguration implements KbqMultipleFileUploadLocaleConfig {
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
        const data: KbqMultipleFileUploadLocaleConfig = localeData[locale];

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: KBQ_FILE_UPLOAD_CONFIGURATION,
            useClass: FileUploadConfiguration,
            deps: [KBQ_LOCALE_SERVICE]
        }
    ]
})
export class FileUploadMultipleCustomTextOverviewExample {}
