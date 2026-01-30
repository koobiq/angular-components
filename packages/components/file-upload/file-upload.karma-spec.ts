import { ChangeDetectionStrategy, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DELETE } from '@koobiq/cdk/keycodes';
import { createFakeEvent, dispatchEvent, dispatchKeyboardEvent } from '@koobiq/cdk/testing';
import {
    KbqDropzoneData,
    KbqFileDropDirective,
    KbqFileValidatorFn,
    KbqFullScreenDropzoneService
} from '@koobiq/components/file-upload';
import { KbqFileItem } from './file-upload';
import { KbqFileUploadModule } from './file-upload.module';
import { KbqMultipleFileUploadComponent } from './multiple-file-upload.component';
import { KbqSingleFileUploadComponent } from './single-file-upload.component';

const fileItemRowCssClass = 'kbq-file-upload__item';

const fileUploadActionCssClass = 'kbq-file-upload__action';

const FILE_NAME = 'test.file';

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

export const createFile = (
    name: string,
    type?: string
): { kind: string; webkitGetAsEntry(): Partial<FileSystemFileEntry> } => ({
    kind: 'file',
    webkitGetAsEntry: () => createFSFile(name, type)
});

function dispatchDropEvent<T>(fixture: ComponentFixture<T>, fileName = FILE_NAME, type?: string) {
    const fakeDropEvent = createFakeEvent('drop');
    const fakeItem = createFile(fileName, type);

    fakeDropEvent['dataTransfer'] = { items: [fakeItem] };

    dispatchEvent(fixture.debugElement.query(By.directive(KbqFileDropDirective)).nativeElement, fakeDropEvent);
    fixture.detectChanges();

    tick();
}

const createMockFile = (fileName: string = FILE_NAME, options?: FilePropertyBag) =>
    new File(['test'] satisfies BlobPart[], fileName, options);

const getMockedChangeEvent = (fileNameOrFakeFile: string | Partial<File>) => {
    const event = createFakeEvent('change');

    const file = typeof fileNameOrFakeFile === 'string' ? createMockFile(fileNameOrFakeFile) : fileNameOrFakeFile;

    const target = document.createElement('input');

    Object.defineProperty(target, 'files', {
        get: () => ({
            item: (_index: number) => file as File,
            length: 1,
            0: file as File
        })
    });

    Object.defineProperty(event, 'target', {
        get: () => target
    });

    return event;
};

