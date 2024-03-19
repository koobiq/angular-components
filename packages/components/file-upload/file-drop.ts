import { Directive, Output, EventEmitter } from '@angular/core';

import { KbqFile } from './file-upload';


const isFolderCanBeDragged = (): boolean => 'webkitGetAsEntry' in DataTransferItem.prototype;
const entryIsDirectory = (entry?: FileSystemEntry): entry is FileSystemDirectoryEntry => !!entry && entry.isDirectory;
const entryIsFile = (entry?: FileSystemEntry): entry is FileSystemFileEntry => !!entry && entry.isFile;


@Directive({
    selector: '[kbqFileDrop]',
    exportAs: 'kbqFileDrop',
    host: {
        '[class.dragover]': 'dragover',
        '(dragover)': 'onDragOver($event)',
        '(dragleave)': 'onDragLeave($event)',
        '(drop)': 'onDrop($event)'
    }
})
export class KbqFileDropDirective {
    dragover: boolean;

    @Output() filesDropped: EventEmitter<FileList | KbqFile[]> = new EventEmitter<FileList | KbqFile[]>();

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.dragover = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.dragover = false;
    }

    onDrop(event: DragEvent) {
        if (!isFolderCanBeDragged()) {
            console.warn('Drag-and-drop functionality for folders is not supported by this browser.');
        }

        event.preventDefault();
        event.stopPropagation();
        this.dragover = false;

        if (event.dataTransfer && event.dataTransfer.items.length > 0) {
            // event.dataTransfer.items requires dom.iterable lib
            // @ts-ignore
            const fileEntries: FileSystemEntry[] = [...event.dataTransfer.items]
                .filter((item: DataTransferItem) => item.kind === 'file')
                .map((item) => item.webkitGetAsEntry() as FileSystemEntry);

            Promise.all(fileEntries.map(unwrapDirectory))
                .then((fileList) => fileList.reduce((res, next) => res.concat(next), []))
                .then((entries: KbqFile[]) => this.filesDropped.emit(entries));
        }
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
                    fileEntry.file(
                        (file) => {
                            (file as KbqFile).fullPath = fileEntry.fullPath;
                            resolve(file as KbqFile);
                        },
                        reject);
                })
            );
        }
    }

    return Promise.all(result);
};
