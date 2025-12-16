import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    Directive,
    ElementRef,
    inject,
    input,
    output,
    signal,
    viewChild
} from '@angular/core';
import { KbqFileItem } from './file-upload';

/**
 * File upload context.
 */
@Directive({
    selector: '[kbqFileUploadPrimitive]',
    exportAs: 'kbqFileUploadPrimitive'
})
export class KbqFileUploadPrimitive {
    id = input();
    disabled = input(false);
    multiple = input(null, { transform: booleanAttribute });
    accept = input<string | null>(null);
    onlyDirectory = input(undefined, { transform: booleanAttribute });
}

/**
 * Loader component to trigger Browser API.
 */
@Component({
    selector: '[kbqFileLoader]',
    exportAs: 'kbqFileLoader',
    template: `
        <ng-content />
        <input
            #input
            tabindex="0"
            type="file"
            class="cdk-visually-hidden"
            [attr.multiple]="innerMultiple()"
            [attr.webkitdirectory]="innerOnlyDirectory()"
            [accept]="innerAccept()"
            [disabled]="innerDisabled()"
            [id]="innerFor()"
            (change)="fileChange.emit($event)"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-file-loader'
    }
})
export class KbqFileLoader {
    private fileUpload = inject(KbqFileUploadPrimitive, { optional: true });

    disabled = input<boolean>(false);
    multiple = input<boolean | null>(null);
    accept = input<string | null>(null);
    for = input<string | null>(null);
    /**
     * Reflects webkitdirectory attribute,
     * which indicates that elements can only select directories instead of files.
     * @link [`HTMLInputElement: webkitdirectory property`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory)
     */
    onlyDirectory = input<boolean | null>(null);

    /** Event fires when file selected in file-picker. */
    readonly fileChange = output<Event>();

    readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

    protected readonly innerDisabled = computed(() => this.fileUpload?.disabled() ?? this.disabled());
    protected readonly innerMultiple = computed(() => this.fileUpload?.multiple() ?? this.multiple());
    protected readonly innerAccept = computed(() => this.fileUpload?.accept() ?? this.accept());
    protected readonly innerFor = computed(() => this.fileUpload?.id() ?? this.for());
    protected readonly innerOnlyDirectory = computed(() => this.fileUpload?.onlyDirectory() ?? this.onlyDirectory());
}

/**
 * Responsible for list update (add/remove)
 */
@Directive({
    selector: '[kbqFileList]',
    exportAs: 'kbqFileList'
})
export class KbqFileList {
    list = signal<KbqFileItem[]>([]);

    private update(fn: (current: KbqFileItem[]) => KbqFileItem[]) {
        this.list.update(fn);
    }

    add(item: KbqFileItem): void {
        this.update((current) => [...current, item]);
    }

    addArray(items: KbqFileItem[]): void {
        this.update((current) => [...current, ...items]);
    }

    remove(item: KbqFileItem): void {
        this.update((current) => current.filter((i) => i !== item));
    }

    removeAt(index: number): KbqFileItem[] {
        const removed: KbqFileItem[] = [];

        this.update((current) => {
            removed.push(...current.splice(index, 1));

            return current;
        });

        return removed;
    }
}
