import {
    ChangeDetectorRef,
    DestroyRef,
    ElementRef,
    inject,
    InjectionToken,
    InputSignal,
    Renderer2,
    Signal
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import {
    CanUpdateErrorState,
    ErrorStateMatcher,
    KbqBaseFileUploadLocaleConfiguration,
    kbqDeepMerge,
    KbqDeepPartial,
    KbqEnumValues,
    KbqFileUploadLocaleConfiguration,
    KbqLocaleOverridesDirective,
    KbqMultipleFileUploadLocaleConfiguration
} from '@koobiq/components/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { KbqFullScreenDropzoneService } from './dropzone';
import { KBQ_FILE_UPLOAD_LOCALE_CONFIGURATION } from './file-upload.tokens';
import { KbqFileList, KbqFileUploadContext } from './primitives';

export interface KbqFile extends File {
    /* used when directory dropped */
    fullPath: string;
}

export interface KbqFileItem {
    file: File;
    hasError?: boolean;
    loading?: BehaviorSubject<boolean>;
    progress?: BehaviorSubject<number>;
}

/** Upload modes enum. */
export enum KbqFileUploadAllowedType {
    File = 'file',
    Folder = 'folder',
    Mixed = 'mixed'
}

/** Allowed upload modes for the upload component. */
export type KbqFileUploadAllowedTypeValues = KbqEnumValues<KbqFileUploadAllowedType>;

/** Strategy for merging newly selected/dropped files into the existing file list. */
export enum KbqFileUploadAddStrategy {
    /** Accumulates files across interactions, skipping files that duplicate ones already present. */
    Concat = 'concat',
    /** Discards the previous selection, mirroring native `<input multiple>` behavior. */
    Replace = 'replace'
}

/** Allowed add strategies for the upload component. */
export type KbqFileUploadAddStrategyValues = KbqEnumValues<KbqFileUploadAddStrategy>;

/** @docs-private */
export type KbqFileUploadCaptionContext = {
    captionText: string;
    browseLink?: string;
    captionTextSeparator?: string;
    browseLinkFolder?: string;
};

/**
 * Object for labels customization inside file upload component.
 *
 * @deprecated Provided as `useValue`, this token used to beat `KBQ_LOCALE_SERVICE` outright and is no
 *     longer read at all. Use {@link kbqFileUploadLocaleConfigurationProvider}, which registers a real
 *     override: the keys it does not mention keep following the active locale.
 */
export const KBQ_FILE_UPLOAD_CONFIGURATION = new InjectionToken<
    KbqBaseFileUploadLocaleConfiguration | KbqMultipleFileUploadLocaleConfiguration
>('KbqFileUploadConfiguration');

/** @docs-private */
export abstract class KbqFileUploadBase<T = KbqBaseFileUploadLocaleConfiguration> implements CanUpdateErrorState {
    protected abstract localeConfig: InputSignal<Partial<T> | undefined>;
    /** Tracks whether the component is in an error state based on the control, parent form,
     * and `errorStateMatcher`, triggering visual updates and state changes if needed. */
    errorState: boolean = false;

    /** An object used to control the error state of the component. */
    abstract errorStateMatcher: ErrorStateMatcher;

    /**
     * Emits whenever the component state changes and should cause the parent
     * form-field to update. Implemented as part of `KbqFormFieldControl`.
     * @docs-private
     */
    readonly stateChanges = new Subject<void>();

    /** @docs-private */
    protected readonly fileUploadContext = inject(KbqFileUploadContext, { host: true });
    /** @docs-private */
    protected readonly fileList = inject<KbqFileList<KbqFileItem>>(KbqFileList, { host: true });

    /** @docs-private */
    get disabled(): boolean {
        return this.fileUploadContext.disabled() ?? false;
    }

    /** @docs-private */
    protected readonly cdr = inject(ChangeDetectorRef);
    /** @docs-private */
    protected readonly renderer = inject(Renderer2);
    /** @docs-private */
    protected readonly destroyRef = inject(DestroyRef);
    /** Localized labels of both upload flavours, following the active locale. @docs-private */
    protected readonly localeConfiguration: Signal<KbqFileUploadLocaleConfiguration> = inject(
        KbqLocaleOverridesDirective,
        { host: true }
    ).read('fileUpload', KBQ_FILE_UPLOAD_LOCALE_CONFIGURATION);
    /** @docs-private */
    protected readonly ngControl = inject(NgControl, { optional: true, self: true });
    /** @docs-private */
    protected readonly parentForm = inject(NgForm, { optional: true });
    /** @docs-private */
    protected readonly parentFormGroup = inject(FormGroupDirective, { optional: true });
    /** @docs-private */
    protected readonly defaultErrorStateMatcher = inject(ErrorStateMatcher);
    /** @docs-private */
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    /** @docs-private */
    protected readonly dropzoneService = inject(KbqFullScreenDropzoneService);

    /** implemented as part of base class. Decided not use mixinErrorState, not to overcomplicate
     * @docs-private */
    updateErrorState() {
        const oldState = this.errorState;
        const parent = this.parentFormGroup || this.parentForm;
        const matcher = this.errorStateMatcher || this.defaultErrorStateMatcher;
        const control = this.ngControl ? (this.ngControl.control as UntypedFormControl) : null;
        const newState = matcher.isErrorState(control, parent);

        if (newState !== oldState) {
            this.errorState = newState;
            this.stateChanges.next();
        }
    }

    /**
     * Merges the deprecated `localeConfig` input over the labels resolved from the locale. It is the most
     * local source of all, so it still wins — including over `[localeOverrides]`.
     * @docs-private
     */
    protected withLocaleConfigInput<C extends T>(configuration: C): C {
        return kbqDeepMerge(configuration, this.localeConfig() as KbqDeepPartial<C>);
    }
}
