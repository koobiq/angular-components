import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqScrollbarTrack, KbqScrollbarViewport } from '@koobiq/components/scrollbar';

/**
 * @title Scrollbar with virtual scroll
 */
@Component({
    selector: 'scrollbar-virtual-scroll-example',
    imports: [KbqScrollbarViewport, KbqScrollbarTrack, ScrollingModule, KbqButtonModule],
    template: `
        <button kbq-button (click)="addItems()">Add items</button>

        <cdk-virtual-scroll-viewport kbqScrollbarViewport class="example-scrollbar" itemSize="32">
            <kbq-scrollbar-track />
            <div *cdkVirtualFor="let item of items()" class="example-item">{{ item }}</div>
        </cdk-virtual-scroll-viewport>
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
            height: 320px;
            width: 320px;
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
    protected readonly items = signal(Array.from({ length: 100 }).map((_, i) => `Item #${i}`));

    protected addItems(): void {
        const nextIndex = this.items().length;
        const newItems = Array.from({ length: 100 }).map((_, i) => `Item #${nextIndex + i}`);

        this.items.update((items) => [...items, ...newItems]);
    }
}
