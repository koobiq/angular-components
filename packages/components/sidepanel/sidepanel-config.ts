import { InjectionToken } from '@angular/core';

/** Injection token that can be used to access the data that was passed in to a sidepanel. */
export const KBQ_SIDEPANEL_DATA = new InjectionToken<any>('KbqSidepanelData');

export enum KbqSidepanelPosition {
    Right = 'right',
    Left = 'left',
    Top = 'top',
    Bottom = 'bottom'
}

export enum KbqSidepanelSize {
    Small = 'small',
    Medium = 'medium',
    Large = 'large'
}

export class KbqSidepanelConfig<D = any> {
    /** ID for the sidepanel. If omitted, a unique one will be generated. */
    id?: string;

    /** Whether the focus trap is active. */
    trapFocus?: boolean;

    /** capture focus on initialization. This option sets cdkTrapFocusAutoCapture. */
    trapFocusAutoCapture?: boolean;

    /** Data being injected into the child component. */
    data?: D | null = null;

    position?: KbqSidepanelPosition = KbqSidepanelPosition.Right;

    size?: KbqSidepanelSize = KbqSidepanelSize.Medium;

    /** Whether the sidepanel has a backdrop. */
    hasBackdrop?: boolean = true;

    backdropClass?: string;

    /**
     * When we open multiple sidepanels, backdrop appears only once, except cases then this flag is true.
     * @deprecated used single shared backdrop instead.
     */
    requiredBackdrop?: boolean = false;

    /** Whether the user can use escape or clicking outside to close the sidepanel. */
    disableClose?: boolean = false;

    /** Custom class for the overlay pane. */
    overlayPanelClass?: string | string[] = '';
}
