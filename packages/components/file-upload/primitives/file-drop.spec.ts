import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchEvent, dispatchFakeEvent } from '@koobiq/cdk/testing';
import { KbqFile } from '../file-upload';
import { KbqFileDropDirective } from './file-drop';

export const createFile = (
    name: string,
    type?: string
): { kind: string; webkitGetAsEntry(): Partial<FileSystemFileEntry> } => ({
    kind: 'file',
    webkitGetAsEntry: () => createFSFile(name, type)
});

const createFSFile = (name: string, type = '') => {
    const file: Partial<File> = { name, type };

    return {
        name,
        fullPath: name,
        isDirectory: false,
        isFile: true,
        file: (successCb) => successCb(file)
    };
};

describe('FileDropDirective', () => {
    let component: SimpleDNDComponent;
    let fixture: ComponentFixture<SimpleDNDComponent>;
    let dndZone: HTMLDivElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SimpleDNDComponent, KbqFileDropDirective]
        }).compileComponents();

        fixture = TestBed.createComponent(SimpleDNDComponent);
        component = fixture.componentInstance;
        dndZone = fixture.debugElement.query(By.css('div')).nativeElement;

        fixture.detectChanges();
    });

    it('FileDropDirective: dragover/dragleave', () => {
        expect(dndZone.classList.contains('kbq-file-drop_dragover')).toBeFalsy();

        dispatchFakeEvent(dndZone, 'dragenter');
        fixture.detectChanges();

        expect(dndZone.classList.contains('kbq-file-drop_dragover')).toBeTruthy();

        dispatchFakeEvent(dndZone, 'dragleave');
        fixture.detectChanges();

        expect(dndZone.classList.contains('kbq-file-drop_dragover')).toBeFalsy();
    });

    it('FileDropDirective: drop with files', (done) => {
        const event = new CustomEvent('CustomEvent');

        event.initCustomEvent('drop');
        const fakeFiles = [createFile('test.file')];

        (event as any).dataTransfer = { items: fakeFiles };

        dispatchFakeEvent(dndZone, 'dragenter');
        fixture.detectChanges();

        expect(dndZone.classList.contains('kbq-file-drop_dragover')).toBeTruthy();

        dispatchEvent(dndZone, event);
        fixture.detectChanges();

        setTimeout(() => {
            expect(component.onDrop).toHaveBeenCalledWith(expect.objectContaining({ length: fakeFiles.length }));
            expect(dndZone.classList.contains('kbq-file-drop_dragover')).toBeFalsy();
            done();
        });
    });

    it('FileDropDirective: drop without files', () => {
        const fakeDropEvent = new DragEvent('drop', { dataTransfer: new DataTransfer() });

        dispatchEvent(dndZone, fakeDropEvent);
        fixture.detectChanges();

        expect(component.onDrop).not.toHaveBeenCalled();
    });

    it('FileDropDirective: drop folder', (done) => {
        const event = new CustomEvent('CustomEvent');

        event.initCustomEvent('drop');
        const fakeFiles = [
            createFSFile('test1'),
            createFSFile('test2')
        ];

        const fakeDirectoryItem = {
            kind: 'file',
            webkitGetAsEntry: () => ({
                isDirectory: true,
                isFile: false,
                createReader: () => ({
                    readEntries: (successCb) => successCb(fakeFiles)
                })
            })
        };

        (event as any).dataTransfer = { items: [fakeDirectoryItem] };

        dispatchFakeEvent(dndZone, 'dragenter');
        fixture.detectChanges();

        dispatchEvent(dndZone, event);
        fixture.detectChanges();

        setTimeout(() => {
            expect(component.onDrop).toHaveBeenCalledWith(expect.objectContaining({ length: fakeFiles.length }));
            expect(component.files.length).toEqual(fakeFiles.length);
            done();
        });
    });
});

@Component({
    imports: [
        KbqFileDropDirective
    ],
    template: '<div style="width: 200px; height: 200px;" kbqFileDrop (filesDropped)="onDrop($event)"></div>'
})
class SimpleDNDComponent {
    files: FileList | KbqFile[];

    onDrop = jest.fn().mockImplementation((event: FileList | KbqFile[]) => {
        this.files = event;
    });
}
