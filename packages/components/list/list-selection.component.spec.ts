import { FocusMonitor } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { CdkDrag, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DebugElement,
    inject,
    Provider,
    signal,
    Type,
    viewChild,
    viewChildren
} from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, NgModel, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    A,
    C,
    createKeyboardEvent,
    createMouseEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    DOWN_ARROW,
    END,
    ENTER,
    FocusKeyManager,
    HOME,
    KbqOptionActionComponent,
    KbqOptionModule,
    LEFT_ARROW,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    SPACE,
    TAB,
    UP_ARROW
} from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { axe } from 'jest-axe';
import {
    KbqListCopyEvent,
    KbqListModule,
    KbqListOption,
    KbqListSelectAllEvent,
    KbqListSelection,
    KbqListSelectionChange,
    KbqListSelectionDroppedEvent
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

        it('should deselect all options on a second Ctrl+A when selectAllToggle is enabled', () => {
            const list: KbqListSelection = selectionList.componentInstance;
            const enabledOptions = listOptions.filter(({ componentInstance: o }) => !o.disabled);

            fixture.componentInstance.selectAllToggle = true;
            fixture.detectChanges();

            const pressCtrlA = () => {
                const event = createKeyboardEvent('keydown', A);

                Object.defineProperty(event, 'ctrlKey', { get: () => true });
                list.onKeyDown(event);
                fixture.detectChanges();
            };

            pressCtrlA();
            expect(enabledOptions.every(({ componentInstance: o }) => o.selected)).toBe(true);

            pressCtrlA();
            expect(enabledOptions.every(({ componentInstance: o }) => !o.selected)).toBe(true);
        });

        it('should keep all options selected on a second Ctrl+A by default (selectAllToggle off)', () => {
            const list: KbqListSelection = selectionList.componentInstance;
            const enabledOptions = listOptions.filter(({ componentInstance: o }) => !o.disabled);

            const pressCtrlA = () => {
                const event = createKeyboardEvent('keydown', A);

                Object.defineProperty(event, 'ctrlKey', { get: () => true });
                list.onKeyDown(event);
                fixture.detectChanges();
            };

            pressCtrlA();
            pressCtrlA();

            expect(enabledOptions.every(({ componentInstance: o }) => o.selected)).toBe(true);
        });

        it('should update the form-control value when Ctrl+A is pressed', () => {
            const list: KbqListSelection = selectionList.componentInstance;
            const onChangeSpy = jest.fn();

            list.registerOnChange(onChangeSpy);

            const selectAllEvent = createKeyboardEvent('keydown', A);

            Object.defineProperty(selectAllEvent, 'ctrlKey', { get: () => true });

            list.onKeyDown(selectAllEvent);
            fixture.detectChanges();

            expect(onChangeSpy).toHaveBeenCalled();

            const enabledCount = listOptions.filter(({ componentInstance: o }) => !o.disabled).length;
            const [reportedValue] = onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1];

            expect(reportedValue.length).toBe(enabledCount);
        });

        it('should invoke a custom selectAllHandler on Ctrl+A instead of the default', () => {
            const list: KbqListSelection = selectionList.componentInstance;
            const customHandler = jest.fn();

            list.selectAllHandler = customHandler;

            const selectAllEvent = createKeyboardEvent('keydown', A);

            Object.defineProperty(selectAllEvent, 'ctrlKey', { get: () => true });

            list.onKeyDown(selectAllEvent);
            fixture.detectChanges();

            expect(customHandler).toHaveBeenCalledTimes(1);
            // default behaviour is bypassed -> nothing gets selected
            expect(listOptions.every(({ componentInstance: o }) => !o.selected)).toBe(true);
        });

        it('should throw when selectAllHandler is set to a non-function', () => {
            const list: KbqListSelection = selectionList.componentInstance;

            expect(() => {
                (list as unknown as { selectAllHandler: unknown }).selectAllHandler = 'not a function';
            }).toThrow('`selectAllHandler` must be a function.');
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

    describe('action button visibility', () => {
        let fixture: ComponentFixture<SelectionListWithActionButton>;
        let list: DebugElement;
        let options: DebugElement[];

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [KbqListModule, KbqOptionModule, KbqDropdownModule] });

            fixture = TestBed.createComponent(SelectionListWithActionButton);
            list = fixture.debugElement.query(By.directive(KbqListSelection));
            options = fixture.debugElement.queryAll(By.directive(KbqListOption));

            fixture.detectChanges();
        });

        // Styles are stripped in jsdom, so these assert the classes the reveal rules key off:
        // `.kbq-list-selection.cdk-keyboard-focused .kbq-list-option.kbq-focused` (see list.scss).
        it('should not mark the list as keyboard-focused when an option is focused by mouse', fakeAsync(() => {
            getFocusMonitor().focusVia(options[0].nativeElement, 'mouse');
            flush();
            fixture.detectChanges();

            expect(options[0].nativeElement.classList).toContain('kbq-focused');
            expect(list.nativeElement.classList).not.toContain('cdk-keyboard-focused');
        }));

        it('should mark the list as keyboard-focused when an option is focused via keyboard', fakeAsync(() => {
            getFocusMonitor().focusVia(options[0].nativeElement, 'keyboard');
            flush();
            fixture.detectChanges();

            expect(options[0].nativeElement.classList).toContain('kbq-focused');
            expect(list.nativeElement.classList).toContain('cdk-keyboard-focused');
        }));

        it('should mark the option with kbq-action-button-focused while the action holds focus', fakeAsync(() => {
            const option = options[0];
            const actionButton = option.query(By.directive(KbqOptionActionComponent));

            expect(option.nativeElement.classList).not.toContain('kbq-action-button-focused');

            actionButton.componentInstance.focus();
            flush();
            fixture.detectChanges();

            expect(actionButton.componentInstance.hasFocus).toBe(true);
            expect(option.nativeElement.classList).toContain('kbq-action-button-focused');
        }));

        it('should not swallow Tab when the action button cannot take focus', fakeAsync(() => {
            const option = options[0];
            const actionButtonDebugElement = option.query(By.directive(KbqOptionActionComponent));
            const actionButton = actionButtonDebugElement.componentInstance;

            // In a browser the action sits in a `display: none` container until the option is hovered or
            // keyboard-focused, so `.focus()` is a no-op. jsdom ignores styles and would always focus it,
            // so neutralise the DOM call only — `KbqOptionActionComponent.focus()` itself must still run,
            // otherwise its `activeElement` check (the fix under test) is never exercised.
            jest.spyOn(actionButtonDebugElement.nativeElement, 'focus').mockImplementation(() => {});

            const event = dispatchKeyboardEvent(option.nativeElement, 'keydown', TAB);

            flush();
            fixture.detectChanges();

            expect(actionButton.hasFocus).toBe(false);
            expect(event.defaultPrevented).toBe(false);
            expect(option.nativeElement.classList).not.toContain('kbq-action-button-focused');
        }));

        it('should swallow Tab when the action button takes focus', fakeAsync(() => {
            const option = options[0];
            const event = dispatchKeyboardEvent(option.nativeElement, 'keydown', TAB);

            flush();
            fixture.detectChanges();

            expect(event.defaultPrevented).toBe(true);
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
            expect(testComponent.optionInstances()[1].selected).toBe(true);
        }));
    });

    describe('should update model after keyboard interaction with multiple mode = checkbox', () => {
        let fixture: ComponentFixture<SelectionListMultipleCheckbox>;
        let selectionList: DebugElement;
        let ngModel: NgModel;

        beforeEach(() => {
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
            { provide: Clipboard, useValue: { copy: clipboardSpy } }
        ]);
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

describe('KbqListSelection drag and drop', () => {
    const getDropList = (fixture: ComponentFixture<unknown>) =>
        fixture.debugElement.query(By.directive(KbqListSelection)).injector.get(CdkDropList);

    const getDrags = (fixture: ComponentFixture<unknown>) =>
        fixture.debugElement.queryAll(By.directive(KbqListOption)).map((option) => option.injector.get(CdkDrag));

    const getLabels = (fixture: ComponentFixture<unknown>) =>
        Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('kbq-list-option .kbq-list-text')).map(
            (element) => element.textContent!.trim()
        );

    const altKeydown = (list: KbqListSelection, keyCode: number) => {
        const event = createKeyboardEvent('keydown', keyCode);

        Object.defineProperty(event, 'altKey', { get: () => true });
        list.onKeyDown(event);

        return event;
    };

    describe('opt-in wiring', () => {
        it('should not be draggable by default', () => {
            // A list with no `draggable` binding at all — the only way to exercise the real default.
            const fixture = setup(SelectionListWithListOptions);

            expect(fixture.nativeElement.querySelector('.kbq-list-selection_draggable')).toBeNull();
            expect(fixture.nativeElement.querySelector('.kbq-list-option_draggable')).toBeNull();
            expect(getDropList(fixture).disabled).toBe(true);
            expect(getDrags(fixture).every((drag) => drag.disabled)).toBe(true);
        });

        it('should stop being draggable once the input is set back to false', () => {
            const fixture = setup(SelectionListWithDragAndDrop);

            fixture.componentInstance.draggable.set(false);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.kbq-list-selection_draggable')).toBeNull();
            expect(fixture.nativeElement.querySelector('.kbq-list-option_draggable')).toBeNull();
            expect(getDropList(fixture).disabled).toBe(true);
            expect(getDrags(fixture).every((drag) => drag.disabled)).toBe(true);
        });

        it('should enable the underlying CDK directives when draggable', () => {
            const fixture = setup(SelectionListWithDragAndDrop);

            expect(fixture.nativeElement.querySelector('.kbq-list-selection_draggable')).not.toBeNull();
            expect(getDropList(fixture).disabled).toBe(false);
            expect(getDrags(fixture).every((drag) => drag.disabled)).toBe(false);
        });

        it('should not be draggable while the list is disabled', () => {
            const fixture = setup(SelectionListWithDragAndDrop);

            fixture.componentInstance.disabled.set(true);
            fixture.detectChanges();

            expect(fixture.componentInstance.list().draggable).toBe(false);
            expect(getDropList(fixture).disabled).toBe(true);
            expect(getDrags(fixture).every((drag) => drag.disabled)).toBe(true);
        });

        it('should not drag a disabled option while the rest stay draggable', () => {
            const fixture = setup(SelectionListWithDragAndDrop);

            fixture.componentInstance.disabledItem.set(fixture.componentInstance.items()[1]);
            fixture.detectChanges();

            expect(getDrags(fixture).map((drag) => drag.disabled)).toEqual([false, true, false, false]);
        });

        it('should delay a touch drag so that the list stays scrollable', () => {
            const fixture = setup(SelectionListWithDragAndDrop);

            expect(getDrags(fixture)[0].dragStartDelay).toEqual({ touch: 300, mouse: 0 });
        });

        it('should connect the drop list to the lists passed to connectedTo', () => {
            const fixture = setup(ConnectedSelectionLists);
            const [first, second] = fixture.debugElement
                .queryAll(By.directive(KbqListSelection))
                .map((list) => list.injector.get(CdkDropList));

            expect(first.connectedTo).toEqual([second]);
            expect(second.connectedTo).toEqual([first]);
        });

        it('should connect the drop list by id and keep the consumer-set id', () => {
            const fixture = setup(IdConnectedSelectionLists);
            const [source, target] = fixture.debugElement
                .queryAll(By.directive(KbqListSelection))
                .map((list) => list.injector.get(CdkDropList));

            // The id has to survive `CdkDropList`'s own `[attr.id]` binding to stay referenceable.
            expect(source.id).toBe('source-list');
            expect(target.id).toBe('target-list');
            expect(source.connectedTo).toEqual(['target-list']);
        });
    });

    describe('dropped output', () => {
        it('should re-emit a CDK drop as a KbqListSelectionDroppedEvent', () => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();
            const option = fixture.debugElement.queryAll(By.directive(KbqListOption))[0].componentInstance;
            const dropList = getDropList(fixture);
            const nativeEvent = createMouseEvent('mouseup');

            dropList.dropped.emit({
                previousIndex: 0,
                currentIndex: 2,
                item: { data: { option } } as any,
                container: dropList,
                previousContainer: dropList,
                isPointerOverContainer: true,
                distance: { x: 0, y: 0 },
                dropPoint: { x: 0, y: 0 },
                event: nativeEvent
            });
            fixture.detectChanges();

            expect(fixture.componentInstance.dropped).toEqual({
                previousIndex: 0,
                currentIndex: 2,
                option,
                container: list,
                previousContainer: list,
                event: nativeEvent
            });
        });
    });

    describe('keyboard reordering', () => {
        it('should move the active option down on ALT + DOWN_ARROW', () => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();

            list.keyManager.setActiveItem(0);
            altKeydown(list, DOWN_ARROW);
            fixture.detectChanges();

            expect(getLabels(fixture)).toEqual(['Item 1', 'Item 0', 'Item 2', 'Item 3']);
        });

        it('should move the active option up on ALT + UP_ARROW', () => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();

            list.keyManager.setActiveItem(2);
            altKeydown(list, UP_ARROW);
            fixture.detectChanges();

            expect(getLabels(fixture)).toEqual(['Item 0', 'Item 2', 'Item 1', 'Item 3']);
        });

        it('should not move past the edges of the list', () => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();

            list.keyManager.setActiveItem(0);
            altKeydown(list, UP_ARROW);
            fixture.detectChanges();

            expect(fixture.componentInstance.dropped).toBeNull();
            expect(getLabels(fixture)).toEqual(['Item 0', 'Item 1', 'Item 2', 'Item 3']);
        });

        it('should ignore ALT + arrow while not draggable', () => {
            const fixture = setup(SelectionListWithDragAndDrop);

            fixture.componentInstance.draggable.set(false);
            fixture.detectChanges();

            const list = fixture.componentInstance.list();

            list.keyManager.setActiveItem(0);
            altKeydown(list, DOWN_ARROW);
            fixture.detectChanges();

            expect(fixture.componentInstance.dropped).toBeNull();
            expect(getLabels(fixture)).toEqual(['Item 0', 'Item 1', 'Item 2', 'Item 3']);
        });

        it('should reorder without changing the selection', () => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();

            list.keyManager.setActiveItem(0);
            altKeydown(list, DOWN_ARROW);
            fixture.detectChanges();

            expect(list.selectionModel.selected).toEqual([]);
        });

        it('should announce the new position once the move has been applied', fakeAsync(() => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();

            list.keyManager.setActiveItem(0);
            altKeydown(list, DOWN_ARROW);
            fixture.detectChanges();
            flush();

            const liveRegion = fixture.nativeElement.querySelector('[aria-live="polite"]');

            expect(liveRegion.textContent.trim()).toBe('Item 0, позиция 2 из 4');
        }));

        it('should not announce a move the consumer has not applied', fakeAsync(() => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();

            fixture.componentInstance.applyMove = false;
            list.keyManager.setActiveItem(0);
            altKeydown(list, DOWN_ARROW);
            fixture.detectChanges();
            flush();

            expect(fixture.nativeElement.querySelector('[aria-live="polite"]').textContent.trim()).toBe('');
        }));

        it('should move the active option into the connected list on ALT + RIGHT_ARROW', () => {
            const fixture = setup(ConnectedSelectionLists);
            const [source, target] = fixture.debugElement
                .queryAll(By.directive(KbqListSelection))
                .map((list) => list.componentInstance as KbqListSelection);

            source.keyManager.setActiveItem(0);
            altKeydown(source, RIGHT_ARROW);
            fixture.detectChanges();

            expect(fixture.componentInstance.dropped!.previousContainer).toBe(source);
            expect(fixture.componentInstance.dropped!.container).toBe(target);
            expect(fixture.componentInstance.leftItems()).toEqual(['left 1']);
            expect(fixture.componentInstance.rightItems()).toEqual(['right 0', 'left 0']);
        });

        it('should move the active option into the connected list on ALT + LEFT_ARROW', () => {
            const fixture = setup(ConnectedSelectionLists);
            const [target, source] = fixture.debugElement
                .queryAll(By.directive(KbqListSelection))
                .map((list) => list.componentInstance as KbqListSelection);

            source.keyManager.setActiveItem(0);
            altKeydown(source, LEFT_ARROW);
            fixture.detectChanges();

            expect(fixture.componentInstance.dropped!.previousContainer).toBe(source);
            expect(fixture.componentInstance.dropped!.container).toBe(target);
            expect(fixture.componentInstance.rightItems()).toEqual([]);
            expect(fixture.componentInstance.leftItems()).toEqual(['left 0', 'left 1', 'right 0']);
        });

        it('should ignore ALT + RIGHT_ARROW without a connected list', () => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();

            list.keyManager.setActiveItem(0);
            altKeydown(list, RIGHT_ARROW);
            fixture.detectChanges();

            expect(fixture.componentInstance.dropped).toBeNull();
        });

        it('should not reach a list connected by id', () => {
            const fixture = setup(IdConnectedSelectionLists);
            const source = fixture.debugElement.queryAll(By.directive(KbqListSelection))[0]
                .componentInstance as KbqListSelection;

            source.keyManager.setActiveItem(0);
            altKeydown(source, RIGHT_ARROW);
            fixture.detectChanges();

            // An id cannot be resolved back to a list instance, so the transfer has no target.
            expect(fixture.componentInstance.dropped).toBeNull();
            expect(fixture.componentInstance.sourceItems()).toEqual(['source 0', 'source 1']);
        });

        it('should keep the shift-range anchor in sync after a reorder', fakeAsync(() => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();

            // Anchor the range on the first option, then move it down: the anchor must follow the option,
            // otherwise the range below spans the wrong items.
            list.keyManager.setActiveItem(0);
            altKeydown(list, DOWN_ARROW);
            fixture.detectChanges();
            flush();

            expect(list.keyManager.previousActiveItemIndex).toBe(list.keyManager.activeItemIndex);
        }));
    });

    describe('accessibility (axe)', () => {
        afterEach(() => {
            if (document.body.contains(fixtureElement!)) {
                document.body.removeChild(fixtureElement!);
            }
        });

        let fixtureElement: HTMLElement | null = null;

        it('has no axe violations while draggable', async () => {
            const fixture = setup(SelectionListWithDragAndDrop);

            fixtureElement = fixture.nativeElement;
            document.body.appendChild(fixture.nativeElement);

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });

        it('has no axe violations once the live region carries an announcement', async () => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();

            fixtureElement = fixture.nativeElement;
            document.body.appendChild(fixture.nativeElement);

            list.keyManager.setActiveItem(0);
            altKeydown(list, DOWN_ARROW);
            fixture.detectChanges();
            // The announcement is filled in on the tick after the move has been applied.
            await new Promise((resolve) => setTimeout(resolve));
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('[aria-live="polite"]').textContent.trim()).not.toBe('');
            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });

        const getShortcuts = (fixture: ComponentFixture<unknown>) =>
            (fixture.nativeElement as HTMLElement).querySelector('kbq-list-option')!.getAttribute('aria-keyshortcuts');

        it('advertises the reordering shortcuts on a draggable option', () => {
            expect(getShortcuts(setup(SelectionListWithDragAndDrop))).toBe('Alt+ArrowUp Alt+ArrowDown');
        });

        it('advertises the transfer shortcuts once a connected list can be reached', () => {
            expect(getShortcuts(setup(ConnectedSelectionLists))).toBe(
                'Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight'
            );
        });

        it('advertises no shortcuts while the list is not draggable', () => {
            expect(getShortcuts(setup(SelectionListWithListOptions))).toBeNull();
        });
    });
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
    readonly optionInstances = viewChildren(KbqListOption);

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
            [selectAllToggle]="selectAllToggle"
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
    selectAllToggle: boolean = false;

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
        KbqListModule,
        KbqOptionModule,
        KbqDropdownModule
    ],
    template: `
        <kbq-list-selection>
            <kbq-list-option [value]="'option_1'">
                Option 1
                <kbq-option-action [kbqDropdownTriggerFor]="dropdown" />
            </kbq-list-option>
            <kbq-list-option [value]="'option_2'">
                Option 2
                <kbq-option-action [kbqDropdownTriggerFor]="dropdown" />
            </kbq-list-option>
        </kbq-list-selection>

        <kbq-dropdown #dropdown>
            <button kbq-dropdown-item>action</button>
        </kbq-dropdown>
    `
})
class SelectionListWithActionButton {}

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

