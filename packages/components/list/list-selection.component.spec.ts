import { FocusMonitor } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DebugElement,
    inject,
    Provider,
    QueryList,
    Type,
    viewChild,
    ViewChildren
} from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, NgModel, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FocusKeyManager } from '@koobiq/cdk/a11y';
import { A, C, DOWN_ARROW, END, ENTER, HOME, PAGE_DOWN, PAGE_UP, SPACE, UP_ARROW } from '@koobiq/cdk/keycodes';
import { createKeyboardEvent, createMouseEvent, dispatchFakeEvent, dispatchKeyboardEvent } from '@koobiq/cdk/testing';
import {
    KbqListCopyEvent,
    KbqListModule,
    KbqListOption,
    KbqListSelectAllEvent,
    KbqListSelection,
    KbqListSelectionChange
} from './index';

const getFocusMonitor = () => TestBed.inject(FocusMonitor);

const setup = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component, NoopAnimationsModule],
        providers: [...providers]
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

describe('KbqListSelection without forms', () => {
    describe('with list option', () => {
        let fixture: ComponentFixture<SelectionListWithListOptions>;
        let listOptions: DebugElement[];
        let selectionList: DebugElement;
        let clipboardContent: string;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [KbqListModule],
                providers: [
                    {
                        provide: Clipboard,
                        useFactory: () => {
                            const originalClipboard = new Clipboard(document);

                            return {
                                copy: (value) => {
                                    originalClipboard.copy(value);
                                    clipboardContent = value;
                                }
                            };
                        }
                    }
                ]
            }).compileComponents();

            fixture = TestBed.createComponent(SelectionListWithListOptions);
            fixture.detectChanges();

            listOptions = fixture.debugElement.queryAll(By.directive(KbqListOption));
            selectionList = fixture.debugElement.query(By.directive(KbqListSelection));

            clipboardContent = '';
        });

        it('should copy selected option - default handler', fakeAsync(() => {
            const manager = selectionList.componentInstance.keyManager;
            const copyKeyEvent = createKeyboardEvent('keydown', C);

            Object.defineProperty(copyKeyEvent, 'ctrlKey', { get: () => true });

            manager.setActiveItem(2);
            expect(manager.activeItemIndex).toBe(2);

            selectionList.componentInstance.onKeyDown(copyKeyEvent);
            fixture.detectChanges();

            expect(clipboardContent).toBe(listOptions[2].componentInstance.value);
        }));

        it('should not blur on focused option when copying', fakeAsync(() => {
            const copyKeyEvent = createKeyboardEvent('keydown', C);

            Object.defineProperty(copyKeyEvent, 'ctrlKey', { get: () => true });

            expect(listOptions[2].componentInstance.hasFocus).toBeFalsy();

            dispatchFakeEvent(listOptions[2].nativeElement, 'focusin');
            flush();
            fixture.detectChanges();

            expect(listOptions[2].componentInstance.hasFocus).toBeTruthy();

            selectionList.componentInstance.onKeyDown(copyKeyEvent);
            fixture.detectChanges();

            expect(clipboardContent).toBe(listOptions[2].componentInstance.value);
            expect(listOptions[2].componentInstance.hasFocus).toBeTruthy();
        }));

        it('should be able to set a value on a list option', () => {
            const optionValues = ['inbox', 'starred', 'sent-mail', 'drafts'];

            optionValues.forEach((optionValue, index) => {
                expect(listOptions[index].componentInstance.value).toBe(optionValue);
            });
        });

        it('should not emit a selectionChange event if an option changed programmatically', () => {
            const onValueChangeSpyFn = jest.spyOn(fixture.componentInstance, 'onValueChange');

            expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(0);

            listOptions[2].componentInstance.toggle();
            fixture.detectChanges();

            expect(onValueChangeSpyFn).toHaveBeenCalledTimes(0);
        });

        it('should emit a selectionChange event if an option got clicked', () => {
            const onValueChangeSpyFn = jest.spyOn(fixture.componentInstance, 'onValueChange');

            expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(0);

            dispatchFakeEvent(listOptions[2].nativeElement, 'click');
            fixture.detectChanges();

            expect(onValueChangeSpyFn).toHaveBeenCalledTimes(1);
        });

        it('should be able to dispatch one selected item', () => {
            const testListItem = listOptions[2].injector.get<KbqListOption>(KbqListOption);
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            testListItem.toggle();
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(1);
        });

        it('should be able to dispatch multiple selected items', () => {
            const testListItem = listOptions[2].injector.get<KbqListOption>(KbqListOption);
            const testListItem2 = listOptions[1].injector.get<KbqListOption>(KbqListOption);
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            testListItem.toggle();
            fixture.detectChanges();

            testListItem2.toggle();
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(2);
        });

        it('should be able to deselect an option', () => {
            const testListItem = listOptions[2].injector.get<KbqListOption>(KbqListOption);
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            testListItem.toggle();
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(1);

            testListItem.toggle();
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(0);
        });

        it('should not allow selection of disabled items', () => {
            const testListItem = listOptions[0].injector.get<KbqListOption>(KbqListOption);
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            const event = createMouseEvent('click');

            testListItem.handleClick(event);
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(0);
        });

        it('should be able to use keyboard select with SPACE', () => {
            const manager = selectionList.componentInstance.keyManager;
            const SPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', SPACE);
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            manager.updateActiveItem(1);
            selectionList.componentInstance.onKeyDown(SPACE_EVENT);

            fixture.detectChanges();

            expect(selectList.selected.length).toBe(1);
            expect(SPACE_EVENT.defaultPrevented).toBe(true);
        });

        it('should be able to select an item using ENTER', () => {
            const manager = selectionList.componentInstance.keyManager;
            const testListItem: HTMLElement = listOptions[1].nativeElement;
            const ENTER_EVENT: KeyboardEvent = createKeyboardEvent('keydown', ENTER, testListItem);
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            manager.updateActiveItem(1);
            selectionList.componentInstance.onKeyDown(ENTER_EVENT);

            fixture.detectChanges();

            expect(selectList.selected.length).toBe(1);
            expect(ENTER_EVENT.defaultPrevented).toBe(true);
        });

        it('should restore focus to the previous option if active option is destroyed', fakeAsync(() => {
            const manager = selectionList.componentInstance.keyManager;
            const activeOption = listOptions[3].componentInstance as KbqListOption;
            const previousOption = listOptions[2].componentInstance as KbqListOption;

            activeOption.focus();
            flush();
            fixture.detectChanges();

            expect(manager.activeItemIndex).toBe(3);
            expect(manager.activeItem).toBe(activeOption);

            fixture.componentInstance.showLastOption = false;
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(manager.activeItemIndex).toBe(2);
            expect(manager.activeItem).toBe(previousOption);
            expect(previousOption.hasFocus).toBe(true);
        }));

        it('should focus previous item when press UP ARROW', () => {
            const testListItem = listOptions[2].nativeElement as HTMLElement;
            const UP_EVENT: KeyboardEvent = createKeyboardEvent('keydown', UP_ARROW, testListItem);
            const manager = selectionList.componentInstance.keyManager;

            manager.setActiveItem(2);
            expect(manager.activeItemIndex).toEqual(2);

            selectionList.componentInstance.onKeyDown(UP_EVENT);

            fixture.detectChanges();

            expect(manager.activeItemIndex).toEqual(1);
        });

        it('should focus and toggle the next item when pressing SHIFT + UP_ARROW', fakeAsync(() => {
            const manager = selectionList.componentInstance.keyManager;
            const upKeyEvent = createKeyboardEvent('keydown', UP_ARROW);

            Object.defineProperty(upKeyEvent, 'shiftKey', { get: () => true });

            listOptions[3].componentInstance.selected = true;

            manager.setActiveItem(3);
            expect(manager.activeItemIndex).toBe(3);

            expect(listOptions[1].componentInstance.selected).toBe(false);
            expect(listOptions[2].componentInstance.selected).toBe(false);

            selectionList.componentInstance.onKeyDown(upKeyEvent);
            fixture.detectChanges();

            expect(listOptions[1].componentInstance.selected).toBe(false);
            expect(listOptions[2].componentInstance.selected).toBe(true);

            selectionList.componentInstance.onKeyDown(upKeyEvent);
            fixture.detectChanges();
            tick();

            expect(listOptions[1].componentInstance.selected).toBe(true);
            expect(listOptions[2].componentInstance.selected).toBe(true);
        }));

        it('should focus next item when press DOWN ARROW', () => {
            const manager = selectionList.componentInstance.keyManager;

            manager.setActiveItem(2);
            expect(manager.activeItemIndex).toEqual(2);

            selectionList.componentInstance.onKeyDown(createKeyboardEvent('keydown', DOWN_ARROW));
            fixture.detectChanges();

            expect(manager.activeItemIndex).toEqual(3);
        });

        it('should focus and toggle the next item when pressing SHIFT + DOWN_ARROW', fakeAsync(() => {
            const manager = selectionList.componentInstance.keyManager;
            const downKeyEvent = createKeyboardEvent('keydown', DOWN_ARROW);

            Object.defineProperty(downKeyEvent, 'shiftKey', { get: () => true });

            listOptions[1].componentInstance.selected = true;

            manager.setActiveItem(1);
            expect(manager.activeItemIndex).toBe(1);

            expect(listOptions[2].componentInstance.selected).toBe(false);
            expect(listOptions[3].componentInstance.selected).toBe(false);

            selectionList.componentInstance.onKeyDown(downKeyEvent);
            fixture.detectChanges();

            expect(listOptions[2].componentInstance.selected).toBe(true);
            expect(listOptions[3].componentInstance.selected).toBe(false);

            selectionList.componentInstance.onKeyDown(downKeyEvent);
            fixture.detectChanges();
            tick();

            expect(listOptions[2].componentInstance.selected).toBe(true);
            expect(listOptions[3].componentInstance.selected).toBe(true);
        }));

        it('should be able to focus the first item when pressing HOME', () => {
            const manager = selectionList.componentInstance.keyManager;

            expect(manager.activeItemIndex).toBe(-1);

            const event = dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', HOME);

            fixture.detectChanges();

            expect(manager.activeItemIndex).toBe(1);
            expect(event.defaultPrevented).toBe(true);
        });

        it('should focus the last item when pressing END', () => {
            const manager = selectionList.componentInstance.keyManager;

            expect(manager.activeItemIndex).toBe(-1);

            const event = dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', END);

            fixture.detectChanges();

            expect(manager.activeItemIndex).toBe(3);
            expect(event.defaultPrevented).toBe(true);
        });

        it('should be able to jump focus down to an item by typing', fakeAsync(() => {
            const manager = selectionList.componentInstance.keyManager;
            const starredOption = listOptions[1].componentInstance as KbqListOption;
            const draftsOption = listOptions[3].componentInstance as KbqListOption;

            expect(manager.activeItemIndex).toBe(-1);

            manager.onKeydown(createKeyboardEvent('keydown', 83, undefined, 's'));
            fixture.detectChanges();
            tick(250);
            fixture.detectChanges();

            expect(manager.activeItemIndex).toBe(1);
            expect(manager.activeItem).toBe(starredOption);

            manager.onKeydown(createKeyboardEvent('keydown', 68, undefined, 'd'));
            fixture.detectChanges();
            tick(250);
            fixture.detectChanges();

            expect(manager.activeItemIndex).toBe(3);
            expect(manager.activeItem).toBe(draftsOption);
        }));

        it('should be able to select all options', () => {
            const list: KbqListSelection = selectionList.componentInstance;

            expect(list.options.toArray().every((option) => option.selected)).toBe(false);

            list.selectAll();
            fixture.detectChanges();

            expect(list.options.toArray().every((option) => option.selected)).toBe(true);
        });

        it('should be able to deselect all options', () => {
            const list: KbqListSelection = selectionList.componentInstance;

            list.options.forEach((option) => option.toggle());
            expect(list.options.toArray().every((option) => option.selected)).toBe(true);

            list.deselectAll();
            fixture.detectChanges();

            expect(list.options.toArray().every((option) => option.selected)).toBe(false);
        });

        it('should update the list value when an item is selected programmatically', () => {
            const list: KbqListSelection = selectionList.componentInstance;

            expect(list.selectionModel.isEmpty()).toBe(true);

            listOptions[0].componentInstance.selected = true;
            listOptions[2].componentInstance.selected = true;
            fixture.detectChanges();

            expect(list.selectionModel.isEmpty()).toBe(false);
            expect(list.selectionModel.isSelected(listOptions[0].componentInstance)).toBe(true);
            expect(list.selectionModel.isSelected(listOptions[2].componentInstance)).toBe(true);
        });

        it('should update the item selected state when it is selected via the model', () => {
            const list: KbqListSelection = selectionList.componentInstance;
            const item: KbqListOption = listOptions[0].componentInstance;

            expect(item.selected).toBe(false);

            list.selectionModel.select(item);
            fixture.detectChanges();

            expect(item.selected).toBe(true);
        });

        it('should select all non-disabled options when Ctrl+A is pressed', () => {
            const list: KbqListSelection = selectionList.componentInstance;
            const selectAllEvent = createKeyboardEvent('keydown', A);

            Object.defineProperty(selectAllEvent, 'ctrlKey', { get: () => true });

            list.onKeyDown(selectAllEvent);
            fixture.detectChanges();

            const enabledOptions = listOptions.filter(({ componentInstance: o }) => !o.disabled);
            const disabledOptions = listOptions.filter(({ componentInstance: o }) => o.disabled);

            expect(enabledOptions.every(({ componentInstance: o }) => o.selected)).toBe(true);
            expect(disabledOptions.every(({ componentInstance: o }) => !o.selected)).toBe(true);
        });

        it('should emit onSelectAll event with non-disabled options when Ctrl+A is pressed', () => {
            const list: KbqListSelection = selectionList.componentInstance;
            const onSelectAllSpy = jest.fn();

            list.onSelectAll.subscribe(onSelectAllSpy);

            const selectAllEvent = createKeyboardEvent('keydown', A);

            Object.defineProperty(selectAllEvent, 'ctrlKey', { get: () => true });

            list.onKeyDown(selectAllEvent);
            fixture.detectChanges();

            expect(onSelectAllSpy).toHaveBeenCalledTimes(1);

            const [event]: [KbqListSelectAllEvent<KbqListOption>] = onSelectAllSpy.mock.calls[0];

            expect(event.source).toBe(list);
            expect(event.options.every((o) => !o.disabled)).toBe(true);
        });

        it('should navigate to next page when PAGE_DOWN is pressed', () => {
            const manager = selectionList.componentInstance.keyManager;

            manager.withScrollSize(2);
            manager.setActiveItem(1);

            expect(manager.activeItemIndex).toBe(1);

            dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', PAGE_DOWN);
            fixture.detectChanges();

            expect(manager.activeItemIndex).toBeGreaterThan(1);
        });

        it('should navigate to previous page when PAGE_UP is pressed', () => {
            const manager = selectionList.componentInstance.keyManager;

            manager.withScrollSize(2);
            manager.setLastItemActive();

            const lastIndex = manager.activeItemIndex;

            dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', PAGE_UP);
            fixture.detectChanges();

            expect(manager.activeItemIndex).toBeLessThan(lastIndex);
        });
    });

    describe('with list option selected', () => {
        let fixture: ComponentFixture<SelectionListWithSelectedOption>;
        let listItemEl: DebugElement;
        let selectionList: DebugElement;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [KbqListModule]
            }).compileComponents();

            fixture = TestBed.createComponent(SelectionListWithSelectedOption);
            listItemEl = fixture.debugElement.query(By.directive(KbqListOption));
            selectionList = fixture.debugElement.query(By.directive(KbqListSelection));
            fixture.detectChanges();
        });

        it('should set its initial selected state in the selectionModel', () => {
            const optionEl = listItemEl.injector.get<KbqListOption>(KbqListOption);
            const selectedOptions = selectionList.componentInstance.selectionModel;

            expect(selectedOptions.isSelected(optionEl)).toBeTruthy();
        });
    });

    describe('with tabindex', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [KbqListModule]
            }).compileComponents();
        });

        it('should properly handle native tabindex attribute', () => {
            const fixture = TestBed.createComponent(SelectionListWithTabindexAttr);

            fixture.detectChanges();
            const selectionList = fixture.debugElement.query(By.directive(KbqListSelection));

            expect(selectionList.componentInstance.tabIndex).toBe(5);
        });

        it('should set tabindex to "-1" in disabled state', () => {
            const fixture = TestBed.createComponent(SelectionListWithTabindexInDisabledState);
            const selectionList = fixture.debugElement.query(By.directive(KbqListSelection));

            expect(selectionList.componentInstance.tabIndex).toBe(0);

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(selectionList.componentInstance.tabIndex).toBe(-1);
        });
    });

    describe('focus states', () => {
        let fixture: ComponentFixture<SelectionListFocusStates>;
        let list: DebugElement;
        let options: DebugElement[];

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [KbqListModule, FormsModule] }).compileComponents();

            fixture = TestBed.createComponent(SelectionListFocusStates);
            list = fixture.debugElement.query(By.directive(KbqListSelection));
            options = fixture.debugElement.queryAll(By.directive(KbqListOption));

            fixture.detectChanges();
        });

        it('should add and remove focus class on focus/blur', fakeAsync(() => {
            const option = options[0].nativeElement;

            expect(option.classList).not.toContain('kbq-focused');

            dispatchFakeEvent(list.nativeElement, 'focus');
            flush();
            fixture.detectChanges();
            expect(option.className).toContain('kbq-focused');

            dispatchFakeEvent(option, 'blur');
            fixture.detectChanges();
            expect(option.className).not.toContain('kbq-focused');
        }));

        it('should add focus class on first selected element', fakeAsync(() => {
            const selectedOption = options[1];

            selectedOption.componentInstance.toggle();
            fixture.detectChanges();

            options.forEach(({ nativeElement }) => {
                expect(nativeElement.classList).not.toContain('kbq-focused');
            });

            expect(selectedOption.nativeElement.classList).toContain('kbq-selected');

            dispatchFakeEvent(list.nativeElement, 'focus');
            flush();
            fixture.detectChanges();
            expect(selectedOption.nativeElement.className).toContain('kbq-focused');
        }));

        it('should be focused when focus on nativeElements', fakeAsync(() => {
            dispatchFakeEvent(options[0].nativeElement, 'focusin');
            flush();
            fixture.detectChanges();

            expect(options[0].nativeElement.className).toContain('kbq-focused');

            dispatchFakeEvent(options[0].nativeElement, 'blur');
            fixture.detectChanges();

            expect(options[0].nativeElement.className).not.toContain('kbq-focused');
        }));
    });

    describe('with list disabled', () => {
        let fixture: ComponentFixture<SelectionListWithListDisabled>;
        let listOption: DebugElement[];
        let selectionList: DebugElement;

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [KbqListModule] }).compileComponents();

            fixture = TestBed.createComponent(SelectionListWithListDisabled);
            listOption = fixture.debugElement.queryAll(By.directive(KbqListOption));
            selectionList = fixture.debugElement.query(By.directive(KbqListSelection));
            fixture.detectChanges();
        });

        it('should not allow selection on disabled selection-list', () => {
            const testListItem = listOption[2].injector.get<KbqListOption>(KbqListOption);
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            const event = createMouseEvent('click');

            testListItem.handleClick(event);
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(0);
        });
    });
});

