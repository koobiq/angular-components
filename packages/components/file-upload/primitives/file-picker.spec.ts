import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqFileList, KbqFileLoader, KbqFileUploadContext } from '@koobiq/components/file-upload';

const createComponent = <T>(component: Type<T>, providers: any[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

@Component({
    selector: '',
    imports: [
        KbqFileUploadContext
    ],
    template: `
        <div
            kbqFileUploadContext
            [id]="id"
            [disabled]="disabled"
            [multiple]="multiple"
            [accept]="accept"
            [onlyDirectory]="onlyDirectory"
        >
            >
        </div>
    `
})
class TestFileUploadContext {
    id: string | null = null;
    disabled = false;
    multiple: boolean | null = null;
    accept: string | null = null;
    onlyDirectory: boolean | null = null;
}

@Component({
    selector: '',
    imports: [
        KbqFileLoader
    ],
    template: `
        <label
            #loader="kbqFileLoader"
            kbqFileLoader
            [disabled]="disabled"
            [multiple]="multiple"
            [accept]="accept"
            [for]="for"
            [onlyDirectory]="onlyDirectory"
            [describedBy]="describedBy"
            [invalid]="invalid"
            (fileChange)="onFileChange($event)"
        >
            TEST
        </label>
    `
})
class TestFileLoader {
    disabled = false;
    multiple: boolean | null = null;
    accept: string | null = null;
    for: string | null = null;
    onlyDirectory: boolean | null = null;
    describedBy: string | null = null;
    invalid = false;
    fileChangeEvent: Event | null = null;

    onFileChange(event: Event) {
        this.fileChangeEvent = event;
    }
}

@Component({
    imports: [KbqFileLoader, KbqFileUploadContext],
    standalone: true,
    template: `
        <div
            kbqFileUploadContext
            [disabled]="contextDisabled"
            [multiple]="contextMultiple"
            [accept]="contextAccept"
            [id]="contextId"
            [onlyDirectory]="contextOnlyDirectory"
        >
            <div
                #loader="kbqFileLoader"
                kbqFileLoader
                [disabled]="disabled"
                [multiple]="multiple"
                [accept]="accept"
                [for]="for"
                [onlyDirectory]="onlyDirectory"
            >
                Content
            </div>
        </div>
    `
})
class TestWithContextComponent {
    contextDisabled: boolean | null = null;
    contextMultiple: boolean | null = null;
    contextAccept: string | null = null;
    contextId: string | null = null;
    contextOnlyDirectory: boolean | null = null;

    disabled = false;
    multiple: boolean | null = null;
    accept: string | null = null;
    for: string | null = null;
    onlyDirectory: boolean | null = null;
}

interface TestFile {
    name: string;
    size: number;
}

@Component({
    selector: '',
    imports: [
        KbqFileList
    ],
    template: `
        <div
            #fileList="kbqFileList"
            kbqFileList
            (itemRemoved)="onItemRemoved($event)"
            (itemsAdded)="onItemsAdded($event)"
        ></div>
    `
})
class TestFileList {
    itemRemovedEvent: [TestFile, number] | null = null;
    itemsAddedEvent: TestFile[] | null = null;

    onItemRemoved(event: [TestFile, number]) {
        this.itemRemovedEvent = event;
    }

    onItemsAdded(event: TestFile[]) {
        this.itemsAddedEvent = event;
    }
}

describe('KbqFileUploadContext', () => {
    let fixture: ComponentFixture<TestFileUploadContext>;
    let directive: KbqFileUploadContext;

    beforeEach(() => {
        fixture = createComponent(TestFileUploadContext);
        directive = fixture.debugElement.children[0].injector.get(KbqFileUploadContext);
        fixture.detectChanges();
    });

    describe('id input', () => {
        it('should have null as default value', () => {
            expect(directive.id()).toBeNull();
        });

        it('should accept string value', () => {
            fixture.componentInstance.id = 'test-id';
            fixture.detectChanges();
            expect(directive.id()).toBe('test-id');
        });
    });

    describe('disabled input', () => {
        it('should have false as default value', () => {
            expect(directive.disabled()).toBe(false);
        });

        it('should accept boolean value', () => {
            fixture.componentInstance.disabled = true;
            fixture.detectChanges();
            expect(directive.disabled()).toBe(true);
        });
    });

    describe('multiple input', () => {
        it('should have null as default value', () => {
            expect(directive.multiple()).toBeFalsy();
        });

        it('should transform string to boolean', () => {
            fixture.componentInstance.multiple = true;
            fixture.detectChanges();
            expect(directive.multiple()).toBe(true);
        });
    });

    describe('accept input', () => {
        it('should have null as default value', () => {
            expect(directive.accept()).toBeNull();
        });

        it('should accept file type specifiers', () => {
            fixture.componentInstance.accept = '.pdf,.doc';
            fixture.detectChanges();
            expect(directive.accept()).toBe('.pdf,.doc');
        });
    });

    describe('onlyDirectory input', () => {
        it('should have null as default value', () => {
            expect(directive.onlyDirectory()).toBeNull();
        });

        it('should transform string to boolean', () => {
            fixture.componentInstance.onlyDirectory = true;
            fixture.detectChanges();
            expect(directive.onlyDirectory()).toBe(true);
        });
    });
});

describe('KbqFileLoader', () => {
    describe('without context', () => {
        let component: TestFileLoader;
        let fixture: ComponentFixture<TestFileLoader>;
        let loader: KbqFileLoader;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(TestFileLoader);
            component = fixture.componentInstance;
            loader = fixture.debugElement.query(By.directive(KbqFileLoader)).componentInstance;
            fixture.detectChanges();
            inputElement = loader.input().nativeElement;
        });

        it('should have hidden file input', () => {
            expect(inputElement.type).toBe('file');
            expect(inputElement.classList.contains('cdk-visually-hidden')).toBe(true);
        });

        describe('disabled input', () => {
            it('should have false as default value', () => {
                expect(inputElement.disabled).toBe(false);
            });

            it('should update input disabled attribute', () => {
                component.disabled = true;
                fixture.detectChanges();
                expect(inputElement.disabled).toBe(true);
            });
        });

        describe('multiple input', () => {
            it('should have null as default value', () => {
                expect(inputElement.hasAttribute('multiple')).toBe(false);
            });

            it('should update input multiple attribute', () => {
                component.multiple = true;
                fixture.detectChanges();
                expect(inputElement.hasAttribute('multiple')).toBe(true);
            });
        });

        describe('accept input', () => {
            it('should update input accept attribute', () => {
                component.accept = '.pdf,.doc';
                fixture.detectChanges();
                expect(inputElement.accept).toBe('.pdf,.doc');
            });
        });

        describe('for input', () => {
            it('should update input id attribute', () => {
                component.for = 'test-id';
                fixture.detectChanges();
                expect(inputElement.id).toBe('test-id');
            });
        });

        describe('onlyDirectory input', () => {
            it('should have null as default value', () => {
                expect(inputElement.hasAttribute('webkitdirectory')).toBe(false);
            });

            it('should update input webkitdirectory attribute', () => {
                component.onlyDirectory = true;
                fixture.detectChanges();
                expect(inputElement.hasAttribute('webkitdirectory')).toBe(true);
            });
        });

        describe('fileChange output', () => {
            it('should emit event on file input change', () => {
                const event = new Event('change');

                inputElement.dispatchEvent(event);
                fixture.detectChanges();
                expect(component.fileChangeEvent).toBeTruthy();
            });
        });
    });

    describe('with context', () => {
        let component: TestWithContextComponent;
        let fixture: ComponentFixture<TestWithContextComponent>;
        let loader: KbqFileLoader;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(TestWithContextComponent);
            component = fixture.componentInstance;
            loader = fixture.debugElement.query(By.directive(KbqFileLoader)).componentInstance;
            fixture.detectChanges();
            inputElement = loader.input().nativeElement;
        });

        it('should prioritize context disabled over component disabled', () => {
            component.disabled = false;
            component.contextDisabled = true;
            fixture.detectChanges();
            expect(inputElement.disabled).toBe(true);
        });

        it('should prioritize context multiple over component multiple', () => {
            component.multiple = false;
            component.contextMultiple = true;
            fixture.detectChanges();
            expect(inputElement.hasAttribute('multiple')).toBe(true);
        });

        it('should prioritize context accept over component accept', () => {
            component.accept = '.txt';
            component.contextAccept = '.pdf';
            fixture.detectChanges();
            expect(inputElement.accept).toBe('.pdf');
        });

        it('should prioritize context id over component for', () => {
            component.for = 'component-id';
            component.contextId = 'context-id';
            fixture.detectChanges();
            expect(inputElement.id).toBe('context-id');
        });

        it('should prioritize context onlyDirectory over component onlyDirectory', () => {
            component.onlyDirectory = false;
            component.contextOnlyDirectory = true;
            fixture.detectChanges();
            expect(inputElement.hasAttribute('webkitdirectory')).toBe(true);
        });

        it('should use component values when context values are null', () => {
            component.contextDisabled = null;
            component.disabled = true;
            component.multiple = true;
            component.accept = '.pdf';
            component.for = 'test-id';
            component.onlyDirectory = true;
            fixture.detectChanges();

            expect(inputElement.disabled).toBe(true);
            expect(inputElement.accept).toBe('.pdf');
            expect(inputElement.id).toBe('test-id');
            expect(inputElement.hasAttribute('webkitdirectory')).toBe(true);
            // `multiple` is not in that list: the context transforms it with `booleanAttribute`, which
            // turns a bound `null` into `false` — a value of its own that keeps winning over the loader.
            expect(inputElement.multiple).toBe(false);
        });

        it('should render no multiple attribute for a falsy value rather than the string "false"', () => {
            component.contextMultiple = false;
            component.multiple = false;
            fixture.detectChanges();

            // `[attr.multiple]="false"` would write multiple="false", and a boolean attribute is read by
            // presence: the OS dialog would go multi-select for a single-file field.
            expect(inputElement.hasAttribute('multiple')).toBe(false);
            expect(inputElement.multiple).toBe(false);
        });

        it('should render no webkitdirectory attribute for a falsy value', () => {
            component.contextOnlyDirectory = false;
            component.onlyDirectory = false;
            fixture.detectChanges();

            expect(inputElement.hasAttribute('webkitdirectory')).toBe(false);
        });
    });

    describe('with accessible description', () => {
        it('should write describedBy and invalid onto the file input', () => {
            const fixture = createComponent(TestFileLoader);

            fixture.componentInstance.describedBy = 'hint-1 hint-2';
            fixture.componentInstance.invalid = true;
            fixture.detectChanges();

            const inputElement = fixture.debugElement.query(By.directive(KbqFileLoader)).componentInstance.input()
                .nativeElement as HTMLInputElement;

            expect(inputElement.getAttribute('aria-describedby')).toBe('hint-1 hint-2');
            expect(inputElement.getAttribute('aria-invalid')).toBe('true');
        });

        it('should omit both attributes by default', () => {
            const fixture = createComponent(TestFileLoader);

            fixture.detectChanges();

            const inputElement = fixture.debugElement.query(By.directive(KbqFileLoader)).componentInstance.input()
                .nativeElement as HTMLInputElement;

            expect(inputElement.hasAttribute('aria-describedby')).toBe(false);
            expect(inputElement.hasAttribute('aria-invalid')).toBe(false);
        });
    });
});

