import { InjectionToken, Provider, TemplateRef } from '@angular/core';

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
    style?: KbqToastStyle | string;

    icon?: TemplateRef<any> | boolean;
    iconClass?: string;
    caption?: string | TemplateRef<any>;

    content?: string | TemplateRef<any>;
    actions?: TemplateRef<any>;

    closeButton?: TemplateRef<any> | boolean;
}

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

export const defaultToastConfig: KbqToastConfig = {
    position: KbqToastPosition.TOP_RIGHT,
    duration: 5000,
    delay: 2000,
    onTop: false,
    indent: {
        vertical: 0,
        horizontal: 0
    }
};

export const KBQ_TOAST_CONFIG = new InjectionToken<KbqToastConfig>('kbq-toast-config', {
    factory: () => defaultToastConfig
});

/** Utility provider for `KBQ_TOAST_CONFIG`. */
export const kbqToastConfigurationProvider = (configuration: Partial<KbqToastConfig>): Provider => ({
    provide: KBQ_TOAST_CONFIG,
    useValue: { ...defaultToastConfig, ...configuration }
});
