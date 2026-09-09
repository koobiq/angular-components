import { AnimationEvent } from '@angular/animations';
import { FocusOrigin } from '@angular/cdk/a11y';
import { InjectionToken, Provider, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';

export enum KbqToastStyle {
    Contrast = 'contrast',
    Success = 'success',
    Warning = 'warning',
    Error = 'error'
}

export enum KbqToastPosition {
    TOP_RIGHT = 'top-right',
    TOP_LEFT = 'top-left',
    TOP_CENTER = 'top-center',
    BOTTOM_RIGHT = 'bottom-right',
    BOTTOM_LEFT = 'bottom-left',
    BOTTOM_CENTER = 'bottom-center',
    CENTER = 'center'
}

export class KbqToastData {
    id?: string;
    title?: string | TemplateRef<any>;
    /** Visual style of the toast. Styles outside `KbqToastStyle` render without a default icon. */
    style?: KbqToastStyle | (string & {});

    icon?: TemplateRef<any> | boolean;
    iconClass?: string;
    caption?: string | TemplateRef<any>;

    content?: string | TemplateRef<any>;
    actions?: TemplateRef<any>;

    closeButton?: TemplateRef<any> | boolean;
}

/**
 * Context of a template rendered by `KbqToastService.showTemplate`.
 *
 * Note that it differs from the context of the slot templates passed through `KbqToastData` (title, caption,
 * content, actions, icon and close button), whose `$implicit` is the `KbqToastComponent` instance.
 */
export type KbqToastTemplateContext = {
    $implicit: KbqToastData;
};

/**
 * Narrow contract that a toast consumes from the service owning its stack.
 *
 * `KbqToastService` implements it and provides itself under `KBQ_TOAST_STACK` for every toast it creates, so
 * that a toast never has to depend on the concrete service that instantiates it.
 */
export interface KbqToastStack {
    /** Emits the data of a toast once the user has read it. */
    readonly read: Subject<KbqToastData | null>;
    /** Emits the animation events of every toast in the stack. */
    readonly animation: Subject<AnimationEvent>;

    /** Removes the toast with the given id from the stack. */
    hide(id: number): void;

    /** Reports that the pointer entered or left the toast with the given id. */
    setHovered(id: number, hovered: boolean): void;

    /** Reports the origin the toast with the given id is focused with, or `null` once it loses focus. */
    setFocused(id: number, origin: FocusOrigin): void;
}

/** Stack a toast belongs to. Provided by `KbqToastService` for every toast it creates. */
export const KBQ_TOAST_STACK = new InjectionToken<KbqToastStack>('KBQ_TOAST_STACK');

export interface KbqToastConfig {
    position: KbqToastPosition;
    duration: number;
    delay: number;
    onTop: boolean;
    /** Custom indentation for positioning the toast stack overlay when using `GlobalPositionStrategy` */
    indent: {
        /** Vertical spacing from the top or bottom of the screen. */
        vertical: number;

        /** Horizontal spacing from the left or right of the screen. */
        horizontal: number;
    };
}

/** Frozen so that the fallback every application shares cannot be reconfigured from a single consumer. */
export const defaultToastConfig: KbqToastConfig = Object.freeze({
    position: KbqToastPosition.TOP_RIGHT,
    duration: 5000,
    delay: 2000,
    onTop: false,
    indent: Object.freeze({
        vertical: 0,
        horizontal: 0
    })
});

export const KBQ_TOAST_CONFIG = new InjectionToken<KbqToastConfig>('kbq-toast-config', {
    factory: () => defaultToastConfig
});

/** Utility provider for `KBQ_TOAST_CONFIG`. */
export const kbqToastConfigurationProvider = (configuration: Partial<KbqToastConfig>): Provider => ({
    provide: KBQ_TOAST_CONFIG,
    useValue: {
        ...defaultToastConfig,
        ...configuration,
        // `indent` is merged on its own: a shallow spread would alias the default object into every
        // configuration that omits it, so writing to one provider's indent would move the global default.
        indent: { ...defaultToastConfig.indent, ...configuration.indent }
    } satisfies KbqToastConfig
});
