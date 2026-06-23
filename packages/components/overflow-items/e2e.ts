import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqFlexWrap } from '@koobiq/components/core';
import { KbqOverflowItemsModule } from './module';

type HorizontalScenario = {
    testid: string;
    containerWidth: number;
    containerPadding: number;
    containerMaxHeight: number;
    itemWidth: number;
    itemHeight: number | null;
    itemMarginRight: number;
    itemMarginLeft: number;
    resultWidth: number;
    resultHeight: number | null;
    justifyContent: 'start' | 'end';
    flexWrap: KbqFlexWrap;
    reverseOverflowOrder: boolean;
    debounceTime: number;
};

type VerticalScenario = {
    testid: string;
    containerHeight: number;
    containerPadding: number;
    containerMaxWidth: number | null;
    itemHeight: number;
    itemWidth: number | null;
    itemMarginBottom: number;
    resultHeight: number;
    resultWidth: number | null;
    flexWrap: KbqFlexWrap;
    reverseOverflowOrder: boolean;
};

type OrderedScenario = {
    testid: string;
    containerWidth: number;
    reverseOverflowOrder: boolean;
    lastItemOrder: number;
};

const HORIZONTAL_DEFAULTS: Omit<HorizontalScenario, 'testid'> = {
    containerWidth: 500,
    containerPadding: 0,
    containerMaxHeight: 24,
    itemWidth: 50,
    itemHeight: null,
    itemMarginRight: 0,
    itemMarginLeft: 0,
    resultWidth: 100,
    resultHeight: null,
    justifyContent: 'start',
    flexWrap: 'nowrap',
    reverseOverflowOrder: false,
    debounceTime: 0
};

const VERTICAL_DEFAULTS: Omit<VerticalScenario, 'testid'> = {
    containerHeight: 500,
    containerPadding: 0,
    containerMaxWidth: null,
    itemHeight: 50,
    itemWidth: null,
    itemMarginBottom: 0,
    resultHeight: 50,
    resultWidth: null,
    flexWrap: 'nowrap',
    reverseOverflowOrder: false
};

function scenarioH(testid: string, overrides: Partial<HorizontalScenario> = {}): HorizontalScenario {
    return { ...HORIZONTAL_DEFAULTS, ...overrides, testid };
}

function scenarioV(testid: string, overrides: Partial<VerticalScenario> = {}): VerticalScenario {
    return { ...VERTICAL_DEFAULTS, ...overrides, testid };
}

