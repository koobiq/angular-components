import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
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
            <kbq-select #select [(value)]="selected" (openedChange)="openedChange($event)">
                <div kbq-select-trigger>{{ select.triggerValue['label'] }}</div>
                <cdk-virtual-scroll-viewport itemSize="32" minBufferPx="300" maxBufferPx="300">
                    <kbq-option *cdkVirtualFor="let option of options" [value]="option">
                        {{ option.label }}
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
    readonly options = Array.from({ length: 10000 }).map((_, i) => ({ id: i, label: `Option #${i}` }));
    readonly virtualScrollViewport = viewChild.required(CdkVirtualScrollViewport);

    selected = this.options[0];

    openedChange(isOpened: boolean): void {
        if (!isOpened) return;
        this.virtualScrollViewport().scrollToIndex(this.selected.id);
    }
}
