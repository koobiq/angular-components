import { Component, ViewEncapsulation } from '@angular/core';
import { KbqScrollbarModule, KbqScrollbarOptions } from '@koobiq/components/scrollbar';

/**
 * @title scrollbar-input-customization-example
 */
@Component({
    standalone: true,
    selector: 'scrollbar-input-customization-example',
    imports: [KbqScrollbarModule],
    template: `
        <div
            class="layout-row"
            [style.gap.px]="16"
        >
            <div
                kbq-scrollbar
                style="height: 300px; max-width: 300px; overflow: auto"
            >
                <div [style.width.px]="400">
                    @for (paragraph of text; track paragraph) {
                        {{ paragraph }}
                    }
                </div>
            </div>
            <div
                [options]="options"
                kbq-scrollbar
                style="height: 300px; max-width: 300px; overflow: auto"
            >
                <div [style.width.px]="400">
                    @for (paragraph of text; track paragraph) {
                        {{ paragraph }}
                    }
                </div>
            </div>
            <div
                kbq-scrollbar
                style="height: 300px; max-width: 300px; overflow: auto"
            >
                <div [style.width.px]="400">
                    @for (paragraph of text; track paragraph) {
                        {{ paragraph }}
                    }
                </div>
            </div>
        </div>
    `,
    encapsulation: ViewEncapsulation.None
})
export class ScrollbarInputCustomizationExample {
    options: KbqScrollbarOptions = {
        scrollbars: {
            autoHide: 'never',
            visibility: 'visible'
        }
    };
    text = Array<string>(20).fill(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla elementum mauris ut hendrerit lobortis. Nam tincidunt eros dolor, vitae auctor dolor suscipit quis. Quisque sagittis sit amet lectus sed vulputate. Cras ornare purus quis suscipit vulputate. Proin vitae dolor in velit tristique finibus eget ut lorem. Integer eu maximus lorem. Maecenas eu consectetur ligula, id mattis urna. Donec nisi ipsum, sollicitudin sit amet euismod ut, tempor eu felis. Quisque sit amet sapien purus. Curabitur quis nisi eros. Cras at aliquet sem, vel tincidunt turpis.'
    );
}
