import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select virtual scroll
 */
@Component({
    standalone: true,
    selector: 'select-virtual-scroll-example',
    imports: [KbqFormFieldModule, KbqSelectModule, ScrollingModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <kbq-select [value]="selected">
                <cdk-virtual-scroll-viewport itemSize="32" maxBufferPx="800" minBufferPx="500">
                    <kbq-option *cdkVirtualFor="let option of options; templateCacheSize: 0" [value]="option">
                        {{ option }}
                    </kbq-option>
                </cdk-virtual-scroll-viewport>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 320px;
        }
    `
})
export class SelectVirtualScrollExample {
    readonly options = Array.from({ length: 10000 }).map((_, i) => `Option #${i}`);
    readonly selected = this.options[0];
}
