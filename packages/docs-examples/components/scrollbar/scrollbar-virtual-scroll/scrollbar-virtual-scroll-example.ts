import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqScrollbar, KbqScrollbarVirtualViewport } from '@koobiq/components/scrollbar';

/**
 * @title Scrollbar with virtual scroll
 */
@Component({
    selector: 'scrollbar-virtual-scroll-example',
    imports: [KbqScrollbar, KbqScrollbarVirtualViewport, ScrollingModule, KbqButtonModule],
    template: `
        <button kbq-button (click)="addItems()">Add items</button>

        <div class="example-scrollbar" kbqScrollbar>
            <cdk-virtual-scroll-viewport kbqScrollbarVirtualViewport itemSize="32" [style.height.%]="100">
                <div *cdkVirtualFor="let item of items()" class="example-item">{{ item }}</div>
            </cdk-virtual-scroll-viewport>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-l);
        }

        .example-scrollbar {
            height: 200px;
            width: 200px;
            border-radius: var(--kbq-size-border-radius);
            background-color: var(--kbq-background-bg-secondary);
        }

        .example-item {
            padding: 0 var(--kbq-size-s);
            line-height: 32px;
            height: 32px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollbarVirtualScrollExample {
    protected readonly items = signal(Array.from({ length: 1000 }).map((_, i) => `Item #${i}`));

    protected addItems(): void {
        const nextIndex = this.items().length;
        const newItems = Array.from({ length: 100 }).map((_, i) => `Item #${nextIndex + i}`);

        this.items.update((items) => [...items, ...newItems]);
    }
}
