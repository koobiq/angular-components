// tslint:disable:no-empty
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent, dispatchEvent } from '@koobiq/cdk/testing';

import { KbqFileDropDirective } from './file-drop';
import { KbqFile } from './file-upload';


export const createFile = (name: string, type?: string): { kind: string; webkitGetAsEntry(): Partial<FileSystemFileEntry>} => ({
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
    }
};

describe('FileDropDirective', () => {
    let component: SimpleDNDComponent;
    let fixture: ComponentFixture<SimpleDNDComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SimpleDNDComponent, KbqFileDropDirective]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SimpleDNDComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('FileDropDirective: dragover/dragleave', () => {
        const dndZone = fixture.debugElement.query(By.css('div')).nativeElement;

        expect(dndZone.classList.contains('dragover')).toBeFalse();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        dispatchFakeEvent(dndZone, 'dragover');
        fixture.detectChanges();

        expect(dndZone.classList.contains('dragover')).toBeTrue();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        dispatchFakeEvent(dndZone, 'dragleave');
        fixture.detectChanges();

        expect(dndZone.classList.contains('dragover')).toBeFalse();
    });

    it('FileDropDirective: drop with files', fakeAsync(() => {
        const event = new CustomEvent('CustomEvent');
        event.initCustomEvent('drop');
        const dndZone = fixture.debugElement.query(By.css('div')).nativeElement;
        (event as any).dataTransfer = { items: [createFile('test.file')] };
        spyOn(component, 'onDrop');

        dispatchFakeEvent(dndZone, 'dragover');
        fixture.detectChanges();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        dispatchEvent(dndZone, event);
        fixture.detectChanges();
        flush();

        expect(dndZone.classList.contains('dragover')).toBeFalse();
        expect(component.onDrop).toHaveBeenCalled();
    }));

    it('FileDropDirective: drop without files', () => {
        const dndZone = fixture.debugElement.query(By.css('div')).nativeElement;
        const fakeDropEvent = new DragEvent('drop', { dataTransfer: new DataTransfer() });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        spyOn(component, 'onDrop');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        dispatchEvent(dndZone, fakeDropEvent);
        fixture.detectChanges();

        expect(component.onDrop).not.toHaveBeenCalled();
    });


    it('FileDropDirective: drop folder', fakeAsync(() => {
        const event = new CustomEvent('CustomEvent');
        event.initCustomEvent('drop');
        const dndZone = fixture.debugElement.query(By.css('div')).nativeElement;
        const fakeFiles = [
            createFSFile('test1'), createFSFile('test2')
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
        spyOn(component, 'onDrop').and.callThrough();

        dispatchFakeEvent(dndZone, 'dragover');
        fixture.detectChanges();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        dispatchEvent(dndZone, event);
        fixture.detectChanges();
        flush();

        expect(dndZone.classList.contains('dragover')).toBeFalse();
        expect(component.onDrop).toHaveBeenCalled();
        expect(component.files.length).toEqual(fakeFiles.length);
    }));
});

@Component({
    template: '<div style="width: 200px; height: 200px;" kbqFileDrop (filesDropped)="onDrop($event)"></div>'
})
class SimpleDNDComponent {
    files: KbqFile[];

    onDrop(event: FileList | KbqFile[]): void {
        if (event instanceof Array) {
            this.files = event;
        }
    }
}
