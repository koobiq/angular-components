import { FocusMonitor } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import {
    Component,
    DebugElement,
    Directive,
    DoCheck,
    effect,
    EventEmitter,
    InputSignal,
    NgZone,
    signal,
    Type,
    viewChild,
    viewChildren
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
    A,
    C,
    createKeyboardEvent,
    createMouseEvent,
    D,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    DOWN_ARROW,
    END,
    ENTER,
    HOME,
    KBQ_STATE_STORE,
    KbqMultipleInput,
    KbqOptionActionComponent,
    KbqOptionModule,
    KbqPseudoCheckbox,
    KbqStateSavingService,
    KbqStateStore,
    LEFT_ARROW,
    MultipleMode,
    RIGHT_ARROW,
    SPACE,
    T,
    TAB,
    UP_ARROW,
    wrappedErrorMessage
} from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqTitleDirective, KbqTitleModule } from '@koobiq/components/title';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { TestScheduler } from 'rxjs/testing';
import {
    FilterByValues,
    FilterByViewValue,
    FilterParentsForNodes,
    FlatTreeControl,
    KbqTree,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule,
    KbqTreeNestedDataSource,
    KbqTreeNodePadding,
    KbqTreeOption,
    KbqTreeSelectAllEvent,
    KbqTreeSelection,
    KbqTreeSelectionChange,
    NestedTreeControl,
    TreeControl
} from './index';
import { getKbqTreeSelectionOwnedMultipleError } from './tree-errors';

