import { ElementRef, InjectionToken, Provider, ViewContainerRef } from '@angular/core';

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
 * Configuration for opened a actions panel.
 */
export class KbqActionsPanelConfig<D = unknown> {
    /**
     * ViewContainerRef that used for dependency injection purposes.
     * NOTE! This does not affect where the action panel is inserted in the DOM.
     */
    viewContainerRef?: ViewContainerRef;

    /**
     * Data being injected into the child component.
     *
     * @see `KBQ_ACTIONS_PANEL_DATA`
     */
    data?: D | null = null;

    /** Extra CSS classes to be added to the actions panel container. */
    containerClass?: string | string[];

    /**
     * Extra CSS classes to be added to the overlay panel.
     */
    overlayPanelClass?: string | string[];

    /**
     * Whether the actions panel should close when the user navigates backwards or forwards through browser history.
     * This does not apply to navigation via anchor element unless using URL-hash based routing (`HashLocationStrategy`
     * in the Angular router).
     *
     * @default true
     */
    closeOnNavigation?: boolean = true;

    /**
     * The element to which the overlay panel should be connected.
     */
    overlayConnectedTo?: ElementRef;

    /**
     * Width of the actions panel.
     *  If a number is provided, assumes pixel units.
     */
    width?: number | string;

    /**
     * Min-width of the actions panel.
     * If a number is provided, assumes pixel units.
     */
    minWidth?: number | string;

    /**
     * Max-width of the actions panel.
     * If a number is provided, assumes pixel units.
     *
     * @default '80%'
     */
    maxWidth?: number | string = '80%';
}
