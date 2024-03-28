import { OverlayRef } from '@angular/cdk/overlay';
import { EventEmitter, TemplateRef, Type } from '@angular/core';


export type OnClickCallback<T> = ((instance: T) => (false | void | {}) | Promise<false | void | {}>);

// Different modal styles we have supported
export type ModalType = 'default' | 'confirm' | 'custom';

// Subtypes of Confirm Modal
export type ConfirmType = 'confirm' | 'success' | 'warn';

export enum ModalSize {
    Small = 'small',
    Medium = 'medium',
    Large = 'large'
}

// Public options for using by service
export interface ModalOptions<T = any, R = any> {
    kbqModalType?: ModalType;
    kbqVisible?: boolean;
    kbqZIndex?: number;
    kbqWidth?: number | string;
    kbqSize?: ModalSize;
    kbqWrapClassName?: string;
    kbqClassName?: string;
    kbqStyle?: object;
    kbqTitle?: string | TemplateRef<{}>;
    kbqContent?: string | TemplateRef<{}> | Type<T>;
    kbqComponent?: Type<T>; // The instance of component opened into the dialog.
    kbqComponentParams?: any;
    kbqClosable?: boolean;
    kbqMask?: boolean;
    kbqMaskClosable?: boolean;
    kbqMaskStyle?: object;
    kbqBodyStyle?: object;
    kbqFooter?: string | TemplateRef<{}> | IModalButtonOptions<T>[]; // Default Modal ONLY
    kbqGetContainer?: HTMLElement | OverlayRef | (() => HTMLElement | OverlayRef) | null; // STATIC
    kbqAfterOpen?: EventEmitter<void>;
    kbqAfterClose?: EventEmitter<R>;
    kbqCloseByESC?: boolean;
    kbqRestoreFocus?: boolean;

    // --- Predefined OK & Cancel buttons
    kbqOkText?: string;
    kbqOkType?: string;
    kbqOkLoading?: boolean;
    kbqOnOk?: EventEmitter<T> | OnClickCallback<T>;
    kbqCancelText?: string;
    kbqCancelLoading?: boolean;
    kbqOnCancel?: EventEmitter<T> | OnClickCallback<T>;
}

// tslint:disable-next-line:no-any
export interface IModalOptionsForService<T = any> extends ModalOptions<T> {
    kbqOnOk?: OnClickCallback<T>;
    kbqOnCancel?: OnClickCallback<T>;
}

export interface IModalButtonOptions<T = any> {
    label: string;
    // tslint:disable-next-line
    type?: string;
    shape?: string;
    ghost?: boolean;
    size?: string;
    // Default: true, indicate whether show loading automatically while onClick returned a Promise
    autoLoading?: boolean;

    // [NOTE] "componentInstance" will refer to the component's instance when using Component
    show?: boolean | ((this: IModalButtonOptions<T>, contentComponentInstance?: T) => boolean);
    loading?: boolean | ((this: IModalButtonOptions<T>, contentComponentInstance?: T) => boolean);
    disabled?: boolean | ((this: IModalButtonOptions<T>, contentComponentInstance?: T) => boolean);

    autoFocus?: boolean;
    kbqModalMainAction?: boolean;

    onClick?(this: IModalButtonOptions<T>, contentComponentInstance?: T): (void | {}) | Promise<(void | {})>;
}
