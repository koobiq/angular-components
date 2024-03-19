import { Component } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import {
    KBQ_FILE_UPLOAD_CONFIGURATION,
    KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION
} from '@koobiq/components/file-upload';


/**
 * @title Progress button
 */
@Component({
    selector: 'file-upload-multiple-compact-overview-example',
    templateUrl: 'file-upload-multiple-compact-overview-example.html',
    styleUrls: ['file-upload-multiple-compact-overview-example.css'],
    providers: [
        {
            provide: KBQ_FILE_UPLOAD_CONFIGURATION,
            useValue: {
                ...KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION,
                captionText: KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION.captionTextForCompactSize
            }
        }
    ]
})
export class FileUploadMultipleCompactOverviewExample {
    themePalette = ThemePalette;
}