describe('KbqMultipleFileUploadComponent', () => {
    let component: BasicMultipleFileUpload;
    let fixture: ComponentFixture<BasicMultipleFileUpload>;
    let dropzoneService: KbqFullScreenDropzoneService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                KbqFileUploadModule,
                FormsModule,
                ReactiveFormsModule,
                BasicMultipleFileUpload,
                ControlValueAccessorMultipleFileUpload
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(BasicMultipleFileUpload);
        component = fixture.componentInstance;
        dropzoneService = fixture.debugElement
            .query(By.directive(KbqMultipleFileUploadComponent))
            .injector.get(KbqFullScreenDropzoneService);
        fixture.detectChanges();
    });

    describe('with file-drop', () => {
        it('should add files via drag-n-drop', fakeAsync(() => {
            expect(component.files).toBeUndefined();

            spyOn(component, 'onChange').and.callThrough();

            component.disabled = false;
            fixture.detectChanges();

            dispatchDropEvent(fixture);

            expect(component.onChange).toHaveBeenCalledTimes(1);
            expect(component.files.length).toEqual(1);
            expect(component.files[0].file.name).toBe(FILE_NAME);
        }));

        it('should NOT add files via drag-n-drop if disabled', fakeAsync(() => {
            spyOn(component, 'onChange').and.callThrough();

            component.disabled = true;
            component.fileUpload.setDisabledState(true);
            fixture.detectChanges();

            dispatchDropEvent(fixture);

            expect(component.onChange).toHaveBeenCalledTimes(0);
        }));

        describe('with ControlValueAccessor', () => {
            let fixture: ComponentFixture<ControlValueAccessorMultipleFileUpload>;
            let component: ControlValueAccessorMultipleFileUpload;

            beforeEach(() => {
                fixture = TestBed.createComponent(ControlValueAccessorMultipleFileUpload);
                component = fixture.componentInstance;
                fixture.detectChanges();
            });

            it('should update form control touched on file dropped', fakeAsync(() => {
                fixture.detectChanges();
                expect(component.control.touched).toBeFalsy();

                dispatchDropEvent(fixture);

                expect(component.control.touched).toBeTruthy();
            }));
        });
    });

    describe('with focus and keyboard', () => {
        it('should remove file via button keydown.delete in a row', () => {
            spyOn(component, 'onChange');
            component.disabled = false;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload.input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();

            const subscription = component.fileUpload.filesChange.subscribe((value) => {
                expect(value.length).toBeFalsy();
            });

            dispatchKeyboardEvent(
                fixture.debugElement.query(By.css(`.${fileItemRowCssClass}`)).nativeElement,
                'keydown',
                DELETE
            );
            subscription.unsubscribe();
        });
    });

    describe('with fullscreen dropzone', () => {
        it('should disable fileDrop directive', fakeAsync(() => {
            spyOn(component, 'onChange').and.callThrough();

            component.fullScreenDropZone.set(true);
            fixture.detectChanges();
            tick();

            dispatchDropEvent(fixture);

            expect(component.onChange).not.toHaveBeenCalled();
        }));

        it('should init dropzone service with provided config', fakeAsync(() => {
            spyOn(dropzoneService, 'init').and.callThrough();

            const config: KbqDropzoneData = {
                title: 'TITLE',
                caption: 'CAPTION',
                size: 'compact'
            };

            component.fullScreenDropZone.set(config);
            fixture.detectChanges();
            tick();

            expect(dropzoneService.init).toHaveBeenCalledWith(config);
        }));

        it('should init dropzone service with empty config when boolean true is provided', fakeAsync(() => {
            spyOn(dropzoneService, 'init').and.callThrough();
            component.fullScreenDropZone.set(true);
            fixture.detectChanges();
            tick();

            expect(dropzoneService.init).toHaveBeenCalledWith({});
        }));

        it('should stop dropzone service if fullScreen dropzone input changed to false', fakeAsync(() => {
            spyOn(dropzoneService, 'init').and.callThrough();
            const stop = spyOn(dropzoneService, 'stop').and.callThrough();

            component.fullScreenDropZone.set(true);
            fixture.detectChanges();
            tick();

            stop.calls.reset();

            component.fullScreenDropZone.set(false);
            fixture.detectChanges();

            expect(dropzoneService.stop).toHaveBeenCalled();
        }));

        it('should listen to filesDropped via dropzoneService', () => {
            const mockFiles = [
                { ...createMockFile('test1.txt', { type: 'text/plain' }), fullPath: 'test1.txt' },
                { ...createMockFile('test2.txt', { type: 'text/plain' }), fullPath: 'test2.txt' }
            ];

            dropzoneService.filesDropped.emit(mockFiles);

            expect(component.files.length).toEqual(mockFiles.length);
        });
    });
});

