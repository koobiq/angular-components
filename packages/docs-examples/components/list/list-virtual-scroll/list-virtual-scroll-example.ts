import { ScrollingModule } from '@angular/cdk/scrolling';
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqListModule } from '@koobiq/components/list';

/**
 * @title List with virtual-scroll
 */
@Component({
    standalone: true,
    selector: 'list-virtual-scroll-example',
    imports: [KbqListModule, FormsModule, ScrollingModule, JsonPipe],
    template: `
        <div>Selected: {{ selected | json }}</div>
        <br />
        <kbq-list-selection style="height: 200px" multiple [(ngModel)]="selected">
            <cdk-virtual-scroll-viewport style="height: 100%" itemSize="32" minBufferPx="300" maxBufferPx="300">
                <kbq-list-option *cdkVirtualFor="let option of options" [value]="option">
                    {{ option.label }}
                </kbq-list-option>
            </cdk-virtual-scroll-viewport>
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListVirtualScrollExample {
    readonly options = Array.from({ length: 10000 }).map((_, i) => ({
        id: i,
        label: `Option #${i}`
    }));

    selected = [];
}
