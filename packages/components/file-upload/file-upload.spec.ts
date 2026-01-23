import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild, signal, viewChild } from '@angular/core';
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
import { KbqDropzoneData, KbqFullScreenDropzoneService, KbqLocalDropzone } from './dropzone';
import { KbqFileItem, KbqFileValidatorFn } from './file-upload';
import { KbqFileUploadModule } from './file-upload.module';
import { KbqInputFileMultipleLabel, KbqMultipleFileUploadComponent } from './multiple-file-upload.component';
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

const FILE_NAME = 'test.file';

const createMockFile = (fileName: string = FILE_NAME, options?: FilePropertyBag) =>
    new File(['test'] satisfies BlobPart[], fileName, options);

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

            fixture.debugElement.query(By.css(`.${fileItemActionCssClass}`)).nativeElement.click();
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
                { ...createMockFile('test1.txt', { type: 'text/plain' }), fullPath: 'test1.txt' }];

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

// Test host component
@Component({
    selector: 'test-local-dropzone',
    imports: [KbqLocalDropzone, KbqMultipleFileUploadComponent, KbqSingleFileUploadComponent],
    standalone: true,
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