describe('KbqListSelection with forms', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqListModule,
                FormsModule,
                ReactiveFormsModule
            ]
        }).compileComponents();
    });

    describe('and ngModel', () => {
        let fixture: ComponentFixture<SelectionListWithModel>;
        let selectionListDebug: DebugElement;
        let listOptions: KbqListOption[];
        let ngModel: NgModel;

        beforeEach(() => {
            fixture = TestBed.createComponent(SelectionListWithModel);
            fixture.detectChanges();

            selectionListDebug = fixture.debugElement.query(By.directive(KbqListSelection));
            ngModel = selectionListDebug.injector.get<NgModel>(NgModel);
            listOptions = fixture.debugElement
                .queryAll(By.directive(KbqListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);
        });

        it('should not update the model if an option got selected programmatically', fakeAsync(() => {
            expect(fixture.componentInstance.selectedOptions.length).toBe(0);

            listOptions[0].toggle();
            fixture.detectChanges();

            tick();

            expect(listOptions[0].selected).toBe(true);
            expect(selectionListDebug.componentInstance.selectionModel.isSelected(listOptions[0])).toBe(true);
            expect(fixture.componentInstance.selectedOptions).toEqual([]);
        }));

        it('should update the model if an option got clicked', fakeAsync(() => {
            expect(fixture.componentInstance.selectedOptions.length).toBe(0);

            dispatchFakeEvent(listOptions[0].getHostElement(), 'click');
            fixture.detectChanges();

            tick();

            expect(fixture.componentInstance.selectedOptions.length).toBe(1);
        }));

        it('should update the options if a model value is set', fakeAsync(() => {
            expect(fixture.componentInstance.selectedOptions.length).toBe(0);

            fixture.componentInstance.selectedOptions = ['opt3'];
            fixture.detectChanges();

            tick();

            expect(fixture.componentInstance.selectedOptions.length).toBe(1);
        }));

        it('should set the selection-list to touched on blur', fakeAsync(() => {
            expect(ngModel.touched).toBe(false);

            dispatchFakeEvent(selectionListDebug.nativeElement, 'blur');
            fixture.detectChanges();

            tick();

            expect(ngModel.touched).toBe(true);
        }));

        it('should stay pristine until the user changes the value', fakeAsync(() => {
            fixture = TestBed.createComponent(SelectionListWithModel);
            fixture.componentInstance.selectedOptions = ['opt2'];
            fixture.detectChanges();

            ngModel = fixture.debugElement.query(By.directive(KbqListSelection)).injector.get<NgModel>(NgModel);
            listOptions = fixture.debugElement
                .queryAll(By.directive(KbqListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);

            // Flush the initial tick to ensure that every action from the ControlValueAccessor
            // happened before the actual test starts.
            tick();

            expect(ngModel.pristine).toBe(true);

            dispatchFakeEvent(listOptions[1].getHostElement(), 'click');
            fixture.detectChanges();

            tick();

            expect(ngModel.pristine).toBe(false);
        }));

        it('should keep the model value and clear visible selection when the selected option is destroyed', fakeAsync(() => {
            fixture.componentInstance.selectedOptions = ['opt3'];
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(fixture.componentInstance.selectedOptions).toEqual(['opt3']);
            expect(listOptions[2].selected).toBe(true);

            fixture.componentInstance.renderLastOption = false;
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            listOptions = fixture.debugElement
                .queryAll(By.directive(KbqListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);

            expect(fixture.componentInstance.selectedOptions).toEqual(['opt3']);
            expect(listOptions).toHaveLength(2);
            expect(listOptions.every((option) => !option.selected)).toBe(true);
        }));

        it('should update the selected options when the model value changes', fakeAsync(() => {
            expect(fixture.componentInstance.selectedOptions).toEqual([]);

            fixture.componentInstance.selectedOptions = ['opt1'];
            fixture.detectChanges();
            tick();

            expect(listOptions[0].selected).toBe(true);
            expect(listOptions[1].selected).toBe(false);
            expect(selectionListDebug.componentInstance.selectionModel.isSelected(listOptions[0])).toBe(true);
            expect(fixture.componentInstance.selectedOptions).toEqual(['opt1']);
        }));
    });

    describe('and formControl', () => {
        let fixture: ComponentFixture<SelectionListWithFormControl>;
        let listOptions: KbqListOption[];

        beforeEach(() => {
            fixture = TestBed.createComponent(SelectionListWithFormControl);
            fixture.detectChanges();

            listOptions = fixture.debugElement
                .queryAll(By.directive(KbqListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);
        });

        it('should be able to disable options from the control', () => {
            expect(listOptions.every((option) => !option.disabled)).toBe(true);

            fixture.componentInstance.formControl.disable();
            fixture.detectChanges();

            expect(listOptions.every((option) => option.disabled)).toBe(true);
        });

        it('should be able to set the value through the form control', fakeAsync(() => {
            expect(listOptions.every((option) => !option.selected)).toBe(true);

            fixture.componentInstance.formControl.setValue(['opt2', 'opt3']);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(listOptions[1].selected).toBe(true);

            expect(listOptions[2].selected).toBe(true);

            fixture.componentInstance.formControl.setValue(null);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(listOptions.every((option) => !option.selected)).toBe(true);
        }));

        it('should mark options as selected when the value is set before they are initialized', fakeAsync(() => {
            fixture.destroy();
            fixture = TestBed.createComponent(SelectionListWithFormControl);

            fixture.componentInstance.formControl.setValue(['opt2', 'opt3']);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            listOptions = fixture.debugElement
                .queryAll(By.directive(KbqListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);

            expect(listOptions[1].selected).toBe(true);

            expect(listOptions[2].selected).toBe(true);
        }));
    });

    describe('preselected values', () => {
        it('should add preselected options to the model value', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithPreselectedOption);
            const listOptions = fixture.debugElement
                .queryAll(By.directive(KbqListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);

            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(listOptions[1].selected).toBe(true);
            expect(fixture.componentInstance.selectedOptions).toEqual(['opt2']);
        }));

        it('should handle preselected option both through the model and the view', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithPreselectedOptionAndModel);
            const listOptions = fixture.debugElement
                .queryAll(By.directive(KbqListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);

            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(listOptions[0].selected).toBe(true);
            expect(listOptions[1].selected).toBe(true);
            expect(fixture.componentInstance.selectedOptions).toEqual(['opt1', 'opt2']);
        }));

        it('should show the item as selected when preselected inside OnPush parent', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithPreselectedFormControlOnPush);

            fixture.detectChanges();

            const option = fixture.debugElement.queryAll(By.directive(KbqListOption))[1];

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(option.componentInstance.selected).toBe(true);
        }));
    });

    describe('with custom compare function', () => {
        it('should use a custom comparator to determine which options are selected', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithCustomComparator);
            const testComponent = fixture.componentInstance;

            // Initial value is set via formControl so writeValue fires synchronously
            // before options' ngOnInit, allowing compareWith to be called
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(testComponent.compareWith).toHaveBeenCalled();
            expect(testComponent.optionInstances.toArray()[1].selected).toBe(true);
        }));
    });
});