@Component({
    selector: 'e2e-overflow-items-horizontal',
    imports: [KbqOverflowItemsModule],
    template: `
        @for (s of scenarios; track s.testid) {
            <div [attr.data-testid]="s.testid">
                <div
                    #ref="kbqOverflowItems"
                    kbqOverflowItems
                    [style.width.px]="s.containerWidth"
                    [style.max-height.px]="s.containerMaxHeight"
                    [style.padding.px]="s.containerPadding"
                    [style.justify-content]="s.justifyContent"
                    [style.box-sizing]="'border-box'"
                    [reverseOverflowOrder]="s.reverseOverflowOrder"
                    [wrap]="s.flexWrap"
                    [debounceTime]="s.debounceTime"
                >
                    <div
                        kbqOverflowItemsResult
                        [style.width.px]="s.resultWidth"
                        [style.height.px]="s.resultHeight"
                        [style.flex-shrink]="0"
                    >
                        and {{ ref.hiddenItemIDs().size }} more
                    </div>
                    @for (item of items; track item.id) {
                        <div
                            [kbqOverflowItem]="item.id"
                            [alwaysVisible]="item.alwaysVisible"
                            [style.width.px]="s.itemWidth"
                            [style.height.px]="s.itemHeight"
                            [style.flex-shrink]="0"
                            [style.margin-right.px]="s.itemMarginRight"
                            [style.margin-left.px]="s.itemMarginLeft"
                        >
                            {{ item.id }}
                        </div>
                    }
                </div>
            </div>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { 'data-testid': 'e2eOverflowItemsHorizontal' }
})
export class E2eOverflowItemsHorizontal {
    protected readonly items = Array.from({ length: 20 }, (_, i) => ({ id: `Item${i}`, alwaysVisible: i === 7 }));

    protected readonly scenarios: HorizontalScenario[] = [
        scenarioH('overflowItems_default'),
        scenarioH('overflowItems_padding', { containerPadding: 25 }),
        scenarioH('overflowItems_marginRight', { itemMarginRight: 10 }),
        scenarioH('overflowItems_wrapFit', { flexWrap: 'wrap', containerMaxHeight: 100 }),
        scenarioH('overflowItems_wrapNotFit', {
            flexWrap: 'wrap',
            containerMaxHeight: 70,
            itemMarginRight: 10,
            itemHeight: 30,
            resultHeight: 30
        }),
        scenarioH('overflowItems_justifyEnd', { justifyContent: 'end' }),
        scenarioH('overflowItems_widthChanged', { containerWidth: 600 }),
        scenarioH('overflowItems_widthChangedJustifyEnd', { containerWidth: 600, justifyContent: 'end' }),
        scenarioH('overflowItems_resultHidden', { containerWidth: 1000 }),
        scenarioH('overflowItems_resultHiddenJustifyEnd', { containerWidth: 1000, justifyContent: 'end' }),
        scenarioH('overflowItems_reverseOrder', { reverseOverflowOrder: true }),
        scenarioH('overflowItems_reverseOrderJustifyEnd', { reverseOverflowOrder: true, justifyContent: 'end' }),
        scenarioH('overflowItems_alwaysVisible', { containerWidth: 250 }),
        scenarioH('overflowItems_alwaysVisibleNoSpace', { containerWidth: 49 }),
        scenarioH('overflowItems_alwaysVisibleReverse', { containerWidth: 200, reverseOverflowOrder: true }),
        scenarioH('overflowItems_marginLeft', { itemMarginLeft: 10 }),
        scenarioH('overflowItems_debounceResize', { debounceTime: 700 })
    ];
}

@Component({
    selector: 'e2e-overflow-items-additional-targets',
    imports: [KbqOverflowItemsModule],
    template: `
        <button data-testid="overflowItemsAdditionalTargets_toggle" (click)="toggle()">Toggle</button>

        <div #target data-testid="overflowItemsAdditionalTargets_target" [style.width.px]="targetWidth"></div>

        <div
            #ref="kbqOverflowItems"
            kbqOverflowItems
            data-testid="overflowItemsAdditionalTargets_block"
            [style.width.px]="containerWidth"
            [additionalResizeObserverTargets]="target"
        >
            <div kbqOverflowItemsResult [style.width.px]="resultWidth" [style.flex-shrink]="0">
                and {{ ref.hiddenItemIDs().size }} more
            </div>
            @for (item of items; track item.id) {
                <div [kbqOverflowItem]="item.id" [style.width.px]="itemWidth" [style.flex-shrink]="0">
                    {{ item.id }}
                </div>
            }
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-s);
        }

        [data-testid='overflowItemsAdditionalTargets_target'] {
            height: 8px;
            overflow: hidden;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { 'data-testid': 'e2eOverflowItemsAdditionalTargets' }
})
export class E2eOverflowItemsAdditionalTargets {
    protected readonly items = Array.from({ length: 20 }, (_, i) => ({ id: `Item${i}` }));

    protected readonly containerWidth = 500;
    protected readonly itemWidth = 50;
    protected targetWidth = 50;
    protected resultWidth = 50;

    protected toggle(): void {
        this.targetWidth = this.targetWidth === 50 ? 200 : 50;
        this.resultWidth = this.targetWidth;
    }
}

