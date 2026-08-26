import { FocusMonitor } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { CdkDrag, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
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
    D,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    DOWN_ARROW,
    END,
    ENTER,
    FocusKeyManager,
    HOME,
    KbqMultipleInput,
    KbqOptionActionComponent,
    KbqOptionModule,
    LEFT_ARROW,
    MultipleMode,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    S,
    SPACE,
    TAB,
    UP_ARROW
} from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { axe } from 'jest-axe';
import {
    KbqListCopyEvent,
    KbqListDragCursor,
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
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            dispatchMouseEvent(listOptions[0].nativeElement, 'click');
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

        it('should not toggle a disabled option with SPACE or ENTER', () => {
            const list: KbqListSelection = selectionList.componentInstance;

            // listOptions[0] is `disabled="true"`. Arrow navigation skips it, but it can still end up
            // active programmatically — e.g. when an index is restored after the list changed.
            list.keyManager.updateActiveItem(0);

            list.onKeyDown(createKeyboardEvent('keydown', SPACE));
            list.onKeyDown(createKeyboardEvent('keydown', ENTER));
            fixture.detectChanges();

            expect(listOptions[0].componentInstance.selected).toBe(false);
            expect(list.selectionModel.selected.length).toBe(0);
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

        it.each([
            { direction: 'UP_ARROW', keyCode: UP_ARROW, anchorIndex: 3, firstIndex: 2, secondIndex: 1 },
            { direction: 'DOWN_ARROW', keyCode: DOWN_ARROW, anchorIndex: 1, firstIndex: 2, secondIndex: 3 }
        ])(
            'should focus and toggle the next item when pressing SHIFT + $direction',
            fakeAsync(({ keyCode, anchorIndex, firstIndex, secondIndex }) => {
                const manager = selectionList.componentInstance.keyManager;
                const keyEvent = createKeyboardEvent('keydown', keyCode);

                Object.defineProperty(keyEvent, 'shiftKey', { get: () => true });

                listOptions[anchorIndex].componentInstance.selected = true;

                manager.setActiveItem(anchorIndex);
                expect(manager.activeItemIndex).toBe(anchorIndex);

                expect(listOptions[firstIndex].componentInstance.selected).toBe(false);
                expect(listOptions[secondIndex].componentInstance.selected).toBe(false);

                selectionList.componentInstance.onKeyDown(keyEvent);
                fixture.detectChanges();

                expect(listOptions[firstIndex].componentInstance.selected).toBe(true);
                expect(listOptions[secondIndex].componentInstance.selected).toBe(false);

                selectionList.componentInstance.onKeyDown(keyEvent);
                fixture.detectChanges();
                tick();

                expect(listOptions[firstIndex].componentInstance.selected).toBe(true);
                expect(listOptions[secondIndex].componentInstance.selected).toBe(true);
            })
        );

        it('should focus next item when press DOWN ARROW', () => {
            const manager = selectionList.componentInstance.keyManager;

            manager.setActiveItem(2);
            expect(manager.activeItemIndex).toEqual(2);

            selectionList.componentInstance.onKeyDown(createKeyboardEvent('keydown', DOWN_ARROW));
            fixture.detectChanges();

            expect(manager.activeItemIndex).toEqual(3);
        });

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

        // Dispatched on the host rather than driving `keyManager` directly, so the event travels the
        // same path a real keypress does — through the `(keydown)` binding and `onKeyDown`, which is
        // where type-ahead is wired into the key manager.
        it('should be able to jump focus down to an item by typing', fakeAsync(() => {
            const manager = selectionList.componentInstance.keyManager;
            const starredOption = listOptions[1].componentInstance as KbqListOption;
            const draftsOption = listOptions[3].componentInstance as KbqListOption;

            expect(manager.activeItemIndex).toBe(-1);

            dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', S, undefined, 's');
            fixture.detectChanges();
            tick(250);
            fixture.detectChanges();

            expect(manager.activeItemIndex).toBe(1);
            expect(manager.activeItem).toBe(starredOption);

            dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', D, undefined, 'd');
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
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            dispatchMouseEvent(listOption[2].nativeElement, 'click');
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(0);
        });

        it('should not select the active option with SPACE or ENTER while the list is disabled', () => {
            const list: KbqListSelection = selectionList.componentInstance;

            list.keyManager.updateActiveItem(2);

            list.onKeyDown(createKeyboardEvent('keydown', SPACE));
            list.onKeyDown(createKeyboardEvent('keydown', ENTER));
            fixture.detectChanges();

            expect(list.selectionModel.selected.length).toBe(0);
        });

        it('should expose the disabled state through aria-disabled', () => {
            expect(selectionList.nativeElement.getAttribute('aria-disabled')).toBe('true');
            expect(listOption[0].nativeElement.getAttribute('aria-disabled')).toBe('true');
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

        it('should disable the list itself when the control is disabled', () => {
            const selectionList = fixture.debugElement.query(By.directive(KbqListSelection));
            const list: KbqListSelection = selectionList.componentInstance;

            expect(list.disabled).toBe(false);
            expect(list.tabIndex).toBe(0);

            fixture.componentInstance.formControl.disable();
            fixture.detectChanges();

            expect(list.disabled).toBe(true);
            expect(list.tabIndex).toBe(-1);
            expect(selectionList.nativeElement.getAttribute('aria-disabled')).toBe('true');
        });

        // The list disables its options through the `KbqListOption.disabled` getter, so re-enabling
        // the control must not resurrect an option that was disabled by its own input.
        it('should not clobber per-option disabled inputs when the control toggles', () => {
            const optionFixture = TestBed.createComponent(SelectionListWithFormControlAndDisabledOption);

            optionFixture.detectChanges();

            const options = optionFixture.debugElement
                .queryAll(By.directive(KbqListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance as KbqListOption);

            expect(options.map((option) => option.disabled)).toEqual([false, true]);

            optionFixture.componentInstance.formControl.disable();
            optionFixture.detectChanges();

            expect(options.map((option) => option.disabled)).toEqual([true, true]);

            optionFixture.componentInstance.formControl.enable();
            optionFixture.detectChanges();

            expect(options.map((option) => option.disabled)).toEqual([false, true]);
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

        it('should keep the selection when an option value is replaced by an equal object', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithReplaceableValues);
            const testComponent = fixture.componentInstance;

            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(testComponent.optionInstances()[1].selected).toBe(true);

            const selectionList = fixture.debugElement.query(By.directive(KbqListSelection)).componentInstance;
            const changes = jest.fn();

            selectionList.selectionModel.changed.subscribe(changes);

            testComponent.reloadItems();
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(testComponent.optionInstances()[1].selected).toBe(true);
            // Re-applying an equal value is a no-op: the delta must not deselect and re-select on the way.
            expect(changes).not.toHaveBeenCalled();
        }));

        it('should apply an object model value set after initialization', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithReplaceableValues);
            const testComponent = fixture.componentInstance;

            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            testComponent.formControl.setValue([{ id: 3, label: 'Three' }]);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(testComponent.optionInstances().map((option) => option.selected)).toEqual([false, false, true]);
        }));

        it('should re-run matching when the comparator changes', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithReplaceableValues);
            const testComponent = fixture.componentInstance;

            testComponent.useCompareByReference();
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(testComponent.optionInstances().every((option) => !option.selected)).toBe(true);

            testComponent.useCompareById();
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(testComponent.optionInstances()[1].selected).toBe(true);
        }));

        it('should keep a single selection when the option values are replaced', fakeAsync(() => {
            const fixture = TestBed.createComponent(SingleSelectionListWithComparator);
            const testComponent = fixture.componentInstance;

            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(testComponent.optionInstances().map((option) => option.selected)).toEqual([false, true, false]);

            testComponent.reloadItems();
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(testComponent.optionInstances().map((option) => option.selected)).toEqual([false, true, false]);
        }));

        it('should use the custom comparator with ngModel', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithComparatorAndModel);
            const testComponent = fixture.componentInstance;

            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(testComponent.optionInstances().map((option) => option.selected)).toEqual([false, false, true]);
        }));

        it('should apply a later value to an option the single-selection model had dropped', fakeAsync(() => {
            const fixture = TestBed.createComponent(SingleSelectionListWithMultipleValues);
            const testComponent = fixture.componentInstance;

            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(testComponent.optionInstances().map((option) => option.selected)).toEqual([false, true, false]);

            testComponent.formControl.setValue(['a']);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(testComponent.optionInstances().map((option) => option.selected)).toEqual([true, false, false]);
        }));

        it('should keep an option whose value the model still matches by id, not by shape', fakeAsync(() => {
            // Options carry objects, the model carries ids — the comparator only works in the documented
            // `(optionValue, modelValue)` order, so this fails if the two are ever swapped.
            const fixture = TestBed.createComponent(SelectionListWithAsymmetricComparator);
            const testComponent = fixture.componentInstance;

            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(testComponent.optionInstances().map((option) => option.selected)).toEqual([false, true, false]);

            testComponent.reloadItems();
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(testComponent.optionInstances().map((option) => option.selected)).toEqual([false, true, false]);
        }));

        it('should let the comparator decide about options without a value', fakeAsync(() => {
            // A valueless option reports `undefined` back through the form control, so it has to be able
            // to find itself again when that value is re-applied.
            const fixture = TestBed.createComponent(SelectionListWithNullishValues);
            const testComponent = fixture.componentInstance;

            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(testComponent.optionInstances().map((option) => option.selected)).toEqual([true, false]);
        }));

        it('should survive a comparator that throws and report it once per comparison', fakeAsync(() => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const fixture = TestBed.createComponent(SelectionListWithThrowingComparator);

            expect(() => {
                fixture.detectChanges();
                tick();
                fixture.detectChanges();
            }).not.toThrow();

            expect(warn).toHaveBeenCalled();
            expect(fixture.componentInstance.optionInstances().every((option) => !option.selected)).toBe(true);

            warn.mockRestore();
        }));

        it('should throw when compareWith is set to a non-function', () => {
            const fixture = TestBed.createComponent(SelectionListWithReplaceableValues);

            fixture.componentInstance.comparator = null as any;

            expect(() => fixture.detectChanges()).toThrow('`compareWith` must be a function.');
        });

        it('should clear a selection the previous comparator matched', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithReplaceableValues);
            const testComponent = fixture.componentInstance;

            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(testComponent.optionInstances()[1].selected).toBe(true);

            testComponent.formControl.setValue([]);
            testComponent.useCompareByReference();
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(testComponent.optionInstances().every((option) => !option.selected)).toBe(true);
        }));

        it('should not let one option break the rest when the comparator cannot read its value', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithValuelessOption);
            const testComponent = fixture.componentInstance;

            expect(() => {
                fixture.detectChanges();
                tick();
                fixture.detectChanges();
            }).not.toThrow();

            expect(testComponent.optionInstances().map((option) => option.selected)).toEqual([
                false,
                false,
                true,
                false
            ]);
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

