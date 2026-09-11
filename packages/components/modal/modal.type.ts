import { OverlayRef } from '@angular/cdk/overlay';
import { EventEmitter, InjectionToken, Injector, Signal, TemplateRef, Type } from '@angular/core';
import { KbqButtonColor } from '@koobiq/components/button';
import { KbqComponentColors, KbqOverflowShadowState } from '@koobiq/components/core';
import { Observable } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type OnClickCallback<T> = (instance: T) => (false | void | {}) | Promise<false | void | {}>;

// Different modal styles we have supported
export type ModalType = 'default' | 'confirm' | 'custom';

// Subtypes of Confirm Modal
export type ConfirmType = 'confirm' | 'success' | 'warn';

/**
 * Where focus lands when the dialog is shown.
 *
 * `[cdkFocusInitial]` and `autofocus` inside the dialog win over every value but `false`.
 *
 * - `first-tabbable` — the first tabbable control, which for a titled dialog is the close button;
 * - `dialog` — the dialog element itself, so a long scrollable body is read from its start;
 * - `first-heading` — the dialog title, falling back to the dialog element;
 * - `false` — nothing is focused, and the caller is responsible for moving focus into the dialog.
 */
export type KbqModalAutoFocus = 'first-tabbable' | 'dialog' | 'first-heading' | false;

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

/**
 * The members of `KbqModalComponent` the composition directives (`kbq-modal-title`,
 * `kbq-modal-caption`, `kbq-modal-body`, `kbq-modal-footer`) depend on. They are projected into the
 * dialog, so they inject this token instead of the concrete host component.
 */
export interface KbqModal {
    /** Whether the dialog renders a close button in its header. */
    readonly kbqClosable: boolean;
    /** Palette the composed header binds the close-icon color from. */
    readonly componentColors: typeof KbqComponentColors;
    /** Id the dialog element points `aria-labelledby` at. Belongs on the rendered title element. */
    readonly titleId: string;
    /** Id the dialog element points `aria-describedby` at. Belongs on the rendered caption element. */
    readonly captionId: string;
    /** Scroll-shadow state of the composed body, so the header and footer can render matching shadows. */
    readonly bodyOverflow: Signal<KbqOverflowShadowState>;
    /** Emits once the dialog is fully shown. */
    readonly afterOpen: Observable<void>;
    /** Runs the cancel flow, exactly as the templated close button does. */
    onClickCloseBtn(): void;
    /** Announces that a composed title is rendered, so the dialog can use it as its accessible name. */
    registerTitle(): void;
    /** Announces that a composed caption is rendered, so the dialog can use it as its description. */
    registerCaption(): void;
    /** Announces that a composed footer is rendered, so the body keeps its normal bottom padding. */
    registerFooter(): void;
    /** Publishes the composed body's scroll-shadow state. */
    setBodyOverflow(state: KbqOverflowShadowState): void;
}

/** Injection token exposing the dialog to the directives composed inside it. */
export const KBQ_MODAL = new InjectionToken<KbqModal>('KBQ_MODAL');