@Component({
    selector: 'e2e-overflow-items-vertical',
    imports: [KbqOverflowItemsModule],
    template: `
        @for (s of scenarios; track s.testid) {
            <div [attr.data-testid]="s.testid">
                <div
                    #ref="kbqOverflowItems"
                    kbqOverflowItems
                    orientation="vertical"
                    [style.height.px]="s.containerHeight"
                    [style.max-width.px]="s.containerMaxWidth"
                    [style.padding.px]="s.containerPadding"
                    [style.box-sizing]="'border-box'"
                    [reverseOverflowOrder]="s.reverseOverflowOrder"
                    [wrap]="s.flexWrap"
                >
                    @for (item of items; track item.id) {
                        <div
                            [kbqOverflowItem]="item.id"
                            [alwaysVisible]="item.alwaysVisible"
                            [style.height.px]="s.itemHeight"
                            [style.width.px]="s.itemWidth"
                            [style.flex-shrink]="0"
                            [style.margin-bottom.px]="s.itemMarginBottom"
                        >
                            {{ item.id }}
                        </div>
                    }
                    <div
                        kbqOverflowItemsResult
                        [style.height.px]="s.resultHeight"
                        [style.width.px]="s.resultWidth"
                        [style.flex-shrink]="0"
                    >
                        and {{ ref.hiddenItemIDs().size }} more
                    </div>
                </div>
            </div>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: row;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-s);
            flex-wrap: wrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { 'data-testid': 'e2eOverflowItemsVertical' }
})
export class E2eOverflowItemsVertical {
    protected readonly items = Array.from({ length: 20 }, (_, i) => ({ id: `Item${i}`, alwaysVisible: i === 7 }));

    protected readonly scenarios: VerticalScenario[] = [
        scenarioV('overflowItemsVertical_default'),
        scenarioV('overflowItemsVertical_padding', { containerPadding: 25 }),
        scenarioV('overflowItemsVertical_marginBottom', { itemMarginBottom: 10 }),
        scenarioV('overflowItemsVertical_wrapFit', { flexWrap: 'wrap', containerMaxWidth: 100, itemWidth: 50 }),
        scenarioV('overflowItemsVertical_wrapNotFit', {
            flexWrap: 'wrap',
            containerMaxWidth: 122,
            itemWidth: 50,
            itemMarginBottom: 10,
            resultWidth: 50
        }),
        scenarioV('overflowItemsVertical_heightChanged', { containerHeight: 600 }),
        scenarioV('overflowItemsVertical_reverseOrder', { reverseOverflowOrder: true }),
        scenarioV('overflowItemsVertical_alwaysVisible', { containerHeight: 200 }),
        scenarioV('overflowItemsVertical_alwaysVisibleNoSpace', { containerHeight: 49 }),
        scenarioV('overflowItemsVertical_alwaysVisibleReverse', { containerHeight: 150, reverseOverflowOrder: true })
    ];
}

@Component({
    selector: 'e2e-overflow-items-ordered',
    imports: [KbqOverflowItemsModule],
    template: `
        @for (s of scenarios; track s.testid) {
            <div [attr.data-testid]="s.testid">
                <div
                    #ref="kbqOverflowItems"
                    kbqOverflowItems
                    [style.width.px]="s.containerWidth"
                    [reverseOverflowOrder]="s.reverseOverflowOrder"
                >
                    @for (item of orderedItems; track $index; let i = $index) {
                        @let isLastHiddenItem = i === lastHiddenItemIndex;

                        <div
                            [kbqOverflowItem]="item"
                            [style.width.px]="itemWidth"
                            [style.flex-shrink]="0"
                            [order]="isLastHiddenItem ? s.lastItemOrder : i"
                        >
                            {{ item }}
                        </div>
                    }
                    <div kbqOverflowItemsResult [style.width.px]="resultWidth" [style.flex-shrink]="0">
                        and {{ ref.hiddenItemIDs().size }} more
                    </div>
                </div>
            </div>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { 'data-testid': 'e2eOverflowItemsOrdered' }
})
export class E2eOverflowItemsOrdered {
    protected readonly orderedItems = Array.from({ length: 20 }, (_, i) => `Item${i}`);
    protected readonly itemWidth = 50;
    protected readonly resultWidth = 100;
    protected readonly lastHiddenItemIndex = 5;

    protected readonly scenarios: OrderedScenario[] = [
        {
            testid: 'overflowItemsOrdered_byOrder',
            containerWidth: 200,
            reverseOverflowOrder: false,
            lastItemOrder: -Infinity
        },
        {
            testid: 'overflowItemsOrdered_byOrderReverse',
            containerWidth: 200,
            reverseOverflowOrder: true,
            lastItemOrder: +Infinity
        },
        {
            testid: 'overflowItemsOrdered_noSpace',
            containerWidth: 49,
            reverseOverflowOrder: false,
            lastItemOrder: -Infinity
        }
    ];
}

@Component({
    selector: 'e2e-overflow-items-dynamic',
    imports: [KbqOverflowItemsModule],
    template: `
        <button data-testid="overflowItemsDynamic_addItem" (click)="addItem()">Add item</button>
        <button data-testid="overflowItemsDynamic_removeItem" (click)="removeItem()">Remove item</button>

        <div
            #ref="kbqOverflowItems"
            kbqOverflowItems
            data-testid="overflowItemsDynamic_block"
            [style.width.px]="containerWidth"
        >
            <div kbqOverflowItemsResult [style.width.px]="resultWidth" [style.flex-shrink]="0">
                and {{ ref.hiddenItemIDs().size }} more
            </div>
            @for (item of items(); track item) {
                <div [kbqOverflowItem]="item" [style.width.px]="itemWidth" [style.flex-shrink]="0">
                    {{ item }}
                </div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { 'data-testid': 'e2eOverflowItemsDynamic' }
})
export class E2eOverflowItemsDynamic {
    protected readonly containerWidth = 100;
    protected readonly itemWidth = 50;
    protected readonly resultWidth = 50;
    protected readonly items = signal(Array.from({ length: 4 }, (_, i) => `Item${i}`));

    protected addItem(): void {
        this.items.update((items) => [...items, `Item${items.length}`]);
    }

    protected removeItem(): void {
        this.items.update((items) => items.slice(0, -1));
    }
}
