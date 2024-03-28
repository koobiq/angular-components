import { Component } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { KbqFileItem } from '@koobiq/components/file-upload';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';


/**
 * @title Button's colors
 */
@Component({
    selector: 'file-upload-indeterminate-loading-overview-example',
    templateUrl: 'file-upload-indeterminate-loading-overview-example.html',
    styleUrls: ['file-upload-indeterminate-loading-overview-example.css']
})
export class FileUploadIndeterminateLoadingOverviewExample {
    isLoading: boolean;
    themePalette = ThemePalette;

    onFileChange(file: KbqFileItem | null) {
        if (!file) { return; }

        const fakeBackendResponse = timer(1500);

        file.loading?.next(true);
        this.isLoading = true;
        fakeBackendResponse.pipe(take(1)).subscribe(() => {
            file.loading?.next(false);
            this.isLoading = false;
        });
    }

    onFilesChange(files: KbqFileItem[] | null) {
        if (!files?.length) { return; }

        const fakeBackendResponse = timer(1500);

        this.isLoading = true;
        files.forEach((file) => file.loading?.next(true));

        fakeBackendResponse.pipe(take(1)).subscribe(() => {
            files.forEach((file) => file.loading?.next(false));
            this.isLoading = false;
        });
    }
}
