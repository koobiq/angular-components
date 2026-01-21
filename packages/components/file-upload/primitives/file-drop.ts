import { Directive, effect, model, output, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { kbqInjectNativeElement } from '@koobiq/components/core';
import { filter, fromEvent, takeUntil } from 'rxjs';
import { KbqFile } from '../file-upload';

const isFolderCanBeDragged = (): boolean => 'webkitGetAsEntry' in DataTransferItem.prototype;
const entryIsDirectory = (entry?: FileSystemEntry): entry is FileSystemDirectoryEntry => !!entry && entry.isDirectory;
const entryIsFile = (entry?: FileSystemEntry): entry is FileSystemFileEntry => !!entry && entry.isFile;

@Directive()
export abstract class KbqDrop {
    readonly disabled = model(false);
    protected disabledAsObservable = toObservable(this.disabled).pipe(filter(Boolean));

    /** Emits an event when file items were dropped. */
    readonly filesDropped = output<KbqFile[]>();

    /** @docs-private */
    onDrop(event: DragEvent) {
        if (!isFolderCanBeDragged()) {
            // eslint-disable-next-line no-console
            console.warn('Drag-and-drop functionality for folders is not supported by this browser.');
        }

        event.preventDefault();
        event.stopPropagation();

        if (event.dataTransfer && event.dataTransfer.items.length > 0) {
            // event.dataTransfer.items requires dom.iterable lib
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const fileEntries: FileSystemEntry[] = [...event.dataTransfer.items]
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

    private elementRef = kbqInjectNativeElement();

    constructor() {
        super();

        effect(() => {
            if (!this.disabled()) {
                this.init();
            }
        });
    }

    onDragEnter(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.dragover.set(true);
    }

    /** @docs-private */
    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    /** @docs-private */
    onDragLeave(event: DragEvent) {
        if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as HTMLElement)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.dragover.set(false);
    }

    /** @docs-private */
    onDrop(event: DragEvent) {
        super.onDrop(event);
        this.dragover.set(false);
    }

    private init() {
        fromEvent<DragEvent>(this.elementRef, 'dragenter')
            .pipe(takeUntil(this.disabledAsObservable))
            .subscribe((event) => {
                this.onDragEnter(event);
            });

        fromEvent<DragEvent>(this.elementRef, 'dragover')
            .pipe(takeUntil(this.disabledAsObservable))
            .subscribe((event) => this.onDragOver(event));

        fromEvent<DragEvent>(this.elementRef, 'dragleave')
            .pipe(takeUntil(this.disabledAsObservable))
            .subscribe((event) => this.onDragLeave(event));

        fromEvent<DragEvent>(this.elementRef, 'drop')
            .pipe(takeUntil(this.disabledAsObservable))
            .subscribe((event) => this.onDrop(event));
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