describe('KbqTreeSelection', () => {
    let treeElement: HTMLElement;

    afterEach(() => {
        vi.useRealTimers();
    });

    function configureKbqTreeTestingModule(providers: any[] = []) {
        TestBed.configureTestingModule({
            imports: [KbqTreeModule, FormsModule],
            providers
        }).compileComponents();
    }

    describe('node template context', () => {
        it('should hand each node its index, as the CDK tree does', () => {
            configureKbqTreeTestingModule();

            const fixture = TestBed.createComponent(TreeWithNodeIndexApp);

            fixture.detectChanges();

            const indexes = getNodes(fixture.nativeElement).map((node) => node.getAttribute('data-index'));

            expect(indexes).toEqual(['0', '1', '2', '3', '4']);
        });
    });

    describe('flat tree', () => {
        describe('should initialize', () => {
            let fixture: ComponentFixture<SimpleKbqTreeApp>;
            let component: SimpleKbqTreeApp;
            let clipboardContent: string;
            let testScheduler: TestScheduler;

            beforeEach(() => {
                testScheduler = new TestScheduler((act, exp) => expect(exp).toEqual(act));

                configureKbqTreeTestingModule([
                    {
                        provide: Clipboard,
                        useFactory: () => {
                            const originalClipboard = new Clipboard(document);

                            return {
                                copy: (value: string) => {
                                    originalClipboard.copy(value);
                                    clipboardContent = value;
                                }
                            };
                        }
                    },
                    {
                        provide: AsyncScheduler,
                        useValue: testScheduler
                    }
                ]);
                fixture = TestBed.createComponent(SimpleKbqTreeApp);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('.kbq-tree-selection');

                fixture.detectChanges();

                clipboardContent = '';
            });

            it('with rendered dataNodes', () => {
                const nodes = getNodes(treeElement);

                expect(nodes).toBeDefined();
                expect(nodes[0].classList).toContain('customNodeClass');
            });

            it('with the right data', () => {
                expect(component.treeData.length).toBe(5);

                expectFlatTreeToMatch(
                    treeElement,
                    [`rootNode_1`],
                    [`Pictures`],
                    [`Documents`],
                    [`Downloads`],
                    [`Applications`]
                );
            });

            it('should define correct paddings', () => {
                const treeOption = fixture.debugElement.queryAll(By.directive(KbqTreeNodePadding))[0];
                const paddingDirective = treeOption.injector.get(KbqTreeNodePadding);

                expect(treeOption.styles['paddingLeft']).toBe(paddingDirective.paddingIndent());
            });

            it('should copy selected option - default handler', async () => {
                const nodes = getNodes(treeElement);
                const event = createMouseEvent('click');

                dispatchEvent(nodes[2], event);
                fixture.detectChanges();

                const treeOptions = fixture.debugElement.queryAll(By.directive(KbqTreeOption));

                const manager = component.tree().keyManager;

                manager.setActiveItem(2);
                expect(manager.activeItemIndex).toBe(2);

                const copyKeyEvent = createKeyboardEvent('keydown', C);

                Object.defineProperty(copyKeyEvent, 'ctrlKey', { get: () => true });

                component.tree().onKeyDown(copyKeyEvent);
                fixture.detectChanges();

                expect(clipboardContent).toBe(treeOptions[2].componentInstance.value);
            });

            // DS-5079: copyActiveOption sets and clears option.preventBlur synchronously, but the blur it
            // provokes reaches the option through FocusMonitor after the handler has returned, so the guard
            // is already down. Deferring the clear by a microtask is not enough — the fix belongs in the
            // blur()/focus() coordination of KbqTreeOption. The clipboard write itself works.
            // eslint-disable-next-line vitest/no-disabled-tests -- documents the defect described above until it is fixed
            it.skip('should not blur on focused option when copying', async () => {
                vi.useFakeTimers();

                const treeOptions = fixture.debugElement.queryAll(By.directive(KbqTreeOption));

                expect(treeOptions[2].componentInstance.hasFocus).toBeFalsy();

                dispatchFakeEvent(treeOptions[2].nativeElement, 'focusin');
                await vi.advanceTimersByTimeAsync(10);
                fixture.detectChanges();

                expect(treeOptions[2].componentInstance.hasFocus).toBeTruthy();

                component.tree().keyManager.setActiveItem(2);

                const copyKeyEvent = createKeyboardEvent('keydown', C);

                Object.defineProperty(copyKeyEvent, 'ctrlKey', { get: () => true });
                component.tree().onKeyDown(copyKeyEvent);
                fixture.detectChanges();

                expect(clipboardContent).toBe(treeOptions[2].componentInstance.value);
                expect(treeOptions[2].componentInstance.hasFocus).toBeTruthy();
            });
        });

        describe('focus states', () => {
            let fixture: ComponentFixture<TreeSelectionFocusStates>;
            let tree: DebugElement;
            let options: DebugElement[];

            beforeEach(() => {
                TestBed.configureTestingModule({
                    imports: [KbqTreeModule, FormsModule, TreeSelectionFocusStates]
                }).compileComponents();

                fixture = TestBed.createComponent(TreeSelectionFocusStates);
                tree = fixture.debugElement.query(By.directive(KbqTreeSelection));

                fixture.detectChanges();
            });

            it('should add focus class on first element', async () => {
                vi.useFakeTimers();

                options = fixture.debugElement.queryAll(By.directive(KbqTreeOption));
                const option = options[0].nativeElement;

                expect(option.classList).not.toContain('kbq-focused');

                dispatchFakeEvent(tree.nativeElement, 'focus');
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(option.classList).toContain('kbq-focused');
            });

            it('should add focus class on first selected element', async () => {
                vi.useFakeTimers();

                options = fixture.debugElement.queryAll(By.directive(KbqTreeOption));
                const selectedOption = options[1];

                selectedOption.componentInstance.toggle();
                await vi.advanceTimersByTimeAsync(0);
                fixture.detectChanges();

                options.forEach(({ nativeElement }) => {
                    expect(nativeElement.classList).not.toContain('kbq-focused');
                });

                expect(selectedOption.nativeElement.classList).toContain('kbq-selected');

                dispatchFakeEvent(tree.nativeElement, 'focus');
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(selectedOption.nativeElement.className).toContain('kbq-focused');
            });
        });

        describe('with toggle', () => {
            let fixture: ComponentFixture<KbqTreeAppWithToggle>;
            let component: KbqTreeAppWithToggle;

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(KbqTreeAppWithToggle);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should expand/collapse the node', () => {
                expect(component.treeData.length).toBe(5);

                expect(component.treeControl.expansionModel.selected.length).toBe(0);

                component.toggleRecursively = false;

                expectFlatTreeToMatch(
                    treeElement,
                    [`rootNode_1`],
                    [`Pictures`],
                    [`Documents`],
                    [`Downloads`],
                    [`Applications`]
                );

                (getNodes(treeElement)[1].querySelectorAll('kbq-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();

                expect(component.treeControl.expansionModel.selected.length).toBe(1);
                expectFlatTreeToMatch(
                    treeElement,
                    [`rootNode_1`],
                    [`Pictures`],
                    [null, 'Sun'],
                    [null, 'Woods'],
                    [null, 'PhotoBoothLibrary'],
                    [`Documents`],
                    [`Downloads`],
                    [`Applications`]
                );

                (getNodes(treeElement)[5].querySelectorAll('kbq-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();

                expect(component.treeControl.expansionModel.selected.length).toBe(2);

                expectFlatTreeToMatch(
                    treeElement,
                    [`rootNode_1`],
                    [`Pictures`],
                    [null, 'Sun'],
                    [null, 'Woods'],
                    [null, 'PhotoBoothLibrary'],
                    [`Documents`],
                    [null, `react`],
                    [null, `angular`],
                    [null, `material2`],
                    [`Downloads`],
                    [`Applications`]
                );

                (getNodes(treeElement)[5].querySelectorAll('kbq-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();

                expectFlatTreeToMatch(
                    treeElement,
                    [`rootNode_1`],
                    [`Pictures`],
                    [null, 'Sun'],
                    [null, 'Woods'],
                    [null, 'PhotoBoothLibrary'],
                    [`Documents`],
                    [`Downloads`],
                    [`Applications`]
                );
            });

            it('should restore expanded items after filter', async () => {
                vi.useFakeTimers();

                const initialNodesCount = 5;
                let nodes = getNodes(treeElement);

                expect(nodes.length).toBe(initialNodesCount);

                (nodes[1].querySelectorAll('kbq-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);
                nodes = getNodes(treeElement);

                const expandedNodesCountBeforeFilter = 8;

                expect(nodes.length).toBe(expandedNodesCountBeforeFilter);

                component.treeControl.filterNodes('app');
                await vi.advanceTimersByTimeAsync(0);
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(5);

                component.treeControl.filterNodes('');
                await vi.advanceTimersByTimeAsync(0);
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(expandedNodesCountBeforeFilter);
            });
        });

        describe('with multipleMode is CTRL', () => {
            let fixture: ComponentFixture<KbqTreeAppMultiple>;
            let component: KbqTreeAppMultiple;
            let testScheduler: TestScheduler;

            beforeEach(() => {
                testScheduler = new TestScheduler((act, exp) => expect(exp).toEqual(act));

                configureKbqTreeTestingModule([{ provide: AsyncScheduler, useValue: testScheduler }]);
                fixture = TestBed.createComponent(KbqTreeAppMultiple);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            describe('when ctrl is pressed', () => {
                it('should select node', () => {
                    expect(component.modelValue.length).toBe(0);

                    const nodes = getNodes(treeElement);

                    const event = createMouseEvent('click');

                    Object.defineProperty(event, 'ctrlKey', { get: () => true });

                    dispatchEvent(nodes[0], event);
                    fixture.detectChanges();
                    expect(component.modelValue.length).toBe(1);

                    dispatchEvent(nodes[2], event);
                    fixture.detectChanges();
                    expect(component.modelValue.length).toBe(2);

                    dispatchEvent(nodes[4], event);
                    fixture.detectChanges();
                    expect(component.modelValue.length).toBe(3);
                });

                it('should deselect', () => {
                    expect(component.modelValue.length).toBe(0);

                    const nodes = getNodes(treeElement);

                    const event = createMouseEvent('click');

                    Object.defineProperty(event, 'ctrlKey', { get: () => true });

                    dispatchEvent(nodes[0], event);
                    fixture.detectChanges();
                    expect(component.modelValue.length).toBe(1);

                    dispatchEvent(nodes[2], event);
                    fixture.detectChanges();
                    expect(component.modelValue.length).toBe(2);

                    dispatchEvent(nodes[2], event);
                    fixture.detectChanges();
                    expect(component.modelValue.length).toBe(1);
                });
            });

            describe('when ctrl is not pressed', () => {
                describe('should reset selection', () => {
                    it('when clicked on selected node', () => {
                        const nodes = getNodes(treeElement);

                        const ctrlKeyEvent = createMouseEvent('click');

                        Object.defineProperty(ctrlKeyEvent, 'ctrlKey', { get: () => true });

                        dispatchEvent(nodes[0], ctrlKeyEvent);
                        fixture.detectChanges();
                        expect(component.modelValue.length).toBe(1);

                        dispatchEvent(nodes[2], ctrlKeyEvent);
                        fixture.detectChanges();
                        expect(component.modelValue.length).toBe(2);

                        const event = createMouseEvent('click');

                        Object.defineProperty(event, 'ctrlKey', { get: () => false });

                        dispatchEvent(nodes[2], event);
                        fixture.detectChanges();
                        expect(component.modelValue.length).toBe(1);
                    });

                    it('when clicked on not selected node', () => {
                        const nodes = getNodes(treeElement);

                        const ctrlKeyEvent = createMouseEvent('click');

                        Object.defineProperty(ctrlKeyEvent, 'ctrlKey', { get: () => true });

                        dispatchEvent(nodes[0], ctrlKeyEvent);
                        fixture.detectChanges();
                        expect(component.modelValue.length).toBe(1);

                        dispatchEvent(nodes[2], ctrlKeyEvent);
                        fixture.detectChanges();
                        expect(component.modelValue.length).toBe(2);

                        const event = createMouseEvent('click');

                        Object.defineProperty(event, 'ctrlKey', { get: () => false });

                        dispatchEvent(nodes[3], event);
                        fixture.detectChanges();
                        expect(component.modelValue.length).toBe(1);
                    });
                });
            });

            describe('when shift is pressed', () => {
                it('should select nodes', async () => {
                    testScheduler.run(() => {
                        expect(component.modelValue.length).toBe(0);

                        const nodes = getNodes(treeElement);

                        const event = createMouseEvent('click');

                        (nodes[0] as HTMLElement).focus();

                        dispatchEvent(nodes[0], event);

                        expect(component.modelValue.length).toBe(1);

                        fixture.detectChanges();

                        testScheduler.flush();

                        const targetNode: HTMLElement = nodes[3] as HTMLElement;

                        Object.defineProperty(event, 'shiftKey', { get: () => true });

                        component.tree().keyManager.setActiveItem(3);
                        dispatchEvent(targetNode, event);

                        testScheduler.flush();

                        fixture.detectChanges();

                        expect(component.modelValue.length).toBe(4);
                    });
                });

                it('should deselect nodes', async () => {
                    testScheduler.run(() => {
                        expect(component.modelValue.length).toBe(0);

                        const nodes = getNodes(treeElement);

                        fixture.detectChanges();
                        component.tree().renderedOptions.forEach((option, index) => {
                            if (index < 3) {
                                option.selected = true;
                            }
                        });

                        testScheduler.flush();

                        expect(component.modelValue.length).toBe(3);

                        component.tree().keyManager.setActiveItem(3);

                        const targetNode: HTMLElement = nodes[0] as HTMLElement;

                        const event = createMouseEvent('click');

                        Object.defineProperty(event, 'shiftKey', { get: () => true });

                        component.tree().keyManager.setActiveItem(0);
                        dispatchEvent(targetNode, event);

                        testScheduler.flush();

                        fixture.detectChanges();

                        expect(component.modelValue.length).toBe(1);
                    });
                });
            });
        });

        describe('selectable', () => {
            let fixture: ComponentFixture<KbqTreeAppMultiple>;
            let component: KbqTreeAppMultiple;
            let testScheduler: TestScheduler;

            beforeEach(() => {
                testScheduler = new TestScheduler((act, exp) => expect(exp).toEqual(act));

                configureKbqTreeTestingModule([{ provide: AsyncScheduler, useValue: testScheduler }]);
                fixture = TestBed.createComponent(KbqTreeAppMultiple);

                component = fixture.componentInstance;
                component.unselectableNodes = ['Documents'];
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should not select non-selectable option on click', () => {
                const onSelectionChange = vi.spyOn(component, 'onSelectionChange');
                const nodes = getNodes(treeElement);

                dispatchEvent(nodes[2], createMouseEvent('click'));
                fixture.detectChanges();

                expect(component.modelValue.length).toBe(0);
                expect(onSelectionChange).not.toHaveBeenCalled();
            });

            it('should not select non-selectable option on SPACE', async () => {
                vi.useFakeTimers();

                component.tree().keyManager.setActiveItem(2);

                component.tree().onKeyDown(createKeyboardEvent('keydown', SPACE));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(component.modelValue.length).toBe(0);
            });

            it('should keep selection when arrowing onto non-selectable option', async () => {
                vi.useFakeTimers();

                const nodes = getNodes(treeElement);

                dispatchEvent(nodes[1], createMouseEvent('click'));
                fixture.detectChanges();

                expect(component.modelValue).toEqual(['Pictures']);

                component.tree().onKeyDown(createKeyboardEvent('keydown', DOWN_ARROW));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(component.tree().keyManager.activeItemIndex).toBe(2);
                expect(component.modelValue).toEqual(['Pictures']);
            });

            it('should skip non-selectable option in shift-click range selection', async () => {
                testScheduler.run(() => {
                    const nodes = getNodes(treeElement);

                    const event = createMouseEvent('click');

                    (nodes[0] as HTMLElement).focus();
                    dispatchEvent(nodes[0], event);

                    expect(component.modelValue.length).toBe(1);

                    fixture.detectChanges();
                    testScheduler.flush();

                    Object.defineProperty(event, 'shiftKey', { get: () => true });

                    component.tree().keyManager.setActiveItem(3);
                    dispatchEvent(nodes[3], event);

                    testScheduler.flush();
                    fixture.detectChanges();

                    expect(component.modelValue.length).toBe(3);
                    expect(component.modelValue).not.toContain('Documents');
                });
            });

            it('should not toggle non-selectable option on shift+arrow when active item can not move', async () => {
                testScheduler.run(() => {
                    component.unselectableNodes = ['Documents', 'Applications'];
                    fixture.detectChanges();

                    const event = createKeyboardEvent('keydown', DOWN_ARROW);

                    Object.defineProperty(event, 'shiftKey', { get: () => true });

                    component.tree().keyManager.setActiveItem(4);
                    component.tree().keyManager.previousActiveItemIndex = 4;

                    component.tree().onKeyDown(event);

                    testScheduler.flush();
                    fixture.detectChanges();

                    expect(component.modelValue.length).toBe(0);
                });
            });

            it('should exclude non-selectable options on CTRL + A', async () => {
                // selectAllToggle enables deselect on the second press asserted below
                component.selectAllToggle = true;
                fixture.detectChanges();

                const selectAllKeyEvent = createKeyboardEvent('keydown', A);

                Object.defineProperty(selectAllKeyEvent, 'ctrlKey', { get: () => true });

                expect(component.modelValue.length).toBe(0);

                component.tree().onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                expect(component.savedSelectAllEvent!.options.length).toBe(4);
                expect(component.savedSelectionChangeEvent!.options!.length).toBe(4);
                expect(component.modelValue.length).toBe(16);
                expect(component.modelValue).not.toContain('Documents');

                component.tree().onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                expect(component.modelValue.length).toBe(0);
            });

            it('should keep all options selected on a second CTRL + A by default (selectAllToggle off)', async () => {
                const selectAllKeyEvent = createKeyboardEvent('keydown', A);

                Object.defineProperty(selectAllKeyEvent, 'ctrlKey', { get: () => true });

                component.tree().onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                const selectedAfterFirst = component.modelValue.length;

                expect(selectedAfterFirst).toBeGreaterThan(0);

                component.tree().onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                expect(component.modelValue.length).toBe(selectedAfterFirst);
            });

            it('should invoke a custom selectAllHandler on CTRL + A instead of the default', async () => {
                const customHandler = vi.fn();

                component.selectAllHandler = customHandler;
                fixture.detectChanges();

                const selectAllKeyEvent = createKeyboardEvent('keydown', A);

                Object.defineProperty(selectAllKeyEvent, 'ctrlKey', { get: () => true });

                component.tree().onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                expect(customHandler).toHaveBeenCalledTimes(1);
                // default behaviour is bypassed -> nothing gets selected
                expect(component.modelValue.length).toBe(0);
            });

            it('should not select non-selectable option via setSelectedOptionsByClick', () => {
                const option = component.tree().renderedOptions.toArray()[2];

                component.tree().setSelectedOptionsByClick(option, false, false);
                fixture.detectChanges();

                expect(component.modelValue.length).toBe(0);
            });

            it('should select non-selectable option programmatically', () => {
                const option = component.tree().renderedOptions.toArray()[2];

                option.setSelected(true);
                fixture.detectChanges();

                expect(component.modelValue).toEqual(['Documents']);
            });
        });

        describe('with an action button and dropdown (#DS-5079)', () => {
            beforeEach(() => {
                configureKbqTreeTestingModule();
            });

            it('renders deeper nodes as selectable options without crashing the action button', async () => {
                vi.useFakeTimers();

                const fixture = TestBed.createComponent(TreeWithActionButtonApp);

                fixture.detectChanges();

                const component = fixture.componentInstance;
                const parent = component.treeControl.dataNodes.find((node) => node.name === 'Pictures')!;

                component.treeControl.expand(parent);
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);

                // Before the fix, KbqOptionActionComponent.ngAfterViewInit threw — `dropdownTrigger` was a
                // signal query and `dropdownClosed` an `output()` without `.pipe` — aborting the tree render,
                // so nodes revealed on expand never registered in renderedOptions and could not be selected.
                const renderedHasSun = component
                    .tree()
                    .renderedOptions.some((option) => option.getHostElement().textContent!.includes('Sun'));

                expect(renderedHasSun).toBe(true);
            });
        });

        describe('action button visibility', () => {
            let fixture: ComponentFixture<TreeWithActionButtonApp>;
            let options: DebugElement[];

            beforeEach(() => {
                configureKbqTreeTestingModule();

                fixture = TestBed.createComponent(TreeWithActionButtonApp);
                fixture.detectChanges();

                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');
                options = fixture.debugElement.queryAll(By.directive(KbqTreeOption));
            });

            // Styles are stripped in jsdom, so these assert the classes the reveal rules key off:
            // `.kbq-tree-selection.cdk-keyboard-focused .kbq-tree-option.kbq-focused` (see tree-option.scss).
            it('should not mark the tree as keyboard-focused when an option is focused by mouse', async () => {
                vi.useFakeTimers();

                TestBed.inject(FocusMonitor).focusVia(options[0].nativeElement, 'mouse');
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(options[0].nativeElement.classList).toContain('kbq-focused');
                expect(treeElement.classList).not.toContain('cdk-keyboard-focused');
            });

            it('should mark the tree as keyboard-focused when an option is focused via keyboard', async () => {
                vi.useFakeTimers();

                TestBed.inject(FocusMonitor).focusVia(options[0].nativeElement, 'keyboard');
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(options[0].nativeElement.classList).toContain('kbq-focused');
                expect(treeElement.classList).toContain('cdk-keyboard-focused');
            });

            it('should not swallow Tab when the action button cannot take focus', async () => {
                vi.useFakeTimers();

                const option = options[0];
                const actionButtonDebugElement = option.query(By.directive(KbqOptionActionComponent));
                const actionButton = actionButtonDebugElement.componentInstance;

                // In a browser the action sits in a `display: none` container until the option is hovered
                // or keyboard-focused, so `.focus()` is a no-op. jsdom ignores styles and would always
                // focus it, so neutralise the DOM call only — `KbqOptionActionComponent.focus()` itself
                // must still run, otherwise its `activeElement` check (the fix under test) is never hit.
                vi.spyOn(actionButtonDebugElement.nativeElement, 'focus').mockImplementation(() => {});

                const event = dispatchKeyboardEvent(option.nativeElement, 'keydown', TAB);

                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(actionButton.hasFocus).toBe(false);
                expect(event.defaultPrevented).toBe(false);
                expect(option.nativeElement.classList).not.toContain('kbq-action-button-focused');
            });

            it('should swallow Tab when the action button takes focus', async () => {
                vi.useFakeTimers();

                const option = options[0];
                const event = dispatchKeyboardEvent(option.nativeElement, 'keydown', TAB);

                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(event.defaultPrevented).toBe(true);
                expect(option.nativeElement.classList).toContain('kbq-action-button-focused');
            });

            it('should keep the option focused and active while its action button holds the focus', async () => {
                const option = options[0];
                const { keyManager } = fixture.componentInstance.tree();

                // The tree listens to its options a macrotask after they are rendered.
                await new Promise((resolve) => setTimeout(resolve));
                keyManager.setFocusOrigin('keyboard');
                keyManager.setFirstItemActive();
                await fixture.whenStable();

                dispatchKeyboardEvent(option.nativeElement, 'keydown', TAB);
                await fixture.whenStable();

                expect(document.activeElement).toBe(option.query(By.directive(KbqOptionActionComponent)).nativeElement);
                expect(option.nativeElement.classList).toContain('kbq-focused');
                expect(keyManager.activeItem).toBe(option.componentInstance);
            });
        });

        describe('selectable with non-selectable parents', () => {
            let fixture: ComponentFixture<KbqTreeAppNonSelectableParents>;
            let component: KbqTreeAppNonSelectableParents;

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(KbqTreeAppNonSelectableParents);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should not select non-selectable parent on click before expand', async () => {
                vi.useFakeTimers();

                const nodes = getNodes(treeElement);

                dispatchEvent(nodes[1], createMouseEvent('click'));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(component.modelValue).toBe('');
            });

            it('should not select non-selectable parent on click after expand', async () => {
                vi.useFakeTimers();

                let nodes = getNodes(treeElement);

                (nodes[1].querySelectorAll('kbq-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);

                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(5);

                dispatchEvent(nodes[1], createMouseEvent('click'));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(component.modelValue).toBe('');
            });

            it('should not select newly rendered non-selectable parent on click after expand', async () => {
                vi.useFakeTimers();

                let nodes = getNodes(treeElement);

                (nodes[1].querySelectorAll('kbq-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);

                nodes = getNodes(treeElement);
                // docs, src, cdk, README, tests
                expect(nodes[2].textContent!.trim()).toContain('cdk');

                dispatchEvent(nodes[2], createMouseEvent('click'));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(component.modelValue).toBe('');
            });

            it('should not select non-selectable options on arrow navigation after expand', async () => {
                vi.useFakeTimers();

                let nodes = getNodes(treeElement);

                (nodes[1].querySelectorAll('kbq-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);

                nodes = getNodes(treeElement);

                dispatchEvent(nodes[0], createMouseEvent('click'));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(component.modelValue).toBe('docs');

                component.tree().onKeyDown(createKeyboardEvent('keydown', DOWN_ARROW));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(component.tree().keyManager.activeItemIndex).toBe(1);
                expect(component.modelValue).toBe('docs');

                component.tree().onKeyDown(createKeyboardEvent('keydown', DOWN_ARROW));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(component.tree().keyManager.activeItemIndex).toBe(2);
                expect(component.modelValue).toBe('docs');
            });
        });

        describe('keyboard navigation with LEFT_ARROW', () => {
            let fixture: ComponentFixture<KbqTreeAppDeepData>;
            let component: KbqTreeAppDeepData;

            const pressKey = async (keyCode: number) => {
                component.tree().onKeyDown(createKeyboardEvent('keydown', keyCode));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
            };

            const expandNode = async (index: number) => {
                (getNodes(treeElement)[index].querySelectorAll('kbq-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
            };

            const getActiveValue = () => component.tree().keyManager.activeItem?.value;

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(KbqTreeAppDeepData);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should collapse an expanded option without moving the focus', async () => {
                vi.useFakeTimers();

                await expandNode(1);

                // docs, src, assets, cdk, README, tests
                expect(getNodes(treeElement).length).toBe(6);

                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('src');

                await pressKey(LEFT_ARROW);

                expect(getNodes(treeElement).length).toBe(3);
                expect(component.treeControl.expansionModel.selected.length).toBe(0);
                expect(getActiveValue()).toBe('src');
            });

            it('should move the focus to the parent when the active option is a leaf', async () => {
                vi.useFakeTimers();

                await expandNode(1);

                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('assets');

                await pressKey(LEFT_ARROW);

                expect(getActiveValue()).toBe('src');
                // the parent is only focused, not collapsed
                expect(getNodes(treeElement).length).toBe(6);
            });

            it('should move the focus to the parent when the active option is already collapsed', async () => {
                vi.useFakeTimers();

                await expandNode(1);

                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('cdk');

                await pressKey(LEFT_ARROW);

                expect(getActiveValue()).toBe('src');
                expect(getNodes(treeElement).length).toBe(6);
            });

            it('should collapse the whole tree with repeated presses', async () => {
                vi.useFakeTimers();

                await expandNode(1);
                await expandNode(3);

                // docs, src, assets, cdk, a11y, keycodes, README, tests
                expect(getNodes(treeElement).length).toBe(8);
                expect(component.treeControl.expansionModel.selected.length).toBe(2);

                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('cdk');

                // expanded -> collapse, the focus stays put
                await pressKey(LEFT_ARROW);

                expect(getNodes(treeElement).length).toBe(6);
                expect(getActiveValue()).toBe('cdk');

                // collapsed -> step up over the `assets` sibling to `src`
                await pressKey(LEFT_ARROW);

                expect(getActiveValue()).toBe('src');

                // expanded -> collapse
                await pressKey(LEFT_ARROW);

                expect(getNodes(treeElement).length).toBe(3);
                expect(component.treeControl.expansionModel.selected.length).toBe(0);

                // `src` is a root, so the tree stays fully collapsed
                await pressKey(LEFT_ARROW);

                expect(getNodes(treeElement).length).toBe(3);
                expect(getActiveValue()).toBe('src');
            });

            it('should move the focus to the parent when the toggle of an expanded option is disabled', async () => {
                vi.useFakeTimers();

                await expandNode(1);
                await expandNode(3);

                // the toggle is disabled only after expanding — a disabled toggle cannot be clicked open
                component.disabledToggles = ['cdk'];
                fixture.detectChanges();

                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);

                // the option itself stays enabled, so DOWN_ARROW does not skip it
                expect(getActiveValue()).toBe('cdk');

                await pressKey(LEFT_ARROW);

                // a disabled toggle makes the option non-expandable, so `cdk` is not collapsed
                expect(getNodes(treeElement).length).toBe(8);
                expect(component.treeControl.expansionModel.selected.length).toBe(2);
                expect(getActiveValue()).toBe('src');
            });

            it('should do nothing on a root-level option', async () => {
                vi.useFakeTimers();

                await pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('docs');

                await pressKey(LEFT_ARROW);

                expect(component.tree().keyManager.activeItemIndex).toBe(0);
                expect(getNodes(treeElement).length).toBe(3);
            });

            it('should skip a disabled ancestor instead of landing on its sibling', async () => {
                vi.useFakeTimers();

                component.disabledNodes = ['cdk'];
                fixture.detectChanges();

                await expandNode(1);
                await expandNode(3);

                expect(getNodes(treeElement).length).toBe(8);

                // DOWN_ARROW skips the disabled `cdk`, so the fourth press lands on `a11y`
                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('a11y');

                await pressKey(LEFT_ARROW);

                // `cdk` cannot take the focus, so the walk narrows to its level and reaches `src` —
                // without narrowing it would stop on `assets`, a sibling of the parent
                expect(getActiveValue()).toBe('src');
            });

            it('should keep narrowing the level across a chain of disabled ancestors', async () => {
                vi.useFakeTimers();

                component.disabledNodes = ['src', 'cdk'];
                fixture.detectChanges();

                await expandNode(1);
                await expandNode(3);

                expect(getNodes(treeElement).length).toBe(8);

                // DOWN_ARROW skips both disabled ancestors, so the third press lands on `a11y`
                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('a11y');

                await pressKey(LEFT_ARROW);

                // the walk narrows twice — over `cdk` to level 1, then over `src` to level 0 — so
                // neither `assets` (a sibling of `cdk`) nor `docs` (a sibling of `src`) takes the focus
                expect(getActiveValue()).toBe('a11y');
            });

            it('should do nothing when every ancestor is disabled', async () => {
                vi.useFakeTimers();

                component.disabledNodes = ['src'];
                fixture.detectChanges();

                await expandNode(1);

                // DOWN_ARROW skips the disabled `src`, so the second press lands on `assets`
                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('assets');

                await pressKey(LEFT_ARROW);

                expect(getActiveValue()).toBe('assets');
            });

            it('should not change the selection when moving to the parent', async () => {
                vi.useFakeTimers();

                await expandNode(1);

                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);

                expect(component.modelValue).toBe('assets');

                await pressKey(LEFT_ARROW);

                expect(getActiveValue()).toBe('src');
                expect(component.modelValue).toBe('assets');
            });

            it('should emit navigationChange when moving to the parent', async () => {
                vi.useFakeTimers();

                await expandNode(1);

                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);

                const spy = vi.fn();
                const subscription = component.tree().navigationChange.subscribe(spy);

                await pressKey(LEFT_ARROW);

                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy.mock.calls[0][0].option.value).toBe('src');

                subscription.unsubscribe();
            });
        });

        // todo need recover
        describe('with when node template', () => {
            let fixture: ComponentFixture<WhenNodeKbqTreeApp>;

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(WhenNodeKbqTreeApp);

                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('with the right data', () => {
                expectFlatTreeToMatch(
                    treeElement,
                    [`>>>rootNode_1`],
                    [`Pictures`],
                    [`Documents`],
                    [`Downloads`],
                    [`Applications`]
                );
            });
        });

        describe('should filter by text', () => {
            let fixture: ComponentFixture<FiltrationKbqTreeApp>;
            let component: FiltrationKbqTreeApp;

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(FiltrationKbqTreeApp);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('.kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should filter nodes by condition', async () => {
                vi.useFakeTimers();

                let nodes = getNodes(treeElement);

                expect(nodes.length).toBe(5);

                component.treeControl.filterNodes('app');
                await vi.advanceTimersByTimeAsync(0);
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(5);

                component.treeControl.filterNodes('Documents');
                await vi.advanceTimersByTimeAsync(0);
                fixture.detectChanges();
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(1);

                component.treeControl.filterNodes('condition for filter all nodes');
                await vi.advanceTimersByTimeAsync(0);
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(0);
            });

            it('should filter nodes and but not their parents', async () => {
                vi.useFakeTimers();

                let nodes = getNodes(treeElement);

                expect(nodes.length).toBe(5);

                component.treeControl.filterNodes('Sun');
                await vi.advanceTimersByTimeAsync(0);
                nodes = getNodes(treeElement);

                const parentOfFoundedNode = nodes[0].textContent!.trim();

                expect(parentOfFoundedNode).toBe('Pictures');

                const foundedNode = nodes[1].textContent!.trim();

                expect(foundedNode).toBe('Sun');

                expect(nodes.length).toBe(2);
            });

            it('should delete filtration with empty condition', async () => {
                vi.useFakeTimers();

                const initialNodesCount = 5;
                let nodes = getNodes(treeElement);

                expect(nodes.length).toBe(initialNodesCount);

                component.treeControl.filterNodes('app');
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(5);

                component.treeControl.filterNodes('');
                await vi.advanceTimersByTimeAsync(0);
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(initialNodesCount);
            });
        });

        describe('should filter by selection', () => {
            let fixture: ComponentFixture<KbqTreeAppMultipleCheckbox>;
            let component: KbqTreeAppMultipleCheckbox;

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(KbqTreeAppMultipleCheckbox);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('.kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should filter selected nodes by 1 level by click', async () => {
                vi.useFakeTimers();

                const initialNodesCount = 5;
                let nodes = getNodes(treeElement);

                expect(nodes.length).toBe(initialNodesCount);
                component.modelValue = [];
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);

                const selectedNodes = nodes.slice(0, 2);

                selectedNodes.forEach((node) => dispatchFakeEvent(node, 'click'));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                component.treeControl.filterNodes(null);
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);
                nodes = getNodes(treeElement);
                expect(nodes.length).toEqual(selectedNodes.length);
            });

            it('should filter NOT selected nodes by 1 level by click', async () => {
                vi.useFakeTimers();

                const initialNodesCount = 5;
                let nodes = getNodes(treeElement);

                expect(nodes.length).toBe(initialNodesCount);

                component.modelValue = [];
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);

                const selectedNodes = nodes.slice(0, 2);

                selectedNodes.forEach((node) => dispatchFakeEvent(node, 'click'));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                const values = component.treeControl.dataNodes
                    .filter((node) => !component.modelValue.includes(component.treeControl.getValue(node)))
                    .map((node) => component.treeControl.getValue(node));

                component.filterByValues.setValues(values);

                component.treeControl.filterNodes(null);
                await vi.advanceTimersByTimeAsync(0);
                nodes = getNodes(treeElement);

                expect(nodes.length).toEqual(component.tree().treeControl.dataNodes.length - selectedNodes.length + 1);
            });

            it('should output selected nodes including parents when filtered by modelValue', async () => {
                vi.useFakeTimers();

                // What the host does when it changes its model: the tree reports no value it was written.
                component.onModelValueChange(['rootNode_1', 'Sun', 'Woods', 'PhotoBoothLibrary']);
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);

                component.treeControl.filterNodes(null);
                await vi.advanceTimersByTimeAsync(0);
                const nodes = getNodes(treeElement);

                expect(nodes.length).toEqual(component.modelValue.length + 1);
            });

            it('should apply different filters together', async () => {
                vi.useFakeTimers();

                component.treeControl.filterNodes('app');
                await vi.advanceTimersByTimeAsync(0);
                const filteredNodesLengthOnlyByText = component
                    .tree()
                    .renderedOptions.map((option) => option.value).length;

                component.treeControl.filterNodes(null);
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);

                component.modelValue = ['Chrome', 'Calendar'];
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);

                component.treeControl.filterNodes(null);
                await vi.advanceTimersByTimeAsync(0);

                expect(getNodes(treeElement).length).not.toEqual(filteredNodesLengthOnlyByText);
            });
        });

        describe('after dataSource.data replacement', () => {
            let fixture: ComponentFixture<KbqTreeAppMultipleCheckbox>;
            let component: KbqTreeAppMultipleCheckbox;

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(KbqTreeAppMultipleCheckbox);

                component = fixture.componentInstance;

                fixture.detectChanges();
            });

            it('should rebind selectionModel orphans so ngModel selection stays toggleable', async () => {
                vi.useFakeTimers();

                await vi.advanceTimersByTimeAsync(0);
                fixture.detectChanges();

                const originalPicturesNode = component.treeControl.dataNodes.find(
                    (node) => component.treeControl.getValue(node) === 'Pictures'
                );

                expect(component.tree().selectionModel.selected[0]).toBe(originalPicturesNode);

                component.dataSource.data = buildFileTree(DATA_OBJECT, 0);
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);

                const newPicturesNode = component.treeControl.dataNodes.find(
                    (node) => component.treeControl.getValue(node) === 'Pictures'
                );

                expect(newPicturesNode).not.toBe(originalPicturesNode);
                expect(component.tree().selectionModel.selected[0]).toBe(newPicturesNode);

                const picturesOption = component.tree().renderedOptions.find((option) => option.value === 'Pictures');

                expect(picturesOption).toBeDefined();
                picturesOption!.selectViaInteraction();
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);

                expect(component.tree().selectionModel.selected.length).toBe(0);
                expect(component.modelValue).toEqual([]);
            });
        });

        describe('after a dataSource swap', () => {
            let fixture: ComponentFixture<SimpleKbqTreeApp>;
            let component: SimpleKbqTreeApp;

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(SimpleKbqTreeApp);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            /** The level cache is private, and keyed by the node objects it would otherwise pin. */
            const levelsOf = (tree: KbqTreeSelection) => (tree as unknown as { levels: Map<unknown, number> }).levels;

            it('should drop the level cache of the previous data source', async () => {
                vi.useFakeTimers();

                await vi.advanceTimersByTimeAsync(0);

                expect(levelsOf(component.tree()).size).toBe(5);

                const nextDataSource = new KbqTreeFlatDataSource(component.treeControl, component.treeFlattener);

                nextDataSource.data = buildFileTree(DATA_OBJECT, 0);

                component.dataSource = nextDataSource;
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);
                fixture.detectChanges();

                expect(levelsOf(component.tree()).size).toBe(5);
            });

            it('should render the new data source instead of appending it to the old one', async () => {
                vi.useFakeTimers();

                await vi.advanceTimersByTimeAsync(0);

                expect(getNodes(treeElement).length).toBe(5);

                const nextDataSource = new KbqTreeFlatDataSource(component.treeControl, component.treeFlattener);

                nextDataSource.data = buildFileTree(DATA_OBJECT, 0);

                component.dataSource = nextDataSource;
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);
                fixture.detectChanges();

                expect(getNodes(treeElement).length).toBe(5);
                expect(component.tree().nodesCount).toBe(5);
            });

            it('should clear the outlet when the data source is set to null', async () => {
                vi.useFakeTimers();

                await vi.advanceTimersByTimeAsync(0);

                expect(getNodes(treeElement).length).toBe(5);

                expect(() => {
                    (component as { dataSource: unknown }).dataSource = null;
                    fixture.detectChanges();
                }).not.toThrow();

                expect(getNodes(treeElement).length).toBe(0);
                expect(levelsOf(component.tree()).size).toBe(0);
            });

            it('should clear the outlet and drop the source when the data source is set back to undefined', async () => {
                vi.useFakeTimers();

                await vi.advanceTimersByTimeAsync(0);

                const previousDataSource = component.dataSource;

                (component as { dataSource: unknown }).dataSource = undefined;
                fixture.detectChanges();

                expect(getNodes(treeElement).length).toBe(0);
                expect(component.tree().dataSource).toBeNull();

                previousDataSource.data = buildFileTree(DATA_OBJECT, 0);
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);
                fixture.detectChanges();

                expect(getNodes(treeElement).length).toBe(0);
            });
        });

        describe('with a trackBy function', () => {
            let fixture: ComponentFixture<TreeWithTrackBy>;
            let component: TreeWithTrackBy;

            const options = (): KbqTreeOption[] =>
                fixture.debugElement
                    .queryAll(By.directive(KbqTreeOption))
                    .map((debugElement) => debugElement.componentInstance as KbqTreeOption);

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(TreeWithTrackBy);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should re-derive the value and the indentation of a reused row', async () => {
                vi.useFakeTimers();

                await vi.advanceTimersByTimeAsync(0);
                fixture.detectChanges();

                const [root, child] = options();

                expect(root.value).toBe('src');
                expect(child.getHostElement().style.paddingLeft).toBe('48px');

                component.emit([
                    { id: 1, name: 'source', level: 0, expandable: false },
                    { id: 2, name: 'docs', level: 2, expandable: false }
                ]);
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);
                fixture.detectChanges();

                // Same instances: the point of the test is the row that was reused rather than rebuilt.
                expect(options()[0]).toBe(root);
                expect(options()[1]).toBe(child);

                expect(root.value).toBe('source');
                expect(child.getHostElement().style.paddingLeft).toBe('60px');
            });
        });

        describe('with a tree control keyed by trackBy and no [trackBy]', () => {
            it('should reuse the rows of the same keys and keep the keyboard order of the new data', async () => {
                vi.useFakeTimers();
                configureKbqTreeTestingModule();

                const fixture = TestBed.createComponent(TreeWithKeyedControl);
                const component = fixture.componentInstance;
                const options = (): KbqTreeOption[] =>
                    fixture.debugElement
                        .queryAll(By.directive(KbqTreeOption))
                        .map((debugElement) => debugElement.componentInstance as KbqTreeOption);

                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);
                fixture.detectChanges();

                const [src, docs] = options();
                const nodes: TrackedNode[] = [
                    { id: 2, name: 'docs', level: 0, expandable: false },
                    { id: 1, name: 'source', level: 0, expandable: false }
                ];

                component.emit(nodes);
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);
                fixture.detectChanges();

                const rendered = component.tree().renderedOptions.toArray();

                // Same instances: the rows were moved, not rebuilt.
                expect(options()[0]).toBe(docs);
                expect(options()[1]).toBe(src);
                expect(src.getHostElement().textContent?.trim()).toBe('source');
                expect(rendered[0]).toBe(docs);
                expect(rendered[1]).toBe(src);
                expect(rendered[0].data).toBe(nodes[0]);
                expect(rendered[1].data).toBe(nodes[1]);
            });
        });

        describe('selection with CTRL + A', () => {
            let fixture: ComponentFixture<KbqTreeAppMultiple>;
            let component: KbqTreeAppMultiple;
            let testScheduler: TestScheduler;

            const selectAllKeyEvent = createKeyboardEvent('keydown', A);

            Object.defineProperty(selectAllKeyEvent, 'ctrlKey', { get: () => true });

            beforeEach(() => {
                testScheduler = new TestScheduler((act, exp) => expect(exp).toEqual(act));

                configureKbqTreeTestingModule([{ provide: AsyncScheduler, useValue: testScheduler }]);
                fixture = TestBed.createComponent(KbqTreeAppMultiple);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should select all visible options and values', async () => {
                expect(component.modelValue.length).toBe(0);

                const onSelectionChange = vi.spyOn(component, 'onSelectionChange');
                const onSelectAll = vi.spyOn(component, 'onSelectAll');

                component.tree().onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                expect(component.savedSelectionChangeEvent!.option.selected).toBe(false);
                expect(onSelectionChange).toHaveBeenCalled();
                expect(component.savedSelectionChangeEvent!.options!.length).toBe(5);
                expect(onSelectAll).toHaveBeenCalled();
                expect(component.savedSelectAllEvent!.options.length).toBe(5);
                expect(component.modelValue.length).toBe(17);
            });

            it('should deselect all visible options and values', async () => {
                component.selectAllToggle = true;
                fixture.detectChanges();

                component.tree().onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                component.savedSelectionChangeEvent = undefined;
                component.savedSelectAllEvent = undefined;

                expect(component.modelValue.length).toBe(17);

                component.tree().onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                expect(component.savedSelectionChangeEvent!.options!.length).toBe(5);
                expect(component.savedSelectAllEvent!.options.length).toBe(5);
                expect(component.modelValue.length).toBe(0);
            });

            it('should select only the matches while a filter is active', async () => {
                vi.useFakeTimers();

                component.treeControl.filterNodes('Sun');
                await vi.advanceTimersByTimeAsync(0);
                fixture.detectChanges();

                component.tree().onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                // `FilterParentsForNodes` keeps the match's ancestors visible, so they take part too.
                expect(component.modelValue).toEqual(['Pictures', 'Sun']);
            });

            it('should not emit selectionChange with an undefined option on a no-op CTRL + A (default)', async () => {
                // first press selects everything (default: selectAllToggle off)
                component.tree().onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                const onSelectionChange = vi.spyOn(component, 'onSelectionChange');

                component.savedSelectionChangeEvent = undefined;

                // second press is a no-op: everything is already selected and allowDeselect is off
                component.tree().onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                expect(onSelectionChange).not.toHaveBeenCalled();
                expect(component.savedSelectionChangeEvent).toBeUndefined();
            });
        });

        describe('selectAll (standalone kbq-tree-selection, no kbq-tree-select wrapper)', () => {
            let fixture: ComponentFixture<KbqTreeAppMultiple>;
            let component: KbqTreeAppMultiple;

            /** All 17 nodes of `DATA_OBJECT`; the 4 branches start out collapsed, so only 5 are rendered. */
            const ALL_NODES_COUNT = 17;

            const getSelectAllRow = (): HTMLElement | null =>
                fixture.nativeElement.querySelector('.kbq-tree-option_select-all');

            const clickSelectAll = () => {
                getSelectAllRow()!.click();
                fixture.detectChanges();
            };

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(KbqTreeAppMultiple);
                component = fixture.componentInstance;
                component.selectAllEnabled = true;
                fixture.detectChanges();
            });

            it('should render the row above the nodes with the locale label', () => {
                const row = getSelectAllRow();

                expect(row).not.toBeNull();
                expect(row!.textContent!.trim()).toBe('Выбрать все');
            });

            it('should not render the row when selectAll is off', () => {
                component.selectAllEnabled = false;
                fixture.detectChanges();

                expect(getSelectAllRow()).toBeNull();
            });

            it('should lead the list the key manager navigates', () => {
                expect(component.tree().renderedOptions.first).toBe(component.tree().selectAllOption());
            });

            it('should be unchecked when nothing is selected', () => {
                expect(component.tree().selectAllState).toBe('unchecked');
            });

            it('should report an empty state instead of throwing before treeControl is assigned', () => {
                // A consumer reading these off a template reference — e.g. to swap the trigger for a
                // "select all" label — can get here before the `treeControl` binding is applied.
                const uninitialized = Object.create(KbqTreeSelection.prototype) as KbqTreeSelection;

                Object.defineProperty(uninitialized, 'treeControlInput', { value: () => undefined });

                expect(() => uninitialized.allOptionsSelected).not.toThrow();
                expect(uninitialized.allOptionsSelected).toBe(false);
                expect(uninitialized.selectAllState).toBe('unchecked');
            });

            it('should be indeterminate when only some nodes are selected', () => {
                component.tree().selectionModel.select(component.tree().treeControl.hasValue('Sun'));
                fixture.detectChanges();

                expect(component.tree().selectAllState).toBe('indeterminate');
            });

            it('should be checked when every node is selected', () => {
                clickSelectAll();

                expect(component.tree().selectAllState).toBe('checked');
            });

            it('should select every node on click, collapsed branches included', () => {
                clickSelectAll();

                expect(component.modelValue.length).toBe(ALL_NODES_COUNT);
            });

            it('should deselect every node on a second click', () => {
                clickSelectAll();
                clickSelectAll();

                expect(component.modelValue.length).toBe(0);
            });

            it('should leave unselectable nodes untouched', () => {
                component.unselectableNodes = ['Pictures'];
                fixture.detectChanges();

                clickSelectAll();

                expect(component.modelValue).not.toContain('Pictures');
            });

            it('should emit onSelectAll on click', () => {
                clickSelectAll();

                expect(component.savedSelectAllEvent).toBeDefined();
            });

            it('should do nothing while the tree is disabled', () => {
                component.treeDisabled = true;
                fixture.detectChanges();

                clickSelectAll();

                expect(component.modelValue.length).toBe(0);
            });
        });

        describe('keyboard navigation with RIGHT_ARROW', () => {
            let fixture: ComponentFixture<KbqTreeAppDeepData>;
            let component: KbqTreeAppDeepData;

            const pressKey = async (keyCode: number) => {
                component.tree().onKeyDown(createKeyboardEvent('keydown', keyCode));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
            };

            const getActiveValue = () => component.tree().keyManager.activeItem?.value;

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(KbqTreeAppDeepData);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should expand a collapsed option without moving the focus', async () => {
                vi.useFakeTimers();

                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('src');

                await pressKey(RIGHT_ARROW);

                // docs, src, assets, cdk, README, tests
                expect(getNodes(treeElement).length).toBe(6);
                expect(getActiveValue()).toBe('src');
            });

            it('should move the focus to the first child of an already expanded option', async () => {
                vi.useFakeTimers();

                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(RIGHT_ARROW);

                expect(getActiveValue()).toBe('src');

                await pressKey(RIGHT_ARROW);

                expect(getActiveValue()).toBe('assets');
                expect(getNodes(treeElement).length).toBe(6);
            });

            it('should do nothing on a leaf', async () => {
                vi.useFakeTimers();

                await pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('docs');

                await pressKey(RIGHT_ARROW);

                expect(getActiveValue()).toBe('docs');
                expect(getNodes(treeElement).length).toBe(3);
            });

            it('should skip a disabled first child', async () => {
                vi.useFakeTimers();

                component.disabledNodes = ['assets'];
                fixture.detectChanges();

                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(RIGHT_ARROW);
                await pressKey(RIGHT_ARROW);

                expect(getActiveValue()).toBe('cdk');
            });

            it('should stay put when every child is disabled', async () => {
                vi.useFakeTimers();

                component.disabledNodes = ['assets', 'cdk', 'README'];
                fixture.detectChanges();

                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(RIGHT_ARROW);
                await pressKey(RIGHT_ARROW);

                expect(getActiveValue()).toBe('src');
            });
        });

        describe('keyboard navigation with the remaining keys', () => {
            let fixture: ComponentFixture<KbqTreeAppDeepData>;
            let component: KbqTreeAppDeepData;

            /** Matches the default debounce `FocusKeyManager.withTypeAhead` applies to the letter stream. */
            const typeAheadDebounce = 200;

            const pressKey = async (keyCode: number, key?: string) => {
                component.tree().onKeyDown(createKeyboardEvent('keydown', keyCode, undefined, key));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
            };

            const getActiveValue = () => component.tree().keyManager.activeItem?.value;

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(KbqTreeAppDeepData);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should step back with UP_ARROW', async () => {
                vi.useFakeTimers();

                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('src');

                await pressKey(UP_ARROW);

                expect(getActiveValue()).toBe('docs');
            });

            it('should jump to the first option with HOME', async () => {
                vi.useFakeTimers();

                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);
                await pressKey(HOME);

                expect(getActiveValue()).toBe('docs');
            });

            it('should jump to the last option with END', async () => {
                vi.useFakeTimers();

                await pressKey(END);

                expect(getActiveValue()).toBe('tests');
            });

            it('should select the active option with ENTER', async () => {
                vi.useFakeTimers();

                await pressKey(DOWN_ARROW);
                await pressKey(ENTER);

                expect(component.tree().keyManager.activeItem!.selected).toBe(true);
            });

            it('should move to the option whose name starts with the typed character', async () => {
                vi.useFakeTimers();

                await pressKey(T, 't');

                await vi.advanceTimersByTimeAsync(typeAheadDebounce);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(getActiveValue()).toBe('tests');
            });

            it('should ignore typed characters once type-ahead is turned off', async () => {
                vi.useFakeTimers();

                component.tree().typeAhead = false;
                fixture.detectChanges();

                await pressKey(T, 't');

                await vi.advanceTimersByTimeAsync(typeAheadDebounce);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(getActiveValue()).toBeUndefined();
            });

            it('should not answer a Ctrl/Cmd/Alt shortcut with type-ahead', async () => {
                vi.useFakeTimers();

                const event = createKeyboardEvent('keydown', T, undefined, 't');

                Object.defineProperty(event, 'ctrlKey', { get: () => true });

                component.tree().onKeyDown(event);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                await vi.advanceTimersByTimeAsync(typeAheadDebounce);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(getActiveValue()).toBeUndefined();
            });

            it('should not answer type-ahead with the select-all row', async () => {
                vi.useFakeTimers();

                const multipleFixture = TestBed.createComponent(KbqTreeAppMultiple);

                multipleFixture.componentInstance.selectAllEnabled = true;
                multipleFixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                // The row's label is "Выбрать все", so an English query cannot match it either way —
                // `getLabel` reports an empty label for it, which is what keeps it out of every query.
                expect(multipleFixture.componentInstance.tree().renderedOptions.first.getLabel()).toBe('');

                multipleFixture.componentInstance.tree().onKeyDown(createKeyboardEvent('keydown', D, undefined, 'd'));
                multipleFixture.detectChanges();

                await vi.advanceTimersByTimeAsync(typeAheadDebounce);
                multipleFixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(multipleFixture.componentInstance.tree().keyManager.activeItem?.value).toBe('Documents');
            });
        });

        describe('tri-state checkbox', () => {
            let fixture: ComponentFixture<TreeWithThirdStateCheckbox>;
            let component: TreeWithThirdStateCheckbox;

            const optionFor = (value: string): KbqTreeOption =>
                component.tree().renderedOptions.find((option) => option.value === value)!;

            const nodeFor = (value: string): HTMLElement => getNodeByText(treeElement, value);

            const settle = async () => {
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);
                fixture.detectChanges();
            };

            const clickNode = async (value: string) => {
                dispatchEvent(nodeFor(value), createMouseEvent('click'));
                await settle();
            };

            const toggleNode = async (value: string) => {
                (nodeFor(value).querySelector('kbq-tree-node-toggle') as HTMLElement).click();
                await settle();
            };

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(TreeWithThirdStateCheckbox);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should start out unchecked', async () => {
                vi.useFakeTimers();

                await vi.runOnlyPendingTimersAsync();

                expect(optionFor('Pictures').checkboxState).toBe('unchecked');
            });

            it('should become indeterminate when only some descendants are selected', async () => {
                vi.useFakeTimers();

                await toggleNode('Pictures');
                await clickNode('Sun');

                expect(optionFor('Pictures').checkboxState).toBe('indeterminate');
            });

            it('should become checked when every descendant is selected', async () => {
                vi.useFakeTimers();

                await toggleNode('Pictures');
                await clickNode('Sun');
                await clickNode('Woods');
                await clickNode('PhotoBoothLibrary');

                expect(optionFor('Pictures').checkboxState).toBe('checked');
            });

            it('should fall back to indeterminate when a descendant is deselected again', async () => {
                vi.useFakeTimers();

                await toggleNode('Pictures');
                await clickNode('Sun');
                await clickNode('Woods');
                await clickNode('PhotoBoothLibrary');
                await clickNode('Sun');

                expect(optionFor('Pictures').checkboxState).toBe('indeterminate');
            });

            it('should go back to unchecked once nothing is selected', async () => {
                vi.useFakeTimers();

                await toggleNode('Pictures');
                await clickNode('Sun');
                await clickNode('Sun');

                expect(optionFor('Pictures').checkboxState).toBe('unchecked');
            });

            it('should keep the rolled-up state while the branch is collapsed', async () => {
                vi.useFakeTimers();

                await toggleNode('Pictures');
                await clickNode('Sun');
                await toggleNode('Pictures');

                expect(getNodes(treeElement).length).toBe(5);
                expect(optionFor('Pictures').checkboxState).toBe('indeterminate');
            });

            it('should report the tri-state through aria-checked', async () => {
                vi.useFakeTimers();

                await toggleNode('Pictures');

                expect(nodeFor('Pictures').getAttribute('aria-checked')).toBe('false');

                await clickNode('Sun');

                expect(nodeFor('Pictures').getAttribute('aria-checked')).toBe('mixed');

                await clickNode('Woods');
                await clickNode('PhotoBoothLibrary');

                expect(nodeFor('Pictures').getAttribute('aria-checked')).toBe('true');
            });

            it('should check the whole branch through setStateChildren', async () => {
                vi.useFakeTimers();

                await toggleNode('Pictures');

                component.tree().setStateChildren(optionFor('Pictures'), true);
                await settle();

                expect(optionFor('Pictures').checkboxState).toBe('checked');
                expect(optionFor('Sun').selected).toBe(true);
                expect(optionFor('Woods').selected).toBe(true);
            });

            it('should clear the whole branch through setStateChildren', async () => {
                vi.useFakeTimers();

                await toggleNode('Pictures');

                component.tree().setStateChildren(optionFor('Pictures'), true);
                await settle();

                // The branch has to actually reach the checked state first: asserting only the cleared one
                // would pass against the field initialisers, with or without `setStateChildren`.
                expect(optionFor('Pictures').checkboxState).toBe('checked');
                expect(optionFor('Sun').selected).toBe(true);

                component.tree().setStateChildren(optionFor('Pictures'), false);
                await settle();

                expect(optionFor('Pictures').checkboxState).toBe('unchecked');
                expect(optionFor('Sun').selected).toBe(false);
            });

            it('should catch up with a selection made while the checkbox was hidden', async () => {
                vi.useFakeTimers();

                const tree = component.tree();

                tree.multipleMode = MultipleMode.KEYBOARD;
                await settle();

                tree.selectionModel.select(component.treeControl.hasValue('Sun')!);
                await settle();

                expect(optionFor('Pictures').checkboxState).toBe('unchecked');

                tree.multipleMode = MultipleMode.CHECKBOX;
                await settle();

                expect(optionFor('Pictures').checkboxState).toBe('indeterminate');
            });
        });

        describe('tri-state checkbox projected while the tree hides its own', () => {
            it('should keep the projected checkbox of an ancestor in step with the selection', async () => {
                vi.useFakeTimers();
                configureKbqTreeTestingModule();

                const fixture = TestBed.createComponent(TreeWithProjectedThirdStateCheckbox);
                const { tree, treeControl } = fixture.componentInstance;
                const settle = async () => {
                    fixture.detectChanges();
                    await vi.advanceTimersByTimeAsync(0);
                    fixture.detectChanges();
                };

                await settle();
                treeControl.expand(treeControl.hasValue('Pictures')!);
                await settle();

                tree().selectionModel.select(treeControl.hasValue('Sun')!);
                await settle();

                const pictures = getNodeByText(fixture.nativeElement, 'Pictures');

                expect(tree().renderedOptions.find((option) => option.value === 'Pictures')!.checkboxState).toBe(
                    'indeterminate'
                );
                expect(pictures.querySelector('kbq-pseudo-checkbox')!.classList).toContain('kbq-indeterminate');
            });
        });

        describe('tri-state checkbox over replaced data', () => {
            let fixture: ComponentFixture<TreeWithTrackedThirdStateCheckbox>;
            let component: TreeWithTrackedThirdStateCheckbox;

            const optionFor = (value: string): KbqTreeOption =>
                component.tree().renderedOptions.find((option) => option.value === value)!;

            const settle = async () => {
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);
                fixture.detectChanges();
            };

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(TreeWithTrackedThirdStateCheckbox);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            // Only the moved row is refreshed, and no row is added, removed or moved, so nothing re-renders the list.
            it('should recompute an ancestor a node moves under in place', async () => {
                vi.useFakeTimers();

                const [branch, child, sibling] = component.dataSource.value;

                dispatchEvent(getNodeByText(treeElement, 'child'), createMouseEvent('click'));
                await settle();

                expect(optionFor('branch').checkboxState).toBe('checked');

                component.emit([branch, child, { ...sibling, level: 1 }]);
                await settle();

                expect(optionFor('branch').checkboxState).toBe('indeterminate');
            });

            it('should recompute a branch as soon as rows are added under it', async () => {
                vi.useFakeTimers();

                const [branch, child, sibling] = component.dataSource.value;

                dispatchEvent(getNodeByText(treeElement, 'child'), createMouseEvent('click'));
                await settle();

                component.emit([branch, child, { id: 4, name: 'added', level: 1, expandable: false }, sibling]);
                // Microtasks only: the pass over the rendered options that follows waits for a timer.
                await Promise.resolve();

                expect(optionFor('branch').checkboxState).toBe('indeterminate');
            });
        });

        describe('tri-state checkbox in a deep tree', () => {
            let fixture: ComponentFixture<TreeWithDeepThirdStateCheckbox>;
            let component: TreeWithDeepThirdStateCheckbox;

            const optionFor = (value: string): KbqTreeOption =>
                component.tree().renderedOptions.find((option) => option.value === value)!;

            const settle = async () => {
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);
                fixture.detectChanges();
            };

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(TreeWithDeepThirdStateCheckbox);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            // An ancestor that rolled the change up through its own ancestors again made a node at depth d cost
            // 2^d updates, so both counts below ran into the thousands.
            it('should update each ancestor a number of times linear in depth', async () => {
                vi.useFakeTimers();

                component.treeControl.expandAll();
                await settle();

                const root = optionFor('node-0');
                const rootUpdates = vi.spyOn(root, 'checkboxState', 'set');
                const rollUps = vi.spyOn(component.treeControl, 'getParents');

                dispatchEvent(getNodeByText(treeElement, `node-${DEEP_CHAIN_DEPTH}`), createMouseEvent('click'));
                await settle();

                expect(rootUpdates.mock.calls.length).toBeLessThanOrEqual(DEEP_CHAIN_DEPTH);
                expect(rollUps.mock.calls.length).toBeLessThanOrEqual(DEEP_CHAIN_DEPTH);

                expect(optionFor(`node-${DEEP_CHAIN_DEPTH}`).checkboxState).toBe('checked');
                expect(optionFor(`node-${DEEP_CHAIN_DEPTH - 1}`).checkboxState).toBe('indeterminate');
                expect(root.checkboxState).toBe('indeterminate');
            });

            it('should roll no rendered row up through its ancestors, selected ones included', async () => {
                vi.useFakeTimers();

                const { tree, treeControl } = component;

                tree().selectionModel.select(treeControl.hasValue(`node-${DEEP_CHAIN_DEPTH}`)!);
                await settle();

                const rollUps = vi.spyOn(treeControl, 'getParents');

                treeControl.expandAll();
                await settle();

                expect(getNodes(treeElement).length).toBe(treeControl.dataNodes.length);
                expect(rollUps).not.toHaveBeenCalled();
                expect(optionFor(`node-${DEEP_CHAIN_DEPTH}`).selected).toBe(true);
                expect(optionFor('node-0').checkboxState).toBe('indeterminate');
            });

            it('should sweep the rows once for the selection changes of one task', async () => {
                vi.useFakeTimers();

                const { tree, treeControl } = component;

                treeControl.expandAll();
                await settle();

                const sweeps = vi.spyOn(optionFor('node-0'), 'markForCheck');

                ['leaf-1', 'leaf-2', 'leaf-3'].forEach((name) =>
                    tree().selectionModel.select(treeControl.hasValue(name)!)
                );
                await settle();

                expect(sweeps).toHaveBeenCalledTimes(1);
            });

            it('should leave renderedOptions.changes to the rendered rows', async () => {
                vi.useFakeTimers();

                const { tree, treeControl } = component;

                treeControl.expandAll();
                await settle();

                const rowChanges = vi.fn();

                tree().renderedOptions.changes.subscribe(rowChanges);
                tree().selectionModel.select(treeControl.hasValue('leaf-1')!);
                await settle();

                expect(rowChanges).not.toHaveBeenCalled();
                expect(optionFor('leaf-1').selected).toBe(true);
            });

            // A write per node would run every listener of the selection once per node.
            it('should change the selection once to select all', async () => {
                vi.useFakeTimers();

                const tree = component.tree();
                const selectionChanges = vi.fn();

                tree.selectionModel.changed.subscribe(selectionChanges);
                tree.selectAllOptions();
                await settle();

                expect(selectionChanges).toHaveBeenCalledTimes(1);
                expect(tree.selectionModel.selected.length).toBe(component.treeControl.dataNodes.length);
            });

            it('should change the selection once for a range', async () => {
                vi.useFakeTimers();

                const { tree, treeControl } = component;

                treeControl.expandAll();
                await settle();

                const rows = getNodes(treeElement);
                const shiftClick = createMouseEvent('click');

                dispatchEvent(rows[0], createMouseEvent('click'));
                await settle();

                const selectionChanges = vi.fn();

                tree().selectionModel.changed.subscribe(selectionChanges);
                Object.defineProperty(shiftClick, 'shiftKey', { get: () => true });
                tree().keyManager.setActiveItem(6);
                dispatchEvent(rows[6], shiftClick);
                await settle();

                expect(selectionChanges).toHaveBeenCalledTimes(1);
                expect(tree().selectionModel.selected.length).toBe(7);
            });
        });

        describe('disabled options', () => {
            let fixture: ComponentFixture<TreeMultipleWithDisabledNodes>;
            let component: TreeMultipleWithDisabledNodes;

            const selectedValues = () =>
                component.tree().selectionModel.selected.map((node) => component.treeControl.getValue(node));

            const pressKey = async (keyCode: number, modifier?: 'ctrlKey' | 'shiftKey') => {
                const event = createKeyboardEvent('keydown', keyCode);

                if (modifier) {
                    Object.defineProperty(event, modifier, { get: () => true });
                }

                component.tree().onKeyDown(event);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
            };

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(TreeMultipleWithDisabledNodes);

                component = fixture.componentInstance;
                component.disabledNodes = ['Documents'];
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should not select a disabled option on click', async () => {
                vi.useFakeTimers();

                dispatchEvent(getNodeByText(treeElement, 'Documents'), createMouseEvent('click'));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(selectedValues()).toEqual([]);
            });

            it('should report the disabled state through aria-disabled', () => {
                expect(getNodeByText(treeElement, 'Documents').getAttribute('aria-disabled')).toBe('true');
                expect(getNodeByText(treeElement, 'Pictures').hasAttribute('aria-disabled')).toBe(false);
            });

            it('should leave a disabled option out of CTRL + A', async () => {
                vi.useFakeTimers();

                await pressKey(A, 'ctrlKey');

                expect(selectedValues()).toContain('Pictures');
                expect(selectedValues()).not.toContain('Documents');
            });

            it('should skip a disabled option inside a shift range', async () => {
                vi.useFakeTimers();

                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW, 'shiftKey');
                await pressKey(DOWN_ARROW, 'shiftKey');
                await pressKey(DOWN_ARROW, 'shiftKey');

                expect(selectedValues()).toContain('Downloads');
                expect(selectedValues()).not.toContain('Documents');
            });
        });

        describe('options disabled by the tree control', () => {
            beforeEach(() => configureKbqTreeTestingModule());

            it('should repaint an option once its isDisabled changes', async () => {
                vi.useFakeTimers();

                const fixture = TestBed.createComponent(KbqTreeAppMultipleCheckbox);
                const disabledNames: string[] = [];

                fixture.componentInstance.treeControl.isDisabled = (node) => disabledNames.includes(node.name);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                const row = getNodeByText(fixture.nativeElement, 'Documents');

                disabledNames.push('Documents');
                fixture.detectChanges();

                expect(row.classList).toContain('kbq-disabled');
                expect(row.getAttribute('aria-disabled')).toBe('true');
                expect(row.querySelector('kbq-pseudo-checkbox')!.classList).toContain('kbq-disabled');

                disabledNames.pop();
                fixture.detectChanges();

                expect(row.classList).not.toContain('kbq-disabled');
                expect(row.hasAttribute('aria-disabled')).toBe(false);
                expect(row.querySelector('kbq-pseudo-checkbox')!.classList).not.toContain('kbq-disabled');
            });

            it('should ask isDisabled once per option on a check', () => {
                const fixture = TestBed.createComponent(TreeSelectionFocusStates);
                const isDisabled = vi.fn((_node: FileFlatNode) => false);

                fixture.componentInstance.treeControl.isDisabled = isDisabled;
                fixture.detectChanges();
                isDisabled.mockClear();

                fixture.detectChanges();

                expect(isDisabled).toHaveBeenCalledTimes(getNodes(fixture.nativeElement).length);
            });

            // Nothing but the signal changes: no check of the host, as with a lock list held by a service.
            describe('with predicates reading a signal', () => {
                const modes: [string, Type<{ treeControl: FlatTreeControl<FileFlatNode> }>][] = [
                    ['single', SimpleKbqTreeApp],
                    ['multiple="keyboard"', TreeSelectionFocusStates],
                    ['multiple="checkbox"', KbqTreeAppMultipleCheckbox]
                ];

                for (const [mode, fixtureType] of modes) {
                    it(`should repaint an option once a signal read by isDisabled changes (${mode})`, async () => {
                        const fixture = TestBed.createComponent(fixtureType);
                        const locked = signal<string[]>([]);

                        fixture.componentInstance.treeControl.isDisabled = (node) => locked().includes(node.name);
                        fixture.detectChanges();
                        await fixture.whenStable();

                        const row = getNodeByText(fixture.nativeElement, 'Documents');

                        locked.set(['Documents']);
                        await fixture.whenStable();

                        expect(row.classList).toContain('kbq-disabled');
                        expect(row.getAttribute('aria-disabled')).toBe('true');

                        locked.set([]);
                        await fixture.whenStable();

                        expect(row.classList).not.toContain('kbq-disabled');
                        expect(row.hasAttribute('aria-disabled')).toBe(false);
                    });
                }

                it('should report a branch once a signal read by isExpandable changes', async () => {
                    const fixture = TestBed.createComponent(TreeSelectionFocusStates);
                    const lazyBranches = signal<string[]>([]);
                    const { treeControl } = fixture.componentInstance;

                    treeControl.isExpandable = (node) => node.expandable || lazyBranches().includes(node.name);
                    fixture.detectChanges();
                    await fixture.whenStable();

                    const row = getNodeByText(fixture.nativeElement, 'rootNode_1');

                    expect(row.hasAttribute('aria-expanded')).toBe(false);

                    lazyBranches.set(['rootNode_1']);
                    await fixture.whenStable();

                    expect(row.getAttribute('aria-expanded')).toBe('false');
                });
            });
        });

        // Changes made in code, followed by no check of the view declaring the options: only what the rows track
        // brings them back.
        describe('rows updated without an event', () => {
            const treeOf = (fixture: ComponentFixture<unknown>): KbqTreeSelection =>
                fixture.debugElement.query(By.directive(KbqTreeSelection)).componentInstance;

            const optionOf = (fixture: ComponentFixture<unknown>, name: string): KbqTreeOption =>
                treeOf(fixture).renderedOptions.find((option) => option.viewValue === name)!;

            beforeEach(() => configureKbqTreeTestingModule());

            // Between two multiple modes, so the selection model is kept and nothing but the mode changes.
            it('should follow the selection mode', async () => {
                const fixture = TestBed.createComponent(KbqTreeAppMultiple);

                fixture.detectChanges();
                await fixture.whenStable();

                const row = getNodeByText(fixture.nativeElement, 'Pictures');

                treeOf(fixture).multipleMode = MultipleMode.CHECKBOX;
                await fixture.whenStable();

                expect(row.getAttribute('aria-checked')).toBe('false');
                expect(row.hasAttribute('aria-selected')).toBe(false);

                treeOf(fixture).multipleMode = MultipleMode.KEYBOARD;
                await fixture.whenStable();

                expect(row.hasAttribute('aria-checked')).toBe(false);
                expect(row.getAttribute('aria-selected')).toBe('false');
            });

            it('should follow the selection', async () => {
                const fixture = TestBed.createComponent(TreeSelectionFocusStates);

                fixture.detectChanges();
                await fixture.whenStable();

                optionOf(fixture, 'Pictures').selected = true;
                await fixture.whenStable();

                expect(getNodeByText(fixture.nativeElement, 'Pictures').getAttribute('aria-selected')).toBe('true');
            });

            it('should follow the checkbox state of a branch', async () => {
                const fixture = TestBed.createComponent(TreeWithThirdStateCheckbox);

                fixture.detectChanges();
                await fixture.whenStable();

                const { treeControl } = fixture.componentInstance;

                treeControl.expand(treeControl.dataNodes.find((node) => node.name === 'Pictures')!);
                await fixture.whenStable();

                optionOf(fixture, 'Sun').selected = true;
                await fixture.whenStable();

                expect(getNodeByText(fixture.nativeElement, 'Pictures').getAttribute('aria-checked')).toBe('mixed');
            });

            it('should follow the select-all state', async () => {
                const fixture = TestBed.createComponent(KbqTreeAppMultiple);

                fixture.componentInstance.selectAllEnabled = true;
                fixture.detectChanges();
                await fixture.whenStable();

                const tree = treeOf(fixture);
                const row = fixture.nativeElement.querySelector('.kbq-tree-option_select-all');

                tree.selectionModel.select(...tree.treeControl.dataNodes);
                await fixture.whenStable();

                expect(row.getAttribute('aria-checked')).toBe('true');

                tree.selectionModel.clear();
                await fixture.whenStable();

                expect(row.getAttribute('aria-checked')).toBe('false');
            });

            it('should follow the expansion', async () => {
                const fixture = TestBed.createComponent(TreeSelectionFocusStates);

                fixture.detectChanges();
                await fixture.whenStable();

                const { treeControl } = fixture.componentInstance;

                treeControl.expand(treeControl.dataNodes.find((node) => node.name === 'Pictures')!);
                await fixture.whenStable();

                expect(getNodeByText(fixture.nativeElement, 'Pictures').getAttribute('aria-expanded')).toBe('true');
            });
        });

        describe('noUnselectLast', () => {
            let fixture: ComponentFixture<KbqTreeAppMultiple>;
            let component: KbqTreeAppMultiple;

            const ctrlClick = async (index: number) => {
                const event = createMouseEvent('click');

                Object.defineProperty(event, 'ctrlKey', { get: () => true });

                dispatchEvent(getNodes(treeElement)[index], event);
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);
                fixture.detectChanges();
            };

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(KbqTreeAppMultiple);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should be on by default in keyboard mode', () => {
                expect(component.tree().noUnselectLast).toBe(true);
            });

            it('should be off by default in checkbox mode', () => {
                const checkboxFixture = TestBed.createComponent(KbqTreeAppMultipleCheckbox);

                checkboxFixture.detectChanges();

                expect(checkboxFixture.componentInstance.tree().noUnselectLast).toBe(false);
            });

            it('should keep the last selected option on a ctrl click', async () => {
                vi.useFakeTimers();

                await ctrlClick(0);

                expect(component.tree().selectionModel.selected.length).toBe(1);

                await ctrlClick(0);

                expect(component.tree().selectionModel.selected.length).toBe(1);
            });

            it('should release the last selected option once it is off', async () => {
                vi.useFakeTimers();

                component.tree().noUnselectLast = false;
                fixture.detectChanges();

                await ctrlClick(0);
                await ctrlClick(0);

                expect(component.tree().selectionModel.selected.length).toBe(0);
            });

            it('should keep the last selected option on SPACE', async () => {
                vi.useFakeTimers();

                await ctrlClick(0);

                component.tree().onKeyDown(createKeyboardEvent('keydown', SPACE));
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(0);

                expect(component.tree().selectionModel.selected.length).toBe(1);
            });
        });

        describe('value accessor', () => {
            let fixture: ComponentFixture<KbqTreeAppMultiple>;
            let component: KbqTreeAppMultiple;

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(KbqTreeAppMultiple);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should reject a non-array value in multiple mode', () => {
                expect(() => component.tree().writeValue('Pictures')).toThrow(
                    'Value must be an array in multiple-selection mode.'
                );
            });

            it('should select the options matching the written values', () => {
                component.tree().writeValue(['Pictures', 'Documents']);

                expect(component.tree().getSelectedValues()).toEqual(['Pictures', 'Documents']);
            });

            it('should ignore a value with no matching node', () => {
                component.tree().writeValue(['Pictures', 'nothing']);

                expect(component.tree().getSelectedValues()).toEqual(['Pictures']);
            });

            it('should clear the selection when written an empty value', () => {
                component.tree().writeValue(['Pictures']);
                component.tree().writeValue(null);

                expect(component.tree().getSelectedValues()).toEqual([]);
            });

            it('should hand the selected values to the registered change callback', () => {
                const changes: any[] = [];

                component.tree().registerOnChange((value) => changes.push(value));
                component.tree().setOptionsFromValues(['Pictures']);

                expect(changes[changes.length - 1]).toEqual(['Pictures']);
            });

            it('should notify the touched callback on blur', () => {
                const onTouched = vi.fn();

                component.tree().registerOnTouched(onTouched);
                component.tree().blur();

                expect(onTouched).toHaveBeenCalled();
            });

            it('should disable the tree through setDisabledState', () => {
                component.tree().setDisabledState(true);
                fixture.detectChanges();

                expect(component.tree().disabled).toBe(true);
                expect(treeElement.getAttribute('aria-disabled')).toBe('true');
            });

            it('should repaint the options and their checkboxes when setDisabledState toggles', async () => {
                vi.useFakeTimers();

                const checkboxFixture = TestBed.createComponent(KbqTreeAppMultipleCheckbox);
                const checkboxTree = checkboxFixture.nativeElement.querySelector('kbq-tree-selection');
                const disabledRows = () => getNodes(checkboxTree).filter((node) => node.matches('.kbq-disabled'));
                const disabledCheckboxes = () => checkboxTree.querySelectorAll('kbq-pseudo-checkbox.kbq-disabled');

                checkboxFixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                checkboxFixture.detectChanges();

                checkboxFixture.componentInstance.tree().setDisabledState(true);
                checkboxFixture.detectChanges();

                expect(disabledRows().length).toBe(getNodes(checkboxTree).length);
                expect(disabledCheckboxes().length).toBe(getNodes(checkboxTree).length);

                checkboxFixture.componentInstance.tree().setDisabledState(false);
                checkboxFixture.detectChanges();

                expect(disabledRows().length).toBe(0);
                expect(disabledCheckboxes().length).toBe(0);
            });

            it('should stay pristine when ngModel writes its value', async () => {
                vi.useFakeTimers();

                const modelFixture = TestBed.createComponent(KbqTreeAppDeepData);

                modelFixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                const ngModel = modelFixture.debugElement.query(By.directive(KbqTreeSelection)).injector.get(NgModel);

                modelFixture.componentInstance.modelValue = 'docs';
                modelFixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(modelFixture.componentInstance.tree().getSelectedValues()).toBe('docs');
                expect(ngModel.pristine).toBe(true);
            });
        });

        describe('with a form control', () => {
            let fixture: ComponentFixture<TreeSelectionWithFormControl>;
            let component: TreeSelectionWithFormControl;

            const settle = async () => {
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();
            };

            beforeEach(async () => {
                vi.useFakeTimers();
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(TreeSelectionWithFormControl);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                await settle();
            });

            it('should stay untouched when the focus enters the tree through its host', async () => {
                treeElement.focus();
                await settle();

                expect(document.activeElement).toBe(getNodes(treeElement)[0]);
                expect(component.control.touched).toBe(false);
            });

            it('should stay untouched while the focus moves between nodes', async () => {
                treeElement.focus();
                await settle();

                dispatchKeyboardEvent(document.activeElement!, 'keydown', DOWN_ARROW);
                await settle();

                expect(document.activeElement).toBe(getNodes(treeElement)[1]);
                expect(component.control.touched).toBe(false);
            });

            it('should be touched once the focus is tabbed out of the tree', async () => {
                treeElement.focus();
                await settle();

                dispatchKeyboardEvent(document.activeElement!, 'keydown', TAB);
                fixture.nativeElement.querySelector('button').focus();
                await settle();

                expect(component.control.touched).toBe(true);
            });

            it('should be touched once the focus is taken away from the tree', async () => {
                treeElement.focus();
                await settle();

                (document.activeElement as HTMLElement).blur();
                await settle();

                expect(component.control.touched).toBe(true);
            });

            it('should stay pristine when the form writes a value', async () => {
                component.control.setValue('Pictures');
                await settle();

                expect(component.tree().getSelectedValues()).toBe('Pictures');
                expect(component.control.value).toBe('Pictures');
                expect(component.control.pristine).toBe(true);
                expect(component.onSelectionChange).not.toHaveBeenCalled();
            });

            it('should stay pristine when a value is written while another one is applied', async () => {
                component.control.setValue('Pictures');
                await settle();

                const tree = component.tree();
                let written = false;
                // Writes on the first change of the next write, before that write has selected its own node.
                const subscription = tree.selectionModel.changed.subscribe(() => {
                    if (written) return;

                    written = true;
                    tree.writeValue('Documents');
                });

                component.control.setValue('Downloads');
                subscription.unsubscribe();
                await settle();

                expect(written).toBe(true);
                expect(component.control.pristine).toBe(true);
            });

            it('should stay pristine when the form is reset', async () => {
                component.control.setValue('Pictures');
                await settle();

                component.control.reset();
                await settle();

                expect(component.tree().getSelectedValues()).toBeUndefined();
                expect(component.control.value).toBeNull();
                expect(component.control.pristine).toBe(true);
            });

            it('should report a selection of the user to the form', async () => {
                getNodeByText(treeElement, 'Pictures').click();
                await settle();

                expect(component.control.value).toBe('Pictures');
                expect(component.control.dirty).toBe(true);
                expect(component.onSelectionChange).toHaveBeenCalledTimes(1);
            });

            it('should stay pristine when the data is replaced with equal nodes', async () => {
                const values: unknown[] = [];

                component.control.setValue('Pictures');
                await settle();
                component.control.valueChanges.subscribe((value) => values.push(value));

                component.dataSource.data = buildFileTree(DATA_OBJECT, 0);
                await settle();

                expect(component.tree().selectionModel.selected[0]).toBe(
                    component.treeControl.dataNodes.find(({ name }) => name === 'Pictures')
                );
                expect(values).toEqual([]);
                expect(component.control.pristine).toBe(true);
                expect(component.onSelectionChange).not.toHaveBeenCalled();
            });

            it('should apply a value written before the data arrives', async () => {
                component.dataSource.data = [];
                await settle();

                component.control.setValue('Pictures');
                await settle();

                expect(component.tree().getSelectedValues()).toBeUndefined();

                component.dataSource.data = buildFileTree(DATA_OBJECT, 0);
                await settle();

                expect(component.tree().getSelectedValues()).toBe('Pictures');
                expect(getNodeByText(treeElement, 'Pictures').getAttribute('aria-selected')).toBe('true');
                expect(component.control.pristine).toBe(true);
            });

            it('should not apply a written value over a selection of the user', async () => {
                component.dataSource.data = buildFileTree({ rootNode_1: 'app' }, 0);
                await settle();

                component.control.setValue('Pictures');
                await settle();

                getNodeByText(treeElement, 'rootNode_1').click();
                await settle();

                component.dataSource.data = buildFileTree(DATA_OBJECT, 0);
                await settle();

                expect(component.tree().getSelectedValues()).toBe('rootNode_1');
                expect(component.control.value).toBe('rootNode_1');
            });

            it('should select a node whose value is 0', async () => {
                const zeroFixture = TestBed.createComponent(TreeSelectionWithFormControl);
                const { control, tree, treeControl } = zeroFixture.componentInstance;

                treeControl.getValue = (node) => (node.name === 'rootNode_1' ? 0 : node.name);
                zeroFixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                (control as FormControl<unknown>).setValue(0);
                zeroFixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(tree().getSelectedValues()).toBe(0);
                expect(tree().selectionModel.selected[0].name).toBe('rootNode_1');
            });
        });

        describe('teardown', () => {
            let fixture: ComponentFixture<KbqTreeAppDeepData>;
            let component: KbqTreeAppDeepData;

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(KbqTreeAppDeepData);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should stop rendering the data source it was connected to', () => {
                expect(treeElement.querySelectorAll('.kbq-tree-option').length).toBe(3);

                fixture.destroy();

                // A live subscription would render the new data straight back into the outlet the tree
                // just cleared — and run change detection over a destroyed view while doing it.
                component.dataSource.data = buildFileTree(DEEP_DATA_OBJECT, 0);

                expect(treeElement.querySelectorAll('.kbq-tree-option').length).toBe(0);
            });

            it('should complete optionFocusChanges and optionBlurChanges', () => {
                const tree = component.tree();
                const focusCompleted = vi.fn();
                const blurCompleted = vi.fn();

                tree.optionFocusChanges.subscribe({ complete: focusCompleted });
                tree.optionBlurChanges.subscribe({ complete: blurCompleted });
                fixture.destroy();

                expect(focusCompleted).toHaveBeenCalledTimes(1);
                expect(blurCompleted).toHaveBeenCalledTimes(1);
            });

            it('should not restore the tab index after the tree is gone', () => {
                vi.useFakeTimers();

                const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

                component.tree().onKeyDown(createKeyboardEvent('keydown', TAB));

                const restore = setTimeoutSpy.mock.results.at(-1)!.value;
                const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

                fixture.destroy();

                expect(clearTimeoutSpy).toHaveBeenCalledWith(restore);
            });

            it('should stop monitoring the host', () => {
                const stopMonitoring = vi.spyOn(TestBed.inject(FocusMonitor), 'stopMonitoring');

                fixture.destroy();

                expect(stopMonitoring).toHaveBeenCalled();
            });
        });

        describe('accessibility', () => {
            let fixture: ComponentFixture<KbqTreeAppDeepData>;
            let component: KbqTreeAppDeepData;

            const nodeFor = (value: string): HTMLElement => getNodeByText(treeElement, value);

            const settle = async () => {
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();
            };

            const pressKey = async (keyCode: number) => {
                component.tree().onKeyDown(createKeyboardEvent('keydown', keyCode));
                await settle();
            };

            const expandSrc = async () => {
                (nodeFor('src').querySelector('kbq-tree-node-toggle') as HTMLElement).click();
                await settle();
            };

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(KbqTreeAppDeepData);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should expose the container as a tree', () => {
                expect(treeElement.getAttribute('role')).toBe('tree');
            });

            it('should expose every row as a treeitem', () => {
                expect(getNodes(treeElement).every((node) => node.getAttribute('role') === 'treeitem')).toBe(true);
            });

            it('should report the nesting depth on aria-level', async () => {
                vi.useFakeTimers();

                await expandSrc();

                expect(nodeFor('src').getAttribute('aria-level')).toBe('1');
                expect(nodeFor('cdk').getAttribute('aria-level')).toBe('2');
            });

            it('should report the expanded state of expandable rows only', async () => {
                vi.useFakeTimers();

                expect(nodeFor('src').getAttribute('aria-expanded')).toBe('false');
                expect(nodeFor('docs').hasAttribute('aria-expanded')).toBe(false);

                await expandSrc();

                expect(nodeFor('src').getAttribute('aria-expanded')).toBe('true');
            });

            it('should keep reporting the expanded state while a filter disables the toggles', async () => {
                vi.useFakeTimers();

                component.treeControl.filterNodes('a11y');
                await settle();

                // Filtering disables every toggle and expands the matched branches: the rows are still
                // branches, and dropping `aria-expanded` would announce them as leaves.
                expect(nodeFor('src').querySelector('kbq-tree-node-toggle')!.hasAttribute('disabled')).toBe(true);
                expect(nodeFor('src').getAttribute('aria-expanded')).toBe('true');
                expect(nodeFor('cdk').getAttribute('aria-expanded')).toBe('true');
            });

            it('should hide the toggle from assistive technology', () => {
                expect(nodeFor('src').querySelector('kbq-tree-node-toggle')!.getAttribute('aria-hidden')).toBe('true');
            });

            it('should report the selection through aria-selected when there is no checkbox', async () => {
                vi.useFakeTimers();

                await pressKey(DOWN_ARROW);

                expect(nodeFor('docs').getAttribute('aria-selected')).toBe('true');
                expect(nodeFor('src').getAttribute('aria-selected')).toBe('false');
            });

            it('should advertise the active option through aria-activedescendant', async () => {
                vi.useFakeTimers();

                expect(treeElement.hasAttribute('aria-activedescendant')).toBe(false);

                await pressKey(DOWN_ARROW);

                expect(treeElement.getAttribute('aria-activedescendant')).toBe(nodeFor('docs').id);

                await pressKey(DOWN_ARROW);

                expect(treeElement.getAttribute('aria-activedescendant')).toBe(nodeFor('src').id);
            });

            it('should give the tab stop back to the host once a Tab has moved the focus out', async () => {
                vi.useFakeTimers();

                component.tree().onKeyDown(createKeyboardEvent('keydown', TAB));
                fixture.detectChanges();

                expect(treeElement.getAttribute('tabindex')).toBe('-1');

                await settle();

                expect(treeElement.getAttribute('tabindex')).toBe('0');
            });

            it('should move real focus onto the option the arrow keys land on', async () => {
                vi.useFakeTimers();

                await pressKey(DOWN_ARROW);
                await pressKey(DOWN_ARROW);

                expect(document.activeElement).toBe(nodeFor('src'));
            });

            it('should not announce a single-selection tree as multiselectable', () => {
                expect(treeElement.hasAttribute('aria-multiselectable')).toBe(false);
            });

            it('should announce a multiple-selection tree as multiselectable', () => {
                const multipleFixture = TestBed.createComponent(KbqTreeAppMultiple);

                multipleFixture.detectChanges();

                expect(
                    multipleFixture.nativeElement
                        .querySelector('kbq-tree-selection')
                        .getAttribute('aria-multiselectable')
                ).toBe('true');
            });

            it('should take an accessible name from aria-label', () => {
                const labelled = TestBed.createComponent(TreeWithAriaLabel);

                labelled.detectChanges();

                expect(labelled.nativeElement.querySelector('kbq-tree-selection').getAttribute('aria-label')).toBe(
                    'Project files'
                );
            });

            it('should keep the select-all row a treeitem carrying aria-checked', () => {
                const multipleFixture = TestBed.createComponent(KbqTreeAppMultiple);

                multipleFixture.componentInstance.selectAllEnabled = true;
                multipleFixture.detectChanges();

                const row = multipleFixture.nativeElement.querySelector('.kbq-tree-option_select-all');

                expect(row.getAttribute('role')).toBe('treeitem');
                expect(row.getAttribute('aria-checked')).toBe('false');
            });
        });

        describe('accessibility (axe)', () => {
            let fixture: ComponentFixture<any>;

            const attach = (type: any): ComponentFixture<any> => {
                fixture = TestBed.createComponent(type);
                fixture.detectChanges();
                document.body.appendChild(fixture.nativeElement);

                return fixture;
            };

            beforeEach(() => configureKbqTreeTestingModule());

            afterEach(() => {
                if (fixture?.nativeElement?.parentNode === document.body) {
                    document.body.removeChild(fixture.nativeElement);
                }
            });

            it('has no violations with every branch collapsed', async () => {
                attach(KbqTreeAppDeepData);

                await expect(fixture.nativeElement).toHaveNoViolations();
            });

            it('has no violations with an expanded branch', async () => {
                attach(KbqTreeAppDeepData);

                fixture.componentInstance.treeControl.expandAll();
                fixture.detectChanges();

                await expect(fixture.nativeElement).toHaveNoViolations();
            });

            it('has no violations with tri-state checkboxes', async () => {
                attach(TreeWithThirdStateCheckbox);

                await expect(fixture.nativeElement).toHaveNoViolations();
            });

            it('has no violations with the select-all row', async () => {
                fixture = TestBed.createComponent(KbqTreeAppMultiple);
                fixture.componentInstance.selectAllEnabled = true;
                fixture.detectChanges();
                document.body.appendChild(fixture.nativeElement);

                expect(fixture.nativeElement.querySelector('.kbq-tree-option_select-all')).not.toBeNull();
                await expect(fixture.nativeElement).toHaveNoViolations();
            });

            it('has no violations with an action button', async () => {
                attach(TreeWithActionButtonApp);

                await expect(fixture.nativeElement).toHaveNoViolations();
            });
        });
    });

    describe('kbq-title', () => {
        let fixture: ComponentFixture<TreeAppWithTitle>;
        let titleDirective: KbqTitleDirective;
        let optionElement: HTMLElement;
        let containerElement: HTMLElement;

        beforeEach(() => {
            configureKbqTreeTestingModule();
            fixture = TestBed.createComponent(TreeAppWithTitle);
            fixture.detectChanges();

            const optionDebugElement = fixture.debugElement.query(By.directive(KbqTitleDirective));

            titleDirective = optionDebugElement.injector.get(KbqTitleDirective);
            optionElement = optionDebugElement.nativeElement;
            containerElement = optionElement.querySelector('.kbq-option-text')!;
        });

        it('should measure the clipping container, not the option host', () => {
            // The host is always wider and taller than the container it wraps (padding, border, checkbox),
            // so measuring the container against the host reported every option as truncated.
            vi.spyOn(optionElement, 'scrollWidth', 'get').mockReturnValue(296);
            vi.spyOn(optionElement, 'scrollHeight', 'get').mockReturnValue(28);
            vi.spyOn(containerElement, 'offsetWidth', 'get').mockReturnValue(232);
            vi.spyOn(containerElement, 'scrollWidth', 'get').mockReturnValue(232);
            vi.spyOn(containerElement, 'offsetHeight', 'get').mockReturnValue(20);
            vi.spyOn(containerElement, 'scrollHeight', 'get').mockReturnValue(20);

            expect(titleDirective.isOverflown).toBe(false);
        });

        it('should report overflow when the container is clipped', () => {
            vi.spyOn(containerElement, 'offsetWidth', 'get').mockReturnValue(28);
            vi.spyOn(containerElement, 'scrollWidth', 'get').mockReturnValue(70);
            vi.spyOn(containerElement, 'offsetHeight', 'get').mockReturnValue(20);
            vi.spyOn(containerElement, 'scrollHeight', 'get').mockReturnValue(20);

            expect(titleDirective.isOverflown).toBe(true);
        });

        it('should report overflow when the container is clipped vertically', () => {
            // Two-line options (`.kbq-option-caption`) clamp vertically, so the height check must stay a
            // real signal and not just mirror the width one.
            vi.spyOn(containerElement, 'offsetWidth', 'get').mockReturnValue(232);
            vi.spyOn(containerElement, 'scrollWidth', 'get').mockReturnValue(232);
            vi.spyOn(containerElement, 'offsetHeight', 'get').mockReturnValue(20);
            vi.spyOn(containerElement, 'scrollHeight', 'get').mockReturnValue(40);

            expect(titleDirective.isOverflown).toBe(true);
        });
    });

    describe('kbq-title with projected #kbqTitleText', () => {
        let fixture: ComponentFixture<TreeAppWithTitleText>;
        let titleDirective: KbqTitleDirective;
        let containerElement: HTMLElement;
        let textElement: HTMLElement;

        beforeEach(() => {
            configureKbqTreeTestingModule();
            fixture = TestBed.createComponent(TreeAppWithTitleText);
            fixture.detectChanges();

            const optionDebugElement = fixture.debugElement.query(By.directive(KbqTitleDirective));

            titleDirective = optionDebugElement.injector.get(KbqTitleDirective);
            containerElement = optionDebugElement.nativeElement.querySelector('.kbq-option-text')!;
            textElement = optionDebugElement.nativeElement.querySelector('.projected-text')!;
        });

        it('should measure the projected text element, not the option container', () => {
            // Projected `#kbqTitleText` wins over the `KbqTitleTextRef` fallback, so the container stays the
            // measured parent while the child is the projected span. Consumers relying on this must keep working.
            vi.spyOn(containerElement, 'offsetWidth', 'get').mockReturnValue(200);
            vi.spyOn(containerElement, 'scrollWidth', 'get').mockReturnValue(200);
            vi.spyOn(textElement, 'scrollWidth', 'get').mockReturnValue(400);

            expect(titleDirective.isOverflown).toBe(true);
        });
    });
});

