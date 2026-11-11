import { ScrollingModule } from '@angular/cdk/scrolling';
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqListModule } from '@koobiq/components/list';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { injectExampleText } from '../l10n';

/**
 * @title List with virtual-scroll
 */
@Component({
    selector: 'list-virtual-scroll-example',
    imports: [KbqListModule, FormsModule, ScrollingModule, JsonPipe, KbqScrollbarViewport],
    template: `
        <div>{{ text().selected }} {{ selected | json }}</div>
        <br />
        <kbq-list-selection style="height: 200px" multiple [attr.aria-label]="text().items" [(ngModel)]="selected">
            <cdk-virtual-scroll-viewport
                kbqScrollbarViewport
                style="height: 100%"
                itemSize="32"
                minBufferPx="300"
                maxBufferPx="300"
            >
                <kbq-list-option *cdkVirtualFor="let option of options()" [value]="option">
                    {{ option.label }}
                </kbq-list-option>
            </cdk-virtual-scroll-viewport>
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListVirtualScrollExample {
    protected readonly text = injectExampleText();

    readonly options = computed(() =>
        Array.from({ length: 10000 }).map((_, i) => ({
            id: i,
            label: this.text().optionN(i)
        }))
    );

    selected = [];
}
