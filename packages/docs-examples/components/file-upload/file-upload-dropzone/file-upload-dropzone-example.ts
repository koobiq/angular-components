import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';
import {
    KbqLocalDropzone,
    KbqMultipleFileUploadComponent,
    KbqSingleFileUploadComponent
} from '@koobiq/components/file-upload';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqToggleComponent } from '@koobiq/components/toggle';

/**
 * @title File-upload Dropzone
 */
@Component({
    selector: 'file-upload-dropzone-example',
    imports: [
        KbqSingleFileUploadComponent,
        KbqMultipleFileUploadComponent,
        KbqIcon,
        KbqToggleComponent,
        KbqLocalDropzone,
        KbqButtonModule,
        KbqContentPanelModule
    ],
    template: `
        <kbq-toggle [checked]="value()" (change)="value.set($event.checked)">full screen</kbq-toggle>

        <kbq-file-upload [fullScreenDropZone]="value()" />

        <kbq-content-panel-container #panel="kbqContentPanelContainer" width="350" maxWidth="450" minWidth="250">
            <div class="example-content-panel-container__content">
                <button kbq-button (click)="panel.toggle()">Toggle</button>
                <button kbq-button [disabled]="panel.isOpened()" (click)="panel.open()">Open</button>
                <button kbq-button [disabled]="!panel.isOpened()" (click)="panel.close()">Close</button>
            </div>

            <kbq-content-panel>
                <kbq-content-panel-header>
                    <div kbqContentPanelHeaderTitle>Title</div>
                    <div kbqContentPanelHeaderActions>
                        <button kbq-button><i kbq-icon="kbq-arrows-expand-diagonal_16"></i></button>
                    </div>
                </kbq-content-panel-header>
                <kbq-content-panel-body kbqLocalDropzone [kbqConnectedTo]="fileUploadLocal">
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
            display: block;
            height: 400px;
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
