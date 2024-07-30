import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DELETE, TAB } from '@koobiq/cdk/keycodes';
import {
    createFakeEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent
} from '@koobiq/cdk/testing';
import { createFile } from './file-drop.spec';
import { KbqFileItem, KbqFileValidatorFn } from './file-upload';
import { KbqFileUploadModule } from './file-upload.module';
import { KbqMultipleFileUploadComponent } from './multiple-file-upload.component';
import { KbqSingleFileUploadComponent } from './single-file-upload.component';

export function dispatchDropEvent(
    component: any,
    fixture: ComponentFixture<any>,
    fileName = 'test.file',
    type?: string
) {
    const fakeDropEvent = createFakeEvent('drop');
    const fakeItem = createFile(fileName, type);
    (fakeDropEvent as any).dataTransfer = { items: [fakeItem] };

    dispatchEvent(component.elementRef.nativeElement.querySelector('.kbq-file-upload'), fakeDropEvent);
    fixture.detectChanges();
}

const fileItemActionCssClass = 'kbq-file-upload__action';
const fileItemRowCssClass = 'multiple__uploaded-item';

const fileItemCssClass = 'file-item';
const fileItemTextCssClass = 'file-item__text';

const maxFileExceeded = (file: File): string | null => {
    const kilo = 1024;
    const mega = kilo * kilo;
    const maxMbytes = 5;
    const maxSize = maxMbytes * mega;

    return maxSize !== undefined && (file?.size ?? 0) > maxSize ? `Exceeded with (${maxSize / mega} Mb)` : null;
};

