import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { createFakeEvent, dispatchEvent } from '@koobiq/components/core';
import { KbqFileItem, KbqSingleFileUploadComponent } from '@koobiq/components/file-upload';

/** Rejects executables, the way a consumer's file-type validator would. */
const noExecutables = (control: AbstractControl<KbqFileItem | null>): ValidationErrors | null =>
    control.value?.file.name.endsWith('.exe') ? { forbiddenType: true } : null;

@Component({
    selector: 'test-app',
    imports: [KbqSingleFileUploadComponent, ReactiveFormsModule],
    template: `
        <kbq-single-file-upload [formControl]="control" />
    `
})
class TestApp {
    readonly fileUpload = viewChild.required(KbqSingleFileUploadComponent);
    readonly control = new FormControl<KbqFileItem | null>(null, { validators: [noExecutables] });
}

/** A `change` event of the hidden input carrying one selected file. */
const selectFile = (input: HTMLInputElement, name: string): void => {
    const event = createFakeEvent('change');
    const target = document.createElement('input');
    const file = new File(['x'], name);

    Object.defineProperty(target, 'files', { get: () => ({ length: 1, 0: file, item: () => file }) });
    Object.defineProperty(event, 'target', { get: () => target });
    dispatchEvent(input, event);
};

describe('triage: the single uploader sets hasError only when the control status changes', () => {
    let fixture: ComponentFixture<TestApp>;

    const uploadArea = (): HTMLElement => fixture.nativeElement.querySelector('.kbq-file-upload');

    beforeEach(() => {
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
    });

    it('DEFECT: an invalid file selected in place of another invalid one keeps hasError unset', () => {
        const { fileUpload, control } = fixture.componentInstance;

        selectFile(fileUpload().input!.nativeElement, 'first.exe');
        fixture.detectChanges();

        expect(control.invalid).toBe(true);
        expect(fileUpload().file!.hasError).toBe(true);

        // The file is shown, so the browse link and its input are gone: the second file comes through a drop.
        fileUpload().onFileDropped([Object.assign(new File(['x'], 'second.exe'), { fullPath: 'second.exe' })]);
        fixture.detectChanges();

        expect(fileUpload().file!.file.name).toBe('second.exe');
        expect(control.invalid).toBe(true);
        expect(fileUpload().file!.hasError).toBeUndefined();
        // Still shown in error, but only through `errorState`: the control was touched by the selection.
        expect(uploadArea().classList).toContain('kbq-error');
    });

    it('DEFECT: a programmatic invalid value replacing another one drops the error state of an untouched control', () => {
        const { fileUpload, control } = fixture.componentInstance;

        control.setValue({ file: new File(['x'], 'first.exe') });
        fixture.detectChanges();

        expect(fileUpload().file!.hasError).toBe(true);
        expect(uploadArea().classList).toContain('kbq-error');

        control.setValue({ file: new File(['x'], 'second.exe') });
        fixture.detectChanges();

        expect(control.invalid).toBe(true);
        expect(control.touched).toBe(false);
        expect(fileUpload().file!.hasError).toBeUndefined();
        expect(uploadArea().classList).not.toContain('kbq-error');
    });

    it('DEFECT: the flag is written onto the item object the consumer passed in', () => {
        const item: KbqFileItem = { file: new File(['x'], 'first.exe') };

        fixture.componentInstance.control.setValue(item);
        fixture.detectChanges();

        expect(item.hasError).toBe(true);
    });
});
