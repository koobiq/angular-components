import { ChangeDetectorRef, Component, ElementRef, ViewChild, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TAB } from '@koobiq/cdk/keycodes';
import {
    createFakeEvent,
    createMouseEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent
} from '@koobiq/cdk/testing';
import { KbqBaseFileUploadLocaleConfig } from '@koobiq/components/core';
import { KbqFileItem, KbqFileValidatorFn } from './file-upload';
import { KbqFileUploadModule } from './file-upload.module';
import { KbqInputFileMultipleLabel, KbqMultipleFileUploadComponent } from './multiple-file-upload.component';
import { KbqSingleFileUploadComponent } from './single-file-upload.component';

const FILE_NAME = 'test.file';

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

const fileItemActionCssClass = 'kbq-file-upload__action';

const fileItemTextCssClass = 'kbq-file-item__text';

const maxFileExceeded = (file: File): string | null => {
    const kilo = 1024;
    const mega = kilo * kilo;
    const maxMbytes = 5;
    const maxSize = maxMbytes * mega;

    return (file?.size ?? 0 > maxSize) ? `Exceeded with (${maxSize / mega} Mb)` : null;
};

describe(KbqMultipleFileUploadComponent.name, () => {
    let component: BasicMultipleFileUpload;
    let fixture: ComponentFixture<BasicMultipleFileUpload>;

    beforeEach(() => {
        TestBed.configureTestingModule({
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
        fixture.detectChanges();
    });

    describe('with focus and keyboard', () => {
        it('should toggle label focus state on input focused/blurred', fakeAsync(() => {
            const fileInput: HTMLInputElement = component.fileUpload.input!.nativeElement;

            // Simulate focus via keyboard.
            dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
            fileInput.focus();
            fixture.detectChanges();
            flush();

            const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');

            expect(label.classList.contains('cdk-keyboard-focused')).toBeTruthy();

            dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
            fileInput.blur();
            fixture.detectChanges();
            flush();

            expect(label.classList.contains('cdk-keyboard-focused')).toBeFalsy();
        }));

        it('should NOT toggle label focus state on input focus if disabled', fakeAsync(() => {
            const fileInput: HTMLInputElement = component.fileUpload.input!.nativeElement;

            component.disabled = true;
            fixture.detectChanges();

            // Simulate focus via keyboard.
            dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
            dispatchFakeEvent(fileInput, 'focusin');
            fixture.detectChanges();
            flush();

            const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');

            expect(label.classList.contains('cdk-keyboard-focused')).toBeFalsy();
        }));
    });

    describe('with file queue change', () => {
        const emitRemoveEvent = () => {
            dispatchEvent(component.fileUpload.input!.nativeElement, getMockedChangeEventForMultiple(FILE_NAME));
            fixture.detectChanges();

            fixture.debugElement.query(By.css(`.${fileItemActionCssClass} .kbq-icon`)).nativeElement.click();
            fixture.detectChanges();
        };

        it('should add files via input click', () => {
            expect(component.files).toBeUndefined();

            component.disabled = false;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload.input!.nativeElement, getMockedChangeEventForMultiple(FILE_NAME));
            fixture.detectChanges();

            expect(component.onChange).toHaveBeenCalledTimes(1);
            expect(component.files).toHaveLength(1);
            expect(component.files[0].file.name).toBe(FILE_NAME);
        });

        it('should NOT add files via input click if disabled', () => {
            component.disabled = true;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload.input!.nativeElement, getMockedChangeEventForMultiple(FILE_NAME));

            expect(component.onChange).toHaveBeenCalledTimes(0);
        });

        it('should remove file via button click in a row', () => {
            expect(component.files).toBeUndefined();

            component.disabled = false;
            fixture.detectChanges();

            emitRemoveEvent();

            expect(component.onChange).toHaveBeenCalledTimes(2);
            expect(component.files).toHaveLength(0);
        });

        it('should focus label after file removed', fakeAsync(() => {
            component.disabled = false;
            fixture.detectChanges();

            emitRemoveEvent();

            flush();

            expect(document.activeElement).toBe(component.fileUpload.input!.nativeElement);
        }));

        it('should NOT throw error on detectChanges in handler', () => {
            component.onChange = jest.fn().mockImplementation((files: KbqFileItem[]) => {
                component.files = files;
                component.cdr.detectChanges();
            });

            jest.spyOn(component.fileUpload, 'deleteFile');

            dispatchEvent(component.fileUpload.input!.nativeElement, getMockedChangeEventForMultiple(FILE_NAME));
            fixture.detectChanges();

            const event = createMouseEvent('click');

            expect(() => {
                component.fileUpload.deleteFile(0, event);
                fixture.detectChanges();
            }).not.toThrow();
        });
    });

    describe('with custom validation', () => {
        it('should mark added file with error', (done) => {
            expect(component.files).toBeUndefined();
            // max file === 5e6
            component.validation = [maxFileExceeded];
            fixture.detectChanges();

            const fakeFile: Partial<File> = { name: FILE_NAME, type: 'test', size: 6e6 };

            dispatchEvent(component.fileUpload.input!.nativeElement, getMockedChangeEventForMultiple(fakeFile));
            fixture.detectChanges();

            setTimeout(() => {
                expect(component.onChange).toHaveBeenCalledTimes(1);
                expect(component.files).toHaveLength(1);
                expect(component.files[0].hasError).toBeTruthy();
                done();
            });
        });
    });

    describe('with ControlValueAccessor', () => {
        let fixture: ComponentFixture<ControlValueAccessorMultipleFileUpload>;
        let component: ControlValueAccessorMultipleFileUpload;

        beforeEach(() => {
            fixture = TestBed.createComponent(ControlValueAccessorMultipleFileUpload);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should toggle the disabled state', () => {
            expect(component.fileUpload.disabled).toBe(false);

            component.control.disable();
            fixture.detectChanges();

            expect(component.fileUpload.disabled).toBe(true);

            component.control.enable();
            fixture.detectChanges();

            expect(component.fileUpload.disabled).toBe(false);
        });

        it('should update file value with setValue', () => {
            expect(component.fileUpload.files.length).toBeFalsy();

            const fakeFile: Partial<File> = createMockFile(FILE_NAME);
            const dt = new DataTransfer();

            dt.items.add(fakeFile as File);

            component.control.setValue(dt.files);

            expect(component.fileUpload.files.length).toBe(1);
            expect(component.files.length).toBe(1);
        });

        it('should update form control touched on file added via click', () => {
            expect(component.control.touched).toBeFalsy();

            dispatchEvent(component.fileUpload.input!.nativeElement, getMockedChangeEventForMultiple(FILE_NAME));
            fixture.detectChanges();

            expect(component.control.touched).toBeTruthy();
        });
    });

    describe('with localeConfig input property', () => {
        it('should use default properties if they not provided with localeConfig', () => {
            const updatedConfig: Partial<KbqInputFileMultipleLabel> = { captionText: 'TEST {{ browseLink }}' };

            component.localeConfig.set(updatedConfig);
            fixture.detectChanges();

            expect(component.fileUpload.resolvedLocaleConfig()).toMatchSnapshot();
        });
    });
});

