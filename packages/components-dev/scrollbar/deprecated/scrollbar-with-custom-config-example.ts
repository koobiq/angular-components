import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KBQ_SCROLLBAR_CONFIG, KbqScrollbarModule, KbqScrollbarOptions } from '@koobiq/components/scrollbar/deprecated';

/**
 * @title Scrollbar with custom KBQ_SCROLLBAR_CONFIG
 * @deprecated Should be removed in a future major version.
 */
@Component({
    selector: 'dev-scrollbar-with-custom-config-example',
    imports: [KbqScrollbarModule],
    template: `
        <div kbq-scrollbar style="width: 200px; height: 200px;">
            @for (item of items; track item) {
                <div>{{ item }}</div>
                <hr />
            }
        </div>
    `,
    providers: [
        {
            provide: KBQ_SCROLLBAR_CONFIG,
            useValue: {
                scrollbars: {
                    autoHide: 'never'
                }
            } satisfies KbqScrollbarOptions
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevScrollbarWithCustomConfigExample {
    readonly items = Array.from({ length: 1000 }).map((_, i) => `Item #${i}`);
}
