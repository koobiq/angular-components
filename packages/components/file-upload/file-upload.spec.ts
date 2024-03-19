import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
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
import { KbqFileItem } from './file-upload';
import { KbqFileUploadModule } from './file-upload.module';
import { KbqMultipleFileUploadComponent } from './multiple-file-upload.component';
import { KbqSingleFileUploadComponent } from './single-file-upload.component';


export function dispatchDropEvent(component: any, fixture: ComponentFixture<any>) {
    const fakeDropEvent = createFakeEvent('drop');
    const fakeItem = createFile('test.file');
    (fakeDropEvent as any).dataTransfer = { items: [fakeItem] };

    dispatchEvent(component.elementRef.nativeElement.querySelector('.kbq-file-upload'), fakeDropEvent);
    fixture.detectChanges();
}


const fileItemActionCssClass = 'kbq-file-upload__action';
const fileItemRowCssClass = 'multiple__uploaded-item';

const fileItemCssClass = 'file-item';
const fileItemTextCssClass = 'file-item__text';

describe('MultipleFileUploadComponent', () => {
    let component: BasicMultipleFileUpload;
    let fixture: ComponentFixture<BasicMultipleFileUpload>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqFileUploadModule],
            declarations: [BasicMultipleFileUpload]
        })
            .compileComponents();

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

            expect(label.classList.contains('kbq-focused')).toBeTrue();

            dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
            fileInput.blur();
            fixture.detectChanges();
            flush();

            expect(label.classList.contains('kbq-focused')).toBeFalse();
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

            expect(label.classList.contains('kbq-focused')).toBeFalse();
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

            const subscription = component.fileUpload.fileQueueChanged
                .subscribe((value) => {
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
            const subscription = component.fileUpload.fileQueueChanged
                .subscribe((value) => {
                    expect(value.length).toBeTruthy();
                });

            subscription.unsubscribe();
        });

        it('should NOT add files via input click if disabled', () => {
            spyOn(component, 'onChange');
            component.disabled = true;
            fixture.detectChanges();
            const subscription = component.fileUpload.fileQueueChanged
                .subscribe((value) => {
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
            const subscription = component.fileUpload.fileQueueChanged
                .subscribe((value) => {
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
            const subscription = component.fileUpload.fileQueueChanged
                .subscribe((value) => {
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

            const subscription = component.fileUpload.fileQueueChanged
                .subscribe((value) => {
                    expect(value.length).toBeFalsy();
                });

            fixture.debugElement.query(By.css(`.${fileItemActionCssClass} .kbq-icon`)).nativeElement.click();
            fixture.detectChanges();
            subscription.unsubscribe();
        });
    });
});

describe('SingleFileUploadComponent', () => {
    let component: BasicSingleFileUpload;
    let fixture: ComponentFixture<BasicSingleFileUpload>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqFileUploadModule],
            declarations: [BasicSingleFileUpload]
        })
            .compileComponents();

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

            expect(label.classList.contains('kbq-focused')).toBeTrue();

            dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
            fileInput.blur();
            fixture.detectChanges();
            flush();

            expect(label.classList.contains('kbq-focused')).toBeFalse();
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

            expect(label.classList.contains('kbq-focused')).toBeFalse();
        }));

        it('should remove file via button keydown.delete', () => {
            component.disabled = false;
            fixture.detectChanges();
            const event = createFakeEvent('change');
            const fakeFile = new File(['test'], 'test.file');
            Object.defineProperty(event, 'target', { get: () => ({ files: [fakeFile] }) });
            dispatchEvent(component.fileUpload.input.nativeElement, event);
            fixture.detectChanges();

            const subscription = component.fileUpload.fileQueueChanged
                .subscribe((value) => {
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
            const subscription = component.fileUpload.fileQueueChanged
                .subscribe((value) => {
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
            const subscription = component.fileUpload.fileQueueChanged
                .subscribe((value) => {
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

            const subscription = component.fileUpload.fileQueueChanged
                .subscribe((value) => {
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

            dispatchMouseEvent(fixture.debugElement.query(By.css(`.${fileItemTextCssClass}`)).nativeElement, 'mouseenter');
            fixture.detectChanges();
            flush();

            const tooltipInstance = document.querySelector('.kbq-tooltip');
            expect(tooltipInstance).toBeTruthy();
        }));
    });
});


@Component({
    selector: '',
    template: `
        <div style="max-width: 350px;">
            <kbq-single-file-upload #fileUpload
                                   [disabled]="disabled"
                                   (fileQueueChanged)="onChange($event)">
            </kbq-single-file-upload>
        </div>
    `
})
class BasicSingleFileUpload {
    @ViewChild('fileUpload') fileUpload: KbqSingleFileUploadComponent;
    disabled: boolean;
    file: KbqFileItem | null;

    constructor(public elementRef: ElementRef) {}

    onChange(event: KbqFileItem | null) {
        this.file = event;
    }
}

@Component({
    selector: '',
    template: `
        <div style="max-width: 350px;">
            <kbq-multiple-file-upload #fileUpload
                                   [disabled]="disabled"
                                   (fileQueueChanged)="onChange($event)">
            </kbq-multiple-file-upload>
        </div>
    `
})
class BasicMultipleFileUpload {
    @ViewChild('fileUpload') fileUpload: KbqMultipleFileUploadComponent;
    disabled: boolean;
    files: KbqFileItem[];

    constructor(public elementRef: ElementRef) {}

    onChange(event: KbqFileItem[]) {
        this.files = event;
    }
}