// should be placed in 'KbqListSelection with forms' section when it will not be skipped
describe('should update model after keyboard interaction with multiple mode = checkbox', () => {
    let fixture: ComponentFixture<SelectionListMultipleCheckbox>;
    let selectionList: DebugElement;
    let ngModel: NgModel;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqListModule, FormsModule] }).compileComponents();

        fixture = TestBed.createComponent(SelectionListMultipleCheckbox);
        fixture.detectChanges();

        selectionList = fixture.debugElement.query(By.directive(KbqListSelection));
        ngModel = selectionList.injector.get<NgModel>(NgModel);
    });

    it('should update model when items selected with SPACE and ENTER', () => {
        const manager = selectionList.componentInstance.keyManager;

        const SPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', SPACE);
        const ENTER_EVENT: KeyboardEvent = createKeyboardEvent('keydown', ENTER);
        const DOWN_EVENT: KeyboardEvent = createKeyboardEvent('keydown', DOWN_ARROW);
        const UP_EVENT: KeyboardEvent = createKeyboardEvent('keydown', UP_ARROW);

        expect(ngModel.value.length).toBe(0);

        manager.setFirstItemActive();
        fixture.detectChanges();

        selectionList.componentInstance.onKeyDown(SPACE_EVENT);
        selectionList.componentInstance.onKeyDown(DOWN_EVENT);
        selectionList.componentInstance.onKeyDown(ENTER_EVENT);
        selectionList.componentInstance.onKeyDown(DOWN_EVENT);
        selectionList.componentInstance.onKeyDown(SPACE_EVENT);
        selectionList.componentInstance.onKeyDown(DOWN_EVENT);

        fixture.detectChanges();

        expect(ngModel.value.length).toBe(3);

        selectionList.componentInstance.onKeyDown(UP_EVENT);
        selectionList.componentInstance.onKeyDown(ENTER_EVENT);

        fixture.detectChanges();

        expect(ngModel.value.length).toBe(2);
    });

    it('should update model when items selected by pressing SHIFT + arrows', fakeAsync(() => {
        const manager = selectionList.componentInstance.keyManager;
        const listEl = selectionList.nativeElement as HTMLElement;

        const dispatchShift = (keyCode: number) => {
            listEl.dispatchEvent(
                new KeyboardEvent('keydown', { keyCode, shiftKey: true, bubbles: true, cancelable: true })
            );
        };

        expect(ngModel.value.length).toBe(0);

        manager.setFirstItemActive();
        fixture.detectChanges();

        // Select first item with SPACE, then extend selection down with Shift
        selectionList.componentInstance.onKeyDown(createKeyboardEvent('keydown', SPACE));
        dispatchShift(DOWN_ARROW);
        dispatchShift(DOWN_ARROW);
        fixture.detectChanges();

        expect(ngModel.value.length).toBe(3);

        // Deselect current item with SPACE, then contract selection up with Shift
        selectionList.componentInstance.onKeyDown(createKeyboardEvent('keydown', SPACE));
        dispatchShift(UP_ARROW);
        fixture.detectChanges();

        expect(ngModel.value.length).toBe(1);
    }));
});

