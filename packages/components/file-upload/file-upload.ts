import { DestroyRef, ElementRef, inject, InjectionToken } from '@angular/core';
import { FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import { CanUpdateErrorState, ErrorStateMatcher, KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { BehaviorSubject, Subject } from 'rxjs';

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

export interface KbqInputFile {
    disabled: boolean;
    accept?: string[];
    onFileSelectedViaClick(event: Event): void;
    onFileDropped(files: FileList | KbqFile[]): void;
}

export interface KbqInputFileLabel {
    /* Text for description, used with `browseLink` */
    captionText: string;
    /* Text for link with which the file(s) can be selected to download */
    browseLink: string;
    /* Header for multiple file-upload in default size */
    title?: string | undefined;
}

/**
 * @deprecated use FormControl for validation
 */
export type KbqFileValidatorFn = (file: File) => string | null;

/* Object for labels customization inside file upload component */
export const KBQ_FILE_UPLOAD_CONFIGURATION = new InjectionToken<KbqInputFileLabel>('KbqFileUploadConfiguration');

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
export abstract class KbqFileUploadBase implements CanUpdateErrorState {
    /** Whether the component is in an error state. */
    errorState: boolean = false;

    /** An object used to control the error state of the component. */
    abstract errorStateMatcher: ErrorStateMatcher;

    /**
     * Emits whenever the component state changes and should cause the parent
     * form-field to update. Implemented as part of `KbqFormFieldControl`.
     * @docs-private
     */
    readonly stateChanges = new Subject<void>();

    protected readonly destroyRef = inject(DestroyRef);
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    protected readonly ngControl = inject(NgControl, { optional: true, self: true });
    protected readonly parentForm = inject(NgForm, { optional: true });
    protected readonly parentFormGroup = inject(FormGroupDirective, { optional: true });
    protected readonly defaultErrorStateMatcher = inject(ErrorStateMatcher);
    protected readonly elementRef = inject(ElementRef);

    /** implemented as part of base class. Decided not use mixinErrorState, not to overcomplicate */
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
}
