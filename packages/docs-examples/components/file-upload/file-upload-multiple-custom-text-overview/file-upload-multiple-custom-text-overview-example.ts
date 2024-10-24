import { Component } from '@angular/core';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import {
    KBQ_FILE_UPLOAD_CONFIGURATION,
    KbqFileUploadModule,
    KbqInputFileMultipleLabel
} from '@koobiq/components/file-upload';
import { enUSLocaleData } from '../en-US';
import { esLALocaleData } from '../es-LA';
import { faIRLocaleData } from '../fa-IR';
import { ptBRLocaleData } from '../pt-BR';
import { ruRULocaleData } from '../ru-RU';
import { zhCNLocaleData } from '../zh-CN';

const localeData = {
    'en-US': enUSLocaleData,
    'zh-CN': zhCNLocaleData,
    'es-LA': esLALocaleData,
    'pt-BR': ptBRLocaleData,
    'ru-RU': ruRULocaleData,
    'fa-IR': faIRLocaleData
};

class FileUploadConfiguration implements KbqInputFileMultipleLabel {
    [k: string | number | symbol]: unknown;
    captionTextWhenSelected: string;
    captionTextForCompactSize: string;
    gridHeaders: { file: string; size: string };
    captionText: string;
    browseLink: string;
    title?: string | undefined;

    constructor(localeService: KbqLocaleService) {
        localeService.changes.subscribe(this.update);
    }

    update = (locale: string) => {
        this.captionTextWhenSelected = localeData[locale].captionTextWhenSelected;
        this.captionTextForCompactSize = localeData[locale].captionTextForCompactSize;
        this.gridHeaders = localeData[locale].gridHeaders;
        this.captionText = localeData[locale].captionText;
        this.browseLink = localeData[locale].browseLink;
        this.title = localeData[locale].title;
    };
}

/**
 * @title file upload multiple custom text
 */
@Component({
    standalone: true,
    selector: 'file-upload-multiple-custom-text-overview-example',
    template: `
        <kbq-multiple-file-upload>
            <ng-template #kbqFileIcon>
                <i kbq-icon="kbq-file-o_16"></i>
            </ng-template>
        </kbq-multiple-file-upload>
    `,
    imports: [
        KbqFileUploadModule
    ],
    providers: [
        {
            provide: KBQ_FILE_UPLOAD_CONFIGURATION,
            useClass: FileUploadConfiguration,
            deps: [KBQ_LOCALE_SERVICE]
        }
    ]
})
export class FileUploadMultipleCustomTextOverviewExample {}