describe('MultipleFileUploadComponent', () => {
    let component: any;
    let fixture: ComponentFixture<any>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqFileUploadModule, FormsModule, ReactiveFormsModule],
            declarations: [BasicMultipleFileUpload, ControlValueAccessorMultipleFileUpload]
        }).compileComponents();

        fixture = TestBed.createComponent(BasicMultipleFileUpload);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('with focus and keyboard', () => {
        it('should toggle label focus state on input focused/blurred', fakeAsync(() => {
            const fileInput: HTMLInputElement = component.fileUpload.input.nativeElement;

            // Simulate focus via keyboard.
            dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
            fileInput.focus();
            fixture.detectChanges();
            flush();

            const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');

            expect(label.classList.contains('cdk-keyboard-focused')).toBeTrue();

            dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
            fileInput.blur();
            fixture.detectChanges();
            flush();

            expect(label.classList.contains('cdk-keyboard-focused')).toBeFalse();
        }));

        it('should NOT toggle label focus state on input focus if disabled', fakeAsync(() => {
            const fileInput: HTMLInputElement = component.fileUpload.input.nativeElement;
            component.disabled = true;
            fixture.detectChanges();

            // Simulate focus via keyboard.
            dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
            dispatchFakeEvent(fileInput, 'focusin');
            fixture.detectChanges();
            flush();

            const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');

            expect(label.classList.contains('cdk-keyboard-focused')).toBeFalse();
        }));

        it('should remove file via button keydown.delete in a row', () => {
            spyOn(component, 'onChange');
            component.disabled = false;
            fixture.detectChanges();
            const event = createFakeEvent('change');

            const fakeFile = new File(['test'], 'test.file');
            Object.defineProperty(event, 'target', { get: () => ({ files: [fakeFile] }) });

            dispatchEvent(component.fileUpload.input.nativeElement, event);
            fixture.detectChanges();

            const subscription = component.fileUpload.fileQueueChanged.subscribe((value) => {
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

    describe('with file queue change', () => {
        it('should add files via input click', () => {
            spyOn(component, 'onChange');
            component.disabled = false;
            fixture.detectChanges();

            const event = createFakeEvent('change');

            const fakeFile = new File(['test'], 'test.file');
            Object.defineProperty(event, 'target', { get: () => ({ files: [fakeFile] }) });

            dispatchEvent(component.fileUpload.input.nativeElement, event);
            fixture.detectChanges();

            expect(component.onChange).toHaveBeenCalled();
            const subscription = component.fileUpload.fileQueueChanged.subscribe((value) => {
                expect(value.length).toBeTruthy();
            });

            subscription.unsubscribe();
        });

        it('should NOT add files via input click if disabled', () => {
            spyOn(component, 'onChange');
            component.disabled = true;
            fixture.detectChanges();
            const subscription = component.fileUpload.fileQueueChanged.subscribe((value) => {
                expect(value.length).toBeFalsy();
            });

            const event = createFakeEvent('change');
            const fakeFile = new File(['test'], 'test.file');
            Object.defineProperty(event, 'target', { get: () => ({ files: [fakeFile] }) });
            dispatchEvent(component.fileUpload.input.nativeElement, event);

            expect(component.onChange).not.toHaveBeenCalled();
            subscription.unsubscribe();
        });

        it('should add files via drag-n-drop', fakeAsync(() => {
            spyOn(component, 'onChange');
            component.disabled = false;
            fixture.detectChanges();
            const subscription = component.fileUpload.fileQueueChanged.subscribe((value) => {
                expect(value.length).toBeTruthy();
            });

            dispatchDropEvent(component, fixture);
            fixture.detectChanges();
            flush();

            expect(component.onChange).toHaveBeenCalled();
            subscription.unsubscribe();
        }));

        it('should NOT add files via drag-n-drop if disabled', () => {
            spyOn(component, 'onChange');
            component.disabled = true;
            fixture.detectChanges();
            const subscription = component.fileUpload.fileQueueChanged.subscribe((value) => {
                expect(value.length).toBeFalsy();
            });

            dispatchDropEvent(component, fixture);

            expect(component.onChange).not.toHaveBeenCalled();
            subscription.unsubscribe();
        });

        it('should remove file via button click in a row', () => {
            spyOn(component, 'onChange');
            component.disabled = false;
            fixture.detectChanges();

            const event = createFakeEvent('change');

            const fakeFile = new File(['test'], 'test.file');
            Object.defineProperty(event, 'target', { get: () => ({ files: [fakeFile] }) });

            dispatchEvent(component.fileUpload.input.nativeElement, event);
            fixture.detectChanges();

            const subscription = component.fileUpload.fileQueueChanged.subscribe((value) => {
                expect(value.length).toBeFalsy();
            });

            fixture.debugElement.query(By.css(`.${fileItemActionCssClass} .kbq-icon`)).nativeElement.click();
            fixture.detectChanges();
            subscription.unsubscribe();
        });
    });

    describe('with custom validation', () => {
        it('should mark added file with error', () => {
            expect(component.files).toBeFalsy();
            // max file === 5e6
            component.validation = [maxFileExceeded];
            fixture.detectChanges();

            const event = createFakeEvent('change');

            const fakeFile: Partial<File> = { name: 'test.file', type: 'test', size: 6e6 };
            Object.defineProperty(event, 'target', { get: () => ({ files: [fakeFile] }) });

            dispatchEvent(component.fileUpload.input.nativeElement, event);
            fixture.detectChanges();

            expect(component.files.length).toBeTruthy();
            expect(component.files[0].hasError).toBeTruthy();
        });
    });

    describe('with ControlValueAccessor', () => {
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

            const fakeFile: Partial<File> = new File(['test'], 'test');
            const dt = new DataTransfer();
            dt.items.add(fakeFile as File);

            component.control.setValue(dt.files);

            expect(component.fileUpload.files.length).toBeTruthy();
            expect(component.files.length).toBeTruthy();
        });

        it('should update form control touched on file dropped', fakeAsync(() => {
            expect(component.control.touched).toBeFalse();

            dispatchDropEvent(component, fixture);
            fixture.detectChanges();
            flush();

            expect(component.control.touched).toBeTrue();
        }));

        it('should update form control touched on file added via click', () => {
            expect(component.control.touched).toBeFalse();

            const event = createFakeEvent('change');

            const fakeFile = new File(['test'], 'test.file');
            Object.defineProperty(event, 'target', { get: () => ({ files: [fakeFile] }) });
            dispatchEvent(component.fileUpload.input.nativeElement, event);
            fixture.detectChanges();

            expect(component.control.touched).toBeTrue();
        });
    });
});

describe('SingleFileUploadComponent', () => {
    let component: any;
    let fixture: ComponentFixture<any>;
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

    describe('with focus and keyboard', () => {
        it('should toggle label focus state on input focused/blurred', fakeAsync(() => {
            const fileInput: HTMLInputElement = component.fileUpload.input.nativeElement;

            // Simulate focus via keyboard.
            dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
            fileInput.focus();
            fixture.detectChanges();
            flush();

            const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');

            expect(label.classList.contains('cdk-keyboard-focused')).toBeTrue();

            dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
            fileInput.blur();
            fixture.detectChanges();
            flush();

            expect(label.classList.contains('cdk-keyboard-focused')).toBeFalse();
        }));

        it('should NOT toggle label focus state on input focus if disabled', fakeAsync(() => {
            const fileInput: HTMLInputElement = component.fileUpload.input.nativeElement;
            component.disabled = true;
            fixture.detectChanges();

            // Simulate focus via keyboard.
            dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
            dispatchFakeEvent(fileInput, 'focusin');
            fixture.detectChanges();
            flush();

            const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');

            expect(label.classList.contains('cdk-keyboard-focused')).toBeFalse();
        }));

        it('should remove file via button keydown.delete', () => {
            component.disabled = false;
            fixture.detectChanges();
            const event = createFakeEvent('change');
            const fakeFile = new File(['test'], 'test.file');
            Object.defineProperty(event, 'target', { get: () => ({ files: [fakeFile] }) });
            dispatchEvent(component.fileUpload.input.nativeElement, event);
            fixture.detectChanges();

            const subscription = component.fileUpload.fileQueueChange.subscribe((value) => {
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

    describe('with file queue change', () => {
        it('should add file via input click', () => {
            spyOn(component, 'onChange');
            component.disabled = false;
            fixture.detectChanges();

            const event = createFakeEvent('change');

            const fakeFile = new File(['test'], 'test.file');
            Object.defineProperty(event, 'target', { get: () => ({ files: [fakeFile] }) });

            dispatchEvent(component.fileUpload.input.nativeElement, event);
            fixture.detectChanges();

            expect(component.onChange).toHaveBeenCalled();
            const subscription = component.fileUpload.fileQueueChange.subscribe((value) => {
                expect(value).toBeTruthy();
            });

            subscription.unsubscribe();
        });

        it('should NOT add file via input click if disabled', () => {
            spyOn(component, 'onChange');
            component.disabled = true;
            fixture.detectChanges();

            const event = createFakeEvent('change');
            Object.defineProperty(event, 'target', { get: () => ({ files: [{ name: 'test' }] }) });
            dispatchEvent(component.fileUpload.input.nativeElement, event);

            expect(component.onChange).not.toHaveBeenCalled();
            expect(component.file).toBeFalsy();
        });

        it('should add file via drag-n-drop', fakeAsync(() => {
            spyOn(component, 'onChange');
            component.disabled = false;
            fixture.detectChanges();

            dispatchDropEvent(component, fixture);
            fixture.detectChanges();
            flush();

            expect(component.onChange).toHaveBeenCalled();
            const subscription = component.fileUpload.fileQueueChange.subscribe((value) => {
                expect(value).toBeTruthy();
            });

            subscription.unsubscribe();
        }));

        it('should NOT add file via drag-n-drop if disabled', () => {
            spyOn(component, 'onChange');
            component.disabled = true;
            fixture.detectChanges();

            dispatchDropEvent(component, fixture);

            expect(component.file).toBeFalsy();
            expect(component.onChange).not.toHaveBeenCalled();
        });

        it('should remove file via button click', () => {
            component.disabled = false;
            fixture.detectChanges();

            const event = createFakeEvent('change');

            const fakeFile = new File(['test'], 'test.file');
            Object.defineProperty(event, 'target', { get: () => ({ files: [fakeFile] }) });

            dispatchEvent(component.fileUpload.input.nativeElement, event);
            fixture.detectChanges();

            const subscription = component.fileUpload.fileQueueChange.subscribe((value) => {
                expect(value).toBeFalsy();
            });

            component.elementRef.nativeElement.querySelector(`.${fileItemCssClass} .kbq-icon-button`).click();
            subscription.unsubscribe();
        });
    });

    describe('with ellipsis in the center', () => {
        it('should add tooltip and ellipsis in the center for a file with a long name', fakeAsync(() => {
            component.disabled = false;
            fixture.detectChanges();

            const event = createFakeEvent('change');
            const fakeFile = new File(['test'], 'very very very very very very very very very long file name.txt');
            Object.defineProperty(event, 'target', { get: () => ({ files: [fakeFile] }) });
            dispatchEvent(component.fileUpload.input.nativeElement, event);
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
        it('should mark added file with error', () => {
            expect(component.file).toBeFalsy();
            // max file === 5e6
            component.validation = [maxFileExceeded];
            fixture.detectChanges();

            const event = createFakeEvent('change');

            const fakeFile: Partial<File> = { name: 'test.file', type: 'test', size: 6e6 };
            Object.defineProperty(event, 'target', { get: () => ({ files: [fakeFile] }) });

            dispatchEvent(component.fileUpload.input.nativeElement, event);
            fixture.detectChanges();

            expect(component.file).toBeTruthy();
            expect(component.file?.hasError).toBeTruthy();
        });
    });

    describe('with ControlValueAccessor', () => {
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

            const fakeFile = new File(['test'], 'test.file');
            component.control.setValue(fakeFile);

            expect(component.fileUpload.file).toBeTruthy();
            expect(component.file).toBeTruthy();
        });

        it('should update form control touched on file dropped', fakeAsync(() => {
            expect(component.control.touched).toBeFalse();

            dispatchDropEvent(component, fixture);
            fixture.detectChanges();
            flush();

            expect(component.control.touched).toBeTrue();
        }));

        it('should update form control touched on file added via click', () => {
            expect(component.control.touched).toBeFalse();

            const event = createFakeEvent('change');

            const fakeFile = new File(['test'], 'test.file');
            Object.defineProperty(event, 'target', { get: () => ({ files: [fakeFile] }) });

            dispatchEvent(component.fileUpload.input.nativeElement, event);
            fixture.detectChanges();

            expect(component.control.touched).toBeTrue();
        });
    });

    // TODO: real-life scenario & test results with the same data are different
    xdescribe('with accepted files list', () => {
        it('should filter files via drag-n-drop with extensions', fakeAsync(() => {
            spyOn(component, 'onChange');
            component.disabled = false;
            component.accept = ['.pdf', '.png'];
            fixture.detectChanges();

            dispatchDropEvent(component, fixture, 'test.test');
            fixture.detectChanges();
            flush();

            dispatchDropEvent(component, fixture, 'test.pdf');
            fixture.detectChanges();
            flush();

            dispatchDropEvent(component, fixture, 'test.png');
            fixture.detectChanges();
            flush();

            expect(component.onChange).toHaveBeenCalledTimes(2);
        }));

        it('should filter files via drag-n-drop with mimeType', fakeAsync(() => {
            spyOn(component, 'onChange');
            component.disabled = false;
            component.accept = ['application/pdf'];
            fixture.detectChanges();

            dispatchDropEvent(component, fixture, 'test.test');
            fixture.detectChanges();
            flush();

            // in file system file type will be automatically provided
            dispatchDropEvent(component, fixture, 'test.pdf', 'application/pdf');
            fixture.detectChanges();
            flush();

            expect(component.onChange).toHaveBeenCalledTimes(1);
        }));
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
    `
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
    `
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
    `
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
