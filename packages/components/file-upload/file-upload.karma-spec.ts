import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DELETE } from '@koobiq/cdk/keycodes';
import { createFakeEvent, dispatchEvent, dispatchKeyboardEvent } from '@koobiq/cdk/testing';
import { KbqFileValidatorFn } from '@koobiq/components/core';
import { KbqFileItem } from './file-upload';
import { KbqFileUploadModule } from './file-upload.module';
import { KbqMultipleFileUploadComponent } from './multiple-file-upload.component';
import { KbqSingleFileUploadComponent } from './single-file-upload.component';

const fileItemRowCssClass = 'multiple__uploaded-item';

const fileItemCssClass = 'file-item';

describe('MultipleFileUploadComponent', () => {
    let component: any;
    let fixture: ComponentFixture<any>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqFileUploadModule, FormsModule, ReactiveFormsModule],
            declarations: [BasicMultipleFileUpload]
        }).compileComponents();

        fixture = TestBed.createComponent(BasicMultipleFileUpload);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('with focus and keyboard', () => {
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
});

describe('SingleFileUploadComponent', () => {
    let component: any;
    let fixture: ComponentFixture<any>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqFileUploadModule, FormsModule, ReactiveFormsModule],
            declarations: [BasicSingleFileUpload]
        }).compileComponents();

        fixture = TestBed.createComponent(BasicSingleFileUpload);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('with focus and keyboard', () => {
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
