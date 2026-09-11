import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, inject as inject_1, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import {
    AbstractControl,
    AsyncValidatorFn,
    FormControl,
    FormControlStatus,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    DELETE,
    KbqBaseFileUploadLocaleConfiguration,
    TAB,
    createFakeEvent,
    createMouseEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { axe } from 'jest-axe';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { KbqDropzoneData, KbqFullScreenDropzoneService, KbqLocalDropzone } from './dropzone';
import { KbqFile, KbqFileItem, KbqFileUploadAddStrategy, KbqFileUploadAddStrategyValues } from './file-upload';
import { KbqFileUploadModule } from './file-upload.module';
import { KbqInputFileMultipleLabel, KbqMultipleFileUploadComponent } from './multiple-file-upload.component';
import { KbqFileDropDirective } from './primitives/file-drop';
import { KbqSingleFileUploadComponent } from './single-file-upload.component';

export const dispatchDragEvent = (type: string, { target }: { target: HTMLElement }) => {
    const file = createMockFile('test1.txt', { type: 'text/plain' });
    const dropEvent = new DragEvent(type, {
        dataTransfer: new DataTransfer()
    });

    dropEvent.dataTransfer?.items.add(file);

    target.dispatchEvent(dropEvent);

    return dropEvent;
};

const createFSFile = (name: string, type = '') => {
    const file: Partial<File> = { name, type, size: 0 };

    return {
        name,
        fullPath: name,
        isDirectory: false,
        isFile: true,
        file: (cb: (f: Partial<File>) => void) => cb(file)
    };
};

const createFakeFileItem = (
    name: string,
    type?: string
): { kind: string; webkitGetAsEntry(): Partial<FileSystemFileEntry> } => ({
    kind: 'file',
    webkitGetAsEntry: () => createFSFile(name, type) as Partial<FileSystemFileEntry>
});

function dispatchDropEventWithEntry<T>(fixture: ComponentFixture<T>, fileName = FILE_NAME, type?: string) {
    const fakeDropEvent = createFakeEvent('drop');

    (fakeDropEvent as any).dataTransfer = { items: [createFakeFileItem(fileName, type)] };

    dispatchEvent(fixture.debugElement.query(By.directive(KbqFileDropDirective)).nativeElement, fakeDropEvent);
    fixture.detectChanges();
}

const FILE_NAME = 'test.file';

const createMockFile = (fileName: string = FILE_NAME, options?: FilePropertyBag) =>
    new File(['test'] satisfies BlobPart[], fileName, options);

/** A real `File` with the `fullPath` the drop path adds, so `size` and `name` survive. */
const createDroppedFile = (fileName: string): KbqFile =>
    Object.assign(createMockFile(fileName), { fullPath: fileName });

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

const A11Y_LOCALE = ruRULocaleData.fileUpload.a11y;

const announcementFor = (template: string, fileName: string) => template.replace('{{ fileName }}', fileName);

const getLiveRegionText = <T>(fixture: ComponentFixture<T>): string =>
    fixture.debugElement.query(By.css('[role="status"]')).nativeElement.textContent.trim();

/** The native input is recreated when the file count crosses zero, so it is re-read on every step. */
const addFiles = <T>(fixture: ComponentFixture<T>, fileUpload: KbqMultipleFileUploadComponent, fileNames: string[]) => {
    fileNames.forEach((fileName) => {
        dispatchEvent(fileUpload.input!.nativeElement, getMockedChangeEvent(fileName));
        fixture.detectChanges();
    });
};

const fileItemActionCssClass = 'kbq-file-upload__action';

const fileItemRowCssClass = 'kbq-file-upload__item';

const fileItemTextCssClass = 'kbq-file-item__text';

const ASYNC_VALIDATOR_TIMER_DUE = 1000;

const getAsyncValidator =
    (valid = true): AsyncValidatorFn =>
    (): Observable<ValidationErrors | null> =>
        timer(ASYNC_VALIDATOR_TIMER_DUE).pipe(map(() => (!valid ? { asyncError: { actual: valid } } : null)));

const MAX_FILE_LINES_FOR_TEST = 3;

function readFileAsText(file: File): Observable<string> {
    return new Observable((observer) => {
        const reader = new FileReader();

        reader.onload = () => {
            observer.next(reader.result as string);
            observer.complete();
        };

        reader.onerror = () => {
            observer.error(reader.error);
        };

        reader.readAsText(file);
    });
}

function fileContentLinesValidator(maxLines: number): AsyncValidatorFn {
    return (control: AbstractControl<KbqFileItem | null>): Observable<ValidationErrors | null> => {
        return new Observable((observer) => {
            if (!control.value) {
                observer.next(null);
                observer.complete();

                return;
            }

            const subscription = readFileAsText(control.value.file).subscribe({
                next: (content) => {
                    const lineCount = content.split('\n').length;

                    observer.next(lineCount > maxLines ? { maxLines: { max: maxLines, actual: lineCount } } : null);
                    observer.complete();
                },
                error: () => {
                    observer.next({ fileReadError: true });
                    observer.complete();
                }
            });

            return () => subscription.unsubscribe();
        });
    };
}

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
                ControlValueAccessorMultipleFileUpload,
                MultipleFileUploadWithAsyncValidator,
                MultipleFileUploadWithInvalidAsyncValidator,
                MultipleFileUploadWithHint,
                TwoWayBindingMultipleFileUpload
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(BasicMultipleFileUpload);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('with focus and keyboard', () => {
        it('should toggle label focus state on input focused/blurred', fakeAsync(() => {
            const fileInput: HTMLInputElement = component.fileUpload().input!.nativeElement;

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
            const fileInput: HTMLInputElement = component.fileUpload().input!.nativeElement;

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

        it('should remove file via keydown.delete on the focused remove control', () => {
            component.disabled = false;
            fixture.detectChanges();

            const fileUpload = component.fileUpload();

            dispatchEvent(fileUpload.input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();

            const filesChangeSpy = jest.fn();
            const subscription = fileUpload.filesChange.subscribe(filesChangeSpy);

            // Dispatched at the control a keyboard user can actually reach, not at the row, which has
            // no tabindex — the row only ever sees the event because it bubbles up from here.
            fixture.debugElement
                .query(By.css(`.${fileItemActionCssClass}`))
                .nativeElement.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'Delete', keyCode: DELETE, bubbles: true })
                );
            fixture.detectChanges();

            subscription.unsubscribe();

            expect(filesChangeSpy).toHaveBeenCalledTimes(1);
            expect(filesChangeSpy.mock.calls[0][0]).toHaveLength(0);
            expect(component.files).toHaveLength(0);
        });

        it('should move focus to the row that took the deleted row place', fakeAsync(() => {
            component.disabled = false;
            fixture.detectChanges();

            addFiles(fixture, component.fileUpload(), ['a.file', 'b.file', 'c.file']);

            const actions = () => fixture.debugElement.queryAll(By.css(`.${fileItemActionCssClass}`));

            expect(actions()).toHaveLength(3);

            actions()[1].nativeElement.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Delete', keyCode: DELETE, bubbles: true })
            );
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(component.fileUpload().files.map(({ file }) => file.name)).toEqual(['a.file', 'c.file']);
            expect(document.activeElement).toBe(actions()[1].nativeElement);
        }));

        it('should focus the file input when the last row is deleted', fakeAsync(() => {
            component.disabled = false;
            fixture.detectChanges();

            addFiles(fixture, component.fileUpload(), ['a.file', 'b.file']);

            const actions = fixture.debugElement.queryAll(By.css(`.${fileItemActionCssClass}`));

            actions[1].nativeElement.click();
            fixture.detectChanges();
            flush();
            actions[0].nativeElement.click();
            fixture.detectChanges();
            flush();

            expect(document.activeElement).toBe(component.fileUpload().input!.nativeElement);
        }));
    });

    describe('with accessibility', () => {
        it('should render a multiple file input', () => {
            expect(component.fileUpload().input!.nativeElement.multiple).toBe(true);
        });

        it('should link projected hints through aria-describedby', () => {
            const hintFixture = TestBed.createComponent(MultipleFileUploadWithHint);

            hintFixture.detectChanges();
            // The hint is projected into an `@if (hasHint)` whose condition reads the content query, so
            // it renders on the pass after the query resolves.
            hintFixture.detectChanges();

            const input: HTMLInputElement = hintFixture.componentInstance.fileUpload().input!.nativeElement;
            const hint: HTMLElement = hintFixture.nativeElement.querySelector('kbq-hint');

            expect(input.getAttribute('aria-describedby')).toBe(hint.getAttribute('id'));
        });

        it('should mark the file input invalid while the control is in an error state', () => {
            const hintFixture = TestBed.createComponent(MultipleFileUploadWithHint);

            hintFixture.detectChanges();

            const input: HTMLInputElement = hintFixture.componentInstance.fileUpload().input!.nativeElement;

            expect(input.hasAttribute('aria-invalid')).toBe(false);

            hintFixture.componentInstance.control.markAsTouched();
            hintFixture.detectChanges();

            expect(input.getAttribute('aria-invalid')).toBe('true');
        });

        it('should mark a row with an error invalid', () => {
            const rowFixture = TestBed.createComponent(TwoWayBindingMultipleFileUpload);
            const row = () => rowFixture.debugElement.query(By.css(`.${fileItemRowCssClass}`)).nativeElement;

            rowFixture.componentInstance.files = [{ file: createMockFile(FILE_NAME) }];
            rowFixture.detectChanges();

            expect(row().hasAttribute('aria-invalid')).toBe(false);

            rowFixture.componentInstance.files = [{ file: createMockFile(FILE_NAME), hasError: true }];
            rowFixture.detectChanges();

            expect(row().getAttribute('aria-invalid')).toBe('true');
        });

        it('should announce an added file', fakeAsync(() => {
            component.disabled = false;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(getLiveRegionText(fixture)).toBe(announcementFor(A11Y_LOCALE.fileAdded, FILE_NAME));
        }));

        it('should announce a removed file', fakeAsync(() => {
            component.disabled = false;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();
            flush();

            fixture.debugElement.query(By.css(`.${fileItemActionCssClass}`)).nativeElement.click();
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(getLiveRegionText(fixture)).toBe(announcementFor(A11Y_LOCALE.fileRemoved, FILE_NAME));
        }));

        it('should report skipped duplicates through rejected', () => {
            component.disabled = false;
            fixture.detectChanges();

            const duplicate: Partial<File> = { name: FILE_NAME, size: 4, type: '', lastModified: 1700000000000 };
            const rejectedSpy = jest.fn();
            const subscription = component.fileUpload().rejected.subscribe(rejectedSpy);

            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(duplicate));
            fixture.detectChanges();
            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(duplicate));
            fixture.detectChanges();

            subscription.unsubscribe();

            expect(rejectedSpy).toHaveBeenCalledTimes(1);
            expect(rejectedSpy.mock.calls[0][0]).toEqual([duplicate]);
        });

        it('should have no violations while empty', async () => {
            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });

        it('should have no violations with files in the list', async () => {
            component.disabled = false;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });

        it('should have no violations while invalid', async () => {
            const hintFixture = TestBed.createComponent(MultipleFileUploadWithHint);

            hintFixture.detectChanges();
            hintFixture.componentInstance.control.markAsTouched();
            hintFixture.detectChanges();

            expect(await axe(hintFixture.nativeElement)).toHaveNoViolations();
        });
    });

    describe('with file queue change', () => {
        const emitRemoveEvent = () => {
            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();

            fixture.debugElement.query(By.css(`.${fileItemActionCssClass}`)).nativeElement.click();
            fixture.detectChanges();
        };

        it('should add files via input click', () => {
            expect(component.files).toBeUndefined();

            component.disabled = false;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();

            expect(component.onChange).toHaveBeenCalledTimes(1);
            expect(component.files).toHaveLength(1);
            expect(component.files[0].file.name).toBe(FILE_NAME);
        });

        it('should NOT add files via input click if disabled', () => {
            component.disabled = true;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));

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

        it('should focus the file input after the last file is removed', fakeAsync(() => {
            component.disabled = false;
            fixture.detectChanges();

            emitRemoveEvent();

            flush();

            expect(document.activeElement).toBe(component.fileUpload().input!.nativeElement);
        }));

        it('should NOT throw error on detectChanges in handler', () => {
            component.onChange = jest.fn().mockImplementation((files: KbqFileItem[]) => {
                component.files = files;
                component.cdr.detectChanges();
            });

            const fileUpload = component.fileUpload();

            jest.spyOn(fileUpload, 'deleteFile');

            dispatchEvent(fileUpload.input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();

            const event = createMouseEvent('click');

            expect(() => {
                component.fileUpload().deleteFile(0, event);
                fixture.detectChanges();
            }).not.toThrow();
        });
    });

    describe('with addStrategy input', () => {
        // Same object reused across dispatches so name/size/type/lastModified are guaranteed
        // identical, instead of relying on two `new File(...)` calls landing in the same millisecond.
        const duplicateFile: Partial<File> = { name: FILE_NAME, size: 4, type: '', lastModified: 1700000000000 };
        const otherFile: Partial<File> = { name: 'other.file', size: 4, type: '', lastModified: 1700000000000 };

        // The native input is inside the `@if (!files.length) {...} @else {...}` branch of the
        // template, so it gets destroyed/recreated when the file count crosses zero — must be
        // re-queried before every dispatch rather than cached once.
        const dispatchChange = (file: Partial<File>) => {
            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(file));
            fixture.detectChanges();
        };

        it('should default to concat strategy', () => {
            expect(component.fileUpload().addStrategy()).toBe(KbqFileUploadAddStrategy.Concat);
        });

        describe('concat strategy (default)', () => {
            it('should skip a file that duplicates one already in the list', () => {
                dispatchChange(duplicateFile);
                dispatchChange(duplicateFile);

                expect(component.files).toHaveLength(1);
            });

            it('should still add files that are genuinely different', () => {
                dispatchChange(duplicateFile);
                dispatchChange(otherFile);

                expect(component.files).toHaveLength(2);
            });

            it('should emit filesAdded with an empty array for a skipped duplicate', () => {
                const filesAddedSpy = jest.fn();
                const subscription = component.fileUpload().filesAdded.subscribe(filesAddedSpy);

                dispatchChange(duplicateFile);
                dispatchChange(duplicateFile);

                subscription.unsubscribe();

                expect(filesAddedSpy).toHaveBeenCalledTimes(2);
                expect(filesAddedSpy.mock.calls[1][0]).toHaveLength(0);
            });
        });

        describe('replace strategy', () => {
            beforeEach(() => {
                component.addStrategy.set(KbqFileUploadAddStrategy.Replace);
                fixture.detectChanges();
            });

            it('should replace the list instead of appending on a new selection', () => {
                dispatchChange(duplicateFile);
                dispatchChange(otherFile);

                expect(component.files).toHaveLength(1);
                expect(component.files[0].file.name).toBe('other.file');
            });

            // An empty directory unwraps to zero files, so `filesDropped` can carry an empty array.
            // Replacing the list with it would destroy a selection the user had already built.
            it('should keep the current list when a drop hands over no files', () => {
                const filesChangeSpy = jest.fn();

                dispatchChange(duplicateFile);

                const subscription = component.fileUpload().filesChange.subscribe(filesChangeSpy);

                component.fileUpload().onFileDropped([]);
                fixture.detectChanges();

                subscription.unsubscribe();

                expect(component.files).toHaveLength(1);
                expect(filesChangeSpy).not.toHaveBeenCalled();
            });
        });
    });

    describe('with ellipsis in the center', () => {
        afterEach(() => jest.restoreAllMocks());

        it('should keep the hint for a long file name while the upload is disabled', fakeAsync(() => {
            // Reading a name the host had to shorten is not an interaction with the control, so blocking the
            // control must not take it away. The single variant never suppressed it; this pins the multiple
            // variant to the same behaviour, which it only diverged from once `kbqTooltipDisabled` started
            // being honoured on a `kbqEllipsisCenter` host.
            jest.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(100);
            jest.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(400);

            const fakeFile = new File(['test'], 'very very very very very very very very very long file name.txt');

            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(fakeFile));
            fixture.detectChanges();
            flush();

            component.disabled = true;
            fixture.detectChanges();
            flush();

            dispatchMouseEvent(
                fixture.debugElement.query(By.css(`.${fileItemTextCssClass}`)).nativeElement,
                'mouseenter'
            );
            fixture.detectChanges();
            flush();

            expect(document.querySelector('.kbq-tooltip')).toBeTruthy();
        }));
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
            expect(component.fileUpload().disabled).toBe(false);

            component.control.disable();
            fixture.detectChanges();

            expect(component.fileUpload().disabled).toBe(true);

            component.control.enable();
            fixture.detectChanges();

            expect(component.fileUpload().disabled).toBe(false);
        });

        it('should update file value with setValue', () => {
            expect(component.fileUpload().files.length).toBeFalsy();

            const fakeFile: Partial<File> = createMockFile(FILE_NAME);
            const dt = new DataTransfer();

            dt.items.add(fakeFile as File);

            component.control.setValue(dt.files);

            expect(component.fileUpload().files.length).toBe(1);
        });

        it('should update form control touched on file added via click', () => {
            expect(component.control.touched).toBeFalsy();

            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();

            expect(component.control.touched).toBeTruthy();
        });

        it('should update form control touched on blur alone', () => {
            expect(component.control.touched).toBeFalsy();

            dispatchFakeEvent(component.fileUpload().input!.nativeElement, 'focusout', true);
            fixture.detectChanges();

            expect(component.control.touched).toBeTruthy();
        });

        it('should NOT mark the control touched while focus stays inside the uploader', () => {
            const host: HTMLElement = fixture.debugElement.query(
                By.directive(KbqMultipleFileUploadComponent)
            ).nativeElement;
            const event = createFakeEvent('focusout', true);

            Object.defineProperty(event, 'relatedTarget', { get: () => host.querySelector('label') });
            dispatchEvent(component.fileUpload().input!.nativeElement, event);
            fixture.detectChanges();

            expect(component.control.touched).toBeFalsy();
        });

        it('should leave the control pristine on a programmatic value', () => {
            component.control.setValue([{ file: createMockFile(FILE_NAME) }]);

            expect(component.control.pristine).toBe(true);
        });

        it('should emit valueChanges once per programmatic value', () => {
            const valueChangesSpy = jest.fn();
            const subscription = component.control.valueChanges.subscribe(valueChangesSpy);

            component.control.setValue([{ file: createMockFile(FILE_NAME) }]);
            subscription.unsubscribe();

            expect(valueChangesSpy).toHaveBeenCalledTimes(1);
        });

        it('should leave the control pristine after reset', () => {
            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();

            expect(component.control.dirty).toBe(true);

            component.control.reset();

            expect(component.control.pristine).toBe(true);
        });

        it('should NOT emit filesChange for a programmatic value', () => {
            const filesChangeSpy = jest.fn();
            const subscription = component.fileUpload().filesChange.subscribe(filesChangeSpy);

            component.control.setValue([{ file: createMockFile(FILE_NAME) }]);
            component.control.reset();
            subscription.unsubscribe();

            expect(filesChangeSpy).not.toHaveBeenCalled();
        });
    });

    describe('with localeConfig input property', () => {
        it('should use default properties if they not provided with localeConfig', () => {
            const updatedConfig: Partial<KbqInputFileMultipleLabel> = { captionText: 'TEST {{ browseLink }}' };

            component.localeConfig.set(updatedConfig);
            fixture.detectChanges();

            expect(component.fileUpload().resolvedLocaleConfig()).toMatchSnapshot();
        });
    });

    describe('with async validation', () => {
        describe('using timer-based validator', () => {
            let asyncFixture: ComponentFixture<MultipleFileUploadWithAsyncValidator>;
            let asyncComponent: MultipleFileUploadWithAsyncValidator;

            beforeEach(() => {
                asyncFixture = TestBed.createComponent(MultipleFileUploadWithAsyncValidator);
                asyncComponent = asyncFixture.componentInstance;
                asyncFixture.detectChanges();
            });

            it('should have PENDING status immediately after files are added', fakeAsync(() => {
                dispatchEvent(asyncComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
                asyncFixture.detectChanges();

                expect(asyncComponent.control.status).toBe('PENDING');

                tick(ASYNC_VALIDATOR_TIMER_DUE);
            }));

            it('should have VALID status after async validator resolves', fakeAsync(() => {
                dispatchEvent(asyncComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
                asyncFixture.detectChanges();

                tick(ASYNC_VALIDATOR_TIMER_DUE);

                expect(asyncComponent.control.status).toBe('VALID');
            }));

            it('should emit PENDING then VALID via statusChanges', fakeAsync(() => {
                const statuses: FormControlStatus[] = [];
                const subscription = asyncComponent.control.statusChanges.subscribe((status) => statuses.push(status));

                dispatchEvent(asyncComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
                asyncFixture.detectChanges();

                expect(statuses).toEqual(['PENDING']);

                tick(ASYNC_VALIDATOR_TIMER_DUE);

                expect(statuses).toEqual(['PENDING', 'VALID']);

                subscription.unsubscribe();
            }));
        });

        describe('using invalid timer-based validator', () => {
            let asyncFixture: ComponentFixture<MultipleFileUploadWithInvalidAsyncValidator>;
            let asyncComponent: MultipleFileUploadWithInvalidAsyncValidator;

            beforeEach(() => {
                asyncFixture = TestBed.createComponent(MultipleFileUploadWithInvalidAsyncValidator);
                asyncComponent = asyncFixture.componentInstance;
                asyncFixture.detectChanges();
            });

            it('should have INVALID status after async validator resolves with errors', fakeAsync(() => {
                dispatchEvent(asyncComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
                asyncFixture.detectChanges();

                tick(ASYNC_VALIDATOR_TIMER_DUE);

                expect(asyncComponent.control.status).toBe('INVALID');
                expect(asyncComponent.control.errors).toEqual({ asyncError: { actual: false } });
            }));

            it('should emit PENDING then INVALID via statusChanges', fakeAsync(() => {
                const statuses: FormControlStatus[] = [];
                const subscription = asyncComponent.control.statusChanges.subscribe((status) => statuses.push(status));

                dispatchEvent(asyncComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
                asyncFixture.detectChanges();

                expect(statuses).toEqual(['PENDING']);

                tick(ASYNC_VALIDATOR_TIMER_DUE);

                expect(statuses).toEqual(['PENDING', 'INVALID']);

                subscription.unsubscribe();
            }));
        });
    });

    describe('with file-drop', () => {
        // NOTE: KbqFileDropDirective handles drops via Promise.all + then chains scheduled inside
        // ngZone.run() reached through ngZone.runOutsideAngular(...). NgZone's outer zone is
        // captured at module bootstrap (before any fakeAsync test runs), so those microtasks
        // bypass fakeAsync's task queue. Tests use done()/setTimeout to wait — the same pattern
        // primitives/file-drop.spec.ts uses for this directive.
        it('should add files via drag-n-drop', (done) => {
            expect(component.files).toBeUndefined();

            component.disabled = false;
            fixture.detectChanges();

            dispatchDropEventWithEntry(fixture);

            setTimeout(() => {
                fixture.detectChanges();
                expect(component.onChange).toHaveBeenCalledTimes(1);
                expect(component.files.length).toEqual(1);
                expect(component.files[0].file.name).toBe(FILE_NAME);
                done();
            });
        });

        it('should NOT add files via drag-n-drop if disabled', (done) => {
            component.disabled = true;
            component.fileUpload().setDisabledState(true);
            fixture.detectChanges();

            dispatchDropEventWithEntry(fixture);

            setTimeout(() => {
                expect(component.onChange).toHaveBeenCalledTimes(0);
                done();
            });
        });

        describe('with ControlValueAccessor', () => {
            let cvaFixture: ComponentFixture<ControlValueAccessorMultipleFileUpload>;
            let cvaComponent: ControlValueAccessorMultipleFileUpload;

            beforeEach(() => {
                cvaFixture = TestBed.createComponent(ControlValueAccessorMultipleFileUpload);
                cvaComponent = cvaFixture.componentInstance;
                cvaFixture.detectChanges();
            });

            it('should update form control touched on file dropped', (done) => {
                expect(cvaComponent.control.touched).toBeFalsy();

                dispatchDropEventWithEntry(cvaFixture);

                setTimeout(() => {
                    cvaFixture.detectChanges();
                    expect(cvaComponent.control.touched).toBeTruthy();
                    done();
                });
            });
        });
    });

    describe('with fullscreen dropzone', () => {
        let dropzoneService: KbqFullScreenDropzoneService;

        beforeEach(() => {
            dropzoneService = fixture.debugElement
                .query(By.directive(KbqMultipleFileUploadComponent))
                .injector.get(KbqFullScreenDropzoneService);
        });

        it('should disable fileDrop directive', fakeAsync(() => {
            component.fullScreenDropZone.set(true);
            fixture.detectChanges();
            tick();

            dispatchDropEventWithEntry(fixture);

            expect(component.onChange).not.toHaveBeenCalled();
        }));

        it('should init dropzone service with provided config', fakeAsync(() => {
            jest.spyOn(dropzoneService, 'init');

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
            jest.spyOn(dropzoneService, 'init');

            component.fullScreenDropZone.set(true);
            fixture.detectChanges();
            tick();

            expect(dropzoneService.init).toHaveBeenCalledWith({});
        }));

        it('should stop dropzone service if fullScreen dropzone input changed to false', fakeAsync(() => {
            const stopSpy = jest.spyOn(dropzoneService, 'stop');

            component.fullScreenDropZone.set(true);
            fixture.detectChanges();
            tick();

            stopSpy.mockClear();

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

        it('should stop listening to the document once the component is destroyed', fakeAsync(() => {
            component.fullScreenDropZone.set(true);
            fixture.detectChanges();
            tick();

            const openSpy = jest.spyOn(dropzoneService, 'open');

            fixture.destroy();
            dispatchDragEvent('dragenter', { target: document.body });

            expect(openSpy).not.toHaveBeenCalled();
        }));

        it('should keep a single listener set when the config changes', fakeAsync(() => {
            component.fullScreenDropZone.set({ title: 'FIRST' });
            fixture.detectChanges();
            tick();

            component.fullScreenDropZone.set({ title: 'SECOND' });
            fixture.detectChanges();
            tick();

            const onDropSpy = jest.spyOn(dropzoneService, 'onDrop');

            dispatchDragEvent('drop', { target: document.body });

            expect(onDropSpy).toHaveBeenCalledTimes(1);
        }));
    });

    describe('with two-way binding', () => {
        let twoWayFixture: ComponentFixture<TwoWayBindingMultipleFileUpload>;
        let twoWayComponent: TwoWayBindingMultipleFileUpload;

        beforeEach(() => {
            twoWayFixture = TestBed.createComponent(TwoWayBindingMultipleFileUpload);
            twoWayComponent = twoWayFixture.componentInstance;
            twoWayFixture.detectChanges();
        });

        it('should update bound variable when files are added via input click', () => {
            expect(twoWayComponent.files).toEqual([]);

            dispatchEvent(twoWayComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            twoWayFixture.detectChanges();

            expect(twoWayComponent.files).toHaveLength(1);
            expect(twoWayComponent.files[0].file.name).toBe(FILE_NAME);
        });

        it('should update bound variable when file is removed', () => {
            dispatchEvent(twoWayComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            twoWayFixture.detectChanges();

            twoWayFixture.debugElement.query(By.css(`.${fileItemActionCssClass}`)).nativeElement.click();
            twoWayFixture.detectChanges();

            expect(twoWayComponent.files).toHaveLength(0);
        });

        it('should emit filesChange with updated list when file is added', () => {
            const filesChangeSpy = jest.fn();
            const subscription = twoWayComponent.fileUpload().filesChange.subscribe(filesChangeSpy);

            dispatchEvent(twoWayComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            twoWayFixture.detectChanges();

            subscription.unsubscribe();

            expect(filesChangeSpy).toHaveBeenCalledTimes(1);
            expect(filesChangeSpy.mock.calls[0][0]).toHaveLength(1);
            expect(filesChangeSpy.mock.calls[0][0][0].file.name).toBe(FILE_NAME);
        });

        it('should emit filesChange with updated list when file is removed', () => {
            dispatchEvent(twoWayComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            twoWayFixture.detectChanges();

            const filesChangeSpy = jest.fn();
            const subscription = twoWayComponent.fileUpload().filesChange.subscribe(filesChangeSpy);

            twoWayFixture.debugElement.query(By.css(`.${fileItemActionCssClass}`)).nativeElement.click();
            twoWayFixture.detectChanges();

            subscription.unsubscribe();

            expect(filesChangeSpy).toHaveBeenCalledTimes(1);
            expect(filesChangeSpy.mock.calls[0][0]).toHaveLength(0);
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
                ControlValueAccessorSingleFileUpload,
                SingleFileUploadWithAsyncValidator,
                SingleFileUploadWithInvalidAsyncValidator,
                SingleFileUploadWithFileReaderValidator,
                SingleFileUploadWithHint,
                TwoWayBindingSingleFileUpload
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(BasicSingleFileUpload);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('with focus and keyboard', () => {
        it('should toggle label focus state on input focused/blurred', fakeAsync(() => {
            const fileInput: HTMLInputElement = component.fileUpload().input!.nativeElement;

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
            const fileInput: HTMLInputElement = component.fileUpload().input!.nativeElement;

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

        it('should remove file via button keydown.delete', () => {
            component.disabled = false;
            fixture.detectChanges();
            const fileUpload = component.fileUpload();

            dispatchEvent(fileUpload.input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();

            const fileChangeSpy = jest.fn();
            const subscription = fileUpload.fileChange.subscribe(fileChangeSpy);

            component.elementRef.nativeElement
                .querySelector(`.${fileItemActionCssClass}`)
                .dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', keyCode: DELETE, bubbles: true }));
            fixture.detectChanges();

            subscription.unsubscribe();

            expect(fileChangeSpy).toHaveBeenCalledTimes(1);
            expect(fileChangeSpy.mock.calls[0][0]).toBeNull();
            expect(component.file).toBeNull();
        });
    });

    describe('with accessibility', () => {
        it('should render a single-selection file input', () => {
            // A `multiple` dialog for a field that keeps `files[0]` discards the rest without a word.
            expect(component.fileUpload().input!.nativeElement.multiple).toBe(false);
        });

        it('should stay single-selection even when multiple is set on the host', () => {
            // The host directive used to forward `multiple`, which put the dialog back into
            // multi-select on a component that keeps one file.
            const multipleFixture = TestBed.createComponent(SingleFileUploadMarkedMultiple);

            multipleFixture.detectChanges();

            expect(multipleFixture.componentInstance.fileUpload().input!.nativeElement.multiple).toBe(false);
        });

        it('should link projected hints through aria-describedby', () => {
            const hintFixture = TestBed.createComponent(SingleFileUploadWithHint);

            hintFixture.detectChanges();
            // The hint is projected into an `@if (hasHint)` whose condition reads the content query, so
            // it renders on the pass after the query resolves.
            hintFixture.detectChanges();

            const input: HTMLInputElement = hintFixture.componentInstance.fileUpload().input!.nativeElement;
            const hint: HTMLElement = hintFixture.nativeElement.querySelector('kbq-hint');

            expect(input.getAttribute('aria-describedby')).toBe(hint.getAttribute('id'));
        });

        it('should mark the file input invalid while the control is in an error state', () => {
            const hintFixture = TestBed.createComponent(SingleFileUploadWithHint);

            hintFixture.detectChanges();

            const input: HTMLInputElement = hintFixture.componentInstance.fileUpload().input!.nativeElement;

            expect(input.hasAttribute('aria-invalid')).toBe(false);

            hintFixture.componentInstance.control.markAsTouched();
            hintFixture.detectChanges();

            expect(input.getAttribute('aria-invalid')).toBe('true');
        });

        it('should announce an added file', fakeAsync(() => {
            component.disabled = false;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(getLiveRegionText(fixture)).toBe(announcementFor(A11Y_LOCALE.fileAdded, FILE_NAME));
        }));

        it('should announce a removed file', fakeAsync(() => {
            component.disabled = false;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();
            flush();

            component.elementRef.nativeElement.querySelector(`.${fileItemActionCssClass}`).click();
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(getLiveRegionText(fixture)).toBe(announcementFor(A11Y_LOCALE.fileRemoved, FILE_NAME));
        }));

        it('should report the files a drop discarded through rejected', (done) => {
            component.disabled = false;
            fixture.detectChanges();

            const rejectedSpy = jest.fn();
            const subscription = component.fileUpload().rejected.subscribe(rejectedSpy);
            const dropped = [createDroppedFile('kept.file'), createDroppedFile('dropped.file')];

            component.fileUpload().onFileDropped(dropped);
            fixture.detectChanges();

            setTimeout(() => {
                subscription.unsubscribe();

                expect(component.fileUpload().file?.file.name).toBe('kept.file');
                expect(rejectedSpy).toHaveBeenCalledTimes(1);
                expect(rejectedSpy.mock.calls[0][0]).toEqual([dropped[1]]);
                done();
            });
        });

        it('should have no violations while empty', async () => {
            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });

        it('should have no violations with a file selected', async () => {
            component.disabled = false;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });

        it('should have no violations while invalid', async () => {
            const hintFixture = TestBed.createComponent(SingleFileUploadWithHint);

            hintFixture.detectChanges();
            hintFixture.componentInstance.control.markAsTouched();
            hintFixture.detectChanges();

            expect(await axe(hintFixture.nativeElement)).toHaveNoViolations();
        });
    });

    describe('with accepted file types', () => {
        // `accept` is forwarded to the native input and nothing else: it filters the OS dialog, and a
        // dropped file never meets it. Rejection is a validator's job — see `FileValidators`.
        it('should join accept into the native input attribute', () => {
            component.accept = ['.pdf', '.png'];
            fixture.detectChanges();

            expect(component.fileUpload().input!.nativeElement.accept).toBe('.pdf,.png');
        });

        it('should fall back to any file type when accept is empty', () => {
            expect(component.fileUpload().input!.nativeElement.accept).toBe('*/*');
        });

        it('should still add a dropped file that accept does not cover', (done) => {
            component.disabled = false;
            component.accept = ['.pdf'];
            fixture.detectChanges();

            dispatchDropEventWithEntry(fixture, 'test.test');

            setTimeout(() => {
                fixture.detectChanges();

                expect(component.fileUpload().file?.file.name).toBe('test.test');
                done();
            });
        });
    });

    describe('with file queue change', () => {
        const emitRemoveEvent = () => {
            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();

            component.elementRef.nativeElement.querySelector(`.${fileItemActionCssClass}`).click();
            fixture.detectChanges();
        };

        it('should add file via input click', () => {
            component.disabled = false;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();

            expect(component.onChange).toHaveBeenCalledTimes(1);
            expect(component.onChange.mock.calls[0][0].file.name).toBe(FILE_NAME);
        });

        it('should NOT add file via input click if disabled', () => {
            expect(component.file).toBeUndefined();

            component.disabled = true;
            fixture.detectChanges();

            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));

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

        it('should focus the file input after the last file is removed', fakeAsync(() => {
            component.disabled = false;
            fixture.detectChanges();

            emitRemoveEvent();

            flush();

            expect(document.activeElement).toBe(component.fileUpload().input!.nativeElement);
        }));
    });

    describe('with ellipsis in the center', () => {
        afterEach(() => jest.restoreAllMocks());

        it('should add tooltip and ellipsis in the center for a file with a long name', fakeAsync(() => {
            component.disabled = false;
            fixture.detectChanges();

            // jsdom lays nothing out, so `KbqEllipsisCenterDirective` would measure the name as fitting and
            // suppress its hint. Both sides of its fit test have to be stubbed for the name to count as long
            // — which also means this case says nothing about the layout itself; that is covered by
            // `KbqSingleFileUploadComponent truncates a long file name without horizontal scroll` in
            // `e2e.playwright-spec.ts`, at the same 320px the multiple variant is pinned to.
            jest.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(100);
            jest.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(400);

            const fakeFile = new File(['test'], 'very very very very very very very very very long file name.txt');

            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(fakeFile));
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

    describe('with ControlValueAccessor', () => {
        let fixture: ComponentFixture<ControlValueAccessorSingleFileUpload>;
        let component: ControlValueAccessorSingleFileUpload;

        beforeEach(() => {
            fixture = TestBed.createComponent(ControlValueAccessorSingleFileUpload);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should toggle the disabled state', () => {
            expect(component.fileUpload().disabled).toBe(false);

            component.control.disable();
            fixture.detectChanges();

            expect(component.fileUpload().disabled).toBe(true);

            component.control.enable();
            fixture.detectChanges();

            expect(component.fileUpload().disabled).toBe(false);
        });

        it('should update file value with setValue', () => {
            expect(component.fileUpload().file).toBeFalsy();

            const fakeFile = createMockFile(FILE_NAME);

            component.control.setValue(fakeFile);

            expect(component.fileUpload().file).toBeTruthy();
        });

        it('should update form control touched on file added via click', () => {
            expect(component.control.touched).toBeFalsy();

            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();

            expect(component.control.touched).toBeTruthy();
        });

        it('should update form control touched on blur alone', () => {
            expect(component.control.touched).toBeFalsy();

            dispatchFakeEvent(component.fileUpload().input!.nativeElement, 'focusout', true);
            fixture.detectChanges();

            expect(component.control.touched).toBeTruthy();
        });

        it('should NOT mark the control touched while focus stays inside the uploader', () => {
            const host: HTMLElement = fixture.debugElement.query(
                By.directive(KbqSingleFileUploadComponent)
            ).nativeElement;
            const event = createFakeEvent('focusout', true);

            Object.defineProperty(event, 'relatedTarget', { get: () => host.querySelector('label') });
            dispatchEvent(component.fileUpload().input!.nativeElement, event);
            fixture.detectChanges();

            expect(component.control.touched).toBeFalsy();
        });

        it('should leave the control pristine on a programmatic value', () => {
            component.control.setValue({ file: createMockFile(FILE_NAME) });

            expect(component.control.pristine).toBe(true);
        });

        it('should emit valueChanges once per programmatic value', () => {
            const valueChangesSpy = jest.fn();
            const subscription = component.control.valueChanges.subscribe(valueChangesSpy);

            component.control.setValue({ file: createMockFile(FILE_NAME) });
            subscription.unsubscribe();

            expect(valueChangesSpy).toHaveBeenCalledTimes(1);
        });

        it('should leave the control pristine after reset', () => {
            dispatchEvent(component.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            fixture.detectChanges();

            expect(component.control.dirty).toBe(true);

            component.control.reset();

            expect(component.control.pristine).toBe(true);
        });

        it('should NOT emit fileChange for a programmatic value', () => {
            const fileChangeSpy = jest.fn();
            const subscription = component.fileUpload().fileChange.subscribe(fileChangeSpy);

            component.control.setValue({ file: createMockFile(FILE_NAME) });
            component.control.reset();
            subscription.unsubscribe();

            expect(fileChangeSpy).not.toHaveBeenCalled();
        });
    });

    describe('with localeConfig input property', () => {
        it('should use default properties if they not provided with localeConfig', () => {
            const updatedConfig: Partial<KbqBaseFileUploadLocaleConfiguration> = {
                captionText: 'TEST {{ browseLink }}'
            };

            component.localeConfig.set(updatedConfig);
            fixture.detectChanges();

            expect(component.fileUpload().resolvedLocaleConfig()).toMatchSnapshot();
        });
    });

    describe('with async validation', () => {
        describe('using timer-based validator', () => {
            let asyncFixture: ComponentFixture<SingleFileUploadWithAsyncValidator>;
            let asyncComponent: SingleFileUploadWithAsyncValidator;

            beforeEach(() => {
                asyncFixture = TestBed.createComponent(SingleFileUploadWithAsyncValidator);
                asyncComponent = asyncFixture.componentInstance;
                asyncFixture.detectChanges();
            });

            it('should have PENDING status immediately after file is selected', fakeAsync(() => {
                dispatchEvent(asyncComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
                asyncFixture.detectChanges();

                expect(asyncComponent.control.status).toBe('PENDING');

                tick(ASYNC_VALIDATOR_TIMER_DUE);
            }));

            it('should have VALID status after async validator resolves', fakeAsync(() => {
                dispatchEvent(asyncComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
                asyncFixture.detectChanges();

                tick(ASYNC_VALIDATOR_TIMER_DUE);

                expect(asyncComponent.control.status).toBe('VALID');
            }));

            it('should emit PENDING then VALID via statusChanges', fakeAsync(() => {
                const statuses: FormControlStatus[] = [];
                const subscription = asyncComponent.control.statusChanges.subscribe((status) => statuses.push(status));

                dispatchEvent(asyncComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
                asyncFixture.detectChanges();

                expect(statuses).toEqual(['PENDING']);

                tick(ASYNC_VALIDATOR_TIMER_DUE);

                expect(statuses).toEqual(['PENDING', 'VALID']);

                subscription.unsubscribe();
            }));
        });

        describe('using invalid timer-based validator', () => {
            let asyncFixture: ComponentFixture<SingleFileUploadWithInvalidAsyncValidator>;
            let asyncComponent: SingleFileUploadWithInvalidAsyncValidator;

            beforeEach(() => {
                asyncFixture = TestBed.createComponent(SingleFileUploadWithInvalidAsyncValidator);
                asyncComponent = asyncFixture.componentInstance;
                asyncFixture.detectChanges();
            });

            it('should have INVALID status after async validator resolves with errors', fakeAsync(() => {
                dispatchEvent(asyncComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
                asyncFixture.detectChanges();

                tick(ASYNC_VALIDATOR_TIMER_DUE);

                expect(asyncComponent.control.status).toBe('INVALID');
                expect(asyncComponent.control.errors).toEqual({ asyncError: { actual: false } });
            }));

            it('should emit PENDING then INVALID via statusChanges', fakeAsync(() => {
                const statuses: FormControlStatus[] = [];
                const subscription = asyncComponent.control.statusChanges.subscribe((status) => statuses.push(status));

                dispatchEvent(asyncComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
                asyncFixture.detectChanges();

                expect(statuses).toEqual(['PENDING']);

                tick(ASYNC_VALIDATOR_TIMER_DUE);

                expect(statuses).toEqual(['PENDING', 'INVALID']);

                subscription.unsubscribe();
            }));
        });

        describe('using FileReader-based validator', () => {
            let asyncFixture: ComponentFixture<SingleFileUploadWithFileReaderValidator>;
            let asyncComponent: SingleFileUploadWithFileReaderValidator;
            let originalFileReader: typeof FileReader;

            const setupFileReaderMock = (content: string, shouldError = false) => {
                (global as any).FileReader = jest.fn().mockImplementation(() => {
                    const reader: any = { result: null, onload: null, onerror: null };

                    reader.readAsText = function () {
                        setTimeout(() => {
                            if (shouldError) {
                                reader.onerror?.(new Event('error'));
                            } else {
                                reader.result = content;
                                reader.onload?.(new Event('load'));
                            }
                        }, 0);
                    };

                    return reader;
                });
            };

            beforeEach(() => {
                originalFileReader = global.FileReader;
                asyncFixture = TestBed.createComponent(SingleFileUploadWithFileReaderValidator);
                asyncComponent = asyncFixture.componentInstance;
                asyncFixture.detectChanges();
            });

            afterEach(() => {
                global.FileReader = originalFileReader;
            });

            it('should have VALID status when file content is within line limit', fakeAsync(() => {
                // 2 lines — below MAX_FILE_LINES_FOR_TEST (3)
                const content = Array.from({ length: 2 }, (_, i) => `line${i}`).join('\n');

                setupFileReaderMock(content);

                dispatchEvent(asyncComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
                asyncFixture.detectChanges();

                expect(asyncComponent.control.status).toBe('PENDING');

                tick(0);

                expect(asyncComponent.control.status).toBe('VALID');
                expect(asyncComponent.control.errors).toBeNull();
            }));

            it('should have INVALID status when file content exceeds line limit', fakeAsync(() => {
                // 4 lines — exceeds MAX_FILE_LINES_FOR_TEST (3)
                const content = Array.from({ length: 4 }, (_, i) => `line${i}`).join('\n');

                setupFileReaderMock(content);

                dispatchEvent(asyncComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
                asyncFixture.detectChanges();

                expect(asyncComponent.control.status).toBe('PENDING');

                tick(0);

                expect(asyncComponent.control.status).toBe('INVALID');
                expect(asyncComponent.control.errors).toEqual({
                    maxLines: { max: MAX_FILE_LINES_FOR_TEST, actual: 4 }
                });
            }));

            it('should have INVALID status with fileReadError when FileReader fails', fakeAsync(() => {
                setupFileReaderMock('', true);

                dispatchEvent(asyncComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
                asyncFixture.detectChanges();

                tick(0);

                expect(asyncComponent.control.status).toBe('INVALID');
                expect(asyncComponent.control.errors).toEqual({ fileReadError: true });
            }));
        });
    });

    describe('with file-drop', () => {
        // see note in the multi-component `with file-drop` block — same constraint applies here.
        it('should add file via drag-n-drop', (done) => {
            expect(component.file).toBeUndefined();

            component.disabled = false;
            fixture.detectChanges();

            dispatchDropEventWithEntry(fixture);

            setTimeout(() => {
                fixture.detectChanges();
                expect(component.onChange).toHaveBeenCalledTimes(1);
                expect(component.file?.file.name).toBe(FILE_NAME);
                done();
            });
        });

        it('should NOT add file via drag-n-drop if disabled', (done) => {
            component.disabled = true;
            component.fileUpload().setDisabledState(true);
            fixture.detectChanges();

            dispatchDropEventWithEntry(fixture);

            setTimeout(() => {
                expect(component.onChange).toHaveBeenCalledTimes(0);
                expect(component.file).toBeUndefined();
                done();
            });
        });

        describe('with ControlValueAccessor', () => {
            let cvaFixture: ComponentFixture<ControlValueAccessorSingleFileUpload>;
            let cvaComponent: ControlValueAccessorSingleFileUpload;

            beforeEach(() => {
                cvaFixture = TestBed.createComponent(ControlValueAccessorSingleFileUpload);
                cvaComponent = cvaFixture.componentInstance;
                cvaFixture.detectChanges();
            });

            it('should update form control touched on file dropped', (done) => {
                expect(cvaComponent.control.touched).toBeFalsy();

                dispatchDropEventWithEntry(cvaFixture);

                setTimeout(() => {
                    cvaFixture.detectChanges();
                    expect(cvaComponent.control.touched).toBeTruthy();
                    done();
                });
            });
        });
    });

    describe('with fullscreen dropzone', () => {
        let dropzoneService: KbqFullScreenDropzoneService;

        beforeEach(() => {
            dropzoneService = fixture.debugElement
                .query(By.directive(KbqSingleFileUploadComponent))
                .injector.get(KbqFullScreenDropzoneService);
        });

        it('should disable fileDrop directive', fakeAsync(() => {
            component.fullScreenDropZone.set(true);
            fixture.detectChanges();
            tick();

            dispatchDropEventWithEntry(fixture);

            expect(component.onChange).not.toHaveBeenCalled();
        }));

        it('should init dropzone service with provided config', fakeAsync(() => {
            jest.spyOn(dropzoneService, 'init');

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
            jest.spyOn(dropzoneService, 'init');

            component.fullScreenDropZone.set(true);
            fixture.detectChanges();
            tick();

            expect(dropzoneService.init).toHaveBeenCalledWith({});
        }));

        it('should stop dropzone service if fullScreen dropzone input changed to false', fakeAsync(() => {
            const stopSpy = jest.spyOn(dropzoneService, 'stop');

            component.fullScreenDropZone.set(true);
            fixture.detectChanges();
            tick();

            stopSpy.mockClear();

            component.fullScreenDropZone.set(false);
            fixture.detectChanges();

            expect(dropzoneService.stop).toHaveBeenCalled();
        }));

        it('should listen to filesDropped via dropzoneService', () => {
            const mockFiles = [{ ...createMockFile('test1.txt', { type: 'text/plain' }), fullPath: 'test1.txt' }];

            dropzoneService.filesDropped.emit(mockFiles);

            expect(component.file?.file).toEqual(mockFiles[0]);
        });

        it('should handle a dropped file once after the config changes', fakeAsync(() => {
            component.fullScreenDropZone.set({ title: 'FIRST' });
            fixture.detectChanges();
            tick();

            component.fullScreenDropZone.set({ title: 'SECOND' });
            fixture.detectChanges();
            tick();

            const onFileDroppedSpy = jest.spyOn(component.fileUpload(), 'onFileDropped');

            dropzoneService.filesDropped.emit([{ ...createMockFile('test1.txt'), fullPath: 'test1.txt' }]);

            expect(onFileDroppedSpy).toHaveBeenCalledTimes(1);
            flush();
        }));
    });

    describe('with two-way binding', () => {
        let twoWayFixture: ComponentFixture<TwoWayBindingSingleFileUpload>;
        let twoWayComponent: TwoWayBindingSingleFileUpload;

        beforeEach(() => {
            twoWayFixture = TestBed.createComponent(TwoWayBindingSingleFileUpload);
            twoWayComponent = twoWayFixture.componentInstance;
            twoWayFixture.detectChanges();
        });

        it('should update bound variable when a file is selected via input click', () => {
            expect(twoWayComponent.file).toBeNull();

            dispatchEvent(twoWayComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            twoWayFixture.detectChanges();

            expect(twoWayComponent.file?.file.name).toBe(FILE_NAME);
        });

        it('should update bound variable to null when file is removed', () => {
            dispatchEvent(twoWayComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            twoWayFixture.detectChanges();

            twoWayComponent.elementRef.nativeElement.querySelector(`.${fileItemActionCssClass}`).click();
            twoWayFixture.detectChanges();

            expect(twoWayComponent.file).toBeNull();
        });

        it('should emit fileChange with the selected file', () => {
            const fileChangeSpy = jest.fn();
            const subscription = twoWayComponent.fileUpload().fileChange.subscribe(fileChangeSpy);

            dispatchEvent(twoWayComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            twoWayFixture.detectChanges();

            subscription.unsubscribe();

            expect(fileChangeSpy).toHaveBeenCalledTimes(1);
            expect(fileChangeSpy.mock.calls[0][0]?.file.name).toBe(FILE_NAME);
        });

        it('should emit fileChange with null when file is removed', () => {
            dispatchEvent(twoWayComponent.fileUpload().input!.nativeElement, getMockedChangeEvent(FILE_NAME));
            twoWayFixture.detectChanges();

            const fileChangeSpy = jest.fn();
            const subscription = twoWayComponent.fileUpload().fileChange.subscribe(fileChangeSpy);

            twoWayComponent.elementRef.nativeElement.querySelector(`.${fileItemActionCssClass}`).click();
            twoWayFixture.detectChanges();

            subscription.unsubscribe();

            expect(fileChangeSpy).toHaveBeenCalledTimes(1);
            expect(fileChangeSpy.mock.calls[0][0]).toBeNull();
        });
    });
});

describe('KbqFullScreenDropzoneService', () => {
    let service: KbqFullScreenDropzoneService;
    let overlay: Overlay;
    let document: Document;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [KbqFullScreenDropzoneService]
        });

        service = TestBed.inject(KbqFullScreenDropzoneService);
        overlay = TestBed.inject(Overlay);
        document = TestBed.inject(DOCUMENT);
    });

    afterEach(() => {
        service.stop();
    });

    it('should create overlay if not already attached', () => {
        const create = jest.spyOn(overlay, 'create');

        service.open();

        expect(create).toHaveBeenCalledWith({
            hasBackdrop: false,
            panelClass: ['kbq-dropzone-overlay', 'kbq-fullscreen-dropzone'],
            width: '100%',
            height: '100%',
            positionStrategy: expect.any(Object)
        });
    });

    it('should handle close when overlay is not open', () => {
        expect(() => service.close()).not.toThrow();
    });

    it('should create overlay with correct configuration', () => {
        jest.spyOn(overlay, 'create');

        service.open();

        expect(overlay.create).toHaveBeenCalledWith({
            hasBackdrop: false,
            panelClass: ['kbq-dropzone-overlay', 'kbq-fullscreen-dropzone'],
            width: '100%',
            height: '100%',
            positionStrategy: expect.any(Object)
        });
    });

    describe('init', () => {
        it('should set up dragenter event listener', () => {
            const config: KbqDropzoneData = { title: 'Drop files' };

            jest.spyOn(service, 'open');

            service.init(config);

            dispatchDragEvent('dragenter', { target: document.body });

            expect(service.open).toHaveBeenCalledWith(config);
        });

        it('should set up dragleave event listener and close overlay', () => {
            jest.spyOn(service, 'close');

            service.init();

            const dragleaveEvent = new DragEvent('dragleave', {
                relatedTarget: null
            });

            document.body.dispatchEvent(dragleaveEvent);

            expect(service.close).toHaveBeenCalled();
        });

        it('should not close overlay on dragleave if related target is inside current target', () => {
            jest.spyOn(service, 'close');

            service.init();

            const childElement = document.createElement('div');

            document.body.appendChild(childElement);

            const dragleaveEvent = new DragEvent('dragleave', {
                relatedTarget: childElement
            });

            Object.defineProperty(dragleaveEvent, 'currentTarget', {
                value: document.body,
                writable: true
            });

            document.body.dispatchEvent(dragleaveEvent);

            expect(service.close).not.toHaveBeenCalled();
        });

        it('should set up drop event listener', () => {
            jest.spyOn(service, 'onDrop');
            jest.spyOn(service, 'close');

            service.init();

            const dropEvent = dispatchDragEvent('drop', { target: document.body });

            expect(service.onDrop).toHaveBeenCalledWith(dropEvent);
            expect(service.close).toHaveBeenCalled();
        });

        it('should pass config to open method', () => {
            const config: KbqDropzoneData = {
                title: 'TEST',
                caption: 'CAPTION',
                size: 'normal'
            };

            jest.spyOn(service, 'open');

            service.init(config);

            dispatchDragEvent('dragenter', { target: document.body });

            expect(service.open).toHaveBeenCalledWith(config);
        });
    });

    describe('stop', () => {
        it('should replace the previous listener set when init runs again', () => {
            const openSpy = jest.spyOn(service, 'open');

            service.init({ title: 'FIRST' });
            service.init({ title: 'SECOND' });

            dispatchDragEvent('dragenter', { target: document.body });

            expect(openSpy).toHaveBeenCalledTimes(1);
            expect(openSpy).toHaveBeenCalledWith({ title: 'SECOND' });
        });

        it('should stop listening once destroyed', () => {
            jest.spyOn(service, 'open');

            service.init();
            service.ngOnDestroy();

            dispatchDragEvent('dragenter', { target: document.body });

            expect(service.open).not.toHaveBeenCalled();
        });

        it('should unsubscribe from all event listeners', () => {
            jest.spyOn(service, 'open');

            service.init();
            service.stop();

            dispatchDragEvent('dragenter', { target: document.body });

            expect(service.open).not.toHaveBeenCalled();
        });

        it('should prevent future events after stop is called', () => {
            jest.spyOn(service, 'close');

            service.init();
            service.stop();

            dispatchDragEvent('dragleave', { target: document.body });

            expect(service.close).not.toHaveBeenCalled();
        });
    });
});

describe('KbqLocalDropzone', () => {
    let component: TestLocalDropzone;
    let fixture: ComponentFixture<TestLocalDropzone>;
    let directive: KbqLocalDropzone;
    let directiveElement: HTMLElement;
    let overlay: Overlay;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TestLocalDropzone]
        });

        fixture = TestBed.createComponent(TestLocalDropzone);
        component = fixture.componentInstance;
        overlay = TestBed.inject(Overlay);

        fixture.detectChanges();

        const directiveDebugElement = fixture.debugElement.query(
            (de) => de.injector.get(KbqLocalDropzone, null) !== null
        );

        directive = directiveDebugElement.injector.get(KbqLocalDropzone);
        directiveElement = directiveDebugElement.nativeElement;
    });

    afterEach(() => {
        directive.close();
    });

    it('should set up dragenter listener on host element', () => {
        jest.spyOn(directive, 'open');

        dispatchDragEvent('dragenter', { target: directiveElement });

        expect(directive.open).toHaveBeenCalled();
    });

    describe('connectedTo', () => {
        it('should connect filesDropped to single file upload component', () => {
            const connectedComponent = component.singleFileUpload();

            jest.spyOn(connectedComponent, 'onFileDropped');
            component.connectedComponent = connectedComponent;
            fixture.detectChanges();

            const files = [{ ...createMockFile('test.txt'), fullPath: 'test.txt' }];

            directive.filesDropped.emit(files);

            expect(connectedComponent.onFileDropped).toHaveBeenCalledWith(files);
        });

        it('should connect filesDropped to multiple file upload component', () => {
            const connectedComponent = component.multipleFileUpload();

            jest.spyOn(connectedComponent, 'onFileDropped');
            component.connectedComponent = connectedComponent;
            fixture.detectChanges();

            const mockFiles = [
                { ...createMockFile('test1.txt', { type: 'text/plain' }), fullPath: 'test1.txt' },
                { ...createMockFile('test2.txt', { type: 'text/plain' }), fullPath: 'test2.txt' }
            ];

            directive.filesDropped.emit(mockFiles);

            expect(connectedComponent.onFileDropped).toHaveBeenCalledWith(mockFiles);
        });

        it('should handle connectedTo being undefined', () => {
            component.connectedComponent = undefined;
            fixture.detectChanges();

            const mockFiles = [
                { ...createMockFile('test1.txt', { type: 'text/plain' }), fullPath: 'test1.txt' }
            ];

            expect(() => directive.filesDropped.emit(mockFiles)).not.toThrow();
        });
    });

    describe('open', () => {
        it('should create overlay with correct configuration', () => {
            jest.spyOn(overlay, 'create');
            directive.open();

            expect(overlay.create).toHaveBeenCalledWith({
                hasBackdrop: false,
                panelClass: ['kbq-dropzone-overlay', 'kbq-local-dropzone'],
                width: directiveElement.offsetWidth,
                height: directiveElement.offsetHeight,
                positionStrategy: expect.any(Object)
            });
        });

        it('should call init after attaching overlay', () => {
            jest.spyOn<any, any>(directive, 'init');

            directive.open();

            expect((directive as any).init).toHaveBeenCalled();
        });
    });

    describe('close', () => {
        it('should handle close when overlay is not open', () => {
            expect(() => directive.close()).not.toThrow();
        });
    });

    describe('init', () => {
        beforeEach(() => {
            directive.open();
        });

        it('should close overlay on dragleave when leaving overlay bounds', () => {
            const overlayRef: OverlayRef = (directive as any).overlayRef;

            jest.spyOn(directive, 'close');

            const dragleaveEvent = new DragEvent('dragleave', {
                relatedTarget: null
            });

            overlayRef.overlayElement.dispatchEvent(dragleaveEvent);

            expect(directive.close).toHaveBeenCalled();
        });

        it('should not close overlay on dragleave if related target is inside overlay', () => {
            const overlayRef: OverlayRef = (directive as any).overlayRef;

            jest.spyOn(directive, 'close');

            const childElement = document.createElement('div');

            overlayRef.overlayElement.appendChild(childElement);

            const dragleaveEvent = new DragEvent('dragleave', {
                relatedTarget: childElement
            });

            Object.defineProperty(dragleaveEvent, 'currentTarget', {
                value: overlayRef.overlayElement,
                writable: true
            });

            overlayRef.overlayElement.dispatchEvent(dragleaveEvent);

            expect(directive.close).not.toHaveBeenCalled();
        });

        it('should handle drop event and close overlay', () => {
            const overlayRef: OverlayRef = (directive as any).overlayRef;

            jest.spyOn(directive, 'onDrop');
            jest.spyOn(directive, 'close');

            const dropEvent = dispatchDragEvent('drop', { target: overlayRef.overlayElement });

            expect(directive.onDrop).toHaveBeenCalledWith(dropEvent);
            expect(directive.close).toHaveBeenCalled();
        });

        it('should not initialize if overlayRef is undefined', () => {
            directive.close();
            (directive as any).overlayRef = undefined;

            expect(() => (directive as any).init()).not.toThrow();
        });

        it('should not keep listeners on a disposed overlay element', () => {
            const disposed: HTMLElement = ((directive as any).overlayRef as OverlayRef).overlayElement;

            jest.spyOn(directive, 'onDrop');

            directive.close();
            dispatchDragEvent('drop', { target: disposed });

            expect(directive.onDrop).not.toHaveBeenCalled();
        });
    });

    describe('createOverlay', () => {
        it('should create overlay positioned relative to host element', () => {
            const positionStrategy = overlay.position();

            jest.spyOn(overlay, 'position').mockImplementation(() => positionStrategy);
            const flexibleConnectedToSpy = jest.spyOn(positionStrategy, 'flexibleConnectedTo');

            directive.open();

            expect(flexibleConnectedToSpy).toHaveBeenCalledWith(directiveElement);
        });

        it('should use element dimensions for overlay size', () => {
            jest.spyOn(overlay, 'create');

            // Set specific dimensions
            directiveElement.style.width = '300px';
            directiveElement.style.height = '250px';

            directive.open();

            expect(overlay.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    width: directiveElement.offsetWidth,
                    height: directiveElement.offsetHeight
                })
            );
        });
    });
});

@Component({
    selector: 'basic-single-file-upload',
    imports: [KbqFileUploadModule, FormsModule, ReactiveFormsModule],
    template: `
        <div style="max-width: 350px;">
            <kbq-single-file-upload
                #fileUpload
                [accept]="accept"
                [disabled]="disabled"
                [fullScreenDropZone]="fullScreenDropZone()"
                [localeConfig]="localeConfig()"
                (fileChange)="onChange($event)"
            />
        </div>
    `
})
class BasicSingleFileUpload {
    elementRef = inject_1(ElementRef);

    readonly fileUpload = viewChild.required<KbqSingleFileUploadComponent>('fileUpload');
    disabled: boolean;
    file: KbqFileItem | null;
    accept: string[] = [];
    fullScreenDropZone = signal<KbqDropzoneData | boolean | undefined>(undefined);

    localeConfig = signal<Partial<KbqBaseFileUploadLocaleConfiguration>>({});

    onChange = jest.fn().mockImplementation((file: KbqFileItem) => {
        this.file = file;
    });
}

@Component({
    selector: 'control-value-accessor-single-file-upload',
    imports: [KbqFileUploadModule, FormsModule, ReactiveFormsModule],
    template: `
        <div style="max-width: 350px;">
            <kbq-file-upload #fileUpload [formControl]="control" [accept]="accept" (fileChange)="onChange($event)" />
        </div>
    `
})
class ControlValueAccessorSingleFileUpload {
    elementRef = inject_1(ElementRef);

    readonly fileUpload = viewChild.required<KbqSingleFileUploadComponent>('fileUpload');
    file: KbqFileItem | null;
    accept: string[] = [];
    control = new FormControl();

    onChange = jest.fn().mockImplementation((file: KbqFileItem) => {
        this.file = file;
    });
}

@Component({
    selector: 'control-value-accessor-multiple-file-upload',
    imports: [KbqFileUploadModule, FormsModule, ReactiveFormsModule],
    template: `
        <div style="max-width: 350px;">
            <kbq-multiple-file-upload
                #fileUpload
                [disabled]="disabled"
                [fullScreenDropZone]="fullScreenDropZone()"
                [localeConfig]="localeConfig()"
                [addStrategy]="addStrategy()"
                (filesChange)="onChange($event)"
            />
        </div>
    `
})
class BasicMultipleFileUpload {
    elementRef = inject_1(ElementRef);
    cdr = inject_1(ChangeDetectorRef);

    readonly fileUpload = viewChild.required<KbqMultipleFileUploadComponent>('fileUpload');
    disabled: boolean;
    files: KbqFileItem[];
    fullScreenDropZone = signal<KbqDropzoneData | boolean | undefined>(undefined);
    addStrategy = signal<KbqFileUploadAddStrategyValues>(KbqFileUploadAddStrategy.Concat);

    localeConfig = signal<Partial<KbqBaseFileUploadLocaleConfiguration>>({});

    onChange = jest.fn().mockImplementation((files: KbqFileItem[]) => {
        this.files = files;
    });
}

@Component({
    selector: 'control-value-accessor-multiple-file-upload',
    imports: [KbqFileUploadModule, FormsModule, ReactiveFormsModule],
    template: `
        <div style="max-width: 350px;">
            <kbq-multiple-file-upload
                #fileUpload
                [formControl]="control"
                [accept]="accept"
                (filesChange)="onChange($event)"
            />
        </div>
    `
})
class ControlValueAccessorMultipleFileUpload {
    elementRef = inject_1(ElementRef);

    readonly fileUpload = viewChild.required<KbqMultipleFileUploadComponent>('fileUpload');
    files: KbqFileItem[];
    accept: string[] = [];
    control = new FormControl();

    onChange = jest.fn().mockImplementation((files: KbqFileItem[]) => {
        this.files = files;
    });
}

@Component({
    selector: 'single-file-upload-with-async-validator',
    imports: [KbqFileUploadModule, ReactiveFormsModule],
    template: `
        <kbq-file-upload #fileUpload [formControl]="control" />
    `
})
class SingleFileUploadWithAsyncValidator {
    elementRef = inject_1(ElementRef);

    readonly fileUpload = viewChild.required<KbqSingleFileUploadComponent>('fileUpload');
    readonly control = new FormControl<KbqFileItem | null>(null, {
        asyncValidators: [getAsyncValidator()]
    });
}

@Component({
    selector: 'single-file-upload-with-invalid-async-validator',
    imports: [KbqFileUploadModule, ReactiveFormsModule],
    template: `
        <kbq-file-upload #fileUpload [formControl]="control" />
    `
})
class SingleFileUploadWithInvalidAsyncValidator {
    elementRef = inject_1(ElementRef);

    readonly fileUpload = viewChild.required<KbqSingleFileUploadComponent>('fileUpload');
    readonly control = new FormControl<KbqFileItem | null>(null, {
        asyncValidators: [getAsyncValidator(false)]
    });
}

@Component({
    selector: 'single-file-upload-with-file-reader-validator',
    imports: [KbqFileUploadModule, ReactiveFormsModule],
    template: `
        <kbq-file-upload #fileUpload [formControl]="control" />
    `
})
class SingleFileUploadWithFileReaderValidator {
    elementRef = inject_1(ElementRef);

    readonly fileUpload = viewChild.required<KbqSingleFileUploadComponent>('fileUpload');
    readonly control = new FormControl<KbqFileItem | null>(null, {
        asyncValidators: [fileContentLinesValidator(MAX_FILE_LINES_FOR_TEST)]
    });
}

@Component({
    selector: 'multiple-file-upload-with-async-validator',
    imports: [KbqFileUploadModule, ReactiveFormsModule],
    template: `
        <kbq-multiple-file-upload #fileUpload [formControl]="control" />
    `
})
class MultipleFileUploadWithAsyncValidator {
    elementRef = inject_1(ElementRef);

    readonly fileUpload = viewChild.required<KbqMultipleFileUploadComponent>('fileUpload');
    readonly control = new FormControl<KbqFileItem[] | null>(null, {
        asyncValidators: [getAsyncValidator()]
    });
}

@Component({
    selector: 'multiple-file-upload-with-invalid-async-validator',
    imports: [KbqFileUploadModule, ReactiveFormsModule],
    template: `
        <kbq-multiple-file-upload #fileUpload [formControl]="control" />
    `
})
class MultipleFileUploadWithInvalidAsyncValidator {
    elementRef = inject_1(ElementRef);

    readonly fileUpload = viewChild.required<KbqMultipleFileUploadComponent>('fileUpload');
    readonly control = new FormControl<KbqFileItem[] | null>(null, {
        asyncValidators: [getAsyncValidator(false)]
    });
}

@Component({
    selector: 'multiple-file-upload-with-hint',
    imports: [KbqFileUploadModule, KbqFormFieldModule, ReactiveFormsModule],
    template: `
        <kbq-multiple-file-upload #fileUpload [formControl]="control">
            <kbq-hint>Up to 5 MB</kbq-hint>
        </kbq-multiple-file-upload>
    `
})
class MultipleFileUploadWithHint {
    readonly fileUpload = viewChild.required<KbqMultipleFileUploadComponent>('fileUpload');
    readonly control = new FormControl<KbqFileItem[] | null>(null, { validators: [Validators.required] });
}

@Component({
    selector: 'single-file-upload-with-hint',
    imports: [KbqFileUploadModule, KbqFormFieldModule, ReactiveFormsModule],
    template: `
        <kbq-single-file-upload #fileUpload [formControl]="control">
            <kbq-hint>Up to 5 MB</kbq-hint>
        </kbq-single-file-upload>
    `
})
class SingleFileUploadWithHint {
    readonly fileUpload = viewChild.required<KbqSingleFileUploadComponent>('fileUpload');
    readonly control = new FormControl<KbqFileItem | null>(null, { validators: [Validators.required] });
}

@Component({
    selector: 'single-file-upload-marked-multiple',
    imports: [KbqFileUploadModule],
    template: `
        <kbq-single-file-upload #fileUpload multiple />
    `
})
class SingleFileUploadMarkedMultiple {
    readonly fileUpload = viewChild.required<KbqSingleFileUploadComponent>('fileUpload');
}

@Component({
    selector: 'two-way-binding-multiple-file-upload',
    imports: [KbqFileUploadModule],
    template: `
        <kbq-multiple-file-upload #fileUpload [(files)]="files" />
    `
})
class TwoWayBindingMultipleFileUpload {
    readonly fileUpload = viewChild.required<KbqMultipleFileUploadComponent>('fileUpload');
    files: KbqFileItem[] = [];
}

@Component({
    selector: 'two-way-binding-single-file-upload',
    imports: [KbqFileUploadModule],
    template: `
        <kbq-single-file-upload #fileUpload [(file)]="file" />
    `
})
class TwoWayBindingSingleFileUpload {
    elementRef = inject_1(ElementRef);

    readonly fileUpload = viewChild.required<KbqSingleFileUploadComponent>('fileUpload');
    file: KbqFileItem | null = null;
}

// Test host component
@Component({
    selector: 'test-local-dropzone',
    imports: [KbqLocalDropzone, KbqMultipleFileUploadComponent, KbqSingleFileUploadComponent],
    template: `
        <div kbqLocalDropzone style="width: 200px; height: 150px;" [kbqConnectedTo]="connectedComponent">Drop zone</div>

        <kbq-multiple-file-upload />
        <kbq-single-file-upload />
    `
})
class TestLocalDropzone {
    multipleFileUpload = viewChild.required(KbqMultipleFileUploadComponent);
    singleFileUpload = viewChild.required(KbqSingleFileUploadComponent);
    connectedComponent?: KbqSingleFileUploadComponent | KbqMultipleFileUploadComponent;
}
