import { Component, TemplateRef, ViewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KbqSidepanelModule,
    KbqSidepanelPosition,
    KbqSidepanelService,
    KbqSidepanelSize
} from '@koobiq/components/sidepanel';

/**
 * @title Sidepanel sizes
 */
@Component({
    standalone: true,
    selector: 'sidepanel-sizes-example',
    imports: [
        KbqButtonModule,
        KbqSidepanelModule
    ],
    template: `
        <div
            class="layout-column"
            style="width: 200px"
        >
            <button
                (click)="showSmall()"
                kbq-button
                style="margin-bottom: 16px"
            >
                Small
            </button>

            <button
                (click)="showMedium()"
                kbq-button
                style="margin-bottom: 16px"
            >
                Medium
            </button>

            <button
                (click)="showLarge()"
                kbq-button
            >
                Large
            </button>
        </div>

        <ng-template>
            <kbq-sidepanel-header [closeable]="true">Sidepanel Template Content</kbq-sidepanel-header>
            <kbq-sidepanel-body class="layout-padding">
                <div class="kbq-subheading">Sidepanel Template Body</div>

                @for (item of array; track item; let i = $index) {
                    <div>
                        {{ i + 1 }}
                    </div>
                }
            </kbq-sidepanel-body>

            <kbq-sidepanel-footer>
                <kbq-sidepanel-actions align="left">
                    <button
                        [color]="'contrast'"
                        cdkFocusInitial
                        kbq-button
                    >
                        <span>Button</span>
                    </button>
                </kbq-sidepanel-actions>

                <kbq-sidepanel-actions align="right">
                    <span>Action</span>
                </kbq-sidepanel-actions>
            </kbq-sidepanel-footer>
        </ng-template>
    `
})
export class SidepanelSizesExample {
    size = KbqSidepanelPosition.Right;

    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    arrayLength = 40;
    array = new Array(this.arrayLength);
    constructor(private sidepanelService: KbqSidepanelService) {}

    showSmall() {
        this.sidepanelService.open(this.template, {
            position: KbqSidepanelPosition.Right,
            size: KbqSidepanelSize.Small
        });
    }

    showMedium() {
        this.sidepanelService.open(this.template, {
            position: KbqSidepanelPosition.Right,
            size: KbqSidepanelSize.Medium
        });
    }

    showLarge() {
        this.sidepanelService.open(this.template, {
            position: KbqSidepanelPosition.Right,
            size: KbqSidepanelSize.Large
        });
    }
}
