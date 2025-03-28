import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqDefaultSizes } from '@koobiq/components/core';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';

/**
 * @title Loader-overlay size
 */
@Component({
    standalone: true,
    selector: 'loader-overlay-size-example',
    imports: [KbqLoaderOverlayModule, KbqButtonToggleModule, FormsModule],
    template: `
        <div>
            <kbq-button-toggle-group [(ngModel)]="size">
                <kbq-button-toggle value="compact">Compact</kbq-button-toggle>
                <kbq-button-toggle value="normal">Normal</kbq-button-toggle>
                <kbq-button-toggle value="big">Big</kbq-button-toggle>
            </kbq-button-toggle-group>
        </div>

        <div class="flex" style="width: 500px; height: 320px">
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text
            <kbq-loader-overlay [size]="size()" text="Loading data..." />
        </div>
    `
})
export class LoaderOverlaySizeExample {
    size = model<KbqDefaultSizes>('compact');
}
