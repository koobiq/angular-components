import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqScrollbar, KbqScrollbarMode, KbqScrollbarViewport } from './scrollbar';

@Component({
    selector: 'e2e-scrollbar-state-and-style',
    imports: [KbqScrollbar],
    template: `
        <kbq-scrollbar class="e2e-scrollbar">
            <p>content</p>
        </kbq-scrollbar>
    `,
    styles: `
        :host {
            display: inline-block;
            padding: var(--kbq-size-xs);
        }

        .e2e-scrollbar {
            width: 100px;
            height: 100px;
            border-radius: var(--kbq-size-border-radius);
            background-color: var(--kbq-background-bg-secondary);
        }

        p {
            width: 200%;
            height: 200%;
            margin: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eScrollbarStateAndStyle'
    }
})
export class E2eScrollbarStateAndStyle {}

@Component({
    selector: 'e2e-scrollbar-track',
    imports: [KbqScrollbar],
    template: `
        <kbq-scrollbar mode="always" class="e2e-scrollbar" data-testid="e2eScrollbarTrackY">
            <p [style.height.%]="200">track Y</p>
        </kbq-scrollbar>

        <kbq-scrollbar mode="always" class="e2e-scrollbar" data-testid="e2eScrollbarTrackX">
            <p [style.width.%]="200">track X</p>
        </kbq-scrollbar>

        <kbq-scrollbar mode="always" class="e2e-scrollbar" data-testid="e2eScrollbarTrackXY">
            <p [style.width.%]="200" [style.height.%]="200">track X and Y</p>
        </kbq-scrollbar>
    `,
    styles: `
        :host {
            display: inline-flex;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xs);
        }

        .e2e-scrollbar {
            --kbq-scrollbar-track-background: cyan;
            --kbq-scrollbar-thumb-default-background: orange;

            width: 125px;
            height: 125px;
            background-color: var(--kbq-background-bg-secondary);
        }

        p {
            margin: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eScrollbarTrack'
    }
})
export class E2eScrollbarTrack {}

@Component({
    selector: 'e2e-scrollbar-mode',
    imports: [KbqScrollbar],
    template: `
        <div class="e2e-mode-buttons">
            @for (m of modes; track m) {
                <button type="button" [attr.data-testid]="modeTestId(m)" (click)="mode.set(m)">{{ m }}</button>
            }
        </div>

        <kbq-scrollbar class="e2e-scrollbar" data-testid="e2eScrollbarModeTarget" [mode]="mode()">
            <p>content</p>
            <!-- Plain, unmonitored content — the viewport's own subtree focus monitoring covers it
                 without needing a per-element cdkMonitorElementFocus opt-in. -->
            <button type="button" data-testid="e2eScrollbarModeFocusable">focusable</button>
        </kbq-scrollbar>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-xs);
        }

        .e2e-scrollbar {
            width: 200px;
            height: 100px;
            border-radius: var(--kbq-size-border-radius);
            background-color: var(--kbq-background-bg-secondary);
        }

        p {
            width: 200%;
            height: 200%;
            margin: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eScrollbarMode'
    }
})
export class E2eScrollbarMode {
    protected readonly modes: KbqScrollbarMode[] = ['hover', 'always', 'native', 'hidden'];
    protected readonly mode = signal<KbqScrollbarMode>('hover');

    protected modeTestId(mode: KbqScrollbarMode): string {
        return `mode-${mode}`;
    }
}

@Component({
    selector: 'e2e-scrollbar-scroll-to',
    imports: [KbqScrollbar],
    template: `
        <div class="e2e-buttons">
            <button type="button" data-testid="scroll-top" (click)="scrollbar.scrollToTop()">Top</button>
            <button type="button" data-testid="scroll-bottom" (click)="scrollbar.scrollToBottom()">Bottom</button>
            <button type="button" data-testid="scroll-start" (click)="scrollbar.scrollStart()">Start</button>
            <button type="button" data-testid="scroll-end" (click)="scrollbar.scrollEnd()">End</button>
            <button type="button" data-testid="scroll-to-element" (click)="scrollbar.scrollToElement(target)">
                To element
            </button>
        </div>

        <kbq-scrollbar
            #scrollbar="kbqScrollbar"
            mode="always"
            class="e2e-scrollbar"
            data-testid="e2eScrollbarScrollToTarget"
        >
            <div class="e2e-block">1</div>
            <div class="e2e-block">2</div>
            <div #target class="e2e-block" data-testid="scroll-to-element-target">3</div>
            <div class="e2e-block">4</div>
            <div class="e2e-block">5</div>
        </kbq-scrollbar>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-xs);
        }

        .e2e-buttons {
            display: flex;
            gap: var(--kbq-size-s);
        }

        .e2e-scrollbar {
            width: 150px;
            height: 150px;
            border-radius: var(--kbq-size-border-radius);
            background-color: var(--kbq-background-bg-secondary);
        }

        .e2e-block {
            box-sizing: border-box;
            width: 300px;
            height: 150px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eScrollbarScrollTo'
    }
})
export class E2eScrollbarScrollTo {}

