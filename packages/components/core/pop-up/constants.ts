import { InjectionToken, Provider, Type } from '@angular/core';
import { TooltipSizeArrowSize } from '@koobiq/design-tokens';
import { Observable } from 'rxjs';
import { KbqEnumValues } from '../utils';

export interface KbqParentPopup {
    closedStream: Observable<boolean>;
}

/**
 * InjectionToken for providing component with popup. Used in select and tree-select for tooltip.
 */
export const KBQ_PARENT_POPUP = new InjectionToken<KbqParentPopup>('kbq-parent-popup');

/**
 * Contract of a pop-up anchored to the same element as a tooltip — a popover, a dropdown, a select and so on.
 *
 * A tooltip sharing its host with such a pop-up mutes itself while the pop-up is on screen, so the two never
 * compete for the same anchor and the focus restored by the closing pop-up does not re-open the tooltip.
 */
export interface KbqSiblingPopup {
    /**
     * Whether the pop-up overlay is currently attached. Unlike a visibility flag it must flip synchronously,
     * both when the overlay is attached and when it is detached.
     */
    readonly isAttached: boolean;
    /** Emits `true` when the pop-up opens and `false` when it closes. */
    readonly openedChange: Observable<boolean>;
}

/**
 * Element-level token for pop-ups sharing their trigger element with a tooltip. Multi-provided, so a single
 * element can carry several pop-ups at once — for example the filter-bar button with both a popover and a
 * dropdown attached to it.
 */
export const KBQ_SIBLING_POPUP = new InjectionToken<readonly KbqSiblingPopup[]>('kbq-sibling-popup');

/**
 * Builds the multi-provider entry a pop-up trigger adds to its own `providers` to announce itself to a
 * tooltip on the same element.
 *
 * Every concrete trigger has to add it on its own: Angular copies `providers` to a subclass only when that
 * subclass has no decorator of its own, so inheriting from an already-announced trigger is not enough.
 */
export const kbqSiblingPopupProvider = (popup: Type<KbqSiblingPopup>): Provider => ({
    provide: KBQ_SIBLING_POPUP,
    useExisting: popup,
    multi: true
});

export enum PopUpPlacements {
    Top = 'top',
    TopLeft = 'topLeft',
    TopRight = 'topRight',
    Right = 'right',
    RightTop = 'rightTop',
    RightBottom = 'rightBottom',
    Left = 'left',
    LeftTop = 'leftTop',
    LeftBottom = 'leftBottom',
    Bottom = 'bottom',
    BottomLeft = 'bottomLeft',
    BottomRight = 'bottomRight'
}

export type KbqPopUpPlacementValues = KbqEnumValues<PopUpPlacements>;

export type KbqStickToWindowPlacementValues = KbqEnumValues<
    PopUpPlacements.Top | PopUpPlacements.Right | PopUpPlacements.Bottom | PopUpPlacements.Left
>;

export enum PopUpVisibility {
    Initial = 'initial',
    Visible = 'visible',
    Hidden = 'hidden'
}

export enum PopUpTriggers {
    Click = 'click',
    Focus = 'focus',
    Hover = 'hover',
    Keydown = 'keydown',
    Program = 'program'
}

export enum PopUpSizes {
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
    Custom = 'custom'
}

export type KbqPopUpSizeValues = KbqEnumValues<PopUpSizes>;

/**
 * Default value when configuring overlay in popups (Autocomplete, Datepicker, Dropdown, Select, Tags Autocomplete,
 * Tags Input, Timezone, TreeSelect).
 */
export const defaultOffsetY: number = 4;

/**
 * Pane class applied to a connected overlay whose panel is positioned BELOW its trigger.
 *
 * Used instead of a physical `offsetY` gap: the pane sits flush with the trigger and the visual gap is
 * recreated as transparent `padding-top` inside the pane (see the `kbq-connected-overlay-gap` styles), so the
 * gap is covered by the pane (`pointer-events: auto`) and can no longer be clicked/hovered through.
 */
export const KBQ_CONNECTED_OVERLAY_BELOW_CLASS = 'kbq-connected-overlay_below';

/**
 * Pane class applied to a connected overlay whose panel is positioned ABOVE its trigger (flipped).
 *
 * Mirror of {@link KBQ_CONNECTED_OVERLAY_BELOW_CLASS}: the visual gap is recreated as transparent
 * `padding-bottom` inside the pane so the flipped gap is not click/hover-through.
 */
export const KBQ_CONNECTED_OVERLAY_ABOVE_CLASS = 'kbq-connected-overlay_above';

/**
 * Pane class applied to a connected overlay whose panel is anchored to the FIRST ROW of a trigger it
 * OVERLAPS — a multiline select whose tag rows have made it taller than the panel itself, with too little
 * room to open on either side of it.
 *
 * The panel ends up where it would for a single-row trigger, so the gap is the same transparent
 * `padding-top` as {@link KBQ_CONNECTED_OVERLAY_BELOW_CLASS}. It is a separate class because the room left
 * for the panel has to be measured from the first row rather than from the trigger's bottom edge, and the
 * class is how the component tells the two apart.
 */
export const KBQ_CONNECTED_OVERLAY_OVERLAP_CLASS = 'kbq-connected-overlay_overlap';

/**
 * Variable used for offsetY(X) calculations when applying Angular Overlay
 *
 * @docs-private
 */
export const ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT = Math.round(parseInt(TooltipSizeArrowSize) * Math.sqrt(2));
