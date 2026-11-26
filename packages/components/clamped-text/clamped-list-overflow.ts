import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    computed,
    effect,
    EnvironmentInjector,
    inject,
    isDevMode,
    Renderer2,
    type Signal,
    signal,
    untracked
} from '@angular/core';
import { map, Observable } from 'rxjs';
import {
    KBQ_WINDOW,
    type KbqFlexWrap,
    type KbqOrientation,
    KbqOverflowFitEngine,
    kbqOverflowRecalculationTriggers
} from '@koobiq/components/core';
import type { KbqOverflowItem, KbqOverflowItemsResult } from '@koobiq/components/overflow-items';
import type { KbqClampedListMode } from './constants';

/**
 * What the Clamped List hands to its Overflow-based Collapse controller.
 *
 * @docs-private
 */
export interface KbqClampedListOverflowOptions {
    /** The Clamped List host element. */
    host: HTMLElement;
    /** Overflow Items directives of the list, in DOM order. */
    itemDirectives: Signal<readonly KbqOverflowItem[]>;
    /** Overflow Items result directive projected next to the items. */
    result: Signal<KbqOverflowItemsResult | undefined>;
    /** Data items of the list. */
    items: Signal<readonly unknown[]>;
    /** What the hidden set depends on besides the geometry: data items, item ids, result, layout and collapse state. */
    dependencies: Signal<readonly unknown[]>;
    mode: Signal<KbqClampedListMode>;
    orientation: Signal<KbqOrientation>;
    wrap: Signal<KbqFlexWrap>;
    hiddenThreshold: Signal<number>;
    hasToggle: () => boolean;
    visibleMap: () => readonly boolean[];
}

/**
 * Internal boundary between the Clamped List and its Overflow-based Collapse measurement.
 * Consumed by later measurement tasks without renaming.
 *
 * @docs-private
 */
export interface KbqClampedListOverflowController {
    /**
     * Indices of the items hidden by the measurement. `null` in Count-based Collapse and before the
     * first measurement: the list falls back to Count-based Collapse visibility then.
     */
    readonly hiddenItemIDs: Signal<ReadonlySet<number> | null>;
    /** Re-runs the measurement and applies the resulting visibility. */
    recalculate(): void;
    /** Applies the current visibility map to the Overflow Items directives. */
    applyVisibility(): void;
}

/**
 * Host layout styles the measurement needs, the same set the Overflow Items directive applies to its own host.
 */
const OVERFLOW_LAYOUT_STYLES = ['position', 'overflow', 'display', 'flex-grow', 'flex-direction', 'flex-wrap'] as const;

type OverflowLayoutStyle = (typeof OVERFLOW_LAYOUT_STYLES)[number];

/**
 * Creates the Overflow-based Collapse controller of a Clamped List.
 *
 * @docs-private
 */