describe('KbqListSelection range selection', () => {
    let fixture: ComponentFixture<SelectionListWithListOptions>;
    let list: KbqListSelection;
    let listOptions: DebugElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqListModule] }).compileComponents();

        fixture = TestBed.createComponent(SelectionListWithListOptions);
        fixture.detectChanges();

        list = fixture.debugElement.query(By.directive(KbqListSelection)).componentInstance;
        listOptions = fixture.debugElement.queryAll(By.directive(KbqListOption));
    });

    // A real mouse click focuses the option first, which routes through `listenToOptionsFocus` ->
    // `keyManager.updateActiveItem`, not `setActiveItem` — so `activeItemIndex` becomes a real index
    // while `previousActiveItemIndex` stays -1 (only `setActiveItem` touches it). That asymmetric
    // fromIndex=-1/toIndex=valid state is exactly what the `isValidIndex` guards in
    // `selectActiveOptions` exist for.
    it('should not throw on shift + click before any keyboard navigation', () => {
        list.keyManager.updateActiveItem(2);

        expect(list.keyManager.previousActiveItemIndex).toBe(-1);
        expect(list.keyManager.activeItemIndex).toBe(2);

        expect(() => list.setSelectedOptionsByClick(listOptions[2].componentInstance, true, false)).not.toThrow();
        expect(list.selectionModel.selected.length).toBe(0);
    });

    it('should extend the range from the anchor once the keyboard has moved', fakeAsync(() => {
        list.keyManager.setActiveItem(1);
        listOptions[1].componentInstance.selected = true;
        list.keyManager.setActiveItem(3);
        fixture.detectChanges();

        list.setSelectedOptionsByClick(listOptions[3].componentInstance, true, false);
        fixture.detectChanges();
        tick();

        expect(listOptions[1].componentInstance.selected).toBe(true);
        expect(listOptions[2].componentInstance.selected).toBe(true);
        expect(listOptions[3].componentInstance.selected).toBe(true);
    }));
});

describe('KbqListSelection horizontal', () => {
    let fixture: ComponentFixture<SelectionListHorizontal>;
    let selectionList: DebugElement;
    let listOptions: DebugElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqListModule] }).compileComponents();

        fixture = TestBed.createComponent(SelectionListHorizontal);
        fixture.detectChanges();

        selectionList = fixture.debugElement.query(By.directive(KbqListSelection));
        listOptions = fixture.debugElement.queryAll(By.directive(KbqListOption));
    });

    it('should announce and lay out the list as a horizontal listbox', () => {
        expect(selectionList.nativeElement.getAttribute('aria-orientation')).toBe('horizontal');
        expect(selectionList.nativeElement.classList).toContain('kbq-list-selection_horizontal');
    });

    it('should move the active option with LEFT and RIGHT arrows', () => {
        const manager = selectionList.componentInstance.keyManager;

        manager.setActiveItem(0);

        dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', RIGHT_ARROW);
        fixture.detectChanges();

        expect(manager.activeItemIndex).toBe(1);

        dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', LEFT_ARROW);
        fixture.detectChanges();

        expect(manager.activeItemIndex).toBe(0);
    });

    it('should follow the selection while navigating horizontally', () => {
        selectionList.componentInstance.keyManager.setActiveItem(0);

        dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', RIGHT_ARROW);
        fixture.detectChanges();

        expect(listOptions[0].componentInstance.selected).toBe(false);
        expect(listOptions[1].componentInstance.selected).toBe(true);
    });

    it('should not compute a scroll size in horizontal mode', () => {
        const withScrollSize = jest.spyOn(selectionList.componentInstance.keyManager, 'withScrollSize');

        selectionList.componentInstance.updateScrollSize();

        expect(withScrollSize).not.toHaveBeenCalled();
    });
});