describe('KbqSingleFileUploadComponent', () => {
    let component: BasicSingleFileUpload;
    let fixture: ComponentFixture<BasicSingleFileUpload>;
    let dropzoneService: KbqFullScreenDropzoneService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                KbqFileUploadModule,
                FormsModule,
                ReactiveFormsModule,
                BasicSingleFileUpload,
                ControlValueAccessorSingleFileUpload
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(BasicSingleFileUpload);
        component = fixture.componentInstance;
        dropzoneService = fixture.debugElement
            .query(By.directive(KbqSingleFileUploadComponent))
            .injector.get(KbqFullScreenDropzoneService);
        fixture.detectChanges();
    });

    describe('with file-drop', () => {
        it('should add file via drag-n-drop', fakeAsync(() => {
            spyOn(component, 'onChange').and.callThrough();
            expect(component.file).toBeUndefined();

            component.disabled = false;
            fixture.detectChanges();

            dispatchDropEvent(fixture);

            expect(component.onChange).toHaveBeenCalledTimes(1);
            expect(component.file?.file.name).toBe(FILE_NAME);
        }));

        it('should NOT add file via drag-n-drop if disabled', fakeAsync(() => {
            spyOn(component, 'onChange').and.callThrough();
            expect(component.file).toBeUndefined();

            component.disabled = true;
            component.fileUpload.setDisabledState(true);
            fixture.detectChanges();

            dispatchDropEvent(fixture);

            expect(component.onChange).toHaveBeenCalledTimes(0);
            expect(component.file).toBeUndefined();
        }));

        describe('with ControlValueAccessor', () => {
            let fixture: ComponentFixture<ControlValueAccessorSingleFileUpload>;
            let component: ControlValueAccessorSingleFileUpload;

            beforeEach(() => {
                fixture = TestBed.createComponent(ControlValueAccessorSingleFileUpload);
                component = fixture.componentInstance;
                fixture.detectChanges();
            });

            it('should update form control touched on file dropped', fakeAsync(() => {
                fixture.detectChanges();
                expect(component.control.touched).toBeFalsy();

                dispatchDropEvent(fixture);

                expect(component.control.touched).toBeTruthy();
            }));
        });

        // TODO: real-life scenario & test results with the same data are different (#DS-4300)
        xdescribe('with accepted files list', () => {
            it('should filter files via drag-n-drop with extensions', fakeAsync(() => {
                component.disabled = false;
                component.accept = ['.pdf', '.png'];
                fixture.detectChanges();

                dispatchDropEvent(fixture, 'test.test');
                fixture.detectChanges();

                dispatchDropEvent(fixture, 'test.pdf');
                fixture.detectChanges();

                dispatchDropEvent(fixture, 'test.png');
                fixture.detectChanges();

                expect(component.onChange).toHaveBeenCalledTimes(2);
            }));

            it('should filter files via drag-n-drop with mimeType', fakeAsync(() => {
                component.disabled = false;
                component.accept = ['application/pdf'];
                fixture.detectChanges();

                dispatchDropEvent(fixture, 'test.test');
                fixture.detectChanges();

                // in file system file type will be automatically provided
                dispatchDropEvent(fixture, 'test.pdf', 'application/pdf');
                fixture.detectChanges();

                expect(component.onChange).toHaveBeenCalledTimes(1);
            }));
        });
    });

    describe('with focus and keyboard', () => {
        it('should remove file via button keydown.delete', () => {
            component.disabled = false;
            fixture.detectChanges();
            dispatchEvent(component.fileUpload.input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();

            const subscription = component.fileUpload.fileChange.subscribe((value) => {
                expect(value).toBeFalsy();
            });

            dispatchKeyboardEvent(
                component.elementRef.nativeElement.querySelector(`.${fileUploadActionCssClass}`),
                'keydown',
                DELETE
            );
            subscription.unsubscribe();
        });
    });

    describe('with fullscreen dropzone', () => {
        it('should disable fileDrop directive', fakeAsync(() => {
            spyOn(component, 'onChange').and.callThrough();

            component.fullScreenDropZone.set(true);
            fixture.detectChanges();
            tick();

            dispatchDropEvent(fixture);

            expect(component.onChange).not.toHaveBeenCalled();
        }));

        it('should init dropzone service with provided config', fakeAsync(() => {
            spyOn(dropzoneService, 'init').and.callThrough();

            const config: KbqDropzoneData = {
                title: 'TITLE',
                caption: 'CAPTION',
                size: 'compact'
            };

            component.fullScreenDropZone.set(config);
            fixture.detectChanges();
            tick();

            expect(dropzoneService.init).toHaveBeenCalledWith(config);
        }));

        it('should init dropzone service with empty config when boolean true is provided', fakeAsync(() => {
            spyOn(dropzoneService, 'init').and.callThrough();
            component.fullScreenDropZone.set(true);
            fixture.detectChanges();
            tick();

            expect(dropzoneService.init).toHaveBeenCalledWith({});
        }));

        it('should stop dropzone service if fullScreen dropzone input changed to false', fakeAsync(() => {
            spyOn(dropzoneService, 'init').and.callThrough();
            const stop = spyOn(dropzoneService, 'stop').and.callThrough();

            // First enable
            component.fullScreenDropZone.set(true);
            fixture.detectChanges();
            tick();

            stop.calls.reset();

            // Now disable
            component.fullScreenDropZone.set(false);
            fixture.detectChanges();

            expect(dropzoneService.stop).toHaveBeenCalled();
        }));

        it('should listen to filesDropped via dropzoneService', () => {
            const mockFiles = [
                { ...createMockFile('test1.txt', { type: 'text/plain' }), fullPath: 'test1.txt' }];

            // Trigger filesDropped event
            dropzoneService.filesDropped.emit(mockFiles);

            // Verify that the component received the files
            expect(component.file?.file).toEqual(mockFiles[0]);
        });
    });
});

