import { inject, Injectable, Renderer2 } from '@angular/core';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { SizeXxs as SelectSizeMultipleContentGap } from '@koobiq/design-tokens';

/** Class that reveals the "+N" counter the matcher reserves room for. */
export const KBQ_SELECT_HIDDEN_TEXT_VISIBLE_CLASS = 'kbq-select__match-hidden-text_visible';

/** Widths the matcher needs in order to work out how many of the selected tags actually fit. */
export type KbqSelectMatcherMeasurement = {
    /** Total width of the selected tags, laid out without the "+N" counter. */
    totalItemsWidth: number;
    /** Total width of the tags that stay on the first line while the counter is shown. */
    totalVisibleItemsWidth: number;
    /** How many tags stay on the first line while the counter is shown. */
    visibleItems: number;
};

/**
 * Measures how much room the selected values take in a multiple select's trigger.
 *
 * Provided by the select rather than injected globally: it writes into (and reads back from) that
 * select's own trigger element. Kept apart from the component because it is pure DOM geometry with no
 * bearing on the select's state — and because the two measurements it makes have to share a single
 * layout pass, which is easy to lose sight of when they live among the component's other concerns.
 * @docs-private
 */
@Injectable()
export class KbqSelectHiddenItemsMeasurer {
    private readonly renderer = inject(Renderer2);
    private readonly window = inject(KBQ_WINDOW);

    /**
     * Measures the trigger against two layouts: one without the "+N" counter and one with it.
     *
     * Both clones are attached before either is read, so the browser resolves layout once for the pair
     * instead of once per clone.
     * @param trigger Trigger element of the select, used both as the source of the clones and as their host.
     */
    measure(trigger: HTMLElement): KbqSelectMatcherMeasurement {
        const withoutCounter = this.buildTriggerClone(trigger);
        const withCounter = this.buildTriggerClone(trigger);

        withoutCounter.querySelector('.kbq-select__match-hidden-text')?.remove();

        const counter = withCounter.querySelector('.kbq-select__match-hidden-text');

        if (counter) {
            this.renderer.addClass(counter, KBQ_SELECT_HIDDEN_TEXT_VISIBLE_CLASS);
        }

        this.renderer.appendChild(trigger, withoutCounter);
        this.renderer.appendChild(trigger, withCounter);

        let totalItemsWidth = 0;
        let totalVisibleItemsWidth = 0;
        let visibleItems = 0;

        withoutCounter.querySelectorAll<HTMLElement>('kbq-tag').forEach((item) => {
            totalItemsWidth += this.getItemWidth(item);
        });

        withCounter.querySelectorAll<HTMLElement>('kbq-tag').forEach((item) => {
            if (item.offsetTop < item.offsetHeight) {
                totalVisibleItemsWidth += this.getItemWidth(item);
                visibleItems++;
            }
        });

        withoutCounter.remove();
        withCounter.remove();

        return { totalItemsWidth, totalVisibleItemsWidth, visibleItems };
    }

    /**
     * Calculates the width of a single item including margins.
     *
     * The elements measured here are `kbq-tag`s, which are `border-box` and carry horizontal
     * padding. `getComputedStyle().width` resolves to the used content-box width whatever
     * `box-sizing` says, so it dropped that padding from every tag and the matcher believed more
     * tags fit than actually do. `getBoundingClientRect()` is always the border box — the same fix
     * `kbqGetPanelWidthOrigin()` carries.
     */
    private getItemWidth(element: HTMLElement): number {
        const { marginLeft, marginRight } = this.window.getComputedStyle(element);

        return (
            element.getBoundingClientRect().width +
            (parseFloat(marginLeft) || 0) +
            (parseFloat(marginRight) || 0) +
            parseInt(SelectSizeMultipleContentGap)
        );
    }

    /** Creates a hidden clone of the trigger element, positioned so that it cannot affect the layout. */
    private buildTriggerClone(trigger: HTMLElement): HTMLElement {
        const triggerClone = trigger.cloneNode(true) as HTMLElement;

        this.renderer.setStyle(triggerClone, 'position', 'absolute');
        this.renderer.setStyle(triggerClone, 'visibility', 'hidden');
        this.renderer.setStyle(triggerClone, 'top', '-100%');
        this.renderer.setStyle(triggerClone, 'left', '0');
        this.renderer.setStyle(triggerClone, 'max-width', '100%');

        return triggerClone;
    }
}
