import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';
import { KbqLocalDropzone, KbqSingleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqSidebar, KbqSidebarClosed, KbqSidebarOpened, SidebarPositions } from '@koobiq/components/sidebar';

/**
 * @title File-upload local dropzone
 */
@Component({
    selector: 'file-upload-local-dropzone-example',
    imports: [
        KbqLocalDropzone,
        KbqButtonModule,
        KbqContentPanelModule,
        KbqSidebar,
        KbqSidebarOpened,
        KbqSidebarClosed,
        KbqSingleFileUploadComponent,
        KbqIcon
    ],
    template: `
        <main>
            <div>
                Manchester United, one of the most iconic football clubs in the world, is renowned for its rich history,
                legendary players, and unparalleled success.
            </div>
        </main>

        <kbq-sidebar
            #rightSidebar="kbqSidebar"
            kbqLocalDropzone
            [opened]="true"
            [position]="position.Right"
            [kbqConnectedTo]="fileUploadLocal"
        >
            <div kbq-sidebar-opened width="100%" minWidth="350px" maxWidth="350px">
                <div class="layout-margin-bottom-m">Drag your files on sidepanel</div>

                <kbq-file-upload #fileUploadLocal>
                    <i kbq-icon="kbq-file-text-o_16"></i>
                </kbq-file-upload>
            </div>
            <div kbq-sidebar-closed width="100px"></div>
        </kbq-sidebar>
    `,
    styles: `
        :host {
            display: flex;
            height: 248px;
        }

        main {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-m);
        }

        .kbq-sidebar {
            background: var(--kbq-background-bg);
            box-shadow: var(--kbq-shadow-overlay);
            padding: var(--kbq-size-xxl);
            border-radius: var(--kbq-size-border-radius);
            height: 100%;
            box-sizing: border-box;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadLocalDropzoneExample {
    protected readonly value = signal(false);
    readonly position = SidebarPositions;
}
