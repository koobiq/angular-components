import {
    ChangeDetectorRef,
    DestroyRef,
    ElementRef,
    inject,
    InjectionToken,
    InputSignal,
    Renderer2
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import {
    CanUpdateErrorState,
    ErrorStateMatcher,
    KBQ_LOCALE_SERVICE,
    KbqBaseFileUploadLocaleConfig,
    KbqEnumValues,
    KbqMultipleFileUploadLocaleConfig
} from '@koobiq/components/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { KbqFullScreenDropzoneService } from './dropzone';
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

/**
 * @docs-private
 * @deprecated Will be removed in next major release
 */
export interface KbqInputFile {
    disabled: boolean;
    accept?: string[];
    onFileSelectedViaClick(event: Event): void;
    onFileDropped(files: FileList | KbqFile[]): void;
}

/**
 * @docs-private
 * @deprecated Will be removed in next major release
 */
export interface KbqInputFileLabel {
    /* Text for description, used with `browseLink` */
    captionText: string;
    /* Text for link with which the file(s) can be selected to download */
    browseLink: string;
    /* Header for multiple file-upload in default size */
    title?: string | undefined;
}

/** Upload modes enum. */
export enum KbqFileUploadAllowedType {
    File = 'file',
    Folder = 'folder',
    Mixed = 'mixed'
}

/** Allowed upload modes for the upload component. */
export type KbqFileUploadAllowedTypeValues = KbqEnumValues<KbqFileUploadAllowedType>;

/** @docs-private */
export type KbqFileUploadCaptionContext = {
    captionText: string;
    browseLink?: string;
    captionTextSeparator?: string;
    browseLinkFolder?: string;
};

/**
 * @deprecated use FormControl for validation
 */
export type KbqFileValidatorFn = (file: File) => string | null;

/* Object for labels customization inside file upload component */
export const KBQ_FILE_UPLOAD_CONFIGURATION = new InjectionToken<
    KbqBaseFileUploadLocaleConfig | KbqMultipleFileUploadLocaleConfig
>('KbqFileUploadConfiguration');

/** @deprecated use `FileValidators.isCorrectExtension` instead. Will be removed in next major release. */
export const isCorrectExtension = (file: File, accept?: string[]): boolean => {
    if (!accept?.length) return true;

    const { name, type } = file;
    const fileExt: string = name.split('.').pop() || '';

    for (const acceptedExtensionOrMimeType of accept) {
        const typeAsRegExp = new RegExp(acceptedExtensionOrMimeType);

        if (typeAsRegExp.test(fileExt) || typeAsRegExp.test(type)) {
            return true;
        }
    }

    return false;
};

/** @docs-private */
export abstract class KbqFileUploadBase<T = KbqBaseFileUploadLocaleConfig> implements CanUpdateErrorState {
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
    /** @docs-private */
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
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

    /** Merges base configuration with locale-specific overrides. */
    protected buildConfig<T>(config: T): T {
        const localeConfig = this.localeConfig();

        return { ...config, ...localeConfig };
    }
}