@Component({
    imports: [KbqListModule],
    template: `
        <kbq-list-selection [disabled]="disabled()" [draggable]="draggable()" (dropped)="handleDropped($event)">
            @for (item of items(); track item) {
                <kbq-list-option [disabled]="item === disabledItem()" [value]="item">{{ item }}</kbq-list-option>
            }
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class SelectionListWithDragAndDrop {
    readonly list = viewChild.required(KbqListSelection);
    readonly items = signal(Array.from({ length: 4 }, (_, i) => `Item ${i}`));

    readonly draggable = signal(true);
    readonly disabled = signal(false);
    readonly disabledItem = signal<string | null>(null);
    /** Lets a test assert what happens when the consumer ignores the event. */
    applyMove = true;
    dropped: KbqListSelectionDroppedEvent | null = null;

    handleDropped(event: KbqListSelectionDroppedEvent): void {
        this.dropped = event;

        if (!this.applyMove) {
            return;
        }

        const items = [...this.items()];

        moveItemInArray(items, event.previousIndex, event.currentIndex);
        this.items.set(items);
    }
}

@Component({
    imports: [KbqListModule],
    template: `
        <kbq-list-selection
            #left="kbqListSelection"
            [connectedTo]="[right]"
            [draggable]="true"
            (dropped)="handleDropped($event)"
        >
            @for (item of leftItems(); track item) {
                <kbq-list-option [value]="item">{{ item }}</kbq-list-option>
            }
        </kbq-list-selection>
        <kbq-list-selection
            #right="kbqListSelection"
            [connectedTo]="[left]"
            [draggable]="true"
            (dropped)="handleDropped($event)"
        >
            @for (item of rightItems(); track item) {
                <kbq-list-option [value]="item">{{ item }}</kbq-list-option>
            }
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ConnectedSelectionLists {
    readonly leftItems = signal(['left 0', 'left 1']);
    readonly rightItems = signal(['right 0']);

    dropped: KbqListSelectionDroppedEvent | null = null;

    handleDropped(event: KbqListSelectionDroppedEvent): void {
        this.dropped = event;

        const fromLeft = this.leftItems().includes(event.option.value);
        const source = fromLeft ? this.leftItems : this.rightItems;

        if (event.previousContainer === event.container) {
            const items = [...source()];

            moveItemInArray(items, event.previousIndex, event.currentIndex);
            source.set(items);

            return;
        }

        const target = fromLeft ? this.rightItems : this.leftItems;
        const from = [...source()];
        const to = [...target()];

        transferArrayItem(from, to, event.previousIndex, event.currentIndex);

        source.set(from);
        target.set(to);
    }
}

@Component({
    imports: [KbqListModule],
    template: `
        <kbq-list-selection
            id="source-list"
            [connectedTo]="'target-list'"
            [draggable]="true"
            (dropped)="dropped = $event"
        >
            @for (item of sourceItems(); track item) {
                <kbq-list-option [value]="item">{{ item }}</kbq-list-option>
            }
        </kbq-list-selection>
        <kbq-list-selection id="target-list" [draggable]="true">
            <kbq-list-option [value]="'target 0'">target 0</kbq-list-option>
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class IdConnectedSelectionLists {
    readonly sourceItems = signal(['source 0', 'source 1']);

    dropped: KbqListSelectionDroppedEvent | null = null;
}
