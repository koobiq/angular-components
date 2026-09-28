import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KbqNativeScrollbar, KbqScrollbar, KbqScrollbarMode, KbqScrollbarViewport } from './scrollbar';

@Component({
    selector: 'e2e-scrollbar-state-and-style',
    imports: [KbqScrollbar, KbqNativeScrollbar, KbqScrollbarViewport],
    template: `
        <kbq-scrollbar kbqScrollbarMode="always" class="e2e-scrollbar">
            <p>KbqScrollbar</p>
        </kbq-scrollbar>

        <div kbqScrollbarViewport kbqScrollbarMode="always" class="e2e-scrollbar" [style.overflow]="'scroll'">
            <p>KbqScrollbarViewport</p>
        </div>

        <div kbqNativeScrollbar class="e2e-scrollbar" [style.overflow]="'scroll'">
            <p>KbqNativeScrollbar</p>
        </div>
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xs);
        }

        .e2e-scrollbar {
            width: 125px;
            height: 125px;
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
    selector: 'e2e-scrollbar-hover',
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
        'data-testid': 'e2eScrollbarHover'
    }
})
export class E2eScrollbarHover {}

@Component({
    selector: 'e2e-scrollbar-track',
    imports: [KbqScrollbar],
    template: `
        <kbq-scrollbar kbqScrollbarMode="always" class="e2e-scrollbar" data-testid="e2eScrollbarTrackY">
            <p [style.height.%]="200">track Y</p>
        </kbq-scrollbar>

        <kbq-scrollbar kbqScrollbarMode="always" class="e2e-scrollbar" data-testid="e2eScrollbarTrackX">
            <p [style.width.%]="200">track X</p>
        </kbq-scrollbar>

        <kbq-scrollbar kbqScrollbarMode="always" class="e2e-scrollbar" data-testid="e2eScrollbarTrackXY">
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

        <kbq-scrollbar class="e2e-scrollbar" data-testid="e2eScrollbarModeTarget" [kbqScrollbarMode]="mode()">
            <p>content</p>
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
            kbqScrollbarMode="always"
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
            kbqScrollbarMode="always"
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

// Taller than any viewport below, so loading it is enough to make the content overflow.
const E2E_TALL_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='400'/%3E";

// A component host left at the default `display: inline`, as most are: a resize observer reports nothing for
// it, whatever grows inside.
@Component({
    selector: 'e2e-scrollbar-inline-host',
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush
})
class E2eScrollbarInlineHost {}

const E2E_LONG_TEXT =
    'Content that arrives after the viewport was measured has to be noticed without anyone touching the ' +
    'scrollbar: nothing scrolls, nothing is hovered, the size changes and the bar has to follow on its own.';

@Component({
    selector: 'e2e-scrollbar-content-changes',
    imports: [KbqScrollbar, KbqScrollbarViewport, NgTemplateOutlet, E2eScrollbarInlineHost],
    template: `
        <div class="e2e-controls">
            <button type="button" data-testid="e2eScrollbarContentChangesAdd" (click)="addItems()">Add</button>
            <button type="button" data-testid="e2eScrollbarContentChangesRemove" (click)="items.set(0)">Remove</button>
            <button type="button" data-testid="e2eScrollbarContentChangesImage" (click)="image.set(tallImage)">
                Image
            </button>
            <button type="button" data-testid="e2eScrollbarContentChangesEnlarge" (click)="enlarged.set(true)">
                Enlarge
            </button>
            <button type="button" data-testid="e2eScrollbarContentChangesText" (click)="text.set(longText)">
                Text
            </button>
            <button type="button" data-testid="e2eScrollbarContentChangesBlock" (click)="block.set(true)">Block</button>
            <button
                type="button"
                data-testid="e2eScrollbarContentChangesBlockImage"
                (click)="blockImage.set(tallImage)"
            >
                Block image
            </button>
            <button
                type="button"
                data-testid="e2eScrollbarContentChangesInlineImage"
                (click)="inlineImage.set(tallImage)"
            >
                Inline image
            </button>
            <button type="button" data-testid="e2eScrollbarContentChangesInlineGrow" (click)="inlineGrown.set(true)">
                Inline grow
            </button>
            <button type="button" data-testid="e2eScrollbarContentChangesWiden" (click)="widened.set(true)">
                Widen
            </button>
            <button type="button" data-testid="e2eScrollbarContentChangesLock" (click)="locked.set(true)">Lock</button>
            <button type="button" data-testid="e2eScrollbarContentChangesUnlock" (click)="locked.set(false)">
                Unlock
            </button>
            <button type="button" data-testid="e2eScrollbarContentChangesShift" (click)="shifted.set(true)">
                Shift
            </button>
        </div>

        <ng-template #content>
            <div>
                <p class="e2e-line" [style.width.px]="widened() ? 600 : null">First line</p>
                <p class="e2e-line">Second line</p>
                <div>
                    @for (item of itemList(); track item) {
                        <p class="e2e-line">Item {{ item }}</p>
                    }
                </div>
                <img alt="" [attr.src]="image()" />
                <p class="e2e-line">{{ text() }}</p>
            </div>
            <!-- More root nodes, so that these land as direct children of the viewport's content. -->
            @if (block()) {
                <div class="e2e-block"><img alt="" [attr.src]="blockImage()" /></div>
            }
            <e2e-scrollbar-inline-host>
                <div [class.e2e-grown]="inlineGrown()"><img alt="" [attr.src]="inlineImage()" /></div>
            </e2e-scrollbar-inline-host>
        </ng-template>

        <div class="e2e-viewports">
            <kbq-scrollbar
                kbqScrollbarMode="always"
                class="e2e-viewport"
                data-testid="e2eScrollbarContentChangesComponent"
            >
                <ng-container [ngTemplateOutlet]="content" />
            </kbq-scrollbar>

            <div
                kbqScrollbarViewport
                kbqScrollbarMode="always"
                class="e2e-viewport e2e-viewport_directive"
                data-testid="e2eScrollbarContentChangesDirective"
                [class.e2e-viewport_locked]="locked()"
            >
                <ng-container [ngTemplateOutlet]="content" />
            </div>

            <kbq-scrollbar
                kbqScrollbarMode="always"
                class="e2e-viewport"
                data-testid="e2eScrollbarContentChangesComponentText"
            >
                {{ text() }}
            </kbq-scrollbar>

            <div
                kbqScrollbarViewport
                kbqScrollbarMode="always"
                class="e2e-viewport e2e-viewport_directive"
                data-testid="e2eScrollbarContentChangesDirectiveText"
            >
                {{ text() }}
            </div>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-xs);
        }

        .e2e-controls,
        .e2e-viewports {
            display: flex;
            gap: var(--kbq-size-m);
            margin-block-end: var(--kbq-size-m);
        }

        .e2e-viewport {
            /* kbq-scrollbar grows along its parent's main axis by design; the text scenarios need a fixed width. */
            flex: none;
            width: 200px;
            height: 120px;
            background-color: var(--kbq-background-bg-secondary);
        }

        .e2e-viewport_directive {
            overflow: auto;
        }

        .e2e-viewport_locked {
            overflow: hidden;
        }

        .e2e-grown {
            height: 400px;
        }

        .e2e-line {
            margin: 0;
            line-height: 20px;
        }

        img {
            display: block;
        }

        :host(.e2e-scrollbar-content-changes_enlarged) .e2e-line {
            font-size: 40px;
            line-height: 48px;
        }

        /* Grows the scrollable size with no resize, no mutation inside the viewport and no event. */
        :host(.e2e-scrollbar-content-changes_shifted) .e2e-line {
            transform: translateY(300px);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eScrollbarContentChanges',
        '[class.e2e-scrollbar-content-changes_enlarged]': 'enlarged()',
        '[class.e2e-scrollbar-content-changes_shifted]': 'shifted()'
    }
})
export class E2eScrollbarContentChanges {
    protected readonly tallImage = E2E_TALL_IMAGE;
    protected readonly longText = E2E_LONG_TEXT;

    protected readonly items = signal(0);
    protected readonly itemList = computed(() => Array.from({ length: this.items() }, (_, index) => index));
    protected readonly image = signal<string | null>(null);
    protected readonly enlarged = signal(false);
    protected readonly text = signal('Short text');
    protected readonly block = signal(false);
    protected readonly blockImage = signal<string | null>(null);
    protected readonly inlineImage = signal<string | null>(null);
    protected readonly inlineGrown = signal(false);
    protected readonly widened = signal(false);
    protected readonly locked = signal(false);
    protected readonly shifted = signal(false);

    protected addItems(): void {
        this.items.update((count) => count + 12);
    }
}

@Component({
    selector: 'e2e-scrollbar-nested',
    imports: [KbqScrollbar],
    template: `
        <kbq-scrollbar kbqScrollbarMode="always" class="e2e-outer" data-testid="e2eScrollbarNestedOuter">
            <div class="e2e-outer-spacer"></div>

            <kbq-scrollbar kbqScrollbarMode="always" class="e2e-inner" data-testid="e2eScrollbarNestedInner">
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

@Component({
    selector: 'e2e-native-scrollbar',
    imports: [KbqNativeScrollbar, KbqScrollbar],
    template: `
        <div kbqNativeScrollbar class="e2e-native-scrollbar" data-testid="e2eNativeScrollbarSelf">
            <div class="e2e-native-scrollbar__content">
                <div class="e2e-native-scrollbar__nested" data-testid="e2eNativeScrollbarSelfNested">
                    <div class="e2e-native-scrollbar__content"></div>
                </div>
            </div>
        </div>

        <div
            kbqNativeScrollbar
            kbqNativeScrollbarDescendants
            class="e2e-native-scrollbar"
            data-testid="e2eNativeScrollbarDescendants"
        >
            <div class="e2e-native-scrollbar__content">
                <div class="e2e-native-scrollbar__nested" data-testid="e2eNativeScrollbarDescendantsNested">
                    <div class="e2e-native-scrollbar__content"></div>
                </div>
            </div>
        </div>

        <kbq-scrollbar
            kbqNativeScrollbar
            kbqScrollbarMode="native"
            class="e2e-native-scrollbar"
            data-testid="e2eNativeScrollbarViewport"
        >
            <div class="e2e-native-scrollbar__content"></div>
        </kbq-scrollbar>
    `,
    styles: `
        :host {
            display: flex;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xs);
        }

        .e2e-native-scrollbar {
            width: 120px;
            height: 80px;
            overflow: scroll;
        }

        .e2e-native-scrollbar__content {
            width: 240px;
            height: 160px;
        }

        .e2e-native-scrollbar__nested {
            width: 60px;
            height: 40px;
            overflow: scroll;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eNativeScrollbar'
    }
})
export class E2eNativeScrollbar {}

@Component({
    selector: 'e2e-scrollbar-padding',
    imports: [KbqScrollbarViewport],
    template: `
        <div
            kbqScrollbarViewport
            kbqScrollbarMode="always"
            class="e2e-scrollbar"
            data-testid="e2eScrollbarPaddingTarget"
        >
            <div class="e2e-content"></div>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-xs);
        }

        .e2e-scrollbar {
            --kbq-scrollbar-track-background: cyan;
            --kbq-scrollbar-thumb-default-background: orange;

            box-sizing: border-box;
            width: 200px;
            height: 200px;
            padding: 16px;
            overflow: auto;
            background-color: var(--kbq-background-bg-secondary);
        }

        .e2e-content {
            width: 100%;
            height: 800px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eScrollbarPadding'
    }
})
export class E2eScrollbarPadding {}

@Component({
    selector: 'e2e-scrollbar-viewport-bound-id',
    imports: [KbqScrollbarViewport],
    template: `
        <div
            kbqScrollbarViewport
            kbqScrollbarMode="always"
            class="e2e-scrollbar"
            [id]="viewportId"
            [style.overflow]="'scroll'"
        >
            <div class="e2e-content">content</div>
        </div>
    `,
    styles: `
        .e2e-scrollbar {
            width: 200px;
            height: 200px;
            overflow: auto;
        }

        .e2e-content {
            width: 100%;
            height: 800px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eScrollbarViewportBoundId'
    }
})
export class E2eScrollbarViewportBoundId {
    readonly viewportId = 'consumer-bound-viewport-id';
}

@Component({
    selector: 'e2e-scrollbar-stacking',
    imports: [KbqScrollbarViewport],
    template: `
        <div kbqScrollbarViewport kbqScrollbarMode="always" class="e2e-scrollbar">
            <div class="e2e-sticky-header" data-testid="e2eScrollbarStackingStickyHeader">sticky</div>
            <div class="e2e-content">content</div>
        </div>

        <div class="e2e-sibling" data-testid="e2eScrollbarStackingSibling"></div>
    `,
    styles: `
        :host {
            position: relative;
            display: inline-block;
        }

        .e2e-scrollbar {
            width: 200px;
            height: 200px;
            overflow: auto;
        }

        /* Higher than any historical track z-index, to prove the track no longer competes on numbers. */
        .e2e-sticky-header {
            position: sticky;
            top: 0;
            z-index: 100;
            height: 40px;
            background-color: var(--kbq-background-bg-secondary);
        }

        .e2e-content {
            width: 100%;
            height: 800px;
        }

        /* Page-level layer after the viewport: the track must not paint above it. */
        .e2e-sibling {
            position: absolute;
            top: 120px;
            right: 0;
            z-index: 1;
            width: 40px;
            height: 40px;
            background-color: var(--kbq-background-bg-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eScrollbarStacking'
    }
})
export class E2eScrollbarStacking {}

@Component({
    selector: 'e2e-scrollbar-non-scrollable-overflow',
    imports: [KbqScrollbarViewport],
    template: `
        <div
            kbqScrollbarViewport
            kbqScrollbarMode="always"
            class="e2e-viewport e2e-viewport_auto"
            data-testid="e2eScrollbarOverflowAuto"
        >
            <div class="e2e-viewport__content">auto</div>
        </div>

        <div
            kbqScrollbarViewport
            kbqScrollbarMode="always"
            class="e2e-viewport e2e-viewport_hidden"
            data-testid="e2eScrollbarOverflowHidden"
        >
            <div class="e2e-viewport__content">hidden</div>
        </div>

        <div
            kbqScrollbarViewport
            kbqScrollbarMode="always"
            class="e2e-viewport e2e-viewport_hidden-x"
            data-testid="e2eScrollbarOverflowHiddenX"
        >
            <div class="e2e-viewport__content">hidden-x</div>
        </div>
    `,
    styles: `
        :host {
            display: inline-flex;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xs);
        }

        .e2e-viewport {
            width: 125px;
            height: 125px;
            background-color: var(--kbq-background-bg-secondary);
        }

        .e2e-viewport_auto {
            overflow: auto;
        }

        /* overflow hidden keeps the element scrollable from script while the browser paints no
           scrollbar — the state the custom track has to refuse to offer. */
        .e2e-viewport_hidden {
            overflow: hidden;
        }

        .e2e-viewport_hidden-x {
            overflow-x: hidden;
            overflow-y: auto;
        }

        /* Overflows both axes in every case above, so an absent bar is never absent for want of content. */
        .e2e-viewport__content {
            width: 250px;
            height: 250px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eScrollbarNonScrollableOverflow'
    }
})
export class E2eScrollbarNonScrollableOverflow {}