@Component({
    selector: '',
    imports: [KbqFileUploadModule, FormsModule, ReactiveFormsModule],
    template: `
        <div style="max-width: 350px;">
            <kbq-single-file-upload
                #fileUpload
                [accept]="accept"
                [customValidation]="validation"
                [disabled]="disabled"
                [fullScreenDropZone]="fullScreenDropZone()"
                (fileQueueChange)="onChange($event)"
            />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class BasicSingleFileUpload {
    @ViewChild('fileUpload') fileUpload: KbqSingleFileUploadComponent;
    disabled: boolean;
    fullScreenDropZone = signal<KbqDropzoneData | boolean | undefined>(undefined);
    file: KbqFileItem | null;
    accept: string[] = [];
    validation: KbqFileValidatorFn[] = [];

    constructor(public elementRef: ElementRef) {}

    onChange(event: KbqFileItem | null) {
        this.file = event;
    }
}

@Component({
    selector: '',
    imports: [KbqFileUploadModule, FormsModule, ReactiveFormsModule],
    template: `
        <div style="max-width: 350px;">
            <kbq-multiple-file-upload
                #fileUpload
                [disabled]="disabled"
                [fullScreenDropZone]="fullScreenDropZone()"
                [customValidation]="validation"
                (fileQueueChanged)="onChange($event)"
            />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class BasicMultipleFileUpload {
    @ViewChild('fileUpload') fileUpload: KbqMultipleFileUploadComponent;
    disabled: boolean;
    fullScreenDropZone = signal<KbqDropzoneData | boolean | undefined>(undefined);
    files: KbqFileItem[];
    validation: KbqFileValidatorFn[] = [];

    constructor(public elementRef: ElementRef) {}

    onChange(event: KbqFileItem[]) {
        this.files = event;
    }
}

@Component({
    selector: '',
    imports: [KbqFileUploadModule, FormsModule, ReactiveFormsModule],
    template: `
        <div style="max-width: 350px;">
            <kbq-multiple-file-upload
                #fileUpload
                [formControl]="control"
                [accept]="accept"
                [customValidation]="validation"
                (fileQueueChanged)="onChange($event)"
            />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ControlValueAccessorMultipleFileUpload {
    @ViewChild('fileUpload') fileUpload: KbqMultipleFileUploadComponent;
    files: KbqFileItem[];
    accept: string[] = [];
    validation: KbqFileValidatorFn[] = [];
    control = new FormControl();

    constructor(public elementRef: ElementRef) {}

    onChange(event: KbqFileItem[]) {
        this.files = event;
    }
}

@Component({
    selector: '',
    imports: [KbqFileUploadModule, FormsModule, ReactiveFormsModule],
    template: `
        <div style="max-width: 350px;">
            <kbq-file-upload
                #fileUpload
                [formControl]="control"
                [accept]="accept"
                [customValidation]="validation"
                (fileQueueChange)="onChange($event)"
            />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ControlValueAccessorSingleFileUpload {
    @ViewChild('fileUpload') fileUpload: KbqSingleFileUploadComponent;
    file: KbqFileItem | null;
    accept: string[] = [];
    validation: KbqFileValidatorFn[] = [];
    control = new FormControl();

    constructor(public elementRef: ElementRef) {}

    onChange = (file: KbqFileItem | null) => {
        this.file = file;
    };
}
