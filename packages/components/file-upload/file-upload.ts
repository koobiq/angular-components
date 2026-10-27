import {
    ChangeDetectorRef,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    Renderer2,
    Signal,
    signal,
    WritableSignal
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import {
    ErrorStateMatcher,
    KbqEnumValues,
    KbqFileUploadLocaleConfiguration,
    kbqInjectA11yLocaleConfiguration,
    KbqLocaleOverridesDirective
} from '@koobiq/components/core';
import { BehaviorSubject, combineLatest, of, Subject, Subscription } from 'rxjs';
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

/** What the `loading` and `progress` subjects of a file item last emitted. */
type KbqFileItemStatus = { loading: boolean; progress: number };

/** The subscription to the subjects of a listed item, kept while the item stays listed. */
type KbqFileItemTracker = Pick<KbqFileItem, 'loading' | 'progress'> & {
    status: WritableSignal<KbqFileItemStatus>;
    subscription: Subscription;
};

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

/** @docs-private */
export abstract class KbqFileUploadBase {
    /**
     * Tracks whether the component is in an error state based on the control, parent form,
     * and `errorStateMatcher`, triggering visual updates and state changes if needed.
     */
    errorState: boolean = false;

    /** An object used to control the error state of the component. */
    abstract errorStateMatcher: ErrorStateMatcher;

    /**
     * Emits whenever the component state changes and should cause the parent
     * form-field to update. Implemented as part of `KbqFormFieldControl`.
     *
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
    /** Localized labels of both upload flavours, following the active locale. */
    readonly localeConfiguration: Signal<KbqFileUploadLocaleConfiguration> = inject(KbqLocaleOverridesDirective, {
        self: true
    }).read('fileUpload', KBQ_FILE_UPLOAD_LOCALE_CONFIGURATION);
    /** Accessible names of the icon-only controls the component renders itself. @docs-private */
    protected readonly a11yNames = kbqInjectA11yLocaleConfiguration();
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

    /** Text of the live region that announces changes of the file list. @docs-private */
    protected readonly announcement = signal('');

    /** Replaced once per list change; an emission sets only the status signal of its item. */
    private readonly itemStatuses = signal<ReadonlyMap<KbqFileItem, KbqFileItemTracker>>(new Map());

    constructor() {
        const trackers = new Map<KbqFileItem, KbqFileItemTracker>();

        // The items belong to the application, which drives their subjects: the view renders what they emit.
        effect(() => {
            const items = new Set(this.fileList.list());

            for (const [item, tracker] of trackers) {
                // An item whose subjects were replaced is followed anew.
                if (!items.has(item) || tracker.loading !== item.loading || tracker.progress !== item.progress) {
                    tracker.subscription.unsubscribe();
                    trackers.delete(item);
                }
            }

            for (const item of items) {
                if (trackers.has(item)) continue;

                const status = signal<KbqFileItemStatus>({ loading: false, progress: 0 });
                const subscription = combineLatest([item.loading ?? of(false), item.progress ?? of(0)]).subscribe(
                    ([loading, progress]) => status.set({ loading, progress })
                );

                trackers.set(item, { loading: item.loading, progress: item.progress, status, subscription });
            }

            this.itemStatuses.set(new Map(trackers));
        });

        this.destroyRef.onDestroy(() => trackers.forEach(({ subscription }) => subscription.unsubscribe()));
    }

    /** Whether the item's `loading` subject last emitted `true`. @docs-private */
    protected isLoading(item: KbqFileItem): boolean {
        return !!this.itemStatuses().get(item)?.status().loading;
    }

    /** What the item's `progress` subject last emitted, `0` until it does. @docs-private */
    protected uploadProgress(item: KbqFileItem): number {
        return this.itemStatuses().get(item)?.status().progress || 0;
    }

    /** @docs-private */
    protected setFileList(items: KbqFileItem[]): void {
        this.fileList.list.set(items);
        this.cdr.markForCheck();
    }

    /**
     * Pushes one message into the live region. Cleared first: a live region speaks on a content
     * change, so removing two identically named files in a row would otherwise stay silent.
     *
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

    /** @docs-private */
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