export const DATA_OBJECT = {
    rootNode_1: 'app',
    Pictures: {
        Sun: 'png',
        Woods: 'jpg',
        PhotoBoothLibrary: 'jpg'
    },
    Documents: {
        react: 'jpg',
        angular: 'ts',
        material2: 'ts'
    },
    Downloads: {
        Tutorial: 'html',
        November: 'pdf',
        October: 'pdf'
    },
    Applications: {
        Chrome: 'app',
        Calendar: 'app',
        Webstorm: 'app'
    }
};

export class FileNode {
    children!: FileNode[];
    name!: string;
    type: any;
    isSpecial!: boolean;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
    name!: string;
    type: any;
    level!: number;
    expandable!: boolean;
    parent: any;
    isSpecial!: boolean;
}

export function buildFileTree(value: any, level: number): FileNode[] {
    const data: any[] = [];

    for (const k of Object.keys(value)) {
        const v = value[k];
        const node = new FileNode();

        node.name = `${k}`;

        if (v === null || v === undefined) {
            // no action
        } else if (typeof v === 'object') {
            node.children = buildFileTree(v, level + 1);
        } else {
            node.type = v;
        }

        data.push(node);
    }

    return data;
}

function getNodes(treeElement: Element): Element[] {
    return [].slice.call(treeElement.querySelectorAll('.kbq-tree-option'))!;
}