describe('KbqListSelection layout measurement', () => {
    let fixture: ComponentFixture<SelectionListWithListOptions>;
    let list: KbqListSelection;
    let listElement: HTMLElement;

    const clientRects = (...heights: number[]) => heights.map((height) => ({ height })) as unknown as DOMRectList;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqListModule] }).compileComponents();

        fixture = TestBed.createComponent(SelectionListWithListOptions);
        fixture.detectChanges();

        const selectionList = fixture.debugElement.query(By.directive(KbqListSelection));

        list = selectionList.componentInstance;
        listElement = selectionList.nativeElement;
    });

    it('should report zero height when the element is not laid out', () => {
        jest.spyOn(listElement, 'getClientRects').mockReturnValue(clientRects());
        expect(list.getHeight()).toBe(0);

        jest.spyOn(listElement, 'getClientRects').mockReturnValue(undefined as unknown as DOMRectList);
        expect(list.getHeight()).toBe(0);
    });

    it('should report the measured height when the element is laid out', () => {
        jest.spyOn(listElement, 'getClientRects').mockReturnValue(clientRects(120));

        expect(list.getHeight()).toBe(120);
    });

    // jsdom never lays elements out, so `getClientRects()` is empty and the option height is 0.
    it('should skip updateScrollSize when the option height is unknown', () => {
        const withScrollSize = jest.spyOn(list.keyManager, 'withScrollSize');

        expect(list.options.first.getHeight()).toBe(0);
        expect(() => list.updateScrollSize()).not.toThrow();
        expect(withScrollSize).not.toHaveBeenCalled();
    });

    it('should derive the scroll size from the rendered heights', () => {
        const withScrollSize = jest.spyOn(list.keyManager, 'withScrollSize');

        jest.spyOn(listElement, 'getClientRects').mockReturnValue(clientRects(100));
        jest.spyOn(list.options.first.getHostElement(), 'getClientRects').mockReturnValue(clientRects(30));

        list.updateScrollSize();

        expect(withScrollSize).toHaveBeenCalledWith(3);
    });

    // Mirrors `RESIZE_AUDIT_TIME` in list-selection.component.ts, not exported since it's an
    // implementation detail of the resize listener, not public API.
    const RESIZE_AUDIT_TIME = 100;

    it('should recompute the scroll size on window resize, debounced', fakeAsync(() => {
        const updateScrollSizeSpy = jest.spyOn(list, 'updateScrollSize');

        window.dispatchEvent(new Event('resize'));
        window.dispatchEvent(new Event('resize'));

        expect(updateScrollSizeSpy).not.toHaveBeenCalled();

        tick(RESIZE_AUDIT_TIME);

        expect(updateScrollSizeSpy).toHaveBeenCalledTimes(1);
    }));
});