describe('KbqListSelection keyboard interaction', () => {
    it('should set focus on list-item removal properly', () => {
        const fixture = setup(TestListSelectionWithDynamicList);
        const initialOptions = fixture.componentInstance.opts.slice();
        const manager: FocusKeyManager<KbqListOption> = fixture.componentInstance.listSelection().keyManager;

        getFocusMonitor().focusVia(
            fixture.debugElement.query(By.directive(KbqListSelection)).nativeElement,
            'keyboard'
        );
        fixture.detectChanges();
        const activeIndex = manager.activeItemIndex;
        const activeItemValue = manager.activeItem?.value;

        expect(activeIndex).toEqual(0);

        fixture.componentInstance.remove(manager.activeItemIndex);
        fixture.detectChanges();

        // active item index should stay the same
        expect(activeIndex).toEqual(manager.activeItemIndex);
        // but active item itself will change
        expect(manager.activeItem?.value).not.toEqual(activeItemValue);
        // active item index will be set to next
        expect(initialOptions.findIndex((optionValue) => optionValue === manager.activeItem?.value)).toEqual(
            manager.activeItemIndex + 1
        );
    });

    it('should set focus on list-item removal from the end properly', () => {
        const fixture = setup(TestListSelectionWithDynamicList);
        const initialOptions = fixture.componentInstance.opts.slice();
        const manager: FocusKeyManager<KbqListOption> = fixture.componentInstance.listSelection().keyManager;

        getFocusMonitor().focusVia(
            fixture.debugElement.query(By.directive(KbqListSelection)).nativeElement,
            'keyboard'
        );
        fixture.detectChanges();
        manager.setLastItemActive();

        const initialActiveIndex = manager.activeItemIndex;

        fixture.componentInstance.remove(manager.activeItemIndex);
        fixture.detectChanges();

        // active item index will change
        expect(initialActiveIndex).not.toEqual(manager.activeItemIndex);
        // active item index will be set to previous
        expect(initialOptions.findIndex((optionValue) => optionValue === manager.activeItem?.value)).toEqual(
            initialActiveIndex - 1
        );
    });
});