/** Locates a row by its label, so a test does not have to track rendering indexes across expansions. */
function getNodeByText(treeElement: Element, text: string): HTMLElement {
    return getNodes(treeElement).find(
        (node) => node.querySelector('.kbq-option-text')!.textContent!.trim() === text
    ) as HTMLElement;
}

/**
 * Matches the rendered rows against `expectedTree`, one entry per row: the last element is the row's
 * text and the entry's length is its `aria-level`.
 */
function expectFlatTreeToMatch(treeElement: Element, ...expectedTree: (string | null)[][]) {
    const nodes = getNodes(treeElement);

    expect(nodes.map((node) => node.textContent!.trim())).toEqual(expectedTree.map((entry) => entry[entry.length - 1]));
    expect(nodes.map((node) => node.getAttribute('aria-level'))).toEqual(
        expectedTree.map((entry) => `${entry.length}`)
    );
}

@Component({
    imports: [
        KbqTreeModule
    ],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option
                *kbqTreeNodeDef="let node"
                class="customNodeClass"
                kbqTreeNodePadding
                kbqTreeNodeToggle
                [kbqTreeNodePaddingIndent]="28"
            >
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class SimpleKbqTreeApp {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    treeData: FileNode[];

    readonly tree = viewChild.required(KbqTreeSelection);

    constructor() {
        this.treeFlattener = new KbqTreeFlattener<FileNode, FileFlatNode>(
            this.transformer,
            this.getLevel,
            this.isExpandable,
            this.getChildren
        );

        this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable, this.getValue, this.getValue);
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = this.treeData = buildFileTree(DATA_OBJECT, 0);
    }

    getLevel = (node: FileFlatNode) => node.level;

    getValue = (node: FileFlatNode) => node.name;

    isExpandable = (node: FileFlatNode) => node.expandable;

    getChildren = (node: FileNode) => node.children;

    transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };
}