@Component({
    selector: 'e2e-scrollbar-virtual-scroll',
    imports: [KbqScrollbarViewport, ScrollingModule],
    template: `
        <button type="button" data-testid="add-items" (click)="addItems()">Add items</button>

        <cdk-virtual-scroll-viewport
            kbqScrollbarViewport
            mode="always"
            class="e2e-scrollbar"
            itemSize="32"
            data-testid="e2eScrollbarVirtualScrollTarget"
        >
            @for (item of items(); track item) {
                <div class="e2e-item">{{ item }}</div>
            }
        </cdk-virtual-scroll-viewport>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-xs);
        }

        .e2e-scrollbar {
            --kbq-scrollbar-track-background: cyan;
            --kbq-scrollbar-thumb-default-background: orange;

            width: 200px;
            height: 200px;
            background-color: var(--kbq-background-bg-secondary);
        }

        .e2e-item {
            box-sizing: border-box;
            height: 32px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eScrollbarVirtualScroll'
    }
})
export class E2eScrollbarVirtualScroll {
    protected readonly items = signal(Array.from({ length: 20 }).map((_, i) => `Item #${i}`));

    protected addItems(): void {
        const nextIndex = this.items().length;
        const newItems = Array.from({ length: 50 }).map((_, i) => `Item #${nextIndex + i}`);

        this.items.update((items) => [...items, ...newItems]);
    }
}

@Component({
    selector: 'e2e-scrollbar-nested',
    imports: [KbqScrollbar],
    template: `
        <kbq-scrollbar mode="always" class="e2e-outer" data-testid="e2eScrollbarNestedOuter">
            <div class="e2e-outer-spacer"></div>

            <kbq-scrollbar mode="always" class="e2e-inner" data-testid="e2eScrollbarNestedInner">
                <div class="e2e-inner-block">1</div>
                <div class="e2e-inner-block">2</div>
                <div class="e2e-inner-block">3</div>
                <div class="e2e-inner-block">4</div>
                <div class="e2e-inner-block">5</div>
            </kbq-scrollbar>

            <div class="e2e-outer-spacer"></div>
        </kbq-scrollbar>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-xs);
        }

        .e2e-outer {
            width: 300px;
            height: 200px;
            border-radius: var(--kbq-size-border-radius);
            background-color: var(--kbq-background-bg-secondary);
        }

        .e2e-outer-spacer {
            box-sizing: border-box;
            height: 200px;
        }

        .e2e-inner {
            width: 250px;
            height: 150px;
            background-color: var(--kbq-background-bg-tertiary);
        }

        .e2e-inner-block {
            box-sizing: border-box;
            width: 100%;
            height: 150px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eScrollbarNested'
    }
})
export class E2eScrollbarNested {}
