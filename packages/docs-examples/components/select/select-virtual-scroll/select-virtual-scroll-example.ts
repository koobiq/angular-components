import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

type OptionItem = { id: number; label: string };

/**
 * @title Select virtual scroll
 */
@Component({
    selector: 'select-virtual-scroll-example',
    imports: [KbqFormFieldModule, KbqSelectModule, ScrollingModule],
    template: `
        <kbq-form-field>
            <kbq-select
                [compareWith]="compareWith"
                [displayWith]="displayWith"
                [(value)]="selected"
                (openedChange)="openedChange($event)"
            >
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectVirtualScrollExample {
    readonly options: OptionItem[] = Array.from({ length: 10000 }).map((_, i) => ({ id: i, label: `Option #${i}` }));
    readonly virtualScrollViewport = viewChild.required(CdkVirtualScrollViewport);

    selected: OptionItem = this.options[0];

    readonly compareWith = (a: OptionItem | null, b: OptionItem | null) => a?.id === b?.id;
    readonly displayWith = (v: OptionItem) => v.label;

    openedChange(isOpened: boolean): void {
        if (!isOpened) return;
        this.virtualScrollViewport().scrollToIndex(this.selected.id);
    }
}