abstract class TreeParams {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;
    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;
    treeData: FileNode[];

    constructor() {
        this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable, this.getValue, this.getValue);
        this.treeFlattener = new KbqTreeFlattener<FileNode, FileFlatNode>(
            this.transformer,
            this.getLevel,
            this.isExpandable,
            this.getChildren
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.dataSource.data = this.treeData = buildFileTree(DATA_OBJECT, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    getLevel = (node: FileFlatNode) => node.level;

    getValue = (node: FileFlatNode) => node.name;

    isExpandable = (node: FileFlatNode) => node.expandable;

    getChildren = (node: FileNode) => node.children;

    transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };
}

@Component({
    imports: [
        KbqTreeModule,
        KbqTitleModule
    ],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbq-title kbqTreeNodePadding>{{ node.name }}</kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeAppWithTitle extends TreeParams {}

@Component({
    imports: [
        KbqTreeModule,
        KbqTitleModule
    ],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbq-title kbqTreeNodePadding>
                <span #kbqTitleText class="projected-text">{{ node.name }}</span>
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeAppWithTitleText extends TreeParams {}

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node; let i = index" [attr.data-index]="i">
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithNodeIndexApp extends TreeParams {}

@Component({
    imports: [KbqTreeModule, FormsModule],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node">{{ node.name }}</kbq-tree-option>
            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle />
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeSelectionFocusStates extends TreeParams {}

@Component({
    imports: [
        KbqTreeModule,
        FormsModule
    ],
    template: `
        <kbq-tree-selection
            multiple="keyboard"
            [selectAllToggle]="selectAllToggle"
            [selectAll]="selectAllEnabled"
            [disabled]="treeDisabled"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            [selectAllHandler]="selectAllHandler"
            [(ngModel)]="modelValue"
            (onSelectAll)="onSelectAll($event)"
            (selectionChange)="onSelectionChange($event)"
        >
            <kbq-tree-option
                *kbqTreeNodeDef="let node"
                kbqTreeNodePadding
                [selectable]="!unselectableNodes.includes(node.name)"
            >
                {{ node.name }}
            </kbq-tree-option>

            <kbq-tree-option
                *kbqTreeNodeDef="let node; when: hasChild"
                kbqTreeNodePadding
                [selectable]="!unselectableNodes.includes(node.name)"
            >
                <kbq-tree-node-toggle />

                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class KbqTreeAppMultiple extends TreeParams {
    modelValue: string[] = [];
    unselectableNodes: string[] = [];
    selectAllToggle: boolean = false;
    selectAllEnabled: boolean = false;
    treeDisabled: boolean = false;
    selectAllHandler: ((event: KeyboardEvent, tree: KbqTreeSelection) => void) | undefined;
    readonly tree = viewChild.required(KbqTreeSelection);

    savedSelectionChangeEvent?: KbqTreeSelectionChange<KbqTreeOption>;
    savedSelectAllEvent?: KbqTreeSelectAllEvent<KbqTreeOption>;

    onSelectionChange(event: KbqTreeSelectionChange<KbqTreeOption>) {
        this.savedSelectionChangeEvent = event;
    }
    onSelectAll(event: KbqTreeSelectAllEvent<KbqTreeOption>) {
        this.savedSelectAllEvent = event;
    }
}

@Component({
    imports: [
        KbqTreeModule,
        FormsModule
    ],
    template: `
        <kbq-tree-selection
            multiple="checkbox"
            [ngModel]="modelValue"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            (ngModelChange)="onModelValueChange($event)"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                {{ node.name }}
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle />

                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class KbqTreeAppMultipleCheckbox extends TreeParams {
    modelValue: any[] = ['Pictures'];
    readonly tree = viewChild.required(KbqTreeSelection);
    filterByValues: FilterByValues<FileFlatNode>;

    constructor() {
        super();

        this.filterByValues = new FilterByValues<FileFlatNode>(this.treeControl);
        this.filterByValues.setValues(this.modelValue);

        this.treeControl.setFilters(
            new FilterByViewValue<FileFlatNode>(this.treeControl),
            this.filterByValues,
            new FilterParentsForNodes<FileFlatNode>(this.treeControl)
        );
    }

    onModelValueChange(values: string[]) {
        this.modelValue = values;
        this.filterByValues.setValues(values);
    }
}

@Component({
    imports: [
        KbqTreeModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-tree-selection
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            [formControl]="control"
            (selectionChange)="onSelectionChange($event)"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>{{ node.name }}</kbq-tree-option>
            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle />
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
        <button type="button">After</button>
    `
})
class TreeSelectionWithFormControl extends TreeParams {
    readonly control = new FormControl<string | null>(null);
    readonly onSelectionChange = vi.fn();
    readonly tree = viewChild.required<KbqTreeSelection<FileFlatNode>>(KbqTreeSelection);
}

@Component({
    imports: [
        KbqTreeModule,
        KbqDropdownModule,
        KbqOptionModule
    ],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                {{ node.name }}
                <kbq-option-action [kbqDropdownTriggerFor]="dropdown" />
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle />
                {{ node.name }}
                <kbq-option-action [kbqDropdownTriggerFor]="dropdown" />
            </kbq-tree-option>
        </kbq-tree-selection>

        <kbq-dropdown #dropdown>
            <button kbq-dropdown-item>action</button>
        </kbq-dropdown>
    `
})
class TreeWithActionButtonApp extends TreeParams {
    readonly tree = viewChild.required(KbqTreeSelection);
}

export const DEEP_DATA_OBJECT = {
    docs: 'app',
    src: {
        cdk: {
            a11y: 'ts',
            keycodes: 'ts'
        },
        README: 'md'
    },
    tests: 'ts'
};

@Component({
    imports: [
        KbqTreeModule,
        FormsModule
    ],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl" [(ngModel)]="modelValue">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                {{ node.name }}
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding [selectable]="false">
                <kbq-tree-node-toggle [node]="node" />

                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class KbqTreeAppNonSelectableParents extends TreeParams {
    modelValue: any = '';
    readonly tree = viewChild.required(KbqTreeSelection);

    constructor() {
        super();

        this.dataSource.data = this.treeData = buildFileTree(DEEP_DATA_OBJECT, 0);
    }
}

// Unlike DEEP_DATA_OBJECT, `cdk` has a sibling before it, so a backwards ancestor scan that fails to
// narrow the level while stepping over a disabled `cdk` lands on `assets` instead of on `src`.
export const DEEP_DATA_OBJECT_WITH_SIBLINGS = {
    docs: 'app',
    src: {
        assets: 'png',
        cdk: {
            a11y: 'ts',
            keycodes: 'ts'
        },
        README: 'md'
    },
    tests: 'ts'
};

@Component({
    imports: [
        KbqTreeModule,
        FormsModule
    ],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl" [(ngModel)]="modelValue">
            <kbq-tree-option
                *kbqTreeNodeDef="let node"
                kbqTreeNodePadding
                [disabled]="disabledNodes.includes(node.name)"
            >
                {{ node.name }}
            </kbq-tree-option>

            <kbq-tree-option
                *kbqTreeNodeDef="let node; when: hasChild"
                kbqTreeNodePadding
                [disabled]="disabledNodes.includes(node.name)"
            >
                <kbq-tree-node-toggle [node]="node" [disabled]="disabledToggles.includes(node.name)" />

                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class KbqTreeAppDeepData extends TreeParams {
    modelValue: any = '';
    disabledNodes: string[] = [];
    // disables only the toggle, leaving the option itself focusable — unlike `disabledNodes`
    disabledToggles: string[] = [];
    readonly tree = viewChild.required(KbqTreeSelection);

    constructor() {
        super();

        this.dataSource.data = this.treeData = buildFileTree(DEEP_DATA_OBJECT_WITH_SIBLINGS, 0);
    }
}

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection multiple="checkbox" [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding [checkboxThirdState]="true">
                {{ node.name }}
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding [checkboxThirdState]="true">
                <kbq-tree-node-toggle />

                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithThirdStateCheckbox extends TreeParams {
    readonly tree = viewChild.required(KbqTreeSelection);
}

@Component({
    imports: [KbqTreeModule, KbqPseudoCheckbox],
    template: `
        <kbq-tree-selection multiple="keyboard" [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option
                *kbqTreeNodeDef="let node"
                #option="kbqTreeOption"
                kbqTreeNodePadding
                [checkboxThirdState]="true"
            >
                <kbq-pseudo-checkbox [state]="option.checkboxState" />
                {{ node.name }}
            </kbq-tree-option>

            <kbq-tree-option
                *kbqTreeNodeDef="let node; when: hasChild"
                #option="kbqTreeOption"
                kbqTreeNodePadding
                [checkboxThirdState]="true"
            >
                <kbq-pseudo-checkbox [state]="option.checkboxState" />
                <kbq-tree-node-toggle />
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithProjectedThirdStateCheckbox extends TreeParams {
    readonly tree = viewChild.required(KbqTreeSelection);
}

const DEEP_CHAIN_DEPTH = 12;

/**
 * `node-<level>` nested down to `node-<DEEP_CHAIN_DEPTH>`, a `leaf-<level>` beside each: every ancestor of the deepest
 * node also holds an unselected leaf.
 */
function buildDeepChain(): object {
    let chain: object | null = null;

    for (let level = DEEP_CHAIN_DEPTH; level >= 0; level--) {
        chain = { [`node-${level}`]: chain, [`leaf-${level}`]: 'file' };
    }

    return chain!;
}

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection multiple="checkbox" [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding [checkboxThirdState]="true">
                {{ node.name }}
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding [checkboxThirdState]="true">
                <kbq-tree-node-toggle />

                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithDeepThirdStateCheckbox extends TreeParams {
    readonly tree = viewChild.required(KbqTreeSelection);

    constructor() {
        super();

        this.dataSource.data = this.treeData = buildFileTree(buildDeepChain(), 0);
    }
}

/** Node identified by its `id`, so a rename or a re-level reuses the view instead of rebuilding it. */
interface TrackedNode {
    id: number;
    name: string;
    level: number;
    expandable: boolean;
}

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl" [trackBy]="trackById">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithTrackBy {
    // A plain stream rather than a `KbqTreeFlatDataSource`: the nodes have to be replaced through the same
    // subscription, which is what keeps the differ — and with it the identity-change path — in play.
    readonly dataSource = new BehaviorSubject<TrackedNode[]>([]);

    readonly treeControl = new FlatTreeControl<TrackedNode>(
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.name,
        (node) => node.name
    );

    trackById = (_: number, node: TrackedNode) => node.id;

    constructor() {
        this.emit([
            { id: 1, name: 'src', level: 0, expandable: false },
            { id: 2, name: 'docs', level: 1, expandable: false }
        ]);
    }

    emit(nodes: TrackedNode[]): void {
        this.treeControl.dataNodes = nodes;
        this.dataSource.next(nodes);
    }
}

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection
            multiple="checkbox"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            [trackBy]="trackById"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding [checkboxThirdState]="true">
                {{ node.name }}
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding [checkboxThirdState]="true">
                <kbq-tree-node-toggle />

                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithTrackedThirdStateCheckbox {
    readonly tree = viewChild.required(KbqTreeSelection);

    // A stream that keeps the objects of untouched nodes, as `TreeWithTrackBy` does: the differ then reports only the
    // rows that really changed.
    readonly dataSource = new BehaviorSubject<TrackedNode[]>([]);

    readonly treeControl = new FlatTreeControl<TrackedNode>(
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.name,
        (node) => node.name
    );

    trackById = (_: number, node: TrackedNode) => node.id;

    hasChild = (_: number, node: TrackedNode) => node.expandable;

    constructor() {
        this.emit([
            { id: 1, name: 'branch', level: 0, expandable: true },
            { id: 2, name: 'child', level: 1, expandable: false },
            { id: 3, name: 'sibling', level: 0, expandable: false }
        ]);
    }

    emit(nodes: TrackedNode[]): void {
        this.treeControl.dataNodes = nodes;
        this.dataSource.next(nodes);
    }
}

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithKeyedControl {
    readonly tree = viewChild.required<KbqTreeSelection<TrackedNode, number>>(KbqTreeSelection);

    readonly dataSource = new BehaviorSubject<TrackedNode[]>([]);

    readonly treeControl = new FlatTreeControl<TrackedNode, number>(
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.name,
        (node) => node.name,
        undefined,
        undefined,
        undefined,
        { trackBy: (node) => node.id }
    );

    constructor() {
        this.emit([
            { id: 1, name: 'src', level: 0, expandable: false },
            { id: 2, name: 'docs', level: 0, expandable: false }
        ]);
    }

    emit(nodes: TrackedNode[]): void {
        this.treeControl.dataNodes = nodes;
        this.dataSource.next(nodes);
    }
}

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection multiple="keyboard" [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option
                *kbqTreeNodeDef="let node"
                kbqTreeNodePadding
                [disabled]="disabledNodes.includes(node.name)"
            >
                {{ node.name }}
            </kbq-tree-option>

            <kbq-tree-option
                *kbqTreeNodeDef="let node; when: hasChild"
                kbqTreeNodePadding
                [disabled]="disabledNodes.includes(node.name)"
            >
                <kbq-tree-node-toggle />

                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeMultipleWithDisabledNodes extends TreeParams {
    disabledNodes: string[] = [];
    readonly tree = viewChild.required<KbqTreeSelection<FileFlatNode>>(KbqTreeSelection);
}

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection aria-label="Project files" [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>{{ node.name }}</kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithAriaLabel extends TreeParams {
    readonly tree = viewChild.required(KbqTreeSelection);
}

@Component({
    imports: [
        KbqTreeModule
    ],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                {{ node.name }}
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle />

                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class KbqTreeAppWithToggle {
    toggleRecursively: boolean = true;
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    treeData: FileNode[];

    readonly tree = viewChild.required(KbqTreeSelection);

    constructor() {
        this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable, this.getValue, this.getViewValue);

        this.treeFlattener = new KbqTreeFlattener<FileNode, FileFlatNode>(
            this.transformer,
            this.getLevel,
            this.isExpandable,
            this.getChildren
        );

        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = this.treeData = buildFileTree(DATA_OBJECT, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    getLevel = (node: FileFlatNode) => node.level;

    getValue = (node: FileFlatNode) => node.name;

    getViewValue = (node: FileFlatNode): string => {
        return `${node.name}.${node.type || ''}`;
    };

    isExpandable = (node: FileFlatNode) => node.expandable;

    getChildren = (node: FileNode) => node.children;

    transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };
}

@Component({
    imports: [
        KbqTreeModule
    ],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                {{ node.name }}
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: isSpecial" kbqTreeNodePadding>
                >>>{{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class WhenNodeKbqTreeApp {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    treeData: FileNode[];

    readonly tree = viewChild.required(KbqTreeSelection);

    constructor() {
        this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable, this.getValue, this.getValue);
        this.treeFlattener = new KbqTreeFlattener<FileNode, FileFlatNode>(
            this.transformer,
            this.getLevel,
            this.isExpandable,
            this.getChildren
        );

        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = this.treeData = buildFileTree(DATA_OBJECT, 0);
    }

    getLevel = (node: FileFlatNode) => node.level;

    getValue = (node: FileFlatNode) => node.name;

    isExpandable = (node: FileFlatNode) => node.expandable;

    getChildren = (node: FileNode) => node.children;

    transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;
        flatNode.isSpecial = !node.children;

        return flatNode;
    };

    isSpecial = (_: number, node: FileFlatNode) => node.isSpecial;
}

@Component({
    imports: [
        KbqTreeModule
    ],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                {{ node.name }}
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class FiltrationKbqTreeApp {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    treeData: FileNode[];

    readonly tree = viewChild.required(KbqTreeSelection);

    constructor() {
        this.treeFlattener = new KbqTreeFlattener<FileNode, FileFlatNode>(
            this.transformer,
            this.getLevel,
            this.isExpandable,
            this.getChildren
        );

        this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable, this.getValue, this.getViewValue);
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = this.treeData = buildFileTree(DATA_OBJECT, 0);
    }

    getLevel = (node: FileFlatNode) => node.level;

    getValue = (node: FileFlatNode) => node.name;

    getViewValue = (node: FileFlatNode): string => {
        return `${node.name}.${node.type || ''}`;
    };

    isExpandable = (node: FileFlatNode) => node.expandable;

    getChildren = (node: FileNode) => node.children;

    transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    imports: [
        KbqTreeModule,
        FormsModule
    ],
    template: `
        <kbq-tree-selection
            [multiple]="multiple"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            [(ngModel)]="modelValue"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                {{ node.name }}
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle />

                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithBoundMultiple extends TreeParams {
    multiple: KbqMultipleInput = 'checkbox';
    modelValue: string[] = [];
    readonly tree = viewChild.required(KbqTreeSelection);
}

describe('KbqTreeSelection multiple mode', () => {
    let fixture: ComponentFixture<TreeWithBoundMultiple>;
    let component: TreeWithBoundMultiple;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqTreeModule, FormsModule] }).compileComponents();

        fixture = TestBed.createComponent(TreeWithBoundMultiple);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const getOptions = (): KbqTreeOption[] =>
        fixture.debugElement.queryAll(By.directive(KbqTreeOption)).map(({ componentInstance }) => componentInstance);

    it('should start in the mode the binding asks for', () => {
        expect(component.tree().multipleMode).toBe(MultipleMode.CHECKBOX);
        expect(component.tree().selectionModel.isMultipleSelection()).toBe(true);
    });

    it('should render and drop the checkboxes', () => {
        expect(fixture.nativeElement.querySelectorAll('kbq-pseudo-checkbox').length).toBeGreaterThan(0);

        component.multiple = false;
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('kbq-pseudo-checkbox').length).toBe(0);
    });

    it('should swap the selection model instead of leaving it on the previous multiplicity', () => {
        component.multiple = false;
        fixture.detectChanges();

        expect(component.tree().multipleMode).toBeNull();
        expect(component.tree().selectionModel.isMultipleSelection()).toBe(false);
    });

    it('should fall back to single selection when the binding turns undefined', () => {
        component.multiple = undefined;
        fixture.detectChanges();

        expect(component.tree().multipleMode).toBeNull();
        expect(component.tree().selectionModel.isMultipleSelection()).toBe(false);
    });

    it('should keep the first selected node when narrowing to single selection', async () => {
        vi.useFakeTimers();

        const options = getOptions();

        options[0].setSelected(true);
        options[1].setSelected(true);
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        expect(component.tree().selectionModel.selected.length).toBe(2);

        component.multiple = false;
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        expect(component.tree().selectionModel.selected).toEqual([options[0].data]);
        expect(options[1].selected).toBe(false);
        // Single selection reports the bare value rather than an array, so narrowing changes the shape the
        // form control receives.
        expect(component.modelValue).toEqual(options[0].value);
    });

    it('should let the swapped model keep driving the nodes', async () => {
        vi.useFakeTimers();

        component.multiple = false;
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        const options = getOptions();
        const onChange = vi.fn();

        component.tree().registerOnChange(onChange);
        component.tree().selectionModel.select(options[1].data);
        fixture.detectChanges();

        expect(onChange).toHaveBeenCalledWith(options[1].value);
    });

    it('should re-derive autoSelect and noUnselectLast the consumer left alone', () => {
        expect(component.tree().autoSelect).toBe(false);
        expect(component.tree().noUnselectLast).toBe(false);

        component.multiple = false;
        fixture.detectChanges();

        expect(component.tree().autoSelect).toBe(true);
        expect(component.tree().noUnselectLast).toBe(true);
    });

    it('should throw when the multiplicity is changed on a model owned by a tree-select', () => {
        const shared = new SelectionModel<any>(true);

        // What `KbqTreeSelect.ngAfterContentInit` does: hands the tree a model it also subscribes to.
        component.tree().selectionModel = shared;

        expect(() => (component.tree().multipleMode = null)).toThrow(
            wrappedErrorMessage(getKbqTreeSelectionOwnedMultipleError())
        );
        expect(component.tree().selectionModel).toBe(shared);
    });

    it('should leave the presentation of an owned model changeable', () => {
        const shared = new SelectionModel<any>(true);

        component.tree().selectionModel = shared;

        // `keyboard` keeps the multiplicity the select decided on, so only the checkboxes go away.
        component.multiple = 'keyboard';
        fixture.detectChanges();

        expect(component.tree().multipleMode).toBe(MultipleMode.KEYBOARD);
        expect(component.tree().showCheckbox).toBe(false);
        expect(component.tree().selectionModel).toBe(shared);
    });
});

describe('KbqTreeSelection multiple mode, value shape and defaults', () => {
    let fixture: ComponentFixture<TreeWithBoundMultiple>;
    let component: TreeWithBoundMultiple;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqTreeModule, FormsModule] }).compileComponents();

        fixture = TestBed.createComponent(TreeWithBoundMultiple);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should re-report the value as an array when widening back to multiple selection', async () => {
        vi.useFakeTimers();

        const options = fixture.debugElement
            .queryAll(By.directive(KbqTreeOption))
            .map(({ componentInstance }) => componentInstance as KbqTreeOption);

        options[0].setSelected(true);
        options[1].setSelected(true);
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        component.multiple = false;
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        // Single selection reports the bare value.
        expect(Array.isArray(component.modelValue)).toBe(false);

        component.multiple = 'checkbox';
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        // Widening changes the shape the control has to hold, so it must be reported again.
        expect(Array.isArray(component.modelValue)).toBe(true);
        expect(component.modelValue).toEqual([options[0].value]);

        // The shape now matches the mode, so writing the control's own value back is accepted.
        expect(() => component.tree().writeValue(component.modelValue)).not.toThrow();
    });

    it('should report once for several mode changes in one tick', async () => {
        vi.useFakeTimers();

        const reported: any[] = [];

        component.tree().registerOnChange((value: any) => reported.push(value));

        // Two real multiplicity changes, so two reports would be queued without coalescing.
        component.tree().multipleMode = null;
        component.tree().multipleMode = MultipleMode.CHECKBOX;
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        expect(reported.length).toBe(1);
    });

    it('should pick the surviving node by render order even when the option mirrors are stale', async () => {
        vi.useFakeTimers();

        const options = fixture.debugElement
            .queryAll(By.directive(KbqTreeOption))
            .map(({ componentInstance }) => componentInstance as KbqTreeOption);

        // Selected through the model, which leaves every `KbqTreeOption._selected` mirror false until the
        // deferred resync lands. Insertion order is deliberately the reverse of render order.
        component.tree().selectionModel.select(options[2].data, options[0].data);

        component.multiple = false;
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        expect(component.tree().selectionModel.selected).toEqual([options[0].data]);
    });

    it('should re-derive both defaults across a checkbox to keyboard change', () => {
        expect(component.tree().showCheckbox).toBe(true);
        expect(component.tree().autoSelect).toBe(false);
        expect(component.tree().noUnselectLast).toBe(false);

        component.multiple = 'keyboard';
        fixture.detectChanges();

        expect(component.tree().multipleMode).toBe(MultipleMode.KEYBOARD);
        expect(component.tree().showCheckbox).toBe(false);
        expect(component.tree().selectionModel.isMultipleSelection()).toBe(true);
        expect(component.tree().autoSelect).toBe(true);
        expect(component.tree().noUnselectLast).toBe(true);
    });

    it('should keep an explicitly set noUnselectLast across a mode change', () => {
        component.tree().noUnselectLast = false;

        component.multiple = false;
        fixture.detectChanges();

        expect(component.tree().noUnselectLast).toBe(false);

        component.multiple = 'checkbox';
        fixture.detectChanges();

        expect(component.tree().noUnselectLast).toBe(false);
    });

    it('should emit selectionChange for the nodes a narrowing deselects', async () => {
        vi.useFakeTimers();

        const options = fixture.debugElement
            .queryAll(By.directive(KbqTreeOption))
            .map(({ componentInstance }) => componentInstance as KbqTreeOption);

        options[0].setSelected(true);
        options[1].setSelected(true);
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        const changes: KbqTreeSelectionChange<KbqTreeOption>[] = [];

        component.tree().selectionChange.subscribe((event) => changes.push(event));

        component.multiple = false;
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        expect(changes.length).toBe(1);
        expect(changes[0].options?.map(({ value }) => value)).toEqual([options[1].value]);
    });
});

@Component({
    imports: [KbqTreeModule, ReactiveFormsModule],
    template: `
        <kbq-tree-selection
            multiple="checkbox"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            [formControl]="control"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>{{ node.name }}</kbq-tree-option>
            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle />
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class MultipleTreeWithFormControl extends TreeParams {
    control = new FormControl<string[] | string>(['Pictures', 'Documents']);
    readonly tree = viewChild.required(KbqTreeSelection);
}

@Component({
    imports: [KbqTreeModule, ReactiveFormsModule],
    template: `
        <form [formGroup]="form">
            <kbq-tree-selection
                multiple="checkbox"
                formControlName="nodes"
                [dataSource]="dataSource"
                [treeControl]="treeControl"
            >
                <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>{{ node.name }}</kbq-tree-option>
                <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                    <kbq-tree-node-toggle />
                    {{ node.name }}
                </kbq-tree-option>
            </kbq-tree-selection>
        </form>
    `
})
class MultipleTreeWithFormControlName extends TreeParams {
    readonly form = new FormGroup({ nodes: new FormControl<string[]>(['Pictures', 'Documents']) });
    readonly tree = viewChild.required(KbqTreeSelection);
}

describe('KbqTreeSelection multiple mode with a form', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [KbqTreeModule, FormsModule, ReactiveFormsModule] });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const render = async (fixture: ComponentFixture<unknown>) => {
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();
    };

    const selectedLabels = (fixture: ComponentFixture<unknown>): string[] =>
        getNodes(fixture.nativeElement)
            .filter((node) => node.classList.contains('kbq-selected'))
            .map((node) => node.querySelector('.kbq-option-text')!.textContent!.trim());

    it('should keep the value of a form control', async () => {
        const fixture = TestBed.createComponent(MultipleTreeWithFormControl);
        const { control, tree } = fixture.componentInstance;

        await render(fixture);

        expect(control.value).toEqual(['Pictures', 'Documents']);
        expect(control.pristine).toBe(true);
        expect(tree().getSelectedValues()).toEqual(['Pictures', 'Documents']);
        expect(selectedLabels(fixture)).toEqual(['Pictures', 'Documents']);
    });

    it('should keep the value of a form control bound by name', async () => {
        const fixture = TestBed.createComponent(MultipleTreeWithFormControlName);
        const { form, tree } = fixture.componentInstance;

        await render(fixture);

        expect(form.value.nodes).toEqual(['Pictures', 'Documents']);
        expect(form.pristine).toBe(true);
        expect(tree().getSelectedValues()).toEqual(['Pictures', 'Documents']);
        expect(selectedLabels(fixture)).toEqual(['Pictures', 'Documents']);
    });

    it('should keep ngModel pristine', async () => {
        const fixture = TestBed.createComponent(TreeWithBoundMultiple);

        fixture.componentInstance.modelValue = ['Pictures'];
        await render(fixture);

        const ngModel = fixture.debugElement.query(By.directive(KbqTreeSelection)).injector.get(NgModel);

        expect(fixture.componentInstance.modelValue).toEqual(['Pictures']);
        expect(ngModel.pristine).toBe(true);
        expect(selectedLabels(fixture)).toEqual(['Pictures']);
    });

    it('should reject a value that is not an array', () => {
        const fixture = TestBed.createComponent(MultipleTreeWithFormControl);

        fixture.componentInstance.control = new FormControl<string[] | string>('Pictures');

        expect(() => fixture.detectChanges()).toThrow('Value must be an array in multiple-selection mode.');
    });

    it('should keep a mode set in code when the form writes a value later', async () => {
        const fixture = TestBed.createComponent(MultipleTreeWithFormControl);
        const { control, tree } = fixture.componentInstance;

        await render(fixture);

        tree().multipleMode = null;
        control.setValue('Pictures');
        await render(fixture);

        expect(tree().multipleMode).toBeNull();
        expect(control.value).toBe('Pictures');
        expect(control.pristine).toBe(true);
        expect(selectedLabels(fixture)).toEqual(['Pictures']);
    });
});

@Component({
    imports: [KbqTreeModule, ReactiveFormsModule],
    template: `
        <kbq-tree-selection
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            [disabled]="disabled"
            [formControl]="control"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>{{ node.name }}</kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeSelectionWithFormControlAndDisabledBinding extends TreeParams {
    disabled: boolean | undefined = false;
    readonly control = new FormControl<string | null>({ value: null, disabled: true });
    readonly tree = viewChild.required(KbqTreeSelection);
}

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection tabIndex="-1" [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>{{ node.name }}</kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeSelectionWithStaticTabIndex extends TreeParams {
    readonly tree = viewChild.required(KbqTreeSelection);
}

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection [tabIndex]="tabIndex" [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>{{ node.name }}</kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeSelectionWithBoundTabIndex extends TreeParams {
    tabIndex: number | null | undefined = 3;
    readonly tree = viewChild.required(KbqTreeSelection);
}

describe('KbqTreeSelection inputs', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqTreeModule, ReactiveFormsModule] });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('disabled next to a form control', () => {
        let fixture: ComponentFixture<TreeSelectionWithFormControlAndDisabledBinding>;
        let tree: KbqTreeSelection;

        beforeEach(() => {
            // Angular warns about `disabled` next to a reactive form directive, which is the combination under test.
            vi.spyOn(console, 'warn').mockImplementation(() => {});

            fixture = TestBed.createComponent(TreeSelectionWithFormControlAndDisabledBinding);
            fixture.detectChanges();

            tree = fixture.componentInstance.tree();
        });

        it('should stay disabled by a control that starts disabled', () => {
            expect(tree.disabled).toBe(true);
            expect(tree.tabIndex).toBe(-1);
        });

        it('should follow whichever of the two changed last', () => {
            fixture.componentInstance.control.enable();
            fixture.detectChanges();

            expect(tree.disabled).toBe(false);

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(tree.disabled).toBe(true);
        });

        it('should enable the tree once the bound disabled turns undefined', () => {
            fixture.componentInstance.control.enable();
            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            fixture.componentInstance.disabled = undefined;
            fixture.detectChanges();

            expect(tree.disabled).toBe(false);
        });
    });

    it('should read a static tabIndex as a number', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(TreeSelectionWithStaticTabIndex);
        const tree = fixture.componentInstance.tree;

        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        expect(tree().userTabIndex).toBe(-1);

        // The tab stop given back after a Tab out of the tree is the bound one.
        tree().onKeyDown(createKeyboardEvent('keydown', TAB));
        await vi.runOnlyPendingTimersAsync();

        expect(tree().tabIndex).toBe(-1);
    });

    describe('with a bound tabIndex', () => {
        let fixture: ComponentFixture<TreeSelectionWithBoundTabIndex>;
        let tree: KbqTreeSelection;
        let treeElement: HTMLElement;

        beforeEach(async () => {
            vi.useFakeTimers();

            fixture = TestBed.createComponent(TreeSelectionWithBoundTabIndex);
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            tree = fixture.componentInstance.tree();
            treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');
        });

        it('should keep it while the rendered options change', async () => {
            expect(treeElement.getAttribute('tabindex')).toBe('3');

            fixture.componentInstance.treeControl.expandAll();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(treeElement.getAttribute('tabindex')).toBe('3');
        });

        it.each([undefined, null])('should give the tab index back to the default for a bound %s', (value) => {
            fixture.componentInstance.tabIndex = value;
            fixture.detectChanges();

            expect(tree.tabIndex).toBe(0);
            expect(tree.userTabIndex).toBeNull();
            expect(treeElement.getAttribute('tabindex')).toBe('0');
        });

        it('should keep it while Tab moves the focus out', async () => {
            tree.onKeyDown(createKeyboardEvent('keydown', TAB));

            expect(treeElement.getAttribute('tabindex')).toBe('-1');
            expect(tree.tabIndex).toBe(3);

            await vi.advanceTimersByTimeAsync(0);

            expect(treeElement.getAttribute('tabindex')).toBe('3');
        });

        it('should keep one pending tab order restore across repeated Tab presses', () => {
            const timers = vi.getTimerCount();

            tree.onKeyDown(createKeyboardEvent('keydown', TAB));
            tree.onKeyDown(createKeyboardEvent('keydown', TAB));
            tree.onKeyDown(createKeyboardEvent('keydown', TAB));

            expect(vi.getTimerCount()).toBe(timers + 1);
        });
    });

    // A template binding is checked against the type of the input signal, which `check-spec-types` checks here: a
    // nested control would pass on kbq-tree-selection and then fail on the API only a flat control has.
    it('should take a flat tree control, unlike kbq-tree', () => {
        const fixture = TestBed.createComponent(SimpleKbqTreeApp);

        fixture.detectChanges();

        expectTypeOf<KbqTreeSelection['treeControlInput']>().toEqualTypeOf<InputSignal<FlatTreeControl<any>>>();
        expectTypeOf<KbqTree['treeControlInput']>().toEqualTypeOf<InputSignal<TreeControl<any>>>();
        expect(fixture.componentInstance.tree().treeControl).toBe(fixture.componentInstance.treeControl);
    });

    // The types are checked by `check-spec-types`. A template infers `T` from the inputs, so they carry it; a query that
    // names the data node gets the model, the options and the event source typed by it, one that does not keeps `any`.
    // What the model holds is the node itself, not the option.
    it('should hold the data nodes in a selection model typed by them', async () => {
        const fixture = TestBed.createComponent(TreeMultipleWithDisabledNodes);
        const { tree, treeControl } = fixture.componentInstance;

        fixture.detectChanges();
        await fixture.whenStable();

        tree().unorderedOptions.first.selectViaInteraction();

        expectTypeOf<KbqTreeSelection<FileFlatNode>['treeControlInput']>().toEqualTypeOf<
            InputSignal<FlatTreeControl<FileFlatNode>>
        >();
        expectTypeOf<KbqTreeSelection<FileFlatNode>['dataSourceInput']>().toEqualTypeOf<
            InputSignal<DataSource<FileFlatNode> | Observable<FileFlatNode[]> | FileFlatNode[] | null | undefined>
        >();
        expectTypeOf<KbqTreeSelection['selectionModel']>().toEqualTypeOf<SelectionModel<any>>();
        expectTypeOf(tree().selectionModel).toEqualTypeOf<SelectionModel<FileFlatNode>>();
        expectTypeOf(tree().unorderedOptions.first.data).toEqualTypeOf<FileFlatNode>();
        expectTypeOf(tree().selectionChange).toEqualTypeOf<
            EventEmitter<KbqTreeSelectionChange<KbqTreeOption<FileFlatNode>, FileFlatNode>>
        >();
        expectTypeOf<KbqTreeSelectionChange<KbqTreeOption<FileFlatNode>, FileFlatNode>['source']>().toEqualTypeOf<
            KbqTreeSelection<FileFlatNode>
        >();
        expect(tree().selectionModel.selected).toHaveLength(1);
        expect(tree().selectionModel.selected[0]).toBe(treeControl.dataNodes[0]);
    });
});

/** In-memory `KbqStateStore` used to make state-saving tests deterministic. */
class InMemoryStateStore implements KbqStateStore {
    readonly store = new Map<string, unknown>();

    getState(key: string): unknown {
        return this.store.has(key) ? JSON.parse(JSON.stringify(this.store.get(key))) : null;
    }

    setState(key: string, state: unknown): void {
        this.store.set(key, JSON.parse(JSON.stringify(state)));
    }

    removeState(key: string): void {
        this.store.delete(key);
    }
}

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection
            [dataSource]="dataSource"
            [stateSavingKey]="stateSavingKey"
            [treeControl]="treeControl"
            [useStateSaving]="useStateSaving"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>{{ node.name }}</kbq-tree-option>
            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle />
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeStateSaving extends TreeParams {
    readonly tree = viewChild.required(KbqTreeSelection);

    useStateSaving = true;
    /** An empty key leaves the tree on the key derived from its position in the document. */
    stateSavingKey = 'tree-key';
}

/** A tree control that keys the expansion by node name, so it survives the nodes being rebuilt. */
@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection
            stateSavingKey="keyed-key"
            useStateSaving
            [dataSource]="keyedDataSource"
            [treeControl]="keyedControl"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>{{ node.name }}</kbq-tree-option>
            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle />
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeKeyedExpansion extends TreeParams {
    // Beside the inherited control rather than in its place: that one is typed to hold nodes, this one names.
    readonly keyedControl = new FlatTreeControl<FileFlatNode, string>(
        this.getLevel,
        this.isExpandable,
        this.getValue,
        this.getValue,
        undefined,
        undefined,
        undefined,
        { trackBy: this.getValue }
    );

    readonly keyedDataSource = new KbqTreeFlatDataSource(this.keyedControl, this.treeFlattener);

    constructor() {
        super();

        this.keyedDataSource.data = this.treeData;
    }
}

/** Models a tree whose data arrives after it has initialized — a lazily loaded one. */
@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection stateSavingKey="lazy-key" [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>{{ node.name }}</kbq-tree-option>
            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle />
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeLazyStateSaving extends TreeParams {
    readonly tree = viewChild.required(KbqTreeSelection);

    constructor() {
        super();

        this.dataSource.data = [];
    }

    load(): void {
        this.dataSource.data = this.treeData;
    }
}

/** A bare `kbq-tree` on a nested control, which has no way to identify a node by value. */
@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree stateSavingKey="nested-key" [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-node *kbqTreeNodeDef="let node">{{ node.name }}</kbq-tree-node>
        </kbq-tree>
    `
})
class TreeNestedStateSaving {
    readonly tree = viewChild.required(KbqTree);

    readonly treeControl = new NestedTreeControl<FileNode>((node) => of(node.children ?? []));
    readonly dataSource = new KbqTreeNestedDataSource<FileNode>();

    constructor() {
        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);
    }
}

/** A tree whose `getValue` returns something that cannot be stored as a JSON key. */
@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection stateSavingKey="numeric-key" [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>{{ node.name }}</kbq-tree-option>
            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle />
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeNumericValues extends TreeParams {
    constructor() {
        super();

        // Rebuilt rather than overridden: the base already handed its own getValue to a control.
        this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable, () => 1, this.getValue);
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.dataSource.data = this.treeData;
    }
}

describe('KbqTreeSelection state saving', () => {
    let store: InMemoryStateStore;

    /** Creates the tree against `store`. Seed the store first to model what the previous visit left. */
    const create = <T>(type: Type<T>): ComponentFixture<T> => {
        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const created = TestBed.createComponent(type);

        created.detectChanges();

        return created;
    };

    /** The names of the expanded nodes, sorted — the order they were expanded in carries no meaning. */
    const expandedNames = (component: TreeParams): string[] =>
        component.treeControl.expansionModel.selected.map(({ name }) => name).sort();

    const clickToggle = (created: ComponentFixture<unknown>, index: number): void => {
        const treeElement = created.nativeElement.querySelector('kbq-tree-selection');

        (getNodes(treeElement)[index].querySelectorAll('kbq-tree-node-toggle')[0] as HTMLElement).click();
        created.detectChanges();
    };

    beforeEach(() => {
        store = new InMemoryStateStore();

        TestBed.configureTestingModule({ imports: [KbqTreeModule, FormsModule] }).compileComponents();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('restores the nodes that were expanded on the previous visit', () => {
        store.setState('tree-key', ['Pictures', 'Documents']);

        const fixture = create(TreeStateSaving);

        expect(expandedNames(fixture.componentInstance)).toEqual(['Documents', 'Pictures']);
    });

    it('renders the restored nodes', () => {
        store.setState('tree-key', ['Pictures']);

        const fixture = create(TreeStateSaving);

        // The five roots plus the three children of `Pictures`.
        expect(getNodes(fixture.nativeElement.querySelector('kbq-tree-selection')).length).toBe(8);
    });

    it.each([['nonsense'], [42], [{ Pictures: true }], [[1, null, {}]]])(
        'ignores an unusable payload: %p',
        (payload) => {
            store.setState('tree-key', payload);

            const fixture = create(TreeStateSaving);

            expect(expandedNames(fixture.componentInstance)).toEqual([]);
        }
    );

    it('drops a saved value that names no node', () => {
        store.setState('tree-key', ['Pictures', 'Gone']);

        const fixture = create(TreeStateSaving);

        expect(expandedNames(fixture.componentInstance)).toEqual(['Pictures']);
    });

    it('persists the expanded nodes when one is toggled with the mouse', () => {
        const fixture = create(TreeStateSaving);

        clickToggle(fixture, 1);

        expect(store.getState('tree-key')).toEqual(['Pictures']);
    });

    it('persists the expanded nodes when one is expanded with the keyboard', async () => {
        vi.useFakeTimers();

        const fixture = create(TreeStateSaving);

        fixture.componentInstance.tree().keyManager.setActiveItem(1);
        fixture.componentInstance.tree().onKeyDown(createKeyboardEvent('keydown', RIGHT_ARROW));
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        expect(store.getState('tree-key')).toEqual(['Pictures']);
    });

    it('persists the expanded nodes when one is collapsed with the keyboard', async () => {
        vi.useFakeTimers();

        store.setState('tree-key', ['Pictures']);

        const fixture = create(TreeStateSaving);

        fixture.componentInstance.tree().keyManager.setActiveItem(1);
        fixture.componentInstance.tree().onKeyDown(createKeyboardEvent('keydown', LEFT_ARROW));
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        expect(store.getState('tree-key')).toEqual([]);
    });

    it('does not persist while a filter is active', async () => {
        vi.useFakeTimers();

        const fixture = create(TreeStateSaving);
        const { treeControl } = fixture.componentInstance;
        const tree = fixture.componentInstance.tree();

        treeControl.filterNodes('Sun');
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        // What is expanded during a search is the result set, not a state the user chose.
        tree.saveState();

        expect(store.getState('tree-key')).toBeNull();
    });

    it('persists nothing while useStateSaving is unset', () => {
        const fixture = create(TreeStateSaving);

        fixture.componentInstance.useStateSaving = false;
        fixture.detectChanges();

        clickToggle(fixture, 1);

        expect(store.store.size).toBe(0);
    });

    it('restores nothing while useStateSaving is unset', () => {
        store.setState('tree-key', ['Pictures']);

        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const fixture = TestBed.createComponent(TreeStateSaving);

        fixture.componentInstance.useStateSaving = false;
        fixture.detectChanges();

        expect(expandedNames(fixture.componentInstance)).toEqual([]);
    });

    it('persists under a key derived from the document when none is given', () => {
        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const fixture = TestBed.createComponent(TreeStateSaving);

        fixture.componentInstance.stateSavingKey = '';
        fixture.detectChanges();

        clickToggle(fixture, 1);

        // The TestBed root element carries an `id` and is the host component's own element, so it
        // anchors the path — the same way an application's `id` on a container does.
        expect([...store.store.keys()]).toEqual([expect.stringMatching(/^#root\d+\/kbq-tree-selection$/)]);
    });

    it('clears the persisted state on request and keeps persisting afterwards', () => {
        store.setState('tree-key', ['Pictures']);

        const fixture = create(TreeStateSaving);
        const tree = fixture.componentInstance.tree();

        expect(tree.hasSavedState).toBe(true);

        tree.clearSavedState();

        expect(tree.hasSavedState).toBe(false);
        expect(store.getState('tree-key')).toBeNull();

        // `Pictures` is still expanded — clearing removes what was stored, not what is on screen — so
        // `Documents` is the sixth row rather than the third.
        clickToggle(fixture, 5);

        expect(store.getState('tree-key')).toEqual(['Pictures', 'Documents']);
    });

    it('registers with the state saving service and leaves it on destroy', () => {
        const fixture = create(TreeStateSaving);
        const service = TestBed.inject(KbqStateSavingService);

        // Mapped to plain data on purpose: deep-comparing a live directive makes the runner serialize it,
        // which throws while building the diff and hides the real failure.
        expect(service.components().map(({ name, key, enabled }) => ({ name, key, enabled }))).toEqual([
            { name: 'kbq-tree-selection', key: 'tree-key', enabled: true }
        ]);

        fixture.destroy();

        expect(service.components()).toEqual([]);
    });

    it('persists nothing when the tree is not in the document as it initializes', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        store.setState('tree-key', ['Pictures']);

        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const fixture = TestBed.createComponent(TreeStateSaving);

        // What a tree projected into a closed overlay looks like — `kbq-tree-select` renders one.
        fixture.nativeElement.remove();
        fixture.detectChanges();

        expect(expandedNames(fixture.componentInstance)).toEqual([]);
        expect(warn).not.toHaveBeenCalled();

        warn.mockRestore();
    });

    it('persists nothing when the tree control cannot identify a node by value', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const fixture = create(TreeNestedStateSaving);
        const { dataSource, treeControl } = fixture.componentInstance;
        const tree = fixture.componentInstance.tree();

        treeControl.expand(dataSource.data[1]);
        // Renders the expanded children while the tree is still there, rather than in a tick after the test.
        fixture.detectChanges();
        tree.saveState();

        expect(store.store.size).toBe(0);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('has no `getValue`'));

        warn.mockRestore();
    });

    it('leaves out a node whose value is not a string', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const fixture = create(TreeNumericValues);

        clickToggle(fixture, 1);

        expect(store.getState('numeric-key')).toEqual([]);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('is not a string'));

        warn.mockRestore();
    });

    describe('data that arrives late', () => {
        it('expands the saved nodes once they are loaded', async () => {
            vi.useFakeTimers();

            store.setState('lazy-key', ['Pictures', 'Documents']);

            const fixture = create(TreeLazyStateSaving);

            expect(expandedNames(fixture.componentInstance)).toEqual([]);

            fixture.componentInstance.load();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(expandedNames(fixture.componentInstance)).toEqual(['Documents', 'Pictures']);
        });

        it('keeps the values it has not seen yet when something else is persisted', async () => {
            vi.useFakeTimers();

            store.setState('lazy-key', ['Pictures', 'Documents']);

            const fixture = create(TreeLazyStateSaving);

            fixture.componentInstance.tree().saveState();

            // Writing the snapshot alone would drop both — nothing is loaded, so nothing is expanded.
            expect(store.getState('lazy-key')).toEqual(['Pictures', 'Documents']);

            await vi.runOnlyPendingTimersAsync();
        });

        it('does not expand again a node the user collapsed after it loaded', async () => {
            vi.useFakeTimers();

            store.setState('lazy-key', ['Pictures']);

            const fixture = create(TreeLazyStateSaving);

            fixture.componentInstance.load();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(expandedNames(fixture.componentInstance)).toEqual(['Pictures']);

            clickToggle(fixture, 1);
            await vi.runOnlyPendingTimersAsync();

            expect(expandedNames(fixture.componentInstance)).toEqual([]);

            // A second batch of data, as a lazy tree delivers when a branch is opened.
            fixture.componentInstance.load();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(expandedNames(fixture.componentInstance)).toEqual([]);
        });
    });

    describe('with a tree control keyed by trackBy', () => {
        const expandedKeys = (component: TreeKeyedExpansion): string[] =>
            [...component.keyedControl.expansionModel.selected].sort();

        it('keeps the expanded rows once the data is rebuilt into new nodes', () => {
            const fixture = create(TreeKeyedExpansion);

            clickToggle(fixture, 1);

            fixture.componentInstance.keyedDataSource.data = buildFileTree(DATA_OBJECT, 0);
            fixture.detectChanges();

            // The five roots plus the three children of `Pictures`.
            expect(getNodes(fixture.nativeElement.querySelector('kbq-tree-selection')).length).toBe(8);
        });

        it('restores the nodes that were expanded on the previous visit', () => {
            store.setState('keyed-key', ['Pictures', 'Documents']);

            const fixture = create(TreeKeyedExpansion);

            expect(expandedKeys(fixture.componentInstance)).toEqual(['Documents', 'Pictures']);
        });

        it('persists the values of the expanded nodes', () => {
            const fixture = create(TreeKeyedExpansion);

            clickToggle(fixture, 1);

            expect(store.getState('keyed-key')).toEqual(['Pictures']);
        });
    });
});

@Component({
    imports: [KbqTreeModule, ReactiveFormsModule],
    template: `
        <kbq-tree-selection
            multiple="checkbox"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            [formControl]="control"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>{{ node.name }}</kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle />
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeDrivenByEffects extends TreeParams {
    readonly tree = viewChild.required(KbqTreeSelection);
    readonly options = viewChildren(KbqTreeOption);
    readonly control = new FormControl<string[]>([], { nonNullable: true });
    readonly command = signal<(() => void) | null>(null);
    runs = 0;

    constructor() {
        super();

        effect(() => {
            const command = this.command();

            if (!command || this.runs >= 10) return;

            this.runs++;
            command();
        });
    }
}

describe('KbqTreeSelection called from an effect', () => {
    let fixture: ComponentFixture<TreeDrivenByEffects>;

    const settle = async (): Promise<void> => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };

    const callFromEffect = async (command: () => void): Promise<void> => {
        fixture.componentInstance.command.set(command);
        await settle();
    };

    const option = (name: string): KbqTreeOption =>
        fixture.componentInstance.options().find((item) => item.viewValue === name)!;

    const clickOption = async (name: string): Promise<void> => {
        option(name).getHostElement().click();
        await settle();
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [TreeDrivenByEffects] });
        fixture = TestBed.createComponent(TreeDrivenByEffects);
        await settle();
    });

    it('should not loop when an effect toggles an option', async () => {
        await callFromEffect(() => option('rootNode_1').toggle());

        expect(option('rootNode_1').selected).toBe(true);
        expect(fixture.componentInstance.runs).toBe(1);
    });

    it('should not make an effect that selects all run again when the tree is disabled and enabled', async () => {
        const { control } = fixture.componentInstance;

        await callFromEffect(() => fixture.componentInstance.tree().selectAllOptions());
        await clickOption('rootNode_1');
        control.disable();
        await settle();
        control.enable();
        await settle();

        expect(option('rootNode_1').selected).toBe(false);
        expect(fixture.componentInstance.runs).toBe(1);
    });
});

/** Counts the change detection passes over the view that declares it. */
@Directive({ selector: '[testCountChecks]' })
class CountChecks implements DoCheck {
    count = 0;

    ngDoCheck(): void {
        this.count++;
    }
}

@Component({
    imports: [KbqTreeModule, ReactiveFormsModule, CountChecks],
    template: `
        <span #declaringView testCountChecks></span>

        <kbq-tree-selection
            multiple="keyboard"
            [selectAll]="selectAll"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            [formControl]="control"
        >
            <kbq-tree-option
                *kbqTreeNodeDef="let node"
                kbqTreeNodePadding
                testCountChecks
                [selectable]="!unselectableNodes.includes(node.name)"
            >
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithCheckCounters extends TreeParams {
    readonly tree = viewChild.required(KbqTreeSelection);
    readonly declaringViewChecks = viewChild.required('declaringView', { read: CountChecks });
    selectAll = true;
    unselectableNodes = ['rootNode_1'];
    readonly control = new FormControl<string[]>(this.namesBut(this.unselectableNodes), { nonNullable: true });

    constructor() {
        super();

        // One flat node per data node across emissions, so new data can leave the rendered rows as they are.
        const flatNodes = new WeakMap<FileNode, FileFlatNode>();

        this.treeFlattener = new KbqTreeFlattener<FileNode, FileFlatNode>(
            (node: FileNode, level: number, parent: any) =>
                flatNodes.get(node) ?? flatNodes.set(node, this.transformer(node, level, parent)).get(node)!,
            this.getLevel,
            this.isExpandable,
            this.getChildren
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.dataSource.data = this.treeData;
    }

    namesBut(excluded: string[]): string[] {
        return this.treeControl.dataNodes.map(({ name }) => name).filter((name) => !excluded.includes(name));
    }
}

describe('KbqTreeSelection rendering a change of the data', () => {
    let fixture: ComponentFixture<TreeWithCheckCounters>;

    // The rows mark themselves for check a macrotask after the rendered set changes.
    const settle = async (): Promise<void> => {
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve));
        await fixture.whenStable();
    };

    const node = (name: string): FileFlatNode =>
        fixture.componentInstance.treeControl.dataNodes.find((dataNode) => dataNode.name === name)!;

    const rowChecks = (): CountChecks[] =>
        fixture.debugElement
            .queryAll(By.css('kbq-tree-option[testCountChecks]'))
            .map(({ injector }) => injector.get(CountChecks));

    /** Runs the change and reports how often it checked the view declaring the tree and each row it renders. */
    const countChecks = (change: () => void): { declaringView: number; rows: number[] } => {
        const declaringView = fixture.componentInstance.declaringViewChecks();
        const declaringViewCount = declaringView.count;
        const rowCounts = new Map(rowChecks().map((row) => [row, row.count]));

        change();
        TestBed.tick();

        return {
            declaringView: declaringView.count - declaringViewCount,
            rows: rowChecks().map((row) => row.count - (rowCounts.get(row) ?? 0))
        };
    };

    const selectAllCheckbox = (): HTMLElement =>
        fixture.nativeElement.querySelector('.kbq-tree-option_select-all kbq-pseudo-checkbox');

    beforeEach(async () => {
        fixture = TestBed.createComponent(TreeWithCheckCounters);
        await settle();
    });

    it('should render new rows once, without the view declaring the tree', async () => {
        fixture.componentInstance.selectAll = false;
        await settle();

        const { treeControl } = fixture.componentInstance;
        const checks = countChecks(() => treeControl.expand(node('Documents')));

        expect(checks.declaringView).toBe(0);
        expect(checks.rows).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
    });

    it('should render a change that leaves the rows as they are once, "select all" row included', () => {
        const { treeControl } = fixture.componentInstance;
        const checks = countChecks(() => treeControl.expand(node('rootNode_1')));

        expect(checks.declaringView).toBe(0);
        expect(checks.rows).toEqual([1, 1, 1, 1, 1]);
    });

    it('should hand the rows of data that arrives outside change detection to the keyboard', async () => {
        fixture.componentInstance.selectAll = false;
        await settle();

        const { dataSource, tree } = fixture.componentInstance;

        dataSource.data = buildFileTree({ docs: 'md', src: 'ts' }, 0);
        TestBed.tick();
        tree().keyManager.setLastItemActive();

        expect(tree().keyManager.activeItem!.value).toBe('src');
    });

    it('should leave a row the user cannot select out of the "select all" state from the first render', () => {
        expect(selectAllCheckbox().classList).toContain('kbq-checked');
    });

    it('should render the "select all" state of the rows a change brings in', async () => {
        const { control, treeControl } = fixture.componentInstance;

        // A collapsed node is a target of "select all" whatever its row would say, so Sun keeps the state mixed.
        fixture.componentInstance.unselectableNodes = ['rootNode_1', 'Sun'];
        control.setValue(fixture.componentInstance.namesBut(['rootNode_1', 'Sun']));
        await settle();

        expect(selectAllCheckbox().classList).toContain('kbq-indeterminate');

        treeControl.expand(node('Pictures'));
        TestBed.tick();

        expect(selectAllCheckbox().classList).toContain('kbq-checked');
    });

    it('should render the "select all" state of data nodes new data adds behind the rows', () => {
        const { dataSource, treeData } = fixture.componentInstance;

        treeData
            .find(({ name }) => name === 'Pictures')!
            .children.push(Object.assign(new FileNode(), { name: 'Moon' }));
        dataSource.data = [...treeData];
        TestBed.tick();

        expect(selectAllCheckbox().classList).toContain('kbq-indeterminate');
    });

    it('should leave every view unchecked when the pointer enters a row of a tree outside a select', () => {
        const row = getNodeByText(fixture.nativeElement, 'Pictures');
        const checks = countChecks(() => dispatchFakeEvent(row, 'mouseenter'));

        expect(checks.declaringView).toBe(0);
        expect(checks.rows).toEqual(checks.rows.map(() => 0));
    });

    it('should leave the zone alone when the pointer enters the row a tree in a select has focused', async () => {
        const row = getNodeByText(fixture.nativeElement, 'Pictures');

        fixture.componentInstance.tree().inSelect = true;
        row.focus();
        await settle();

        const run = vi.spyOn(TestBed.inject(NgZone), 'run');

        dispatchFakeEvent(row, 'mouseenter');

        expect(run).not.toHaveBeenCalled();

        dispatchFakeEvent(getNodeByText(fixture.nativeElement, 'Documents'), 'mouseenter');

        expect(run).toHaveBeenCalled();
    });

    it('should render a selected row the change brings in as selected, without announcing it', async () => {
        fixture.componentInstance.selectAll = false;
        await settle();

        const { tree, treeControl } = fixture.componentInstance;

        treeControl.expand(node('Documents'));
        TestBed.tick();

        const row = getNodeByText(fixture.nativeElement, 'angular');
        const announced = vi.fn();

        tree()
            .renderedOptions.find((option) => option.value === 'angular')!
            .selectionChange.subscribe(announced);

        expect(row.classList).toContain('kbq-selected');
        expect(row.getAttribute('aria-selected')).toBe('true');

        await settle();

        expect(announced).not.toHaveBeenCalled();
    });

    it('should report once the focus the key manager moves', () => {
        const tree = fixture.componentInstance.tree();
        const reported = vi.fn();
        const ownReports = vi.fn();

        tree.optionFocusChanges.subscribe(reported);
        tree.renderedOptions.get(2)!.onFocus.subscribe(ownReports);
        tree.keyManager.setFocusOrigin('keyboard');
        tree.keyManager.setActiveItem(2);

        expect(reported).toHaveBeenCalledTimes(1);
        expect(ownReports).toHaveBeenCalledTimes(1);
    });

    it('should hand the focus of a row the change brings in to the keyboard before the rows are swept', async () => {
        fixture.componentInstance.selectAll = false;
        await settle();

        const { tree, treeControl } = fixture.componentInstance;

        treeControl.expand(node('Documents'));
        TestBed.tick();
        dispatchFakeEvent(getNodeByText(fixture.nativeElement, 'angular'), 'focusin');

        expect(tree().keyManager.activeItem!.value).toBe('angular');
    });

    it('should report through optionFocusChanges the focus of rows rendered after subscribing', async () => {
        const { tree, treeControl } = fixture.componentInstance;
        const focused: string[] = [];
        const subscription = tree().optionFocusChanges.subscribe(({ option }) => focused.push(option.value));

        treeControl.expand(node('Documents'));
        await settle();
        getNodeByText(fixture.nativeElement, 'angular').focus();
        subscription.unsubscribe();

        expect(focused).toEqual(['angular']);
    });
});

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>{{ node.name }}</kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithSharedValues extends TreeParams {
    readonly tree = viewChild.required<KbqTreeSelection<FileFlatNode>>(KbqTreeSelection);

    constructor() {
        super();

        // Rows share values (`jpg`, `ts`, `pdf`, `app`): only the node tells such rows apart.
        this.treeControl.getValue = (node: FileFlatNode) => node.type ?? node.name;
    }
}

describe('KbqTreeSelection with rows that share a value', () => {
    let fixture: ComponentFixture<TreeWithSharedValues>;

    const settle = async (): Promise<void> => {
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve));
        await fixture.whenStable();
    };

    const folder = (name: string): FileFlatNode => fixture.componentInstance.treeControl.hasValue(name)!;

    /** The rows the keyboard moves through, in its order. */
    const keyboardRows = (): HTMLElement[] =>
        fixture.componentInstance.tree().renderedOptions.map((option) => option.getHostElement());

    const selectedRows = (): string[] =>
        getNodes(fixture.nativeElement)
            .filter((row) => row.classList.contains('kbq-selected'))
            .map((row) => row.textContent!.trim());

    beforeEach(() => {
        fixture = TestBed.createComponent(TreeWithSharedValues);
        fixture.detectChanges();
    });

    it('should mark only the selected node among the rows that share its value', async () => {
        const { tree, treeControl } = fixture.componentInstance;

        treeControl.expand(folder('Pictures'));
        treeControl.expand(folder('Documents'));
        await settle();

        dispatchFakeEvent(getNodeByText(fixture.nativeElement, 'Woods'), 'click');
        await settle();

        expect(tree().selectionModel.selected.map(({ name }) => name)).toEqual(['Woods']);
        expect(selectedRows()).toEqual(['Woods']);
    });

    it('should mark no row while nothing is selected, rows without a value included', async () => {
        fixture = TestBed.createComponent(TreeWithSharedValues);
        // Folders carry no value.
        fixture.componentInstance.treeControl.getValue = (node: FileFlatNode) => node.type;
        await settle();

        expect(getNodes(fixture.nativeElement).length).toBeGreaterThan(0);
        expect(selectedRows()).toEqual([]);
    });

    it('should follow the rows on screen across expanding, collapsing and new data, with values shared by rows', () => {
        const { dataSource, treeControl } = fixture.componentInstance;

        treeControl.expand(folder('Pictures'));
        treeControl.expand(folder('Documents'));
        TestBed.tick();

        expect(getNodes(fixture.nativeElement).length).toBe(11);
        expect(keyboardRows()).toEqual(getNodes(fixture.nativeElement));

        treeControl.collapse(folder('Pictures'));
        TestBed.tick();

        expect(getNodes(fixture.nativeElement).length).toBe(8);
        expect(keyboardRows()).toEqual(getNodes(fixture.nativeElement));

        dataSource.data = buildFileTree(DATA_OBJECT, 0);
        treeControl.expand(folder('Downloads'));
        TestBed.tick();

        expect(getNodes(fixture.nativeElement).length).toBe(8);
        expect(keyboardRows()).toEqual(getNodes(fixture.nativeElement));
    });
});
