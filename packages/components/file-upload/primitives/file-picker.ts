import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    Directive,
    ElementRef,
    inject,
    input,
    model,
    output,
    viewChild
} from '@angular/core';

/**
 * File upload context.
 */
@Directive({
    selector: '[kbqFileUploadContext]',
    exportAs: 'kbqFileUploadContext'
})
export class KbqFileUploadContext {
    /** id for file input */
    id = input<string | null>(null);
    /** Whether file input selectable or not */
    disabled = model<boolean | null>(null);
    /** Selection mode for file input */
    multiple = input(null, { transform: booleanAttribute });
    /** File type specifiers */
    accept = input<string | null>(null);
    /**
     * Reflects webkitdirectory attribute, which indicates that elements can only select directories instead of files.
     */
    onlyDirectory = input<boolean | null>(null);
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
    private fileUploadContext = inject(KbqFileUploadContext, { optional: true });

    /** Whether file input selectable or not */
    disabled = input<boolean>(false);
    /** Selection mode for file input */
    multiple = input<boolean | null>(null);
    /** File type specifiers */
    accept = input<string | null>(null);
    /** id for file input  */
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

    /** @docs-private */
    protected readonly innerDisabled = computed(() => this.fileUploadContext?.disabled() ?? this.disabled());
    /** @docs-private */
    protected readonly innerMultiple = computed(() => this.fileUploadContext?.multiple() ?? this.multiple());
    /** @docs-private */
    protected readonly innerAccept = computed(() => this.fileUploadContext?.accept() ?? this.accept());
    /** @docs-private */
    protected readonly innerFor = computed(() => this.fileUploadContext?.id() ?? this.for());
    /** @docs-private */
    protected readonly innerOnlyDirectory = computed(
        () => this.fileUploadContext?.onlyDirectory() ?? this.onlyDirectory()
    );
}

/**
 * Responsible for list update (add/remove)
 */
@Directive({
    selector: '[kbqFileList]',
    exportAs: 'kbqFileList',
    host: {
        class: 'kbq-file-list'
    }
})
export class KbqFileList<T> {
    /** Current list of items. */
    list = model<T[]>([]);
    /**
     * Emits an event containing a tuple of file and file's index when removed from the file list.
     * Useful when handle removed files, skipping filtering file list.
     */
    readonly itemRemoved = output<[T, number]>();
    /** Emits array of items that were added to the list. */
    readonly itemsAdded = output<T[]>();

    /** Adds a single item to the list and emits event */
    add(item: T): void {
        this.update((current) => [...current, item]);
        this.itemsAdded.emit([item]);
    }

    /** Adds multiple items to the list and emits event */
    addArray(items: T[]): void {
        this.update((current) => [...current, ...items]);
        this.itemsAdded.emit(items);
    }

    /** Removes the first occurrence of the specified item. Returns removed items and emits event. */
    remove(item: T): T[] {
        const removed: T[] = [];

        this.update((current) =>
            current.filter((currentItem) => {
                const isRemoved = currentItem !== item;

                if (isRemoved) {
                    removed.push(currentItem);
                }

                return isRemoved;
            })
        );

        return removed;
    }

    /** Removes item at specified index. Returns removed items and emits event. */
    removeAt(index: number): T[] {
        const removed: T[] = [];

        this.update((current) => {
            const removedItem = current.splice(index, 1);

            removed.push(...removedItem);

            return current;
        });
        this.itemRemoved.emit([removed[0], index]);

        return removed;
    }

    private update(fn: (current: T[]) => T[]) {
        this.list.update(fn);
    }
}
