import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';
import {
    KbqLocalDropzone,
    KbqMultipleFileUploadComponent,
    KbqSingleFileUploadComponent
} from '@koobiq/components/file-upload';
import { KbqToggleComponent } from '@koobiq/components/toggle';

/**
 * @title File-upload Dropzone
 */
@Component({
    selector: 'file-upload-dropzone-example',
    imports: [
        KbqSingleFileUploadComponent,
        KbqMultipleFileUploadComponent,
        KbqToggleComponent,
        KbqLocalDropzone,
        KbqButtonModule,
        KbqContentPanelModule
    ],
    template: `
        <div class="layout-margin-bottom-l">
            <kbq-toggle [checked]="value()" (change)="value.set($event.checked)">full screen</kbq-toggle>

            <kbq-file-upload [fullScreenDropZone]="value()" />
        </div>

        <kbq-content-panel-container maxWidth="600" minWidth="250" width="600" [opened]="true">
            <kbq-content-panel>
                <kbq-content-panel-header>
                    <div kbqContentPanelHeaderTitle>Local dropzone</div>
                </kbq-content-panel-header>
                <kbq-content-panel-body kbqLocalDropzone [kbqConnectedTo]="fileUploadLocal">
                    <span class="kbq-subheading">Drop file here</span>

                    @for (_i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; track $index) {
                        <p>
                            In computing [{{ $index }}], a denial-of-service attack (DoS attack) is a cyber-attack in
                            which the perpetrator seeks to make a machine or network resource unavailable to its
                            intended users by temporarily or indefinitely disrupting services of a host connected to a
                            network. Denial of service is typically accomplished by flooding the targeted machine or
                            resource with superfluous requests in an attempt to overload systems and prevent some or all
                            legitimate requests from being fulfilled. The range of attacks varies widely, spanning from
                            inundating a server with millions of requests to slow its performance, overwhelming a server
                            with a substantial amount of invalid data, to submitting requests with an illegitimate IP
                            address.
                        </p>
                    }
                    <kbq-file-upload #fileUploadLocal multiple />
                </kbq-content-panel-body>
                <kbq-content-panel-footer>
                    <button kbq-button>Button 1</button>
                </kbq-content-panel-footer>
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
export class FileUploadDropzoneExample {
    protected readonly value = signal(false);
}
