import { DestroyRef, Directive, inject, model, NgZone, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { kbqInjectNativeElement } from '@koobiq/components/core';
import { filter, fromEvent } from 'rxjs';
import { KbqFile } from '../file-upload';

const isFolderCanBeDragged = (): boolean => 'webkitGetAsEntry' in DataTransferItem.prototype;
const entryIsDirectory = (entry?: FileSystemEntry): entry is FileSystemDirectoryEntry => !!entry && entry.isDirectory;
const entryIsFile = (entry?: FileSystemEntry): entry is FileSystemFileEntry => !!entry && entry.isFile;

@Directive()
export class KbqDrop {
    /**
     * Controls whether drag-and-drop functionality is enabled.
     * When true, all drag events are filtered out and ignored.
     */
    readonly disabled = model(false);

    /** Emits an event when file items were dropped. */
    readonly filesDropped = output<KbqFile[]>();

    /** @docs-private */
    protected onDrop(event: DragEvent) {
        if (!isFolderCanBeDragged()) {
            // eslint-disable-next-line no-console
            console.warn('Drag-and-drop functionality for folders is not supported by this browser.');
        }

        event.preventDefault();
        event.stopPropagation();

        if (event.dataTransfer && event.dataTransfer.items.length > 0) {
            const fileEntries: FileSystemEntry[] = Array.from(event.dataTransfer.items)
                .filter((item: DataTransferItem) => item.kind === 'file')
                .map((item: DataTransferItem) => item.webkitGetAsEntry()!);

            Promise.all(fileEntries.map(unwrapDirectory))
                .then((fileList) => fileList.reduce((res, next) => res.concat(next), []))
                .then((entries: KbqFile[]) => this.filesDropped.emit(entries));
        }
    }
}

@Directive({
    selector: '[kbqFileDrop]',
    exportAs: 'kbqFileDrop',
    host: {
        class: 'kbq-file-drop',
        '[class.kbq-file-drop_dragover]': 'dragover()'
    }
})
export class KbqFileDropDirective extends KbqDrop {
    /** Flag that controls css-class modifications on drag events. */
    protected readonly dragover = signal(false);

    private readonly ngZone = inject(NgZone);
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        super();

        this.init();
    }

    onDragEnter(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();

        this.dragover.set(true);
    }

    /** @docs-private */
    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }

    /** @docs-private */
    onDragLeave(event: DragEvent): void {
        if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as HTMLElement)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.dragover.set(false);
    }

    /** @docs-private */
    onDrop(event: DragEvent): void {
        super.onDrop(event);
        this.dragover.set(false);
    }

    private init(): void {
        this.ngZone.runOutsideAngular(() => {
            fromEvent<DragEvent>(this.nativeElement, 'dragenter')
                .pipe(
                    filter(() => !this.disabled()),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe((e) => this.onDragEnter(e));

            fromEvent<DragEvent>(this.nativeElement, 'dragover')
                .pipe(
                    filter(() => !this.disabled()),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe((e) => this.onDragOver(e));

            fromEvent<DragEvent>(this.nativeElement, 'dragleave')
                .pipe(
                    filter(() => !this.disabled()),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe((e) => this.onDragLeave(e));

            fromEvent<DragEvent>(this.nativeElement, 'drop')
                .pipe(
                    filter(() => !this.disabled()),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe((e) => {
                    this.ngZone.run(() => this.onDrop(e));
                });
        });
    }
}

const unwrapDirectory = async (item: FileSystemEntry): Promise<KbqFile[]> => {
    const queue: (FileSystemEntry | Promise<FileSystemEntry[]>)[] = [item];
    const result: Promise<KbqFile>[] = [];

    while (queue.length > 0) {
        const next = queue.pop();

        if (next instanceof Promise) {
            queue.push(...(await next));
        } else if (entryIsDirectory(next)) {
            const directoryReader = next.createReader();

            queue.push(
                new Promise<FileSystemEntry[]>((resolve, reject) => directoryReader.readEntries(resolve, reject))
            );
        } else if (entryIsFile(next)) {
            const fileEntry = next;

            result.push(
                new Promise((resolve, reject) => {
                    fileEntry.file((file) => {
                        (file as KbqFile).fullPath = fileEntry.fullPath;
                        resolve(file as KbqFile);
                    }, reject);
                })
            );
        }
    }

    return Promise.all(result);
};