describe('KbqListSelection accessibility', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqListModule] }).compileComponents();
    });

    it('should expose a single-selection list as a non-multiselectable listbox', () => {
        const fixture = TestBed.createComponent(SelectionListForA11y);

        fixture.detectChanges();

        const list = fixture.debugElement.query(By.directive(KbqListSelection)).nativeElement;

        expect(list.getAttribute('role')).toBe('listbox');
        expect(list.getAttribute('aria-multiselectable')).toBe('false');
        expect(list.getAttribute('aria-orientation')).toBeNull();
    });

    it('should mark a multiple-selection list as multiselectable', () => {
        const fixture = TestBed.createComponent(SelectionListMultipleForA11y);

        fixture.detectChanges();

        const list = fixture.debugElement.query(By.directive(KbqListSelection)).nativeElement;

        expect(list.getAttribute('aria-multiselectable')).toBe('true');
    });

    it('should give every option a role and an explicit aria-selected', () => {
        const fixture = TestBed.createComponent(SelectionListForA11y);

        fixture.detectChanges();

        const options = fixture.debugElement.queryAll(By.directive(KbqListOption));

        expect(options.map(({ nativeElement }) => nativeElement.getAttribute('role'))).toEqual([
            'option',
            'option',
            'option'
        ]);
        expect(options.map(({ nativeElement }) => nativeElement.getAttribute('aria-selected'))).toEqual([
            'false',
            'false',
            'false'
        ]);

        options[1].componentInstance.toggle();
        fixture.detectChanges();

        expect(options.map(({ nativeElement }) => nativeElement.getAttribute('aria-selected'))).toEqual([
            'false',
            'true',
            'false'
        ]);
    });

    it('should mark disabled options with aria-disabled instead of the inert disabled attribute', () => {
        const fixture = TestBed.createComponent(SelectionListForA11y);

        fixture.detectChanges();

        const options = fixture.debugElement.queryAll(By.directive(KbqListOption));

        expect(options[2].nativeElement.getAttribute('aria-disabled')).toBe('true');
        expect(options[2].nativeElement.hasAttribute('disabled')).toBe(false);
        expect(options[0].nativeElement.getAttribute('aria-disabled')).toBeNull();
    });

    it('should keep the pseudo-checkbox out of the accessibility tree', () => {
        const fixture = TestBed.createComponent(SelectionListMultipleForA11y);

        fixture.detectChanges();

        const pseudoCheckbox = fixture.debugElement.query(By.css('kbq-pseudo-checkbox')).nativeElement;

        expect(pseudoCheckbox.getAttribute('aria-hidden')).toBe('true');
    });

    describe('axe', () => {
        it('should have no violations for a single-selection list', async () => {
            const fixture = TestBed.createComponent(SelectionListForA11y);

            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });

        it('should have no violations for a multiple-selection list', async () => {
            const fixture = TestBed.createComponent(SelectionListMultipleForA11y);

            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });

        it('should have no violations for a grouped list', async () => {
            const fixture = TestBed.createComponent(SelectionListGroupedForA11y);

            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });

        it('should have no violations for a disabled list', async () => {
            const fixture = TestBed.createComponent(SelectionListDisabledForA11y);

            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });
    });
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

    const getOptions = (fixture: ComponentFixture<unknown>): KbqListOption[] =>
        fixture.debugElement.queryAll(By.directive(KbqListOption)).map((option) => option.componentInstance);

    /**
     * jsdom performs no layout, so every rect is empty and the gap the indicator marks cannot be
     * resolved. Stacks the options 20px apart, which puts their midpoints at 10, 30, 50, 70.
     */
    const stubVerticalLayout = (fixture: ComponentFixture<unknown>, optionHeight = 20) => {
        fixture.debugElement.queryAll(By.directive(KbqListSelection)).forEach(({ nativeElement }) => {
            jest.spyOn(nativeElement as HTMLElement, 'getBoundingClientRect').mockReturnValue({
                top: 0,
                bottom: 1000,
                left: 0,
                right: 100
            } as DOMRect);
        });

        getOptions(fixture).forEach((option, index) => {
            jest.spyOn(option.getHostElement(), 'getBoundingClientRect').mockReturnValue({
                top: index * optionHeight,
                bottom: (index + 1) * optionHeight,
                left: 0,
                right: 100
            } as DOMRect);
        });
    };

    /** Replays what `CdkDropList` emits on drop; its own `currentIndex` is stale by design. */
    const emitCdkDrop = (
        fixture: ComponentFixture<unknown>,
        option: KbqListOption,
        event = createMouseEvent('mouseup')
    ) => {
        const dropList = getDropList(fixture);

        dropList.dropped.emit({
            previousIndex: 0,
            currentIndex: 0,
            item: { data: { option } } as any,
            container: dropList,
            previousContainer: dropList,
            isPointerOverContainer: true,
            distance: { x: 0, y: 0 },
            dropPoint: { x: 0, y: 0 },
            event
        });
        fixture.detectChanges();
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

        it('should not drag an option that opts out while the rest stay draggable', () => {
            const fixture = setup(SelectionListWithDragAndDrop);

            fixture.componentInstance.nonDraggableItem.set(fixture.componentInstance.items()[1]);
            fixture.detectChanges();

            expect(getDrags(fixture).map((drag) => drag.disabled)).toEqual([false, true, false, false]);
        });

        it('should keep an option that opts out of dragging selectable', () => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();

            fixture.componentInstance.nonDraggableItem.set(fixture.componentInstance.items()[1]);
            fixture.detectChanges();

            const option = getOptions(fixture)[1];

            // The whole point of the input: pinning an option must not disable it.
            expect(getDrags(fixture)[1].disabled).toBe(true);
            expect(option.disabled).toBe(false);

            list.setSelectedOptionsByClick(option, false, false);
            fixture.detectChanges();

            expect(list.selectionModel.selected).toEqual([option]);
        });

        it('should delay a touch drag so that the list stays scrollable', () => {
            const fixture = setup(SelectionListWithDragAndDrop);

            expect(getDrags(fixture)[0].dragStartDelay).toEqual({ touch: 300, mouse: 0 });
        });

        it('should not delay a touch drag once an option carries a handle', () => {
            // A handle leaves nothing to disambiguate, so the delay the row needs would be pure lag.
            const fixture = setup(SelectionListWithDragHandle);

            expect(getDrags(fixture)[0].dragStartDelay).toBe(0);
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
            const option = getOptions(fixture)[0];
            const nativeEvent = createMouseEvent('mouseup');

            stubVerticalLayout(fixture);
            // Pointer past the midpoint of the third option, i.e. into the gap that follows it.
            list.onOptionDragMoved(option, { x: 50, y: 55 });
            emitCdkDrop(fixture, option, nativeEvent);

            expect(fixture.componentInstance.dropped).toEqual({
                previousIndex: 0,
                currentIndex: 2,
                option,
                container: list,
                previousContainer: list,
                event: nativeEvent
            });
        });

        it('should survive the ended event that CDK fires before the drop', () => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();
            const option = getOptions(fixture)[0];

            stubVerticalLayout(fixture);
            list.onOptionDragMoved(option, { x: 50, y: 55 });

            // `DragRef` emits `ended` immediately before `dropped`. Tearing the indicator down there
            // would discard the resolved target index and silently turn every drag into a no-op.
            getDrags(fixture)[0].ended.emit({
                source: null!,
                distance: { x: 0, y: 0 },
                dropPoint: { x: 0, y: 0 },
                event: createMouseEvent('mouseup')
            });
            emitCdkDrop(fixture, option);

            expect(fixture.componentInstance.dropped!.currentIndex).toBe(2);
            expect(getLabels(fixture)).toEqual(['Item 1', 'Item 2', 'Item 0', 'Item 3']);
        });

        it('should report a move that changes nothing when the pointer never entered a list', () => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const option = getOptions(fixture)[0];

            // Sorting is disabled, so CDK itself has no target index to offer — dropping outside every
            // known list has to resolve to a no-op rather than to CDK's stale starting index.
            emitCdkDrop(fixture, option);

            expect(fixture.componentInstance.dropped!.currentIndex).toBe(0);
            expect(getLabels(fixture)).toEqual(['Item 0', 'Item 1', 'Item 2', 'Item 3']);
        });
    });

    describe('drop indicator', () => {
        const getIndicator = (fixture: ComponentFixture<unknown>) =>
            (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.kbq-list-selection__drop-indicator');

        const getIndicatorOffset = (fixture: ComponentFixture<unknown>) =>
            getIndicator(fixture)!.style.getPropertyValue('--kbq-list-drop-indicator-offset');

        it('should not be rendered until a drag hovers the list', () => {
            expect(getIndicator(setup(SelectionListWithDragAndDrop))).toBeNull();
        });

        it('should sit on the gap the pointer is closest to', () => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();
            // The second option, so that neither end of the list is the place it already occupies.
            const option = getOptions(fixture)[1];

            stubVerticalLayout(fixture);
            // Above every midpoint: the option would land before the first one.
            list.onOptionDragMoved(option, { x: 50, y: 5 });
            fixture.detectChanges();

            expect(getIndicatorOffset(fixture)).toBe('0px');

            // Past the last midpoint: the option would land at the very end.
            list.onOptionDragMoved(option, { x: 50, y: 95 });
            fixture.detectChanges();

            expect(getIndicatorOffset(fixture)).toBe('80px');
        });

        it('should mark the option while the pointer is over no list that would take it', () => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();
            const option = getOptions(fixture)[1];

            stubVerticalLayout(fixture);
            // `stubVerticalLayout` puts the list at 0..1000 vertically and 0..100 horizontally.
            list.onOptionDragMoved(option, { x: 500, y: 50 });

            expect(option.getHostElement().classList).toContain('kbq-list-option_drop-forbidden');

            list.onOptionDragMoved(option, { x: 50, y: 50 });

            expect(option.getHostElement().classList).not.toContain('kbq-list-option_drop-forbidden');
        });

        it('should not mark the gap the option already occupies', () => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();
            const option = getOptions(fixture)[1];

            stubVerticalLayout(fixture);
            list.onOptionDragMoved(option, { x: 50, y: 95 });
            fixture.detectChanges();

            expect(getIndicator(fixture)).not.toBeNull();

            // Back over its own row: dropping here would put the option where it already is.
            list.onOptionDragMoved(option, { x: 50, y: 25 });
            fixture.detectChanges();

            expect(getIndicator(fixture)).toBeNull();
        });

        it('should disappear once the option has been dropped', () => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = fixture.componentInstance.list();
            const option = getOptions(fixture)[0];

            stubVerticalLayout(fixture);
            list.onOptionDragMoved(option, { x: 50, y: 55 });
            fixture.detectChanges();

            expect(getIndicator(fixture)).not.toBeNull();

            emitCdkDrop(fixture, option);

            expect(getIndicator(fixture)).toBeNull();
        });

        it('should follow the pointer into the connected list and leave the source', () => {
            const fixture = setup(ConnectedSelectionLists);
            const [sourceElement, targetElement] = fixture.debugElement
                .queryAll(By.directive(KbqListSelection))
                .map(({ nativeElement }) => nativeElement as HTMLElement);
            const source = fixture.debugElement.queryAll(By.directive(KbqListSelection))[0]
                .componentInstance as KbqListSelection;
            const option = getOptions(fixture)[0];

            stubVerticalLayout(fixture);
            // `stubVerticalLayout` stacks both lists on the same box, so separate them along x and aim
            // the pointer at the second one.
            jest.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
                top: 0,
                bottom: 1000,
                left: 200,
                right: 300
            } as DOMRect);

            source.onOptionDragMoved(option, { x: 250, y: 5 });
            fixture.detectChanges();

            const indicators = (fixture.nativeElement as HTMLElement).querySelectorAll(
                '.kbq-list-selection__drop-indicator'
            );

            expect(indicators.length).toBe(1);
            expect(targetElement.contains(indicators[0])).toBe(true);
            expect(sourceElement.querySelector('.kbq-list-selection__drop-indicator')).toBeNull();
        });
    });

    describe('after a move has been applied', () => {
        /** Drags the first option past the last midpoint and drops it there. */
        const dragToEnd = (fixture: ComponentFixture<SelectionListWithDragAndDrop>) => {
            const list = fixture.componentInstance.list();
            const option = getOptions(fixture)[0];

            stubVerticalLayout(fixture);
            list.onOptionDragMoved(option, { x: 50, y: 95 });
            emitCdkDrop(fixture, option);

            return list;
        };

        it('should reorder without changing the selection', () => {
            const fixture = setup(SelectionListWithDragAndDrop);
            const list = dragToEnd(fixture);

            expect(getLabels(fixture)).toEqual(['Item 1', 'Item 2', 'Item 3', 'Item 0']);
            expect(list.selectionModel.selected).toEqual([]);
        });

        it('should keep the shift-range anchor in sync', fakeAsync(() => {
            const fixture = setup(SelectionListWithDragAndDrop);

            // Anchor the range on the first option, then move it: the anchor must follow the option,
            // otherwise the range below spans the wrong items.
            const list = fixture.componentInstance.list();

            list.keyManager.setActiveItem(0);
            dragToEnd(fixture);
            flush();

            expect(list.keyManager.previousActiveItemIndex).toBe(list.keyManager.activeItemIndex);
        }));
    });

    describe('drag cursor', () => {
        const getGrabCursorOptions = (fixture: ComponentFixture<unknown>) =>
            (fixture.nativeElement as HTMLElement).querySelectorAll('.kbq-list-option_grab-cursor');

        it('should leave the row its own cursor by default', () => {
            const fixture = setup(SelectionListWithDragAndDrop);

            // Draggable, and still not marked — being draggable is not on its own a reason to advertise.
            expect(fixture.componentInstance.list().dragCursor()).toBe('auto');
            expect(fixture.nativeElement.querySelectorAll('.kbq-list-option_draggable').length).toBe(4);
            expect(getGrabCursorOptions(fixture).length).toBe(0);
        });

        it('should mark every draggable option when the list asks for the grab', () => {
            const fixture = setup(SelectionListWithDragAndDrop);

            fixture.componentInstance.dragCursor.set('grab');
            fixture.detectChanges();

            expect(getGrabCursorOptions(fixture).length).toBe(4);
        });

        it('should not mark an option that cannot be picked up', () => {
            const fixture = setup(SelectionListWithDragAndDrop);

            fixture.componentInstance.dragCursor.set('grab');
            fixture.componentInstance.nonDraggableItem.set('Item 1');
            fixture.detectChanges();

            const marked = Array.from(getGrabCursorOptions(fixture)).map((option) =>
                option.querySelector('.kbq-list-text')!.textContent!.trim()
            );

            expect(marked).toEqual(['Item 0', 'Item 2', 'Item 3']);
        });
    });

    describe('drag preview', () => {
        it('should render the text preview by default', () => {
            const fixture = setup(SelectionListWithDragAndDrop);

            expect(fixture.componentInstance.list().dragPreview()).toBe('text');
            expect(fixture.nativeElement.querySelector('.kbq-list-drag-preview_text')).toBeNull();
        });

        it('should read the label without the caption', () => {
            const fixture = setup(SelectionListWithCaption);
            const [plain, captioned] = getOptions(fixture);

            expect(plain.getDragPreviewText()).toEqual({ label: 'Plain', caption: '' });
            expect(captioned.getDragPreviewText()).toEqual({ label: 'Captioned', caption: 'Caption text' });
        });

        it('should keep the anchors Angular leaves in the label out of the text', () => {
            const fixture = setup(SelectionListWithCaption);
            const [option] = getOptions(fixture);
            const label: HTMLElement = option.text().nativeElement;

            label.appendChild(document.createComment('container'));

            expect(option.getDragPreviewText().label).toBe('Plain');
        });
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

        it('has no axe violations once the list is split by a group and a divider', async () => {
            // Characterises the shape the docs recommend — a group, a decorative divider and an option
            // that cannot be dragged — so that a later change to any of their roles is caught here.
            const fixture = setup(SelectionListWithSections);

            fixtureElement = fixture.nativeElement;
            document.body.appendChild(fixture.nativeElement);

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });
    });

    describe('virtual scroll', () => {
        let warn: jest.SpyInstance;

        beforeEach(() => {
            warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        });

        afterEach(() => warn.mockRestore());

        it('should warn once the list becomes draggable', () => {
            const fixture = setup(SelectionListInVirtualScroll);

            expect(warn).not.toHaveBeenCalled();

            // Enabled after init: the warning has to survive a late toggle, not only the first render.
            fixture.componentInstance.draggable.set(true);
            fixture.detectChanges();

            expect(warn).toHaveBeenCalledWith(expect.stringContaining('cdk-virtual-scroll-viewport'));
        });

        it('should warn only once', () => {
            const fixture = setup(SelectionListInVirtualScroll);

            fixture.componentInstance.draggable.set(true);
            fixture.detectChanges();
            fixture.componentInstance.draggable.set(false);
            fixture.detectChanges();
            fixture.componentInstance.draggable.set(true);
            fixture.detectChanges();

            expect(warn).toHaveBeenCalledTimes(1);
        });

        it('should not warn about a draggable list whose options sit in a group', () => {
            const fixture = setup(SelectionListInOptgroup);

            fixture.componentInstance.draggable.set(true);
            fixture.detectChanges();

            expect(warn).not.toHaveBeenCalled();
        });

        it('should not warn about a plain draggable list', () => {
            setup(SelectionListWithDragAndDrop);

            expect(warn).not.toHaveBeenCalled();
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

    // A distinct object that only `compareWith` can match against `options[1]` — a reference (`===`)
    // lookup inside the list would silently select nothing.
    formControl = new UntypedFormControl([{ id: 2, label: 'Two' }]);

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
    imports: [
        KbqListModule
    ],
    template: `
        <kbq-list-selection [horizontal]="true">
            <kbq-list-option [value]="'opt1'">Option 1</kbq-list-option>
            <kbq-list-option [value]="'opt2'">Option 2</kbq-list-option>
            <kbq-list-option [value]="'opt3'">Option 3</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListHorizontal {}

@Component({
    imports: [
        KbqListModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-list-selection multiple="checkbox" [formControl]="formControl">
            <kbq-list-option [value]="'opt1'">Option 1</kbq-list-option>
            <kbq-list-option [disabled]="true" [value]="'opt2'">Option 2</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListWithFormControlAndDisabledOption {
    formControl = new UntypedFormControl();
}

// `role="listbox"` needs an accessible name, hence the `aria-label` on every a11y fixture.
@Component({
    imports: [
        KbqListModule
    ],
    template: `
        <kbq-list-selection aria-label="Mailboxes">
            <kbq-list-option [value]="'inbox'">Inbox</kbq-list-option>
            <kbq-list-option [value]="'starred'">Starred</kbq-list-option>
            <kbq-list-option [disabled]="true" [value]="'drafts'">Drafts</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListForA11y {}

@Component({
    imports: [
        KbqListModule
    ],
    template: `
        <kbq-list-selection aria-label="Mailboxes" multiple="checkbox">
            <kbq-list-option [value]="'inbox'">Inbox</kbq-list-option>
            <kbq-list-option [value]="'starred'">Starred</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListMultipleForA11y {}

@Component({
    imports: [
        KbqListModule,
        KbqOptionModule
    ],
    template: `
        <kbq-list-selection aria-label="Security controls" multiple="checkbox">
            <kbq-optgroup label="Network">
                <kbq-list-option [value]="'firewall'">Firewall</kbq-list-option>
                <kbq-list-option [value]="'vpn'">VPN</kbq-list-option>
            </kbq-optgroup>
            <kbq-list-option [value]="'rbac'">RBAC</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListGroupedForA11y {}

@Component({
    imports: [
        KbqListModule
    ],
    template: `
        <kbq-list-selection aria-label="Mailboxes" [disabled]="true">
            <kbq-list-option [value]="'inbox'">Inbox</kbq-list-option>
            <kbq-list-option [value]="'starred'">Starred</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListDisabledForA11y {}

@Component({
    imports: [KbqListModule],
    template: `
        <kbq-list-selection [draggable]="true">
            <kbq-list-option [value]="'pinned'">
                <span cdkDragHandle>handle</span>
                Option
            </kbq-list-option>
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class SelectionListWithDragHandle {}

@Component({
    imports: [KbqListModule],
    template: `
        <kbq-list-selection
            aria-label="Items"
            [disabled]="disabled()"
            [dragCursor]="dragCursor()"
            [draggable]="draggable()"
            (dropped)="handleDropped($event)"
        >
            @for (item of items(); track item) {
                <kbq-list-option
                    [disabled]="item === disabledItem()"
                    [draggable]="item !== nonDraggableItem()"
                    [value]="item"
                >
                    {{ item }}
                </kbq-list-option>
            }
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class SelectionListWithDragAndDrop {
    readonly list = viewChild.required(KbqListSelection);
    readonly items = signal(Array.from({ length: 4 }, (_, i) => `Item ${i}`));

    readonly draggable = signal(true);
    readonly dragCursor = signal<KbqListDragCursor>('auto');
    readonly disabled = signal(false);
    readonly disabledItem = signal<string | null>(null);
    readonly nonDraggableItem = signal<string | null>(null);
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
        <kbq-list-selection aria-label="Items" [draggable]="true">
            <kbq-list-option [value]="'plain'">Plain</kbq-list-option>
            <kbq-list-option [value]="'captioned'">
                Captioned
                <span kbq-list-option-caption>Caption text</span>
            </kbq-list-option>
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class SelectionListWithCaption {}

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

@Component({
    imports: [KbqListModule, KbqOptionModule, KbqDividerModule],
    template: `
        <kbq-list-selection aria-label="Items" multiple="checkbox" [draggable]="true">
            <kbq-list-option [value]="'loose'">Loose</kbq-list-option>
            <kbq-optgroup label="Group">
                <kbq-list-option [value]="'grouped'">Grouped</kbq-list-option>
            </kbq-optgroup>
            <kbq-divider aria-hidden="true" />
            <kbq-list-option [draggable]="false" [value]="'pinned'">Pinned</kbq-list-option>
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class SelectionListWithSections {}

@Component({
    imports: [KbqListModule, ScrollingModule],
    template: `
        <kbq-list-selection style="height: 64px" [draggable]="draggable()">
            <cdk-virtual-scroll-viewport style="height: 100%" itemSize="32">
                <kbq-list-option *cdkVirtualFor="let item of items" [value]="item">{{ item }}</kbq-list-option>
            </cdk-virtual-scroll-viewport>
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class SelectionListInVirtualScroll {
    readonly draggable = signal(false);
    readonly items = Array.from({ length: 20 }, (_, index) => `Item ${index}`);
}

@Component({
    imports: [KbqListModule, KbqOptionModule],
    template: `
        <kbq-list-selection [draggable]="draggable()">
            <kbq-optgroup label="Group">
                <kbq-list-option [value]="'Item 0'">Item 0</kbq-list-option>
                <kbq-list-option [value]="'Item 1'">Item 1</kbq-list-option>
            </kbq-optgroup>
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class SelectionListInOptgroup {
    readonly draggable = signal(false);
}

type ComparatorItem = { id: number; label: string };

/** Fresh, structurally identical objects — a reference lookup can never match two of these arrays. */
const comparatorItems = (): ComparatorItem[] => [
    { id: 1, label: 'One' },
    { id: 2, label: 'Two' },
    { id: 3, label: 'Three' }
];

@Component({
    imports: [KbqListModule, ReactiveFormsModule],
    template: `
        <kbq-list-selection multiple="checkbox" [compareWith]="comparator" [formControl]="formControl">
            @for (item of items(); track item.id) {
                <kbq-list-option [value]="item">{{ item.label }}</kbq-list-option>
            }
        </kbq-list-selection>
    `
})
class SelectionListWithReplaceableValues {
    readonly optionInstances = viewChildren(KbqListOption);
    readonly items = signal(comparatorItems());

    // Structurally equal to `items()[1]` but a distinct object, so only `compareById` matches it.
    formControl = new UntypedFormControl([{ id: 2, label: 'Two' }]);

    comparator: (o1: any, o2: any) => boolean = this.compareById;

    compareById(o1: ComparatorItem | null, o2: ComparatorItem | null): boolean {
        return !!o1 && !!o2 && o1.id === o2.id;
    }

    compareByReference(o1: ComparatorItem | null, o2: ComparatorItem | null): boolean {
        return o1 === o2;
    }

    useCompareById(): void {
        this.comparator = this.compareById;
    }

    useCompareByReference(): void {
        this.comparator = this.compareByReference;
    }

    /** Replaces every item with an equal-but-new object, the way an immutable refetch would. */
    reloadItems(): void {
        this.items.set(comparatorItems());
    }
}

@Component({
    imports: [KbqListModule, FormsModule],
    template: `
        <kbq-list-selection multiple="checkbox" [compareWith]="compareById" [(ngModel)]="selected">
            @for (item of items; track item.id) {
                <kbq-list-option [value]="item">{{ item.label }}</kbq-list-option>
            }
        </kbq-list-selection>
    `
})
class SelectionListWithComparatorAndModel {
    readonly optionInstances = viewChildren(KbqListOption);
    readonly items = comparatorItems();

    selected: ComparatorItem[] = [{ id: 3, label: 'Three' }];

    compareById = (o1: ComparatorItem | null, o2: ComparatorItem | null): boolean => !!o1 && !!o2 && o1.id === o2.id;
}

@Component({
    imports: [KbqListModule, ReactiveFormsModule],
    template: `
        <kbq-list-selection multiple="checkbox" [compareWith]="compareById" [formControl]="formControl">
            <kbq-list-option>No value</kbq-list-option>
            @for (item of items; track item.id) {
                <kbq-list-option [value]="item">{{ item.label }}</kbq-list-option>
            }
        </kbq-list-selection>
    `
})
class SelectionListWithValuelessOption {
    readonly optionInstances = viewChildren(KbqListOption);
    readonly items = comparatorItems();

    formControl = new UntypedFormControl([{ id: 2, label: 'Two' }]);

    // Dereferences both arguments: an option without a value must never reach it.
    compareById = (o1: ComparatorItem, o2: ComparatorItem): boolean => o1.id === o2.id;
}

@Component({
    imports: [KbqListModule, ReactiveFormsModule],
    template: `
        <kbq-list-selection [compareWith]="compareById" [formControl]="formControl">
            @for (item of items(); track item.id) {
                <kbq-list-option [value]="item">{{ item.label }}</kbq-list-option>
            }
        </kbq-list-selection>
    `
})
class SingleSelectionListWithComparator {
    readonly optionInstances = viewChildren(KbqListOption);
    readonly items = signal(comparatorItems());

    // A bare value rather than an array, the way a single-select form control carries it.
    formControl = new UntypedFormControl({ id: 2, label: 'Two' });

    compareById = (o1: ComparatorItem | null, o2: ComparatorItem | null): boolean => !!o1 && !!o2 && o1.id === o2.id;

    reloadItems(): void {
        this.items.set(comparatorItems());
    }
}

@Component({
    imports: [KbqListModule, ReactiveFormsModule],
    template: `
        <kbq-list-selection multiple="checkbox" [compareWith]="$any(compareById)" [formControl]="formControl">
            @for (item of items(); track item.id) {
                <kbq-list-option [value]="item">{{ item.label }}</kbq-list-option>
            }
        </kbq-list-selection>
    `
})
class SelectionListWithAsymmetricComparator {
    readonly optionInstances = viewChildren(KbqListOption);
    readonly items = signal(comparatorItems());

    // The model carries bare ids while the options carry objects.
    formControl = new UntypedFormControl([2]);

    compareById = (option: ComparatorItem | null, id: number): boolean => !!option && option.id === id;

    reloadItems(): void {
        this.items.set(comparatorItems());
    }
}

@Component({
    imports: [KbqListModule, ReactiveFormsModule],
    template: `
        <kbq-list-selection multiple="checkbox" [formControl]="formControl">
            <kbq-list-option [value]="null">Any</kbq-list-option>
            <kbq-list-option [value]="'a'">A</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListWithNullishValues {
    readonly optionInstances = viewChildren(KbqListOption);

    formControl = new UntypedFormControl([null]);
}

@Component({
    imports: [KbqListModule, ReactiveFormsModule],
    template: `
        <kbq-list-selection multiple="checkbox" [compareWith]="compareWith" [formControl]="formControl">
            @for (item of items; track item.id) {
                <kbq-list-option [value]="item">{{ item.label }}</kbq-list-option>
            }
        </kbq-list-selection>
    `
})
class SelectionListWithThrowingComparator {
    readonly optionInstances = viewChildren(KbqListOption);
    readonly items = comparatorItems();

    formControl = new UntypedFormControl([{ id: 2, label: 'Two' }]);

    compareWith = (): boolean => {
        throw new Error('comparator blew up');
    };
}

@Component({
    imports: [KbqListModule, ReactiveFormsModule],
    template: `
        <kbq-list-selection [formControl]="formControl">
            @for (item of items; track item) {
                <kbq-list-option [value]="item">{{ item }}</kbq-list-option>
            }
        </kbq-list-selection>
    `
})
class SingleSelectionListWithMultipleValues {
    readonly optionInstances = viewChildren(KbqListOption);
    readonly items = ['a', 'b', 'c'];

    // More entries than a single-selection list can hold: the model keeps only the last one, and the
    // options it dropped on the way must not be left believing they are still selected.
    formControl = new UntypedFormControl(['a', 'b']);
}

@Component({
    imports: [
        KbqListModule,
        FormsModule
    ],
    template: `
        <kbq-list-selection [multiple]="multiple()" [(ngModel)]="selected">
            <kbq-list-option [value]="'opt1'">Option 1</kbq-list-option>
            <kbq-list-option [value]="'opt2'">Option 2</kbq-list-option>
            <kbq-list-option [value]="'opt3'">Option 3</kbq-list-option>
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class SelectionListWithBoundMultiple {
    readonly multiple = signal<KbqMultipleInput>('checkbox');
    selected: string[] = [];
}

@Component({
    imports: [KbqListModule],
    template: `
        <kbq-list-selection multiple="false">
            <kbq-list-option [value]="'opt1'">Option 1</kbq-list-option>
            <kbq-list-option [value]="'opt2'">Option 2</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListMultipleFalse {}

@Component({
    imports: [KbqListModule],
    template: `
        <kbq-list-selection multiple="single">
            <kbq-list-option [value]="'opt1'">Option 1</kbq-list-option>
            <kbq-list-option [value]="'opt2'">Option 2</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListMultipleSingle {}

@Component({
    imports: [KbqListModule],
    template: `
        <kbq-list-selection multiple>
            <kbq-list-option [value]="'opt1'">Option 1</kbq-list-option>
            <kbq-list-option [value]="'opt2'">Option 2</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListBareMultiple {}

@Component({
    imports: [KbqListModule],
    template: `
        <kbq-list-selection autoSelect="true" [multiple]="multiple()">
            <kbq-list-option [value]="'opt1'">Option 1</kbq-list-option>
            <kbq-list-option [value]="'opt2'">Option 2</kbq-list-option>
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class SelectionListWithPinnedAutoSelect {
    readonly multiple = signal<KbqMultipleInput>('checkbox');
}

describe('KbqListSelection multiple mode', () => {
    const getList = (fixture: ComponentFixture<unknown>): KbqListSelection =>
        fixture.debugElement.query(By.directive(KbqListSelection)).componentInstance;

    const getOptions = (fixture: ComponentFixture<unknown>): KbqListOption[] =>
        fixture.debugElement.queryAll(By.directive(KbqListOption)).map(({ componentInstance }) => componentInstance);

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqListModule] }).compileComponents();
    });

    describe('static values', () => {
        it('should treat a bare multiple as the checkbox mode', () => {
            const fixture = TestBed.createComponent(SelectionListBareMultiple);

            fixture.detectChanges();

            expect(getList(fixture).multipleMode).toBe(MultipleMode.CHECKBOX);
            expect(getList(fixture).multiple).toBe(true);
        });

        it.each([
            ['multiple="false"', SelectionListMultipleFalse],
            ['multiple="single"', SelectionListMultipleSingle]
        ])('should treat %s as single selection', (_, hostType) => {
            const fixture = TestBed.createComponent(hostType);

            fixture.detectChanges();

            const list = getList(fixture);

            expect(list.multiple).toBe(false);
            expect(list.multipleMode).toBeNull();
            expect(list.selectionModel.isMultipleSelection()).toBe(false);
            expect(fixture.nativeElement.querySelector('kbq-pseudo-checkbox')).toBeNull();
        });

        it('should keep an explicitly set autoSelect when the mode default disagrees', () => {
            const fixture = TestBed.createComponent(SelectionListWithPinnedAutoSelect);

            fixture.detectChanges();

            expect(getList(fixture).multipleMode).toBe(MultipleMode.CHECKBOX);
            expect(getList(fixture).autoSelect).toBe(true);
        });
    });

    describe('changing the mode after initialization', () => {
        it('should render and drop the checkboxes', () => {
            const fixture = TestBed.createComponent(SelectionListWithBoundMultiple);

            fixture.detectChanges();

            expect(fixture.nativeElement.querySelectorAll('kbq-pseudo-checkbox').length).toBe(3);

            fixture.componentInstance.multiple.set(false);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelectorAll('kbq-pseudo-checkbox').length).toBe(0);

            fixture.componentInstance.multiple.set('checkbox');
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelectorAll('kbq-pseudo-checkbox').length).toBe(3);
        });

        it('should update aria-multiselectable', () => {
            const fixture = TestBed.createComponent(SelectionListWithBoundMultiple);

            fixture.detectChanges();

            const list = fixture.debugElement.query(By.directive(KbqListSelection)).nativeElement;

            expect(list.getAttribute('aria-multiselectable')).toBe('true');

            fixture.componentInstance.multiple.set('single');
            fixture.detectChanges();

            expect(list.getAttribute('aria-multiselectable')).toBe('false');
        });

        it('should swap the selection model instead of leaving it on the previous multiplicity', () => {
            const fixture = TestBed.createComponent(SelectionListWithBoundMultiple);

            fixture.detectChanges();

            expect(getList(fixture).selectionModel.isMultipleSelection()).toBe(true);

            fixture.componentInstance.multiple.set(false);
            fixture.detectChanges();

            expect(getList(fixture).selectionModel.isMultipleSelection()).toBe(false);
        });

        it('should keep the first selected option when narrowing to single selection', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithBoundMultiple);

            fixture.detectChanges();
            flush();

            const options = getOptions(fixture);

            options.forEach((option) => option.setSelected(true));
            fixture.detectChanges();

            expect(getList(fixture).getSelectedOptionValues()).toEqual(['opt1', 'opt2', 'opt3']);

            fixture.componentInstance.multiple.set(false);
            fixture.detectChanges();
            flush();

            expect(options.map((option) => option.selected)).toEqual([true, false, false]);
            expect(getList(fixture).selectionModel.selected).toEqual([options[0]]);
            expect(fixture.componentInstance.selected).toEqual(['opt1']);
        }));

        it('should keep every selected option when widening to multiple selection', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithBoundMultiple);

            fixture.componentInstance.multiple.set(false);
            fixture.detectChanges();
            flush();

            const options = getOptions(fixture);

            options[1].setSelected(true);
            fixture.detectChanges();

            fixture.componentInstance.multiple.set('checkbox');
            fixture.detectChanges();
            flush();

            expect(options.map((option) => option.selected)).toEqual([false, true, false]);
            expect(getList(fixture).selectionModel.isMultipleSelection()).toBe(true);
        }));

        it('should let the swapped model keep driving the options', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithBoundMultiple);

            fixture.detectChanges();
            flush();

            fixture.componentInstance.multiple.set(false);
            fixture.detectChanges();
            flush();

            const options = getOptions(fixture);

            // Selecting through the model is what the list's subscription mirrors back onto the option.
            // Without it the option's own state lags behind, and the toggle below silently does nothing.
            getList(fixture).selectionModel.select(options[2]);
            fixture.detectChanges();

            expect(options[2].selected).toBe(true);

            options[2].toggle();
            fixture.detectChanges();

            expect(options[2].selected).toBe(false);
            expect(getList(fixture).selectionModel.selected).toEqual([]);
        }));

        it('should re-derive autoSelect and noUnselectLast the consumer left alone', () => {
            const fixture = TestBed.createComponent(SelectionListWithBoundMultiple);

            fixture.detectChanges();

            const list = getList(fixture);

            expect(list.autoSelect).toBe(false);
            expect(list.noUnselectLast).toBe(false);

            fixture.componentInstance.multiple.set(false);
            fixture.detectChanges();

            expect(list.autoSelect).toBe(true);
            expect(list.noUnselectLast).toBe(true);
        });

        it('should leave a pinned autoSelect alone across a mode change', () => {
            const fixture = TestBed.createComponent(SelectionListWithPinnedAutoSelect);

            fixture.detectChanges();

            fixture.componentInstance.multiple.set(false);
            fixture.detectChanges();

            expect(getList(fixture).autoSelect).toBe(true);

            fixture.componentInstance.multiple.set('checkbox');
            fixture.detectChanges();

            expect(getList(fixture).autoSelect).toBe(true);
        });

        it('should stop handling Ctrl + A once the list is single-selection', () => {
            const fixture = TestBed.createComponent(SelectionListWithBoundMultiple);

            fixture.detectChanges();

            const list = getList(fixture);

            fixture.componentInstance.multiple.set(false);
            fixture.detectChanges();

            const selectAllEvent = createKeyboardEvent('keydown', A);

            Object.defineProperty(selectAllEvent, 'ctrlKey', { get: () => true });

            list.onKeyDown(selectAllEvent);
            fixture.detectChanges();

            expect(list.getSelectedOptionValues()).toEqual([]);
        });
    });
});