export function kbqInjectClampedListOverflow(options: KbqClampedListOverflowOptions): KbqClampedListOverflowController {
    const environmentInjector = inject(EnvironmentInjector);
    const renderer = inject(Renderer2);
    const engine = new KbqOverflowFitEngine(inject(KBQ_WINDOW));
    const hiddenItemIDs = signal<ReadonlySet<number> | null>(null);

    let invalidItemsWarned = false;

    /** Inline values replaced by the current overflow layout cycle, restored when overflow mode switches off. */
    let originalStyles: Record<OverflowLayoutStyle, string> | null = null;

    const captureOriginalStyles = () => {
        originalStyles ??= Object.fromEntries(
            OVERFLOW_LAYOUT_STYLES.map((style) => [style, options.host.style.getPropertyValue(style)])
        ) as Record<OverflowLayoutStyle, string>;
    };

    /** Lays the host out the way the measurement reads it, as the Overflow Items directive lays out its own host. */
    const applyOverflowStyles = () => {
        captureOriginalStyles();

        renderer.setStyle(options.host, 'position', 'relative');
        renderer.setStyle(options.host, 'overflow', 'hidden');
        renderer.setStyle(options.host, 'display', 'flex');
        renderer.setStyle(options.host, 'flex-grow', '1');
        renderer.setStyle(
            options.host,
            'flex-direction',
            engine.orientationConfig[options.orientation()].flexDirection
        );
        renderer.setStyle(options.host, 'flex-wrap', options.wrap());
    };

    /** Returns the consumer styles the current overflow application replaced, then rearms capture for the next cycle. */
    const restoreOriginalStyles = () => {
        const captured = originalStyles;

        if (!captured) return;

        OVERFLOW_LAYOUT_STYLES.forEach((style) => {
            if (captured[style]) renderer.setStyle(options.host, style, captured[style]);
            else renderer.removeStyle(options.host, style);
        });
        originalStyles = null;
    };

    const applyVisibility = () => {
        const visibleMap = options.visibleMap();

        options.itemDirectives().forEach((item, index) => {
            if (visibleMap[index] === false) item.hide();
            else item.show();
        });

        const result = options.result();

        if (options.hasToggle()) result?.show();
        else result?.hide();
    };

    const recalculate = () => {
        const itemDirectives = options.itemDirectives();
        const ids = itemDirectives.map((item) => item.id());
        const valid = itemDirectives.length === options.items().length && ids.every((id, index) => id === index);

        if (options.mode() === 'count') {
            restoreOriginalStyles();
            hiddenItemIDs.set(null);
            applyVisibility();

            return;
        }

        if (!valid) {
            if (isDevMode() && !invalidItemsWarned) {
                invalidItemsWarned = true;
                // eslint-disable-next-line no-console
                console.warn(
                    'KbqClampedList: overflow mode requires one [kbqOverflowItem]="index" per item, with unique indices from 0 to items.length - 1. Count-based Collapse is used instead.'
                );
            }

            restoreOriginalStyles();
            hiddenItemIDs.set(null);
            applyVisibility();

            return;
        }

        invalidItemsWarned = false;
        applyOverflowStyles();

        engine.showAll(itemDirectives, options.result());
        const subject = engine.containerSubject(options.host, options.orientation(), options.wrap());
        const hidden = engine.hideOverflownItems(
            [...itemDirectives].reverse(),
            subject,
            options.result(),
            options.wrap()
        );
        const hiddenIDs = new Set(
            itemDirectives.filter((item) => hidden.includes(item)).map((item) => item.id() as number)
        );

        hiddenItemIDs.set(hiddenIDs.size >= options.hiddenThreshold() ? hiddenIDs : new Set());
        applyVisibility();
    };

    const controller: KbqClampedListOverflowController = {
        hiddenItemIDs: hiddenItemIDs.asReadonly(),
        recalculate,
        applyVisibility
    };

    /**
     * Emits when `dependencies` changes. The effect runs on the environment injector, not on the list's node
     * injector: a view effect is flushed in the middle of refreshing the host view, before the item views an
     * `@for` recreates receive their `[kbqOverflowItem]` inputs, and the item ids the dependency tuple reads
     * would throw NG0950 while the query already returns the half-initialized directives. Root effects flush
     * before change detection, when the query still holds the previous, fully initialized items. The watcher is
     * destroyed on unsubscribe: the environment injector outlives the list, so `toObservable`'s own cleanup,
     * tied to the injector's `DestroyRef`, would leak it.
     */
    const dependencies$ = new Observable<void>((observer) => {
        const watcher = effect(
            () => {
                try {
                    options.dependencies();
                } catch (error) {
                    untracked(() => observer.error(error));

                    return;
                }

                untracked(() => observer.next(undefined));
            },
            { injector: environmentInjector, manualCleanup: true }
        );

        return () => watcher.destroy();
    });

    const document = inject(DOCUMENT);
    const resizeTargets = computed(() => {
        const result = options.mode() === 'overflow' ? options.result() : undefined;

        // An auto-width result changes size after its hidden-count label or locale changes. Observing the current
        // element stabilizes the measurement without an effect loop and follows conditional result creation.
        return result ? [document.body!, result.element] : document.body!;
    });

    const triggers = kbqOverflowRecalculationTriggers({
        element: options.host,
        additionalTargets: resizeTargets,
        debounceTime: signal(0),
        // Subscribed after the first render: the initial emission of `options.dependencies` reads the item inputs,
        // which are not set yet while the controller is constructed.
        extra: [dependencies$.pipe(map(() => undefined))]
    });

    afterNextRender(() => {
        controller.recalculate();
        // Subscribed after the first render: the initial emission of `options.dependencies` reads the item inputs,
        // which are not set yet while the controller is constructed.
        triggers.subscribe(() => controller.recalculate());
    });

    return controller;
}
