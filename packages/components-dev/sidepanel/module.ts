import { ChangeDetectionStrategy, Component, Inject, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { ThemePalette } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';
import {
    KBQ_SIDEPANEL_DATA,
    KbqSidepanelModule,
    KbqSidepanelPosition,
    KbqSidepanelService,
    KbqSidepanelSize
} from '@koobiq/components/sidepanel';
import { KbqToggleModule } from '@koobiq/components/toggle';
import {
    SidepanelModalModeExample,
    SidepanelNormalModeExample,
    SidepanelOverlayedExample,
    SidepanelSizesExample,
    SidepanelWithDynamicConfigUpdateExample
} from '../../docs-examples/components/sidepanel';

@Component({
    selector: 'dev-examples',
    imports: [
        SidepanelWithDynamicConfigUpdateExample,
        SidepanelModalModeExample,
        SidepanelNormalModeExample,
        SidepanelOverlayedExample,
        SidepanelSizesExample
    ],
    template: `
        <sidepanel-modal-mode-example />
        <hr />
        <sidepanel-normal-mode-example />
        <hr />
        <sidepanel-overlayed-example />
        <hr />
        <sidepanel-sizes-example />
        <hr />
        <sidepanel-with-dynamic-config-update-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-sidepanel-component',
    imports: [KbqSidepanelModule, KbqButtonModule],
    template: `
        <kbq-sidepanel-header [closeable]="true">
            Sidepanel Component Content Sidepanel Component Content Sidepanel Component Content
        </kbq-sidepanel-header>

        <kbq-sidepanel-body class="layout-padding">
            <div class="kbq-subheading">Sidepanel Component Body</div>

            @for (item of array; track item) {
                <div>{{ $index + 1 }}</div>
            }
        </kbq-sidepanel-body>

        <kbq-sidepanel-footer>
            <kbq-sidepanel-actions>
                <button kbq-button [color]="'contrast'" (click)="openComponentSidepanel()">
                    <span>Open another sidepanel</span>
                </button>

                <button kbq-button kbq-sidepanel-close>
                    <span>Close</span>
                </button>
            </kbq-sidepanel-actions>
        </kbq-sidepanel-footer>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column flex'
    }
})
export class DevSidepanelComponent {
    themePalette = ThemePalette;

    openComponentSidepanel: () => void;

    array = new Array(60);

    constructor(@Inject(KBQ_SIDEPANEL_DATA) public data: any) {
        this.openComponentSidepanel = data.openComponentSidepanel;
    }
}

@Component({
    selector: 'dev-app',
    imports: [
        FormsModule,
        KbqSidepanelModule,
        KbqButtonModule,
        KbqIconModule,
        KbqFormFieldModule,
        KbqSelectModule,
        KbqToggleModule,
        KbqDropdownModule,
        DevDocsExamples
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    themePalette = ThemePalette;
    position: KbqSidepanelPosition = KbqSidepanelPosition.Right;
    size: KbqSidepanelSize = KbqSidepanelSize.Medium;

    modalState: boolean = false;

    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    array = new Array(40);
    constructor(private sidepanelService: KbqSidepanelService) {}

    openComponentSidepanel() {
        this.sidepanelService.open(DevSidepanelComponent, {
            hasBackdrop: this.modalState,
            position: this.position,
            size: this.size,
            data: {
                openComponentSidepanel: () => {
                    this.openComponentSidepanel();
                }
            }
        });
    }

    openTemplateSidepanel() {
        this.sidepanelService.open(this.template, {
            position: this.position,
            size: this.size,
            hasBackdrop: this.modalState
        });
    }
}
