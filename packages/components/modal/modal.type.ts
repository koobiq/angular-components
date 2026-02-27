import { OverlayRef } from '@angular/cdk/overlay';
import { EventEmitter, Injector, TemplateRef, Type } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/ban-types
export type OnClickCallback<T> = (instance: T) => (false | void | {}) | Promise<false | void | {}>;

// Different modal styles we have supported
export type ModalType = 'default' | 'confirm' | 'custom';

// Subtypes of Confirm Modal
export type ConfirmType = 'confirm' | 'success' | 'warn';

export enum ModalSize {
    Small = 'small',
    Medium = 'medium',
    Large = 'large'
}

/**
 * Duration when perform animations (ms)
 * @docs-private
 */
export const MODAL_ANIMATE_DURATION = 300;

// Public options for using by service
export interface ModalOptions<C = any, R = any> {
    kbqModalType?: ModalType;
    kbqVisible?: boolean;
    kbqWidth?: number | string;
    kbqSize?: ModalSize;
    kbqWrapClassName?: string;
    kbqClassName?: string;
    kbqStyle?: object;
    // eslint-disable-next-line @typescript-eslint/ban-types
    kbqTitle?: string | TemplateRef<{}>;
    // eslint-disable-next-line @typescript-eslint/ban-types
    kbqContent?: string | TemplateRef<{}> | Type<C>;
    kbqComponent?: Type<C>; // The instance of component opened into the dialog.
    /** @deprecated. Use field data and KBQ_MODAL_DATA */
    kbqComponentParams?: any;
    kbqClosable?: boolean;
    kbqMask?: boolean;
    kbqMaskClosable?: boolean;
    kbqMaskStyle?: object;
    kbqBodyStyle?: object;
    // eslint-disable-next-line @typescript-eslint/ban-types
    kbqFooter?: string | TemplateRef<{}> | IModalButtonOptions<C>[]; // Default Modal ONLY
    kbqGetContainer?: HTMLElement | OverlayRef | (() => HTMLElement | OverlayRef) | null; // STATIC
    kbqAfterOpen?: EventEmitter<void>;
    kbqAfterClose?: EventEmitter<R>;
    kbqCloseByESC?: boolean;
    kbqRestoreFocus?: boolean;

    // --- Predefined OK & Cancel buttons
    kbqOkText?: string;
    kbqOkType?: string;
    kbqOkLoading?: boolean;
    kbqOnOk?: EventEmitter<C> | OnClickCallback<C>;
    kbqCancelText?: string;
    kbqCancelLoading?: boolean;
    kbqOnCancel?: EventEmitter<C> | OnClickCallback<C>;

    /** Data being injected into the child component. */
    data?;
}

export interface IModalOptionsForService<T = any> extends ModalOptions<T> {
    kbqOnOk?: OnClickCallback<T>;
    kbqOnCancel?: OnClickCallback<T>;
    /**
     * The injector used to create the component that will be attached.
     * If specified, it overrides the injector provided by `KbqModalService`.
     */
    injector?: Injector;
}

export interface IModalButtonOptions<T = any> {
    label: string;
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

    // eslint-disable-next-line @typescript-eslint/ban-types
    onClick?(this: IModalButtonOptions<T>, contentComponentInstance?: T): (void | {}) | Promise<void | {}>;
}
