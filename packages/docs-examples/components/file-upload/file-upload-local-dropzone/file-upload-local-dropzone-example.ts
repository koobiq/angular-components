import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';
import { KbqLocalDropzone, KbqSingleFileUploadComponent } from '@koobiq/components/file-upload';

/**
 * @title File-upload local dropzone
 */
@Component({
    selector: 'file-upload-local-dropzone-example',
    imports: [
        KbqLocalDropzone,
        KbqButtonModule,
        KbqContentPanelModule,
        KbqSingleFileUploadComponent
    ],
    template: `
        <kbq-content-panel-container maxWidth="400" minWidth="400" x [opened]="true" [disableClose]="true">
            Manchester United, one of the most iconic football clubs in the world, is renowned for its rich history,
            legendary players, and unparalleled success.

            <kbq-content-panel>
                <kbq-content-panel-body kbqLocalDropzone [kbqConnectedTo]="fileUploadLocal">
                    <div class="layout-margin-bottom-m layout-margin-top-xxl">Drag your files on sidepanel</div>

                    <kbq-file-upload #fileUploadLocal />
                </kbq-content-panel-body>
            </kbq-content-panel>
        </kbq-content-panel-container>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            height: 500px;
        }

        .example-content-panel-container__content {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
            align-items: center;
            justify-content: center;
            height: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadLocalDropzoneExample {
    protected readonly value = signal(false);
}
