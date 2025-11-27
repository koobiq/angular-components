import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqResizable, KbqResizer, KbqResizerSizeChangeEvent } from '@koobiq/components/resizer';

/**
 * @title Resizer overview example
 */
@Component({
    standalone: true,
    selector: 'resizer-overview-example',
    imports: [KbqResizer, KbqResizable, KbqIcon],
    template: `
        <div kbqResizable>
            <div></div>
            <div></div>
            <div></div>

            <div></div>
            <div></div>
            <div class="layout-align-end-center" [kbqResizer]="[1, 0]" (sizeChange)="sizeChanged($event)">
                <i kbq-icon="kbq-arrow-right_16"></i>
            </div>

            <div></div>
            <div class="layout-align-center-end" [kbqResizer]="[0, 1]" (sizeChange)="sizeChanged($event)">
                <i kbq-icon="kbq-arrow-down_16"></i>
            </div>
            <div class="layout-align-end-end" [kbqResizer]="[1, 1]" (sizeChange)="sizeChanged($event)">
                <i kbq-icon="kbq-arrow-down-right_16"></i>
            </div>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            height: 250px;
            padding: var(--kbq-size-m);
        }

        .kbq-resizable {
            display: grid;
            grid-template-columns: repeat(3, auto);
            grid-template-rows: repeat(3, auto);
            justify-content: space-between;

            max-height: 100%;
            max-width: 100%;
            width: 150px;
            height: 150px;
            min-width: 125px;
            min-height: 125px;

            border-radius: var(--kbq-size-border-radius);
            border: 2px solid var(--kbq-line-theme);
            background-color: var(--kbq-background-theme-fade);
            color: var(--kbq-foreground-theme);
            padding: var(--kbq-size-s);
        }

        .kbq-icon {
            color: inherit;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizerOverviewExample {
    protected sizeChanged(event: KbqResizerSizeChangeEvent): void {
        console.debug('Resized to:', event);
    }
}