describe('KbqFileList', () => {
    let component: TestFileList;
    let fixture: ComponentFixture<TestFileList>;
    let directive: KbqFileList<TestFile>;

    const file1: TestFile = { name: 'file1.txt', size: 100 };
    const file2: TestFile = { name: 'file2.txt', size: 200 };
    const file3: TestFile = { name: 'file3.txt', size: 300 };

    beforeEach(() => {
        fixture = createComponent(TestFileList);
        component = fixture.componentInstance;
        directive = fixture.debugElement.query(By.directive(KbqFileList)).injector.get(KbqFileList);
        fixture.detectChanges();
    });

    describe('add', () => {
        beforeEach(() => {
            directive.list.set([]);
        });

        it('should add single item to the list', () => {
            directive.add(file1);
            expect(directive.list()).toEqual([file1]);
        });

        it('should add item to the end of the list', () => {
            directive.add(file1);
            directive.add(file2);
            expect(directive.list()).toEqual([file1, file2]);
        });

        it('should emit itemsAdded event with single item array', () => {
            directive.add(file1);
            fixture.detectChanges();
            expect(component.itemsAddedEvent).toEqual([file1]);
        });

        it('should allow adding the same item multiple times', () => {
            directive.add(file1);
            directive.add(file1);
            expect(directive.list()).toEqual([file1, file1]);
        });
    });

    describe('addArray', () => {
        beforeEach(() => {
            directive.list.set([]);
        });
        it('should add multiple items to the list', () => {
            directive.addArray([file1, file2, file3]);
            expect(directive.list()).toEqual([file1, file2, file3]);
        });

        it('should add items to the end of existing list', () => {
            directive.add(file1);
            directive.addArray([file2, file3]);
            expect(directive.list()).toEqual([file1, file2, file3]);
        });

        it('should emit itemsAdded event with added items', () => {
            directive.addArray([file1, file2]);
            fixture.detectChanges();
            expect(component.itemsAddedEvent).toEqual([file1, file2]);
        });

        it('should handle empty array', () => {
            directive.addArray([]);
            expect(directive.list()).toEqual([]);
            expect(component.itemsAddedEvent).toEqual([]);
        });
    });

    describe('replace', () => {
        it('should replace the list with the specified items and emit event', () => {
            directive.addArray([file1, file3]);
            directive.replace([file1, file2, file3]);
            expect(directive.list()).toEqual([file1, file2, file3]);
            expect(component.itemsAddedEvent).toEqual([file1, file2, file3]);
        });

        it('should emit itemsAdded event with added items', () => {
            directive.replace([file1, file2]);
            fixture.detectChanges();
            expect(component.itemsAddedEvent).toEqual([file1, file2]);
        });
    });

    describe('remove', () => {
        beforeEach(() => {
            directive.list.set([]);
            directive.addArray([file1, file2, file3]);
            component.itemsAddedEvent = null;
        });

        it('should remove the first occurrence of the item', () => {
            directive.remove(file2);
            expect(directive.list()).toEqual([file1, file3]);
        });

        it('should return the removed item', () => {
            const removed = directive.remove(file2);

            expect(removed).toEqual([file2]);
        });

        it('should not modify list if item not found', () => {
            const notExisting: TestFile = { name: 'not-exists.txt', size: 999 };

            directive.remove(notExisting);
            expect(directive.list()).toEqual([file1, file2, file3]);
        });

        it('should return an empty array if item not found', () => {
            const notExisting: TestFile = { name: 'not-exists.txt', size: 999 };

            expect(directive.remove(notExisting)).toEqual([]);
        });

        it('should keep the later copies when duplicates exist', () => {
            directive.add(file1); // duplicate
            directive.remove(file1);

            expect(directive.list()).toEqual([file2, file3, file1]);
        });

        it('should emit itemRemoved with the item and its index', () => {
            directive.remove(file2);
            fixture.detectChanges();
            expect(component.itemRemovedEvent).toEqual([file2, 1]);
        });
    });

    describe('removeAt', () => {
        beforeEach(() => {
            directive.list.set([]);
            directive.addArray([file1, file2, file3]);
            component.itemRemovedEvent = null;
        });

        it('should remove item at specified index', () => {
            directive.removeAt(1);
            expect(directive.list()).toEqual([file1, file3]);
        });

        it('should emit itemRemoved event with item and index', () => {
            directive.removeAt(1);
            fixture.detectChanges();
            expect(component.itemRemovedEvent).toEqual([file2, 1]);
        });

        it('should remove first item', () => {
            directive.removeAt(0);
            expect(directive.list()).toEqual([file2, file3]);
        });

        it('should remove last item', () => {
            directive.removeAt(2);
            expect(directive.list()).toEqual([file1, file2]);
        });

        it('should return removed items', () => {
            const removed = directive.removeAt(1);

            expect(removed).toEqual([file2]);
        });

        it('should handle removal from single-item list', () => {
            directive.list.set([file1]);
            directive.removeAt(0);
            expect(directive.list()).toEqual([]);
        });

        it('should return a new array reference so signal consumers detect the change', () => {
            const before = directive.list();

            directive.removeAt(1);

            expect(directive.list()).not.toBe(before);
        });
    });

    describe('integration', () => {
        beforeEach(() => {
            directive.list.set([]);
        });
        it('should handle complex sequence of operations', () => {
            directive.add(file1);
            directive.addArray([file2, file3]);
            expect(directive.list()).toEqual([file1, file2, file3]);

            directive.remove(file2);
            expect(directive.list()).toEqual([file1, file3]);

            directive.add(file2);
            expect(directive.list()).toEqual([file1, file3, file2]);

            directive.removeAt(0);
            expect(directive.list()).toEqual([file3, file2]);
        });

        it('should maintain list state after multiple operations', () => {
            directive.addArray([file1, file2]);
            directive.removeAt(0);
            directive.add(file3);
            directive.remove(file2);
            directive.addArray([file1, file2]);

            expect(directive.list()).toEqual([file3, file1, file2]);
        });
    });
});
