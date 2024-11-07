import { Component, TemplateRef, ViewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSidepanelModule, KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { take } from 'rxjs/operators';

/**
 * @title Sidepanel normal mode
 */
@Component({
    standalone: true,
    selector: 'sidepanel-normal-mode-example',
    imports: [KbqFormFieldModule, KbqSelectModule, KbqButtonModule, KbqSidepanelModule],
    template: `
        <div class="kbq-form-horizontal">
            <div class="kbq-form__row">
                <label class="kbq-form__label">Position</label>
                <kbq-form-field
                    class="kbq-form__control flex-10"
                    style="min-width: 120px"
                >
                    <kbq-select [(value)]="position">
                        <kbq-option [value]="'right'">Right</kbq-option>
                        <kbq-option [value]="'left'">Left</kbq-option>
                        <kbq-option [value]="'top'">Top</kbq-option>
                        <kbq-option [value]="'bottom'">Bottom</kbq-option>
                    </kbq-select>
                </kbq-form-field>
            </div>
        </div>

        <br />

        <button
            [color]="'contrast'"
            (click)="toggleSidepanel()"
            kbq-button
        >
            <span>{{ isOpened ? 'Close sidepanel' : 'Open sidepanel' }}</span>
        </button>

        <ng-template>
            <kbq-sidepanel-header [closeable]="true">Sidepanel Template Content</kbq-sidepanel-header>
            <kbq-sidepanel-body style="padding-top: 8px; padding-bottom: 8px">
                <div
                    class="kbq-subheading"
                    style="padding: 8px"
                >
                    Sidepanel Template Body
                </div>

                @for (item of array; track item; let i = $index) {
                    <div style="padding: 8px">
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
export class SidepanelNormalModeExample {
    position = KbqSidepanelPosition.Right;

    isOpened = false;

    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    arrayLength = 40;
    array = new Array(this.arrayLength);
    constructor(private sidepanelService: KbqSidepanelService) {}

    toggleSidepanel() {
        if (!this.isOpened) {
            const sidepanel = this.sidepanelService.open(this.template, {
                position: this.position,
                hasBackdrop: false
            });

            sidepanel
                .afterClosed()
                .pipe(take(1))
                .subscribe(() => {
                    this.isOpened = false;
                });
            this.isOpened = true;
        } else {
            this.sidepanelService.closeAll();
        }
    }
}
