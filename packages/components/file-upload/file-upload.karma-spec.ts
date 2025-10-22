import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DELETE } from '@koobiq/cdk/keycodes';
import { createFakeEvent, dispatchEvent, dispatchKeyboardEvent } from '@koobiq/cdk/testing';
import { KbqFileDropDirective, KbqFileValidatorFn } from '@koobiq/components/file-upload';
import { KbqFileItem } from './file-upload';
import { KbqFileUploadModule } from './file-upload.module';
import { KbqMultipleFileUploadComponent } from './multiple-file-upload.component';
import { KbqSingleFileUploadComponent } from './single-file-upload.component';

const fileItemRowCssClass = 'multiple__uploaded-item';

const fileItemCssClass = 'file-item';

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
}

const createMockFile = (fileName: string = FILE_NAME) => new File(['test'] satisfies BlobPart[], fileName);

const getMockedChangeEventForMultiple = (fileNameOrFakeFile: string | Partial<File>) => {
    const event = createFakeEvent('change');

    Object.defineProperty(event, 'target', {
        get: () => ({
            files: [typeof fileNameOrFakeFile === 'string' ? createMockFile(fileNameOrFakeFile) : fileNameOrFakeFile]
        })
    });

    return event;
};

const getMockedChangeEventForSingle = (fileNameOrFakeFile: string | Partial<File>) => {
    const event = createFakeEvent('change');

    Object.defineProperty(event, 'target', {
        get: () => ({
            files: {
                item: (_: number) =>
                    typeof fileNameOrFakeFile === 'string' ? createMockFile(fileNameOrFakeFile) : fileNameOrFakeFile
            }
        })
    });

    return event;
};

describe('KbqMultipleFileUploadComponent', () => {
    let component: BasicMultipleFileUpload;
    let fixture: ComponentFixture<BasicMultipleFileUpload>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqFileUploadModule, FormsModule, ReactiveFormsModule],
            declarations: [
                BasicMultipleFileUpload,
                ControlValueAccessorMultipleFileUpload
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(BasicMultipleFileUpload);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('with file-drop', () => {
        it('should add files via drag-n-drop', fakeAsync(() => {
            expect(component.files).toBeUndefined();

            spyOn(component, 'onChange').and.callThrough();

            component.disabled = false;
            fixture.detectChanges();

            dispatchDropEvent(fixture);

            tick();

            expect(component.onChange).toHaveBeenCalledTimes(1);
            expect(component.files.length).toEqual(1);
            expect(component.files[0].file.name).toBe(FILE_NAME);
        }));

        it('should NOT add files via drag-n-drop if disabled', fakeAsync(() => {
            spyOn(component, 'onChange').and.callThrough();

            component.disabled = true;
            fixture.detectChanges();

            dispatchDropEvent(fixture);

            tick();

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

                tick();

                expect(component.control.touched).toBeTruthy();
            }));
        });
    });

    describe('with focus and keyboard', () => {
        it('should remove file via button keydown.delete in a row', () => {
            spyOn(component, 'onChange');
            component.disabled = false;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload.input.nativeElement, getMockedChangeEventForMultiple(FILE_NAME));
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
});

describe('KbqSingleFileUploadComponent', () => {
    let component: BasicSingleFileUpload;
    let fixture: ComponentFixture<BasicSingleFileUpload>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqFileUploadModule, FormsModule, ReactiveFormsModule],
            declarations: [
                BasicSingleFileUpload,
                ControlValueAccessorSingleFileUpload
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(BasicSingleFileUpload);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('with file-drop', () => {
        it('should add file via drag-n-drop', fakeAsync(() => {
            spyOn(component, 'onChange').and.callThrough();
            expect(component.file).toBeUndefined();

            component.disabled = false;
            fixture.detectChanges();

            dispatchDropEvent(fixture);

            tick();

            expect(component.onChange).toHaveBeenCalledTimes(1);
            expect(component.file?.file.name).toBe(FILE_NAME);
        }));

        it('should NOT add file via drag-n-drop if disabled', fakeAsync(() => {
            spyOn(component, 'onChange').and.callThrough();
            expect(component.file).toBeUndefined();

            component.disabled = true;
            fixture.detectChanges();

            dispatchDropEvent(fixture);

            tick();

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

                tick();

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
                flush();

                dispatchDropEvent(fixture, 'test.pdf');
                fixture.detectChanges();
                flush();

                dispatchDropEvent(fixture, 'test.png');
                fixture.detectChanges();
                flush();

                expect(component.onChange).toHaveBeenCalledTimes(2);
            }));

            it('should filter files via drag-n-drop with mimeType', fakeAsync(() => {
                component.disabled = false;
                component.accept = ['application/pdf'];
                fixture.detectChanges();

                dispatchDropEvent(fixture, 'test.test');
                fixture.detectChanges();
                flush();

                // in file system file type will be automatically provided
                dispatchDropEvent(fixture, 'test.pdf', 'application/pdf');
                fixture.detectChanges();
                flush();

                expect(component.onChange).toHaveBeenCalledTimes(1);
            }));
        });
    });

    describe('with focus and keyboard', () => {
        it('should remove file via button keydown.delete', () => {
            component.disabled = false;
            fixture.detectChanges();
            dispatchEvent(component.fileUpload.input.nativeElement, getMockedChangeEventForSingle(FILE_NAME));
            fixture.detectChanges();

            const subscription = component.fileUpload.fileChange.subscribe((value) => {
                expect(value).toBeFalsy();
            });

            dispatchKeyboardEvent(
                component.elementRef.nativeElement.querySelector(`.${fileItemCssClass} .kbq-icon-button`),
                'keydown',
                DELETE
            );
            subscription.unsubscribe();
        });
    });
});

@Component({
    selector: '',
    template: `
        <div style="max-width: 350px;">
            <kbq-single-file-upload
                #fileUpload
                [accept]="accept"
                [customValidation]="validation"
                [disabled]="disabled"
                (fileQueueChange)="onChange($event)"
            />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class BasicSingleFileUpload {
    @ViewChild('fileUpload') fileUpload: KbqSingleFileUploadComponent;
    disabled: boolean;
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
    template: `
        <div style="max-width: 350px;">
            <kbq-multiple-file-upload
                #fileUpload
                [disabled]="disabled"
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
    files: KbqFileItem[];
    validation: KbqFileValidatorFn[] = [];

    constructor(public elementRef: ElementRef) {}

    onChange(event: KbqFileItem[]) {
        this.files = event;
    }
}

@Component({
    selector: '',
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

    onChange = (file: KbqFileItem) => {
        this.file = file;
    };
}
