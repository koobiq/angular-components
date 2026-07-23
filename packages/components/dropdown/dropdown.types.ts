import { FocusOrigin } from '@angular/cdk/a11y';
import { Direction } from '@angular/cdk/bidi';
import { EventEmitter, InjectionToken, QueryList, Signal, TemplateRef } from '@angular/core';
import {
    KBQ_PANEL_DEFAULT_MIN_WIDTH,
    KbqPanelMaxWidth,
    KbqPanelMinWidth,
    KbqPanelWidth
} from '@koobiq/components/core';
import { KbqDropdownContent } from './dropdown-content.directive';
import { KbqDropdownItem } from './dropdown-item.component';

/** Position of the dropdown panel along the x-axis. */
export type KbqDropdownPositionX = 'before' | 'after' | 'center';
/**
 * @deprecated Use `KbqDropdownPositionX` instead.
 * @docs-private
 */
export type DropdownPositionX = KbqDropdownPositionX;

/** Position of the dropdown panel along the y-axis. */
export type KbqDropdownPositionY = 'above' | 'below';
/**
 * @deprecated Use `KbqDropdownPositionY` instead.
 * @docs-private
 */
export type DropdownPositionY = KbqDropdownPositionY;

/** Reason why the menu was closed. */
export type DropdownCloseReason = void | 'click' | 'keydown' | 'tab';

/**
 * Interface for a custom dropdown panel that can be used with `kbqDropdownTriggerFor`.
 * @docs-private
 */
export interface KbqDropdownPanel {
    xPosition: KbqDropdownPositionX;
    yPosition: KbqDropdownPositionY;
    overlapTriggerX: boolean;
    overlapTriggerY: boolean;
    templateRef: TemplateRef<any>;
    closed: EventEmitter<DropdownCloseReason>;
    parent?: KbqDropdownPanel | undefined;
    /**
     * @deprecated Has no effect. Use `KbqDropdownTrigger.widthOrigin` to make the panel match
     * an element other than the trigger. Will be removed in v21.
     */
    triggerWidth?: string;
    panelWidth?: Signal<KbqPanelWidth>;
    panelMinWidth?: Signal<KbqPanelMinWidth>;
    panelMaxWidth?: Signal<KbqPanelMaxWidth>;
    direction?: Direction;
    lazyContent?: KbqDropdownContent;
    backdropClass?: string;
    hasBackdrop?: boolean;
    items: QueryList<KbqDropdownItem>;
    focusFirstItem(origin?: FocusOrigin): void;
    resetActiveItem(): void;
    setPositionClasses?(x: KbqDropdownPositionX, y: KbqDropdownPositionY): void;
}

/** Default `kbq-dropdown` options that can be overridden. */
export interface KbqDropdownDefaultOptions {
    /** The x-axis position of the dropdown. */
    xPosition: KbqDropdownPositionX;

    /** The y-axis position of the dropdown. */
    yPosition: KbqDropdownPositionY;

    /** Whether the dropdown should overlap the dropdown trigger horizontally. */
    overlapTriggerX: boolean;

    /** Whether the dropdown should overlap the dropdown trigger vertically. */
    overlapTriggerY: boolean;

    /** Class to be applied to the dropdown's backdrop. */
    backdropClass: string;

    /** Whether the dropdown has a backdrop. */
    hasBackdrop: boolean;

    /**
     * Width of the panel. If set to `auto`, the panel will match the trigger width.
     * If set to null, the panel will grow to match its content.
     */
    panelWidth?: KbqPanelWidth;

    /** Minimum width of the panel. If set to null, only the trigger width applies. */
    panelMinWidth?: KbqPanelMinWidth;

    /**
     * Maximum width of the panel. Caps growth by content only — it never overrides the trigger width or an
     * explicit `panelWidth`. If null, the `--kbq-dropdown-size-container-width-max` token applies.
     */
    panelMaxWidth?: KbqPanelMaxWidth;
}

/**
 * Injection token used to provide the parent dropdown to dropdown-specific components.
 * @docs-private
 */
export const KBQ_DROPDOWN_PANEL = new InjectionToken<KbqDropdownPanel>('KBQ_DROPDOWN_PANEL');

/** Injection token to be used to override the default options for `kbq-dropdown`. */
export const KBQ_DROPDOWN_DEFAULT_OPTIONS = new InjectionToken<KbqDropdownDefaultOptions>(
    'kbq-dropdown-default-options',
    {
        providedIn: 'root',
        factory: KBQ_DROPDOWN_DEFAULT_OPTIONS_FACTORY
    }
);

/** @docs-private */
export function KBQ_DROPDOWN_DEFAULT_OPTIONS_FACTORY(): KbqDropdownDefaultOptions {
    return {
        overlapTriggerX: true,
        overlapTriggerY: false,
        xPosition: 'after',
        yPosition: 'below',
        backdropClass: 'cdk-overlay-transparent-backdrop',
        hasBackdrop: false,
        // Reproduces the pre-existing CSS-driven sizing: grow with content, never narrower than the
        // trigger or `--kbq-dropdown-size-container-width-min`, capped by the token.
        panelWidth: null,
        panelMinWidth: KBQ_PANEL_DEFAULT_MIN_WIDTH,
        panelMaxWidth: null
    };
}
