import { InjectionToken } from '@angular/core';
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
    // Normal is deprecated and will be deleted in 16.x
    Normal = 'medium',
    Large = 'large'
}

export type KbqPopUpSizeValues = KbqEnumValues<PopUpSizes>;

/**
 * Default value when configuring overlay in popups (Autocomplete, Datepicker, Dropdown, Select, Tags Autocomplete,
 * Tags Input, Timezone, TreeSelect).
 */
export const defaultOffsetY: number = 4;

/**
 * Variable used for offsetY(X) calculations when applying Angular Overlay
 *
 * @docs-private
 */
export const ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT = Math.round(parseInt(TooltipSizeArrowSize) * Math.sqrt(2));
