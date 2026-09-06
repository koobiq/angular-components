import {
    ChangeDetectorRef,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    InjectionToken,
    InputSignal,
    Renderer2,
    signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import {
    CanUpdateErrorState,
    ErrorStateMatcher,
    KBQ_DEFAULT_LOCALE_ID,
    KBQ_LOCALE_SERVICE,
    KbqBaseFileUploadLocaleConfig,
    KbqEnumValues,
    KbqFileUploadA11yLocaleConfiguration,
    KbqMultipleFileUploadLocaleConfig,
    ruRULocaleData
} from '@koobiq/components/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
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

/* Object for labels customization inside file upload component */
export const KBQ_FILE_UPLOAD_CONFIGURATION = new InjectionToken<
    KbqBaseFileUploadLocaleConfig | KbqMultipleFileUploadLocaleConfig
>('KbqFileUploadConfiguration');

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

    /** @docs-private */
    protected readonly localeId = toSignal(this.localeService?.changes.asObservable() ?? of(KBQ_DEFAULT_LOCALE_ID));

    /** @docs-private */
    protected readonly a11yLocaleConfig = computed<KbqFileUploadA11yLocaleConfiguration>(() => {
        const active = this.localeService && this.localeId() ? this.localeService.getParams('fileUpload').a11y : null;

        // A locale registered through `KBQ_LOCALE_DATA` before this section existed carries no `a11y` key.
        return active ?? ruRULocaleData.fileUpload.a11y;
    });

    /** Text of the live region that announces changes of the file list. @docs-private */
    protected readonly announcement = signal('');

    /** @docs-private */
    protected setFileList(items: KbqFileItem[]): void {
        this.fileList.list.set(items);
        this.cdr.markForCheck();
    }

    /**
     * Pushes one message into the live region. Cleared first: a live region speaks on a content
     * change, so removing two identically named files in a row would otherwise stay silent.
     * @docs-private
     */
    protected announce(...messages: string[]): void {
        const message = messages.filter(Boolean).join('. ');

        this.announcement.set('');
        setTimeout(() => this.announcement.set(message));
    }

    /** @docs-private */
    protected withFileName(template: string, fileName: string): string {
        return template.replace('{{ fileName }}', fileName);
    }

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
