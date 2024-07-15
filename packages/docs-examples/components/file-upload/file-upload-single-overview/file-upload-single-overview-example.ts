import { Component } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';

/**
 * @title Button's colors
 */
@Component({
    selector: 'file-upload-single-overview-example',
    templateUrl: 'file-upload-single-overview-example.html',
    styleUrls: ['file-upload-single-overview-example.css'],
})
export class FileUploadSingleOverviewExample {
    themePalette = ThemePalette;
}