describe(KbqSingleFileUploadComponent.name, () => {
    let component: BasicSingleFileUpload;
    let fixture: ComponentFixture<BasicSingleFileUpload>;

    beforeEach(() => {
        TestBed.configureTestingModule({
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
        fixture.detectChanges();
    });

    describe('with focus and keyboard', () => {
        it('should toggle label focus state on input focused/blurred', fakeAsync(() => {
            const fileInput: HTMLInputElement = component.fileUpload.input!.nativeElement;

            // Simulate focus via keyboard.
            dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
            fileInput.focus();
            fixture.detectChanges();
            flush();

            const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');

            expect(label.classList.contains('cdk-keyboard-focused')).toBeTruthy();

            dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
            fileInput.blur();
            fixture.detectChanges();
            flush();

            expect(label.classList.contains('cdk-keyboard-focused')).toBeFalsy();
        }));

        it('should NOT toggle label focus state on input focus if disabled', fakeAsync(() => {
            const fileInput: HTMLInputElement = component.fileUpload.input!.nativeElement;

            component.disabled = true;
            fixture.detectChanges();

            // Simulate focus via keyboard.
            dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
            dispatchFakeEvent(fileInput, 'focusin');
            fixture.detectChanges();
            flush();

            const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');

            expect(label.classList.contains('cdk-keyboard-focused')).toBeFalsy();
        }));
    });

    describe('with file queue change', () => {
        const emitRemoveEvent = () => {
            dispatchEvent(component.fileUpload.input!.nativeElement, getMockedChangeEventForSingle(FILE_NAME));
            fixture.detectChanges();

            component.elementRef.nativeElement.querySelector(`.${fileItemActionCssClass}`).click();
            fixture.detectChanges();
        };

        it('should add file via input click', () => {
            component.disabled = false;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload.input!.nativeElement, getMockedChangeEventForSingle(FILE_NAME));
            fixture.detectChanges();

            expect(component.onChange).toHaveBeenCalledTimes(1);
            expect(component.onChange.mock.calls[0][0].file.name).toBe(FILE_NAME);
        });

        it('should NOT add file via input click if disabled', () => {
            expect(component.file).toBeUndefined();

            component.disabled = true;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload.input!.nativeElement, getMockedChangeEventForSingle(FILE_NAME));

            expect(component.onChange).toHaveBeenCalledTimes(0);
            expect(component.file).toBeUndefined();
        });

        it('should remove file via button click', () => {
            expect(component.file).toBeUndefined();

            component.disabled = false;
            fixture.detectChanges();

            emitRemoveEvent();

            expect(component.onChange).toHaveBeenCalledTimes(2);
            expect(component.file).toBeNull();
        });

        it('should focus label after file removed', fakeAsync(() => {
            component.disabled = false;
            fixture.detectChanges();

            emitRemoveEvent();

            flush();

            expect(document.activeElement).toBe(component.fileUpload.input!.nativeElement);
        }));
    });

    describe('with ellipsis in the center', () => {
        it('should add tooltip and ellipsis in the center for a file with a long name', fakeAsync(() => {
            component.disabled = false;
            fixture.detectChanges();

            const fakeFile = new File(['test'], 'very very very very very very very very very long file name.txt');

            dispatchEvent(component.fileUpload.input!.nativeElement, getMockedChangeEventForSingle(fakeFile));
            fixture.detectChanges();
            flush();

            dispatchMouseEvent(
                fixture.debugElement.query(By.css(`.${fileItemTextCssClass}`)).nativeElement,
                'mouseenter'
            );
            fixture.detectChanges();
            flush();

            const tooltipInstance = document.querySelector('.kbq-tooltip');

            expect(tooltipInstance).toBeTruthy();
        }));
    });

    describe('with custom validation', () => {
        it('should mark added file with error', (done) => {
            expect(component.file).toBeUndefined();
            // max file === 5e6
            component.validation = [maxFileExceeded];
            fixture.detectChanges();

            const fakeFile: Partial<File> = { name: FILE_NAME, type: 'test', size: 6e6 };

            dispatchEvent(component.fileUpload.input!.nativeElement, getMockedChangeEventForSingle(fakeFile));
            fixture.detectChanges();

            setTimeout(() => {
                expect(component.file?.file.name).toBe(FILE_NAME);
                expect(component.file?.hasError).toBeTruthy();
                done();
            });
        });
    });

    describe('with ControlValueAccessor', () => {
        let fixture: ComponentFixture<ControlValueAccessorSingleFileUpload>;
        let component: ControlValueAccessorSingleFileUpload;

        beforeEach(() => {
            fixture = TestBed.createComponent(ControlValueAccessorSingleFileUpload);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should toggle the disabled state', () => {
            expect(component.fileUpload.disabled).toBe(false);

            component.control.disable();
            fixture.detectChanges();

            expect(component.fileUpload.disabled).toBe(true);

            component.control.enable();
            fixture.detectChanges();

            expect(component.fileUpload.disabled).toBe(false);
        });

        it('should update file value with setValue', () => {
            expect(component.fileUpload.file).toBeFalsy();

            const fakeFile = createMockFile(FILE_NAME);

            component.control.setValue(fakeFile);

            expect(component.fileUpload.file).toBeTruthy();
            expect(component.file).toBeTruthy();
        });

        it('should update form control touched on file added via click', () => {
            expect(component.control.touched).toBeFalsy();

            dispatchEvent(component.fileUpload.input!.nativeElement, getMockedChangeEventForSingle(FILE_NAME));
            fixture.detectChanges();

            expect(component.control.touched).toBeTruthy();
        });
    });

    describe('with localeConfig input property', () => {
        it('should use default properties if they not provided with localeConfig', () => {
            const updatedConfig: Partial<KbqBaseFileUploadLocaleConfig> = { captionText: 'TEST {{ browseLink }}' };

            component.localeConfig.set(updatedConfig);
            fixture.detectChanges();

            expect(component.fileUpload.resolvedLocaleConfig()).toMatchSnapshot();
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
                [localeConfig]="localeConfig()"
                (fileQueueChange)="onChange($event)"
            />
        </div>
    `
})
class BasicSingleFileUpload {
    @ViewChild('fileUpload') fileUpload: KbqSingleFileUploadComponent;
    disabled: boolean;
    file: KbqFileItem | null;
    accept: string[] = [];
    validation: KbqFileValidatorFn[] = [];

    localeConfig = signal<Partial<KbqBaseFileUploadLocaleConfig>>({});

    constructor(public elementRef: ElementRef) {}

    onChange = jest.fn().mockImplementation((file: KbqFileItem) => {
        this.file = file;
    });
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
    `
})
class ControlValueAccessorSingleFileUpload {
    @ViewChild('fileUpload') fileUpload: KbqSingleFileUploadComponent;
    file: KbqFileItem | null;
    accept: string[] = [];
    validation: KbqFileValidatorFn[] = [];
    control = new FormControl();

    constructor(public elementRef: ElementRef) {}

    onChange = jest.fn().mockImplementation((file: KbqFileItem) => {
        this.file = file;
    });
}

@Component({
    selector: '',
    imports: [KbqFileUploadModule, FormsModule, ReactiveFormsModule],
    template: `
        <div style="max-width: 350px;">
            <kbq-multiple-file-upload
                #fileUpload
                [disabled]="disabled"
                [customValidation]="validation"
                [localeConfig]="localeConfig()"
                (fileQueueChanged)="onChange($event)"
            />
        </div>
    `
})
class BasicMultipleFileUpload {
    @ViewChild('fileUpload') fileUpload: KbqMultipleFileUploadComponent;
    disabled: boolean;
    files: KbqFileItem[];
    validation: KbqFileValidatorFn[] = [];

    localeConfig = signal<Partial<KbqBaseFileUploadLocaleConfig>>({});

    constructor(
        public elementRef: ElementRef,
        public cdr: ChangeDetectorRef
    ) {}

    onChange = jest.fn().mockImplementation((files: KbqFileItem[]) => {
        this.files = files;
    });
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
    `
})
class ControlValueAccessorMultipleFileUpload {
    @ViewChild('fileUpload') fileUpload: KbqMultipleFileUploadComponent;
    files: KbqFileItem[];
    accept: string[] = [];
    validation: KbqFileValidatorFn[] = [];
    control = new FormControl();

    constructor(public elementRef: ElementRef) {}

    onChange = jest.fn().mockImplementation((files: KbqFileItem[]) => {
        this.files = files;
    });
}
