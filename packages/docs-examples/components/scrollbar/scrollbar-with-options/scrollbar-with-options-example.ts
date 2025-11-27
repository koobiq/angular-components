import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqScrollbarModule, KbqScrollbarOptions } from '@koobiq/components/scrollbar';

/**
 * @title Scrollbar with options
 */
@Component({
    selector: 'scrollbar-with-options-example',
    imports: [KbqScrollbarModule],
    template: `
        <kbq-scrollbar style="width: 200px; height: 200px;" [options]="options">
            @for (item of items; track item) {
                <div>{{ item }}</div>
                <hr />
            }
        </kbq-scrollbar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollbarWithOptionsExample {
    readonly options: KbqScrollbarOptions = {
        scrollbars: {
            autoHide: 'never'
        }
    };

    readonly items = Array.from({ length: 1000 }).map((_, i) => `Item #${i}`);
}