describe('KbqListSelection onCopy event', () => {
    it('should emit onCopy event instead of using clipboard when (onCopy) observer is attached', fakeAsync(() => {
        const fixture = setup(SelectionListWithOnCopyHandler);
        const selectionList = fixture.debugElement.query(By.directive(KbqListSelection));
        const listOptions = fixture.debugElement.queryAll(By.directive(KbqListOption));
        const manager = selectionList.componentInstance.keyManager;

        manager.setActiveItem(0);

        const copyEvent = createKeyboardEvent('keydown', C);

        Object.defineProperty(copyEvent, 'ctrlKey', { get: () => true });

        selectionList.componentInstance.onKeyDown(copyEvent);
        fixture.detectChanges();
        flush();

        expect(fixture.componentInstance.copyEvent).not.toBeNull();
        expect(fixture.componentInstance.copyEvent!.option).toBe(listOptions[0].componentInstance);
        expect(fixture.componentInstance.copyEvent!.event).toBe(copyEvent);
    }));

    it('should not call clipboard.copy when (onCopy) observer is attached', fakeAsync(() => {
        const clipboardSpy = jest.fn();
        const fixture = setup(SelectionListWithOnCopyHandler, [
            { provide: Clipboard, useValue: { copy: clipboardSpy } }]);
        const selectionList = fixture.debugElement.query(By.directive(KbqListSelection));
        const manager = selectionList.componentInstance.keyManager;

        manager.setActiveItem(0);

        const copyEvent = createKeyboardEvent('keydown', C);

        Object.defineProperty(copyEvent, 'ctrlKey', { get: () => true });

        selectionList.componentInstance.onKeyDown(copyEvent);
        fixture.detectChanges();
        flush();

        expect(clipboardSpy).not.toHaveBeenCalled();
    }));
});

