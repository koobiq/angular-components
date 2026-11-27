import { afterNextRender, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { enUSLocaleData } from '@koobiq/components/core';
import { KbqLink } from '@koobiq/components/link';
import { KbqOverflowItem, KbqOverflowItemsResult } from '@koobiq/components/overflow-items';
import { KbqClampedList, KbqClampedListTrigger } from './clamped-list';
import { KbqClampedText } from './clamped-text';
import { kbqClampedTextDefaultMaxRows, kbqClampedTextLocaleConfigurationProvider } from './constants';

const text =
    'In a distributed denial-of-service attack (DDoS attack), the incoming traffic flooding the victim originates from many different sources. More sophisticated strategies are required to mitigate this type of attack; simply attempting to block a single source is insufficient as there are multiple sources. A DoS or DDoS attack is analogous to a group of people crowding the entry door of a shop, making it hard for legitimate customers to enter, thus disrupting trade and losing the business money. Criminal perpetrators of DoS attacks often target sites or services hosted on high-profile web servers such as banks or credit card payment gateways. Revenge and blackmail, as well as hacktivism, can motivate these attacks.';

type ClampedTextState = {
    rows: number;
    isCollapsed?: boolean;
};

@Component({
    selector: 'e2e-clamped-text-state-and-style',
    imports: [KbqClampedText],
    template: `
        <div>
            <table data-testid="e2eClampedTextTable">
                @for (row of states(); track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td style="max-width: 300px;">
                                <kbq-clamped-text [rows]="cell.rows" [isCollapsed]="cell.isCollapsed">
                                    {{ text }}
                                </kbq-clamped-text>
                            </td>
                        }
                    </tr>
                }
            </table>
        </div>
    `,
    providers: [kbqClampedTextLocaleConfigurationProvider(enUSLocaleData.clampedText)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eClampedTextStateAndStyle'
    }
})
export class E2eClampedTextStateAndStyle {
    protected readonly text = text;
    protected readonly states = signal<ClampedTextState[][]>([
        [{ rows: kbqClampedTextDefaultMaxRows }],
        [{ rows: kbqClampedTextDefaultMaxRows }],
        [{ rows: 3 }]
    ]);

    constructor() {
        afterNextRender(() => {
            this.states.set([
                [{ isCollapsed: true, rows: kbqClampedTextDefaultMaxRows }],
                [{ isCollapsed: false, rows: kbqClampedTextDefaultMaxRows }],
                [{ rows: 3 }]
            ]);
        });
    }
}

@Component({
    selector: 'e2e-clamped-text-states',
    imports: [KbqClampedText],
    template: `
        <div data-testid="auto_collapsed" style="max-width: 200px;">
            <kbq-clamped-text [rows]="2">{{ text }}</kbq-clamped-text>
        </div>

        <div data-testid="resize_persistence" [style.max-width.px]="resizeWidth()">
            <kbq-clamped-text [rows]="2">{{ text }}</kbq-clamped-text>
        </div>
        <button data-testid="resize_persistence_widen" type="button" (click)="widen()">Widen</button>

        <div data-testid="unbreakable_token" style="max-width: 200px;">
            <kbq-clamped-text [rows]="2">{{ unbreakableToken }}</kbq-clamped-text>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-s);
        }
    `,
    providers: [kbqClampedTextLocaleConfigurationProvider(enUSLocaleData.clampedText)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eClampedTextStates'
    }
})
export class E2eClampedTextStates {
    protected readonly text = text;
    protected readonly resizeWidth = signal(200);

    /**
     * Eight 80-character words. Nothing inside a word can wrap, so each one overflows the 200px
     * container on a line of its own — enough lines to exceed `rows` and collapse, while every
     * line is wider than the box the collapsed state must not let scroll.
     */
    protected readonly unbreakableToken = Array.from({ length: 8 }, () => 'a'.repeat(80)).join(' ');

    protected widen(): void {
        this.resizeWidth.set(1000);
    }
}

/**
 * Renders `kbqClampedList` on a page with no `kbq-clamped-text`, so the trigger is shown with only
 * the styling the directive owns.
 */
@Component({
    selector: 'e2e-clamped-list',
    imports: [KbqClampedList, KbqClampedListTrigger, KbqLink],
    template: `
        <div #clampedList="kbqClampedList" class="layout-column layout-gap-xxs" kbqClampedList [items]="items">
            @for (item of clampedList.visibleItems(); track item) {
                <span>{{ item }}</span>
            }

            @if (clampedList.hasToggle()) {
                <a data-testid="e2eClampedListTrigger" kbqLink kbqClampedListTrigger pseudo>
                    @if (clampedList.isCollapsed()) {
                        {{ clampedList.showMoreCountText() }}
                    } @else {
                        {{ clampedList.localeConfiguration().closeText }}
                    }
                </a>
            }
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-s);
        }
    `,
    providers: [kbqClampedTextLocaleConfigurationProvider(enUSLocaleData.clampedText)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eClampedList'
    }
})
export class E2eClampedList {
    protected readonly items = Array.from({ length: 17 }, (_, index) => `Item ${index + 1}`);
}

/**
 * Exercises `mode="overflow"` in a real browser: fixed-size items measured against a signal-driven
 * container size, with the result directive acting as the disclosure toggle.
 */
@Component({
    selector: 'e2e-clamped-list-overflow',
    imports: [KbqClampedList, KbqClampedListTrigger, KbqOverflowItem, KbqOverflowItemsResult],
    template: `
        <div class="e2e-clamped-list-overflow__controls">
            <button data-testid="narrow" type="button" (click)="size.set(narrowSize)">Narrow</button>
            <button data-testid="widen" type="button" (click)="size.set(wideSize)">Widen</button>
            <button data-testid="replace-items" type="button" (click)="replaceItems()">Replace items</button>
            <label>
                Auto width
                <input data-testid="auto-width" type="number" [value]="autoWidth()" (input)="setAutoWidth($event)" />
            </label>
        </div>

        <div data-testid="scroll-container" class="e2e-clamped-list-overflow__scroll">
            <div class="e2e-clamped-list-overflow__spacer"></div>
            <div
                #horizontal="kbqClampedList"
                kbqClampedList
                mode="overflow"
                data-testid="overflow-horizontal"
                class="e2e-clamped-list-overflow__horizontal"
                [items]="items()"
                [style.width.px]="size()"
            >
                @for (item of horizontal.items(); track item) {
                    <span class="e2e-clamped-list-overflow__item" [kbqOverflowItem]="$index">{{ item }}</span>
                }
                @if (horizontal.hasToggle()) {
                    <span kbqClampedListTrigger kbqOverflowItemsResult class="e2e-clamped-list-overflow__item">
                        {{
                            horizontal.isCollapsed()
                                ? horizontal.showMoreCountText()
                                : horizontal.localeConfiguration().closeText
                        }}
                    </span>
                }
            </div>
            <div class="e2e-clamped-list-overflow__spacer"></div>
        </div>

        <div
            #vertical="kbqClampedList"
            kbqClampedList
            mode="overflow"
            orientation="vertical"
            data-testid="overflow-vertical"
            class="e2e-clamped-list-overflow__vertical"
            [items]="items()"
            [style.height.px]="size()"
        >
            @for (item of vertical.items(); track item) {
                <span class="e2e-clamped-list-overflow__item-vertical" [kbqOverflowItem]="$index">{{ item }}</span>
            }
            @if (vertical.hasToggle()) {
                <span kbqClampedListTrigger kbqOverflowItemsResult class="e2e-clamped-list-overflow__item-vertical">
                    {{
                        vertical.isCollapsed() ? vertical.showMoreCountText() : vertical.localeConfiguration().closeText
                    }}
                </span>
            }
        </div>

        <div
            #autoList="kbqClampedList"
            kbqClampedList
            mode="overflow"
            data-testid="overflow-auto-trigger"
            class="e2e-clamped-list-overflow__horizontal e2e-clamped-list-overflow__auto"
            [items]="autoItems"
            [style.width.px]="autoWidth()"
        >
            @for (item of autoList.items(); track item) {
                <span class="e2e-clamped-list-overflow__item" [kbqOverflowItem]="$index">{{ item }}</span>
            }
            @if (autoList.hasToggle()) {
                <span kbqClampedListTrigger kbqOverflowItemsResult class="e2e-clamped-list-overflow__auto-result">
                    {{
                        autoList.isCollapsed() ? autoList.showMoreCountText() : autoList.localeConfiguration().closeText
                    }}
                </span>
            }
        </div>

        <div
            #wrapList="kbqClampedList"
            kbqClampedList
            mode="overflow"
            wrap="wrap"
            data-testid="overflow-wrap"
            class="e2e-clamped-list-overflow__wrap"
            [style.max-height.px]="wrapList.isCollapsed() ? 48 : null"
            [items]="items()"
        >
            @for (item of wrapList.items(); track item) {
                <span class="e2e-clamped-list-overflow__item" [kbqOverflowItem]="$index">{{ item }}</span>
            }
            @if (wrapList.hasToggle()) {
                <span kbqClampedListTrigger kbqOverflowItemsResult class="e2e-clamped-list-overflow__item">
                    {{
                        wrapList.isCollapsed() ? wrapList.showMoreCountText() : wrapList.localeConfiguration().closeText
                    }}
                </span>
            }
        </div>
    `,
    styles: `
        :host {
            display: block;
        }

        .e2e-clamped-list-overflow__controls {
            display: flex;
            gap: var(--kbq-size-s);
            margin-bottom: var(--kbq-size-m);
        }

        .e2e-clamped-list-overflow__scroll {
            height: 300px;
            overflow-y: auto;
            border: 1px solid;
        }

        .e2e-clamped-list-overflow__spacer {
            height: 1000px;
        }

        .e2e-clamped-list-overflow__horizontal {
            height: 24px;
        }

        .e2e-clamped-list-overflow__vertical {
            width: 160px;
            margin-top: var(--kbq-size-m);
        }

        .e2e-clamped-list-overflow__auto {
            margin-top: var(--kbq-size-m);
        }

        .e2e-clamped-list-overflow__auto-result {
            flex-shrink: 0;
            white-space: nowrap;
        }

        .e2e-clamped-list-overflow__wrap {
            width: 400px;
            margin-top: var(--kbq-size-m);
        }

        .e2e-clamped-list-overflow__item {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 24px;
            flex-shrink: 0;
        }

        .e2e-clamped-list-overflow__item-vertical {
            width: 160px;
            height: 80px;
            flex-shrink: 0;
        }
    `,
    providers: [kbqClampedTextLocaleConfigurationProvider(enUSLocaleData.clampedText)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eClampedListOverflow'
    }
})
export class E2eClampedListOverflow {
    /** Item box is 80px on the main axis, so 30 items need 2400px plus the toggle to fully fit. */
    protected readonly narrowSize = 400;

    /** Fits all 30 items and the toggle on both the horizontal and the vertical list. */
    protected readonly wideSize = 2600;
    protected readonly size = signal(this.narrowSize);
    protected readonly items = signal(
        Array.from({ length: 30 }, (_, index) => `Item ${String(index + 1).padStart(2, '0')}`)
    );
    protected readonly autoItems = Array.from(
        { length: 20 },
        (_, index) => `Auto ${String(index + 1).padStart(2, '0')}`
    );
    protected readonly autoWidth = signal(1000);

    protected replaceItems(): void {
        this.items.set(Array.from({ length: 30 }, (_, index) => `Entry ${String(index + 1).padStart(2, '0')}`));
    }

    protected setAutoWidth(event: Event): void {
        this.autoWidth.set((event.target as HTMLInputElement).valueAsNumber);
    }
}
