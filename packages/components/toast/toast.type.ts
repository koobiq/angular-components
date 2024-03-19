import { TemplateRef, InjectionToken } from '@angular/core';


export enum KbqToastStyle {
    Contrast = 'contrast',
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
    title?: string | TemplateRef<any>;
    style?: KbqToastStyle | string;

    icon?: TemplateRef<any> | boolean;
    iconClass?: string;
    caption?: string | TemplateRef<any>;

    content?: string | TemplateRef<any>;
    actions?: TemplateRef<any>;

    closeButton?: TemplateRef<any> | boolean;
}

// tslint:disable-next-line:naming-convention
export interface KbqToastConfig {
    position: KbqToastPosition;
    duration: number;
    delay: number;
    onTop: boolean;
}

export const KBQ_TOAST_CONFIG = new InjectionToken('kbq-toast-config');