@Component({
    imports: [
        KbqListModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-list-selection multiple="checkbox" [compareWith]="compareWith" [formControl]="formControl">
            @for (option of options; track option) {
                <kbq-list-option [value]="option">
                    {{ option.label }}
                </kbq-list-option>
            }
        </kbq-list-selection>
    `
})
class SelectionListWithCustomComparator {
    @ViewChildren(KbqListOption) optionInstances: QueryList<KbqListOption>;

    options = [
        { id: 1, label: 'One' },
        { id: 2, label: 'Two' },
        { id: 3, label: 'Three' }
    ];

    // Use same object reference so getOptionByValue (===) finds the match after initializeSelection
    formControl = new UntypedFormControl([this.options[1]]);

    compareWith = jest.fn((o1: any, o2: any) => o1 && o2 && o1.id === o2.id);
}

@Component({
    imports: [
        KbqListModule
    ],
    template: `
        <kbq-list-selection
            id="selection-list-1"
            multiple="keyboard"
            [autoSelect]="false"
            [noUnselectLast]="false"
            (selectionChange)="onValueChange($event)"
        >
            <kbq-list-option checkboxPosition="before" disabled="true" [value]="'inbox'">
                Inbox (disabled selection-option)
            </kbq-list-option>
            <kbq-list-option id="testSelect" checkboxPosition="before" [value]="'starred'">Starred</kbq-list-option>
            <kbq-list-option checkboxPosition="before" [value]="'sent-mail'">Sent Mail</kbq-list-option>
            @if (showLastOption) {
                <kbq-list-option checkboxPosition="before" [value]="'drafts'">Drafts</kbq-list-option>
            }
        </kbq-list-selection>
    `
})
class SelectionListWithListOptions {
    showLastOption: boolean = true;

    onValueChange(_change: KbqListSelectionChange) {}
}

@Component({
    imports: [
        KbqListModule,
        FormsModule
    ],
    template: `
        <kbq-list-selection multiple="checkbox" [autoSelect]="false" [noUnselectLast]="false" [(ngModel)]="model">
            <kbq-list-option [value]="'value1'">value1</kbq-list-option>
            <kbq-list-option [value]="'value2'">value2</kbq-list-option>
            <kbq-list-option [value]="'value3'">value3</kbq-list-option>
            <kbq-list-option [value]="'value4'">value4</kbq-list-option>
            <kbq-list-option [value]="'disabled option'" [disabled]="true">disabled option</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListMultipleCheckbox {
    model = [];
}

@Component({
    imports: [
        KbqListModule
    ],
    template: `
        <kbq-list-selection id="selection-list-3" [disabled]="true">
            <kbq-list-option checkboxPosition="after">Inbox (disabled selection-option)</kbq-list-option>
            <kbq-list-option id="testSelect" checkboxPosition="after">Starred</kbq-list-option>
            <kbq-list-option checkboxPosition="after">Sent Mail</kbq-list-option>
            <kbq-list-option checkboxPosition="after">Drafts</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListWithListDisabled {}

@Component({
    imports: [
        KbqListModule
    ],
    template: `
        <kbq-list-selection>
            <kbq-list-option [selected]="true">Item</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListWithSelectedOption {}

@Component({
    imports: [
        KbqListModule,
        FormsModule
    ],
    template: `
        <kbq-list-selection [(ngModel)]="selectedOptions">
            <kbq-list-option [value]="'option_1'">Option 1</kbq-list-option>
            <kbq-list-option [value]="'option_2'">Option 2</kbq-list-option>
            <kbq-list-option [value]="'option_3'">Option 3</kbq-list-option>
            <kbq-list-option [value]="'option_4'">Option 4</kbq-list-option>
            <kbq-list-option [value]="'option_5'">Option 5</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListFocusStates {
    selectedOptions: string[] = [];
}

@Component({
    imports: [
        KbqListModule
    ],
    template: `
        <kbq-list-selection [tabIndex]="5" />
    `
})
class SelectionListWithTabindexAttr {}

@Component({
    imports: [
        KbqListModule
    ],
    template: `
        <kbq-list-selection [disabled]="disabled" />
    `
})
class SelectionListWithTabindexInDisabledState {
    tabIndex: number;
    disabled: boolean;
}

@Component({
    imports: [
        KbqListModule,
        FormsModule
    ],
    template: `
        <kbq-list-selection [autoSelect]="false" [(ngModel)]="selectedOptions">
            <kbq-list-option [value]="'opt1'">Option 1</kbq-list-option>
            <kbq-list-option [value]="'opt2'">Option 2</kbq-list-option>
            @if (renderLastOption) {
                <kbq-list-option [value]="'opt3'">Option 3</kbq-list-option>
            }
        </kbq-list-selection>
    `
})
class SelectionListWithModel {
    selectedOptions: string[] = [];
    renderLastOption = true;
}

@Component({
    imports: [
        KbqListModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-list-selection multiple="checkbox" [formControl]="formControl">
            <kbq-list-option [value]="'opt1'">Option 1</kbq-list-option>
            <kbq-list-option [value]="'opt2'">Option 2</kbq-list-option>
            <kbq-list-option [value]="'opt3'">Option 3</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListWithFormControl {
    formControl = new UntypedFormControl();
}

@Component({
    imports: [
        KbqListModule,
        FormsModule
    ],
    template: `
        <kbq-list-selection multiple="checkbox" [(ngModel)]="selectedOptions">
            <kbq-list-option [value]="'opt1'">Option 1</kbq-list-option>
            <kbq-list-option [value]="'opt2'">Option 2</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListWithPreselectedOption {
    selectedOptions = ['opt2'];
}

@Component({
    imports: [
        KbqListModule,
        FormsModule
    ],
    template: `
        <kbq-list-selection multiple="checkbox" [(ngModel)]="selectedOptions">
            <kbq-list-option [value]="'opt1'">Option 1</kbq-list-option>
            <kbq-list-option [value]="'opt2'">Option 2</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListWithPreselectedOptionAndModel {
    selectedOptions = ['opt1', 'opt2'];
}

@Component({
    imports: [
        KbqListModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-list-selection [formControl]="formControl">
            @for (opt of opts; track opt) {
                <kbq-list-option [value]="opt">
                    {{ opt }}
                </kbq-list-option>
            }
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class SelectionListWithPreselectedFormControlOnPush {
    opts = ['opt1', 'opt2', 'opt3'];
    formControl = new UntypedFormControl(['opt2']);
}

@Component({
    imports: [KbqListModule],
    standalone: true,
    template: `
        <kbq-list-selection>
            @for (opt of opts; track opt) {
                <kbq-list-option [value]="opt">
                    {{ opt }}
                </kbq-list-option>
            }
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestListSelectionWithDynamicList {
    listSelection = viewChild.required(KbqListSelection);
    opts = Array.from({ length: 3 }, (_, i) => `opt${i}`);
    changeDetectorRef = inject(ChangeDetectorRef);

    remove(index: number) {
        this.opts.splice(index, 1);
        this.changeDetectorRef.detectChanges();
    }
}

@Component({
    imports: [KbqListModule],
    template: `
        <kbq-list-selection [autoSelect]="false" [noUnselectLast]="false" (onCopy)="handleCopy($event)">
            <kbq-list-option [value]="'option1'">Option 1</kbq-list-option>
            <kbq-list-option [value]="'option2'">Option 2</kbq-list-option>
            <kbq-list-option [value]="'option3'">Option 3</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListWithOnCopyHandler {
    copyEvent: KbqListCopyEvent<KbqListOption> | null = null;

    handleCopy(event: KbqListCopyEvent<KbqListOption>): void {
        this.copyEvent = event;
    }
}