// Public options for using by service
export interface ModalOptions<C = any, R = any> {
    /** Layout the dialog renders. Default is `'default'`. */
    kbqModalType?: ModalType;
    /** Whether the dialog is shown. Managed by the service on the imperative path. */
    kbqVisible?: boolean;
    /** Explicit width, overriding the one `kbqSize` implies. A number is read as pixels. */
    kbqWidth?: number | string;
    /** Width preset. Default is `ModalSize.Medium` (640px). */
    kbqSize?: ModalSize;
    /** Extra class names for the full-screen wrapper around the dialog. */
    kbqWrapClassName?: string;
    /** Extra class names for the dialog element itself. */
    kbqClassName?: string;
    /** Inline styles for the dialog element. */
    kbqStyle?: object;
    /** Heading of the dialog. Also becomes its accessible name. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    kbqTitle?: string | TemplateRef<{}>;
    /** Secondary line under the heading. Also becomes the dialog's accessible description. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    kbqCaption?: string | TemplateRef<{}>;
    /** Body of the dialog: text, a template or a component class. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    kbqContent?: string | TemplateRef<{}> | Type<C>;
    /** The instance of component opened into the dialog. */
    kbqComponent?: Type<C>;
    /** Whether the header renders a close button. Default is `true`. */
    kbqClosable?: boolean;
    /** Whether the page behind the dialog is dimmed. Default is `true`. */
    kbqMask?: boolean;
    /** Whether a click on the dim layer cancels the dialog. Default is `false`. */
    kbqMaskClosable?: boolean;
    /** Inline styles for the dim layer. */
    kbqMaskStyle?: object;
    /** Inline styles for the body element. */
    kbqBodyStyle?: object;
    /** Footer of the dialog: text, a template, or the buttons to render. Default modal ONLY. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    kbqFooter?: string | TemplateRef<{}> | IModalButtonOptions<C>[];
    /** Element or overlay the dialog is rendered into. STATIC — read once, on init. */
    kbqGetContainer?: HTMLElement | OverlayRef | (() => HTMLElement | OverlayRef) | null;
    /**
     * Emitter that mirrors the dialog's own open event. It is subscribed to the dialog, never
     * substituted for it, so `afterOpen` on the returned `KbqModalRef` keeps working alongside.
     */
    kbqAfterOpen?: EventEmitter<void>;
    /**
     * Emitter that mirrors the dialog's own close event. It is subscribed to the dialog, never
     * substituted for it, so `afterClose` on the returned `KbqModalRef` keeps working alongside.
     */
    kbqAfterClose?: EventEmitter<R>;
    /** Whether <kbd>Escape</kbd> cancels the dialog. Default is `true`. */
    kbqCloseByESC?: boolean;
    /** Whether focus returns to the trigger when the dialog closes. Default is `true`. */
    kbqRestoreFocus?: boolean;
    /** Where focus lands when the dialog is shown. Default is `'first-tabbable'`. */
    kbqAutoFocus?: KbqModalAutoFocus;
    /** Accessible name for a dialog rendered without `kbqTitle` — a confirm or a header-less dialog. */
    kbqAriaLabel?: string;

    // --- Predefined OK & Cancel buttons
    /** Caption of the predefined OK button. The button is not rendered without it. */
    kbqOkText?: string;
    /** Color of the predefined OK button. Default is `KbqComponentColors.Contrast`. */
    kbqOkType?: KbqButtonColor;
    /** Whether the predefined OK button renders its progress state. */
    kbqOkLoading?: boolean;
    /**
     * Handler of the predefined OK button. A function returning `false` (or a promise of `false`)
     * keeps the dialog open; anything else closes it.
     */
    kbqOnOk?: EventEmitter<C> | OnClickCallback<C>;
    /** Caption of the predefined Cancel button. The button is not rendered without it. */
    kbqCancelText?: string;
    /** Whether the predefined Cancel button renders its progress state. */
    kbqCancelLoading?: boolean;
    /**
     * Handler of the predefined Cancel button, the close button, <kbd>Escape</kbd> and the dim
     * layer. A function returning `false` (or a promise of `false`) keeps the dialog open.
     */
    kbqOnCancel?: EventEmitter<C> | OnClickCallback<C>;

    /** Data being injected into the child component. */
    data?: unknown;
}

export interface IModalOptionsForService<T = any> extends ModalOptions<T> {
    kbqOnOk?: OnClickCallback<T>;
    kbqOnCancel?: OnClickCallback<T>;
    /**
     * The injector used to create the component that will be attached.
     * If specified, it overrides the injector provided by `KbqModalService`.
     *
     * Its `DestroyRef` also owns the dialog: the modal is torn down when the injector is destroyed.
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

    /**
     * Whether the button is rendered.
     *
     * The callable form is re-evaluated on every change-detection pass over the dialog, which is
     * what lets it track state the dialog knows nothing about — so it must be cheap and free of
     * side effects. `contentComponentInstance` is passed only when the body is a component.
     */
    show?: boolean | ((this: IModalButtonOptions<T>, contentComponentInstance?: T) => boolean);
    /** Whether the button renders its progress state. Re-evaluated per pass — see {@link IModalButtonOptions.show}. */
    loading?: boolean | ((this: IModalButtonOptions<T>, contentComponentInstance?: T) => boolean);
    /** Whether the button is disabled. Re-evaluated per pass — see {@link IModalButtonOptions.show}. */
    disabled?: boolean | ((this: IModalButtonOptions<T>, contentComponentInstance?: T) => boolean);

    autoFocus?: boolean;
    kbqModalMainAction?: boolean;

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    onClick?(this: IModalButtonOptions<T>, contentComponentInstance?: T): (void | {}) | Promise<void | {}>;
}
