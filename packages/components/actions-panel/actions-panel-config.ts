import { Direction } from '@angular/cdk/bidi';
import { Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { ElementRef, InjectionToken, Injector, Provider } from '@angular/core';

/** Injection token that can be used to specify default actions panel config. */
export const KBQ_ACTIONS_PANEL_DEFAULT_CONFIG = new InjectionToken<KbqActionsPanelConfig>(
    'KBQ_ACTIONS_PANEL_DEFAULT_CONFIG',
    { factory: () => new KbqActionsPanelConfig() }
);

/**
 * Utility for providing default actions panel config.
 *
 * @see `KBQ_ACTIONS_PANEL_DEFAULT_CONFIG`
 */
export const kbqActionsPanelDefaultConfigProvider = <D>(config: KbqActionsPanelConfig<D>): Provider => ({
    provide: KBQ_ACTIONS_PANEL_DEFAULT_CONFIG,
    useValue: config
});

/**
 * Configuration for opened actions panel.
 * Based on cdk `DialogConfig`.
 *
 * @see `DialogConfig`
 *
 */
export class KbqActionsPanelConfig<D = unknown> {
    /**
     * Injector used for the instantiation of the component to be attached.
     */
    injector?: Injector;

    /**
     * Data being injected into the child component.
     *
     * @see `KBQ_ACTIONS_PANEL_DATA`
     */
    data?: D | null = null;

    /** Extra CSS classes to be added to the actions panel container. */
    containerClass?: string | string[];

    /**
     * Whether the actions panel should be closed of when the user goes backwards/forwards in history.
     * NOTE! This does not apply to router navigation.
     *
     * @default true
     */
    closeOnNavigation?: boolean = true;

    /**
     * Element in which the actions panel overlay will be connected to.
     */
    overlayContainer?: ElementRef<HTMLElement>;

    /**
     * Extra CSS classes to be added to the overlay panel.
     */
    overlayPanelClass?: string | string[];

    /**
     * Width of the actions panel.
     */
    width?: string;

    /**
     * Min-width of the actions panel.
     * If a number is provided, assumes pixel units.
     */
    minWidth?: number | string;

    /**
     * Max-width of the actions panel.
     * If a number is provided, assumes pixel units.
     */
    maxWidth?: number | string;

    /**
     * Direction of the text in the actions panel.
     *
     * @default 'ltr'
     */
    direction?: Direction = 'ltr';

    /**
     * Scroll strategy to be used for the actions panel.
     *
     * @default `RepositionScrollStrategy`
     */
    scrollStrategy?: (overlay: Overlay) => ScrollStrategy = (overlay) => overlay.scrollStrategies.reposition();

    /**
     * Whether the user can use ESC or click on close button to close the actions panel.
     *
     * @default false
     */
    disableClose?: boolean = false;
}
