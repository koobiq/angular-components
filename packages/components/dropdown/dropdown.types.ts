import { FocusOrigin } from '@angular/cdk/a11y';
import { Direction } from '@angular/cdk/bidi';
import { EventEmitter, InjectionToken, TemplateRef } from '@angular/core';
import { KbqDropdownContent } from './dropdown-content.directive';

export type DropdownPositionX = 'before' | 'after';

export type DropdownPositionY = 'above' | 'below';

/** Reason why the menu was closed. */
export type DropdownCloseReason = void | 'click' | 'keydown' | 'tab';

/**
 * Interface for a custom dropdown panel that can be used with `kbqDropdownTriggerFor`.
 * @docs-private
 */
// tslint:disable-next-line:naming-convention
export interface KbqDropdownPanel {
    xPosition: DropdownPositionX;
    yPosition: DropdownPositionY;
    overlapTriggerX: boolean;
    overlapTriggerY: boolean;
    templateRef: TemplateRef<any>;
    closed: EventEmitter<DropdownCloseReason>;
    parent?: KbqDropdownPanel | undefined;
    triggerWidth?: string;
    direction?: Direction;
    lazyContent?: KbqDropdownContent;
    backdropClass?: string;
    hasBackdrop?: boolean;
    focusFirstItem(origin?: FocusOrigin): void;
    resetActiveItem(): void;
    setPositionClasses?(x: DropdownPositionX, y: DropdownPositionY): void;
}

/** Default `kbq-dropdown` options that can be overridden. */
// tslint:disable-next-line:naming-convention
export interface KbqDropdownDefaultOptions {
    /** The x-axis position of the dropdown. */
    xPosition: DropdownPositionX;

    /** The y-axis position of the dropdown. */
    yPosition: DropdownPositionY;

    /** Whether the dropdown should overlap the dropdown trigger horizontally. */
    overlapTriggerX: boolean;

    /** Whether the dropdown should overlap the dropdown trigger vertically. */
    overlapTriggerY: boolean;

    /** Class to be applied to the dropdown's backdrop. */
    backdropClass: string;

    /** Whether the dropdown has a backdrop. */
    hasBackdrop: boolean;
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
        factory: KBQ_DROPDOWN_DEFAULT_OPTIONS_FACTORY,
    },
);

/** @docs-private */
// tslint:disable-next-line:naming-convention
export function KBQ_DROPDOWN_DEFAULT_OPTIONS_FACTORY(): KbqDropdownDefaultOptions {
    return {
        overlapTriggerX: true,
        overlapTriggerY: false,
        xPosition: 'after',
        yPosition: 'below',
        backdropClass: 'cdk-overlay-transparent-backdrop',
        hasBackdrop: false,
    };
}
