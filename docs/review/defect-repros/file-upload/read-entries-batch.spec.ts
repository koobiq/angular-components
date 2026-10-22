import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createFakeEvent, dispatchEvent } from '@koobiq/components/core';
import { KbqFile, KbqFileDropDirective } from '@koobiq/components/file-upload';

/** Chromium hands out the entries of a directory in batches of at most 100 per `readEntries()` call. */
const BATCH_SIZE = 100;
const FILES_IN_FOLDER = 150;

const createFileEntry = (name: string) => ({
    name,
    fullPath: `/folder/${name}`,
    isDirectory: false,
    isFile: true,
    file: (resolve: (file: File) => void) => resolve(new File(['x'], name))
});

/** A directory reader that behaves like Chromium's: it must be called until it returns an empty batch. */
const createBatchingDirectory = (entries: ReturnType<typeof createFileEntry>[]) => {
    const reader = {
        offset: 0,
        readEntries: vi.fn((resolve: (batch: unknown[]) => void) => {
            const batch = entries.slice(reader.offset, reader.offset + BATCH_SIZE);

            reader.offset += batch.length;
            resolve(batch);
        })
    };

    return {
        reader,
        entry: { name: 'folder', fullPath: '/folder', isDirectory: true, isFile: false, createReader: () => reader }
    };
};

@Component({
    selector: 'test-app',
    imports: [KbqFileDropDirective],
    template: `
        <div kbqFileDrop (filesDropped)="dropped = $event"></div>
    `
})
class TestApp {
    dropped: KbqFile[] | null = null;
}

describe('triage: a dropped folder is read with a single readEntries() call', () => {
    let fixture: ComponentFixture<TestApp>;

    beforeEach(() => {
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
    });

    it('DEFECT: files of a dropped folder past the first readEntries() batch are lost', async () => {
        const entries = Array.from({ length: FILES_IN_FOLDER }, (_, index) => createFileEntry(`file-${index}.txt`));
        const { reader, entry } = createBatchingDirectory(entries);
        const drop = createFakeEvent('drop');

        (drop as unknown as { dataTransfer: unknown }).dataTransfer = {
            items: [{ kind: 'file', webkitGetAsEntry: () => entry }]
        };

        dispatchEvent(fixture.nativeElement.querySelector('[kbqFileDrop]'), drop);
        await new Promise<void>((resolve) => setTimeout(resolve));

        expect(reader.readEntries).toHaveBeenCalledTimes(1);
        expect(fixture.componentInstance.dropped).toHaveLength(BATCH_SIZE);
        expect(reader.offset).toBeLessThan(FILES_IN_FOLDER);
    });
});
