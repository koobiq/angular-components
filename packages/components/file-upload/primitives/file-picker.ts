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
    signal,
    viewChild
} from '@angular/core';

/**
 * File upload context.
 */
@Directive({
    selector: '[kbqFileUploadPrimitive]',
    exportAs: 'kbqFileUploadPrimitive'
})
export class KbqFileUploadPrimitive {
    id = input<string | null>(null);
    disabled = input(false);
    multiple = input(null, { transform: booleanAttribute });
    accept = input<string | null>(null);
    onlyDirectory = input(undefined, { transform: booleanAttribute });

    innerDisabled = signal<boolean | null>(null);

    computedDisabled = computed(() => this.innerDisabled() ?? this.disabled());
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

    protected readonly innerDisabled = computed(() => this.fileUpload?.computedDisabled() ?? this.disabled());
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
    exportAs: 'kbqFileList',
    host: {
        class: 'kbq-items-list'
    }
})
export class KbqFileList<T> {
    list = model<T[]>([]);
    /**
     * Emits an event containing a tuple of file and file's index when removed from the file list.
     * Useful when handle removed files, skipping filtering file list.
     */
    readonly itemRemoved = output<[T, number]>();
    readonly itemsAdded = output<T[]>();

    private update(fn: (current: T[]) => T[]) {
        this.list.update(fn);
    }

    add(item: T): void {
        this.update((current) => [...current, item]);
        this.itemsAdded.emit([item]);
    }

    addArray(items: T[]): void {
        this.update((current) => [...current, ...items]);
        this.itemsAdded.emit(items);
    }

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

    removeAt(index: number): T[] {
        const removed: T[] = [];

        this.update((current) => {
            const removedItem = current.splice(index, 1);

            removed.concat(removedItem);

            return current;
        });
        this.itemRemoved.emit([removed[0], index]);

        return removed;
    }
}
