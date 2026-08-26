import { FocusMonitor } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, DebugElement, ViewChild, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
    A,
    C,
    createKeyboardEvent,
    createMouseEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    DOWN_ARROW,
    KbqMultipleInput,
    KbqOptionActionComponent,
    KbqOptionModule,
    LEFT_ARROW,
    MultipleMode,
    SPACE,
    TAB
} from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { TestScheduler } from 'rxjs/testing';
import {
    FilterByValues,
    FilterByViewValue,
    FilterParentsForNodes,
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule,
    KbqTreeNodePadding,
    KbqTreeOption,
    KbqTreeSelectAllEvent,
    KbqTreeSelection,
    KbqTreeSelectionChange
} from './index';

describe('KbqTreeSelection', () => {
    let treeElement: HTMLElement;

    function configureKbqTreeTestingModule(providers: any[] = []) {
        TestBed.configureTestingModule({
            imports: [KbqTreeModule, FormsModule],
            providers
        }).compileComponents();
    }

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
                                copy: (value) => {
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

            // todo need recover
            xit('with the right data', () => {
                expect(component.treeData.length).toBe(5);

                expectFlatTreeToMatch(
                    treeElement,
                    28,
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

                expect(treeOption.styles.paddingLeft).toBe(paddingDirective.paddingIndent());
            });

            it('should copy selected option - default handler', fakeAsync(() => {
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
            }));

            // TODO(DS-5079): real regression under Angular 20 — copyActiveOption's
            // `preventBlur = true / false` envelope no longer suppresses the blur that
            // arrives via FocusMonitor microtask after the copy. Needs a fix in
            // KbqTreeOption.blur()/focus() coordination, not a test-only adjustment.
            // Clipboard write itself works (verified inline); only the focus retention
            // assertion fails.
            it.skip('should not blur on focused option when copying', fakeAsync(() => {
                const treeOptions = fixture.debugElement.queryAll(By.directive(KbqTreeOption));

                expect(treeOptions[2].componentInstance.hasFocus).toBeFalsy();

                dispatchFakeEvent(treeOptions[2].nativeElement, 'focusin');
                tick(10);
                fixture.detectChanges();

                expect(treeOptions[2].componentInstance.hasFocus).toBeTruthy();

                component.tree().keyManager.setActiveItem(2);

                const copyKeyEvent = createKeyboardEvent('keydown', C);

                Object.defineProperty(copyKeyEvent, 'ctrlKey', { get: () => true });
                component.tree().onKeyDown(copyKeyEvent);
                fixture.detectChanges();

                expect(clipboardContent).toBe(treeOptions[2].componentInstance.value);
                expect(treeOptions[2].componentInstance.hasFocus).toBeTruthy();
            }));
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

            it('should add focus class on first element', fakeAsync(() => {
                options = fixture.debugElement.queryAll(By.directive(KbqTreeOption));
                const option = options[0].nativeElement;

                expect(option.classList).not.toContain('kbq-focused');

                dispatchFakeEvent(tree.nativeElement, 'focus');
                flush();
                fixture.detectChanges();

                expect(option.classList).toContain('kbq-focused');
            }));

            it('should add focus class on first selected element', fakeAsync(() => {
                options = fixture.debugElement.queryAll(By.directive(KbqTreeOption));
                const selectedOption = options[1];

                selectedOption.componentInstance.toggle();
                tick();
                fixture.detectChanges();

                options.forEach(({ nativeElement }) => {
                    expect(nativeElement.classList).not.toContain('kbq-focused');
                });

                expect(selectedOption.nativeElement.classList).toContain('kbq-selected');

                dispatchFakeEvent(tree.nativeElement, 'focus');
                flush();
                fixture.detectChanges();

                expect(selectedOption.nativeElement.className).toContain('kbq-focused');
            }));
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

            // todo need recover
            xit('should expand/collapse the node', () => {
                expect(component.treeData.length).toBe(5);

                expect(component.treeControl.expansionModel.selected.length).toBe(0);

                component.toggleRecursively = false;

                expectFlatTreeToMatch(
                    treeElement,
                    40,
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
                    40,
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
                    40,
                    [`rootNode_1`],
                    [`Pictures`],
                    [null, 'Sun'],
                    [null, 'Woods'],
                    [null, 'PhotoBoothLibrary'],
                    [`Documents`],
                    [null, `Pictures`],
                    [null, `angular`],
                    [null, `material2`],
                    [`Downloads`],
                    [`Applications`]
                );

                (getNodes(treeElement)[5].querySelectorAll('kbq-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();

                expectFlatTreeToMatch(
                    treeElement,
                    40,
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

            it('should restore expanded items after filter', fakeAsync(() => {
                const initialNodesCount = 5;
                let nodes = getNodes(treeElement);

                expect(nodes.length).toBe(initialNodesCount);

                (nodes[1].querySelectorAll('kbq-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();
                tick();
                nodes = getNodes(treeElement);

                const expandedNodesCountBeforeFilter = 8;

                expect(nodes.length).toBe(expandedNodesCountBeforeFilter);

                component.treeControl.filterNodes('app');
                tick();
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(5);

                component.treeControl.filterNodes('');
                tick();
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(expandedNodesCountBeforeFilter);
            }));
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
                it('should select nodes', fakeAsync(() => {
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

                        component.tree.keyManager.setActiveItem(3);
                        dispatchEvent(targetNode, event);

                        testScheduler.flush();

                        fixture.detectChanges();

                        expect(component.modelValue.length).toBe(4);
                    });
                }));

                it('should deselect nodes', fakeAsync(() => {
                    testScheduler.run(() => {
                        expect(component.modelValue.length).toBe(0);

                        const nodes = getNodes(treeElement);

                        fixture.detectChanges();
                        component.tree.renderedOptions.toArray().forEach((option, index) => {
                            if (index < 3) {
                                option.selected = true;
                            }
                        });

                        testScheduler.flush();

                        expect(component.modelValue.length).toBe(3);

                        component.tree.keyManager.setActiveItem(3);

                        const targetNode: HTMLElement = nodes[0] as HTMLElement;

                        const event = createMouseEvent('click');

                        Object.defineProperty(event, 'shiftKey', { get: () => true });

                        component.tree.keyManager.setActiveItem(0);
                        dispatchEvent(targetNode, event);

                        testScheduler.flush();

                        fixture.detectChanges();

                        expect(component.modelValue.length).toBe(1);
                    });
                }));
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
                const onSelectionChange = jest.spyOn(component, 'onSelectionChange');
                const nodes = getNodes(treeElement);

                dispatchEvent(nodes[2], createMouseEvent('click'));
                fixture.detectChanges();

                expect(component.modelValue.length).toBe(0);
                expect(onSelectionChange).not.toHaveBeenCalled();
            });

            it('should not select non-selectable option on SPACE', fakeAsync(() => {
                component.tree.keyManager.setActiveItem(2);

                component.tree.onKeyDown(createKeyboardEvent('keydown', SPACE));
                fixture.detectChanges();
                flush();

                expect(component.modelValue.length).toBe(0);
            }));

            it('should keep selection when arrowing onto non-selectable option', fakeAsync(() => {
                const nodes = getNodes(treeElement);

                dispatchEvent(nodes[1], createMouseEvent('click'));
                fixture.detectChanges();

                expect(component.modelValue).toEqual(['Pictures']);

                component.tree.onKeyDown(createKeyboardEvent('keydown', DOWN_ARROW));
                fixture.detectChanges();
                flush();

                expect(component.tree.keyManager.activeItemIndex).toBe(2);
                expect(component.modelValue).toEqual(['Pictures']);
            }));

            it('should skip non-selectable option in shift-click range selection', fakeAsync(() => {
                testScheduler.run(() => {
                    const nodes = getNodes(treeElement);

                    const event = createMouseEvent('click');

                    (nodes[0] as HTMLElement).focus();
                    dispatchEvent(nodes[0], event);

                    expect(component.modelValue.length).toBe(1);

                    fixture.detectChanges();
                    testScheduler.flush();

                    Object.defineProperty(event, 'shiftKey', { get: () => true });

                    component.tree.keyManager.setActiveItem(3);
                    dispatchEvent(nodes[3], event);

                    testScheduler.flush();
                    fixture.detectChanges();

                    expect(component.modelValue.length).toBe(3);
                    expect(component.modelValue).not.toContain('Documents');
                });
            }));

            it('should not toggle non-selectable option on shift+arrow when active item can not move', fakeAsync(() => {
                testScheduler.run(() => {
                    component.unselectableNodes = ['Documents', 'Applications'];
                    fixture.detectChanges();

                    const event = createKeyboardEvent('keydown', DOWN_ARROW);

                    Object.defineProperty(event, 'shiftKey', { get: () => true });

                    component.tree.keyManager.setActiveItem(4);
                    component.tree.keyManager.previousActiveItemIndex = 4;

                    component.tree.onKeyDown(event);

                    testScheduler.flush();
                    fixture.detectChanges();

                    expect(component.modelValue.length).toBe(0);
                });
            }));

            it('should exclude non-selectable options on CTRL + A', fakeAsync(() => {
                // selectAllToggle enables deselect on the second press asserted below
                component.selectAllToggle = true;
                fixture.detectChanges();

                const selectAllKeyEvent = createKeyboardEvent('keydown', A);

                Object.defineProperty(selectAllKeyEvent, 'ctrlKey', { get: () => true });

                expect(component.modelValue.length).toBe(0);

                component.tree.onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                expect(component.savedSelectAllEvent!.options.length).toBe(4);
                expect(component.savedSelectionChangeEvent!.options!.length).toBe(4);
                expect(component.modelValue.length).toBe(16);
                expect(component.modelValue).not.toContain('Documents');

                component.tree.onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                expect(component.modelValue.length).toBe(0);
            }));

            it('should keep all options selected on a second CTRL + A by default (selectAllToggle off)', fakeAsync(() => {
                const selectAllKeyEvent = createKeyboardEvent('keydown', A);

                Object.defineProperty(selectAllKeyEvent, 'ctrlKey', { get: () => true });

                component.tree.onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                const selectedAfterFirst = component.modelValue.length;

                expect(selectedAfterFirst).toBeGreaterThan(0);

                component.tree.onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                expect(component.modelValue.length).toBe(selectedAfterFirst);
            }));

            it('should invoke a custom selectAllHandler on CTRL + A instead of the default', fakeAsync(() => {
                const customHandler = jest.fn();

                component.tree.selectAllHandler = customHandler;

                const selectAllKeyEvent = createKeyboardEvent('keydown', A);

                Object.defineProperty(selectAllKeyEvent, 'ctrlKey', { get: () => true });

                component.tree.onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                expect(customHandler).toHaveBeenCalledTimes(1);
                // default behaviour is bypassed -> nothing gets selected
                expect(component.modelValue.length).toBe(0);
            }));

            it('should not select non-selectable option via setSelectedOptionsByClick', () => {
                const option = component.tree.renderedOptions.toArray()[2];

                component.tree.setSelectedOptionsByClick(option, false, false);
                fixture.detectChanges();

                expect(component.modelValue.length).toBe(0);
            });

            it('should select non-selectable option programmatically', () => {
                const option = component.tree.renderedOptions.toArray()[2];

                option.setSelected(true);
                fixture.detectChanges();

                expect(component.modelValue).toEqual(['Documents']);
            });
        });

        describe('with an action button and dropdown (#DS-5079)', () => {
            beforeEach(() => {
                configureKbqTreeTestingModule();
            });

            it('renders deeper nodes as selectable options without crashing the action button', fakeAsync(() => {
                const fixture = TestBed.createComponent(TreeWithActionButtonApp);

                fixture.detectChanges();

                const component = fixture.componentInstance;
                const parent = component.treeControl.dataNodes.find((node) => node.name === 'Pictures')!;

                component.treeControl.expand(parent);
                fixture.detectChanges();
                tick();

                // Before the fix, KbqOptionActionComponent.ngAfterViewInit threw — `dropdownTrigger` was a
                // signal query and `dropdownClosed` an `output()` without `.pipe` — aborting the tree render,
                // so nodes revealed on expand never registered in renderedOptions and could not be selected.
                const renderedHasSun = component.tree.renderedOptions
                    .toArray()
                    .some((option) => option.getHostElement().textContent!.includes('Sun'));

                expect(renderedHasSun).toBe(true);
            }));
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
            it('should not mark the tree as keyboard-focused when an option is focused by mouse', fakeAsync(() => {
                TestBed.inject(FocusMonitor).focusVia(options[0].nativeElement, 'mouse');
                flush();
                fixture.detectChanges();

                expect(options[0].nativeElement.classList).toContain('kbq-focused');
                expect(treeElement.classList).not.toContain('cdk-keyboard-focused');
            }));

            it('should mark the tree as keyboard-focused when an option is focused via keyboard', fakeAsync(() => {
                TestBed.inject(FocusMonitor).focusVia(options[0].nativeElement, 'keyboard');
                flush();
                fixture.detectChanges();

                expect(options[0].nativeElement.classList).toContain('kbq-focused');
                expect(treeElement.classList).toContain('cdk-keyboard-focused');
            }));

            it('should not swallow Tab when the action button cannot take focus', fakeAsync(() => {
                const option = options[0];
                const actionButtonDebugElement = option.query(By.directive(KbqOptionActionComponent));
                const actionButton = actionButtonDebugElement.componentInstance;

                // In a browser the action sits in a `display: none` container until the option is hovered
                // or keyboard-focused, so `.focus()` is a no-op. jsdom ignores styles and would always
                // focus it, so neutralise the DOM call only — `KbqOptionActionComponent.focus()` itself
                // must still run, otherwise its `activeElement` check (the fix under test) is never hit.
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
                expect(option.nativeElement.classList).toContain('kbq-action-button-focused');
            }));
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

            it('should not select non-selectable parent on click before expand', fakeAsync(() => {
                const nodes = getNodes(treeElement);

                dispatchEvent(nodes[1], createMouseEvent('click'));
                fixture.detectChanges();
                flush();

                expect(component.modelValue).toBe('');
            }));

            it('should not select non-selectable parent on click after expand', fakeAsync(() => {
                let nodes = getNodes(treeElement);

                (nodes[1].querySelectorAll('kbq-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();
                tick();

                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(5);

                dispatchEvent(nodes[1], createMouseEvent('click'));
                fixture.detectChanges();
                flush();

                expect(component.modelValue).toBe('');
            }));

            it('should not select newly rendered non-selectable parent on click after expand', fakeAsync(() => {
                let nodes = getNodes(treeElement);

                (nodes[1].querySelectorAll('kbq-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();
                tick();

                nodes = getNodes(treeElement);
                // docs, src, cdk, README, tests
                expect(nodes[2].textContent!.trim()).toContain('cdk');

                dispatchEvent(nodes[2], createMouseEvent('click'));
                fixture.detectChanges();
                flush();

                expect(component.modelValue).toBe('');
            }));

            it('should not select non-selectable options on arrow navigation after expand', fakeAsync(() => {
                let nodes = getNodes(treeElement);

                (nodes[1].querySelectorAll('kbq-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();
                tick();

                nodes = getNodes(treeElement);

                dispatchEvent(nodes[0], createMouseEvent('click'));
                fixture.detectChanges();
                flush();

                expect(component.modelValue).toBe('docs');

                component.tree.onKeyDown(createKeyboardEvent('keydown', DOWN_ARROW));
                fixture.detectChanges();
                flush();

                expect(component.tree.keyManager.activeItemIndex).toBe(1);
                expect(component.modelValue).toBe('docs');

                component.tree.onKeyDown(createKeyboardEvent('keydown', DOWN_ARROW));
                fixture.detectChanges();
                flush();

                expect(component.tree.keyManager.activeItemIndex).toBe(2);
                expect(component.modelValue).toBe('docs');
            }));
        });

        describe('keyboard navigation with LEFT_ARROW', () => {
            let fixture: ComponentFixture<KbqTreeAppDeepData>;
            let component: KbqTreeAppDeepData;

            const pressKey = (keyCode: number) => {
                component.tree.onKeyDown(createKeyboardEvent('keydown', keyCode));
                fixture.detectChanges();
                flush();
            };

            const expandNode = (index: number) => {
                (getNodes(treeElement)[index].querySelectorAll('kbq-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();
                flush();
            };

            const getActiveValue = () => component.tree.keyManager.activeItem?.value;

            beforeEach(() => {
                configureKbqTreeTestingModule();
                fixture = TestBed.createComponent(KbqTreeAppDeepData);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');

                fixture.detectChanges();
            });

            it('should collapse an expanded option without moving the focus', fakeAsync(() => {
                expandNode(1);

                // docs, src, assets, cdk, README, tests
                expect(getNodes(treeElement).length).toBe(6);

                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('src');

                pressKey(LEFT_ARROW);

                expect(getNodes(treeElement).length).toBe(3);
                expect(component.treeControl.expansionModel.selected.length).toBe(0);
                expect(getActiveValue()).toBe('src');
            }));

            it('should move the focus to the parent when the active option is a leaf', fakeAsync(() => {
                expandNode(1);

                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('assets');

                pressKey(LEFT_ARROW);

                expect(getActiveValue()).toBe('src');
                // the parent is only focused, not collapsed
                expect(getNodes(treeElement).length).toBe(6);
            }));

            it('should move the focus to the parent when the active option is already collapsed', fakeAsync(() => {
                expandNode(1);

                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('cdk');

                pressKey(LEFT_ARROW);

                expect(getActiveValue()).toBe('src');
                expect(getNodes(treeElement).length).toBe(6);
            }));

            it('should collapse the whole tree with repeated presses', fakeAsync(() => {
                expandNode(1);
                expandNode(3);

                // docs, src, assets, cdk, a11y, keycodes, README, tests
                expect(getNodes(treeElement).length).toBe(8);
                expect(component.treeControl.expansionModel.selected.length).toBe(2);

                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('cdk');

                // expanded -> collapse, the focus stays put
                pressKey(LEFT_ARROW);

                expect(getNodes(treeElement).length).toBe(6);
                expect(getActiveValue()).toBe('cdk');

                // collapsed -> step up over the `assets` sibling to `src`
                pressKey(LEFT_ARROW);

                expect(getActiveValue()).toBe('src');

                // expanded -> collapse
                pressKey(LEFT_ARROW);

                expect(getNodes(treeElement).length).toBe(3);
                expect(component.treeControl.expansionModel.selected.length).toBe(0);

                // `src` is a root, so the tree stays fully collapsed
                pressKey(LEFT_ARROW);

                expect(getNodes(treeElement).length).toBe(3);
                expect(getActiveValue()).toBe('src');
            }));

            it('should move the focus to the parent when the toggle of an expanded option is disabled', fakeAsync(() => {
                expandNode(1);
                expandNode(3);

                // the toggle is disabled only after expanding — a disabled toggle cannot be clicked open
                component.disabledToggles = ['cdk'];
                fixture.detectChanges();

                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);

                // the option itself stays enabled, so DOWN_ARROW does not skip it
                expect(getActiveValue()).toBe('cdk');

                pressKey(LEFT_ARROW);

                // a disabled toggle makes the option non-expandable, so `cdk` is not collapsed
                expect(getNodes(treeElement).length).toBe(8);
                expect(component.treeControl.expansionModel.selected.length).toBe(2);
                expect(getActiveValue()).toBe('src');
            }));

            it('should do nothing on a root-level option', fakeAsync(() => {
                pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('docs');

                pressKey(LEFT_ARROW);

                expect(component.tree.keyManager.activeItemIndex).toBe(0);
                expect(getNodes(treeElement).length).toBe(3);
            }));

            it('should skip a disabled ancestor instead of landing on its sibling', fakeAsync(() => {
                component.disabledNodes = ['cdk'];
                fixture.detectChanges();

                expandNode(1);
                expandNode(3);

                expect(getNodes(treeElement).length).toBe(8);

                // DOWN_ARROW skips the disabled `cdk`, so the fourth press lands on `a11y`
                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('a11y');

                pressKey(LEFT_ARROW);

                // `cdk` cannot take the focus, so the walk narrows to its level and reaches `src` —
                // without narrowing it would stop on `assets`, a sibling of the parent
                expect(getActiveValue()).toBe('src');
            }));

            it('should keep narrowing the level across a chain of disabled ancestors', fakeAsync(() => {
                component.disabledNodes = ['src', 'cdk'];
                fixture.detectChanges();

                expandNode(1);
                expandNode(3);

                expect(getNodes(treeElement).length).toBe(8);

                // DOWN_ARROW skips both disabled ancestors, so the third press lands on `a11y`
                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('a11y');

                pressKey(LEFT_ARROW);

                // the walk narrows twice — over `cdk` to level 1, then over `src` to level 0 — so
                // neither `assets` (a sibling of `cdk`) nor `docs` (a sibling of `src`) takes the focus
                expect(getActiveValue()).toBe('a11y');
            }));

            it('should do nothing when every ancestor is disabled', fakeAsync(() => {
                component.disabledNodes = ['src'];
                fixture.detectChanges();

                expandNode(1);

                // DOWN_ARROW skips the disabled `src`, so the second press lands on `assets`
                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);

                expect(getActiveValue()).toBe('assets');

                pressKey(LEFT_ARROW);

                expect(getActiveValue()).toBe('assets');
            }));

            it('should not change the selection when moving to the parent', fakeAsync(() => {
                expandNode(1);

                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);

                expect(component.modelValue).toBe('assets');

                pressKey(LEFT_ARROW);

                expect(getActiveValue()).toBe('src');
                expect(component.modelValue).toBe('assets');
            }));

            it('should emit navigationChange when moving to the parent', fakeAsync(() => {
                expandNode(1);

                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);
                pressKey(DOWN_ARROW);

                const spy = jest.fn();
                const subscription = component.tree.navigationChange.subscribe(spy);

                pressKey(LEFT_ARROW);

                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy.mock.calls[0][0].option.value).toBe('src');

                subscription.unsubscribe();
            }));
        });

        // todo need recover
        xdescribe('with when node template', () => {
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
                    40,
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

            it('should filter nodes by condition', fakeAsync(() => {
                let nodes = getNodes(treeElement);

                expect(nodes.length).toBe(5);

                component.treeControl.filterNodes('app');
                tick();
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(5);

                component.treeControl.filterNodes('Documents');
                tick();
                fixture.detectChanges();
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(1);

                component.treeControl.filterNodes('condition for filter all nodes');
                tick();
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(0);
            }));

            it('should filter nodes and but not their parents', fakeAsync(() => {
                let nodes = getNodes(treeElement);

                expect(nodes.length).toBe(5);

                component.treeControl.filterNodes('Sun');
                tick();
                nodes = getNodes(treeElement);

                const parentOfFoundedNode = nodes[0].textContent!.trim();

                expect(parentOfFoundedNode).toBe('Pictures');

                const foundedNode = nodes[1].textContent!.trim();

                expect(foundedNode).toBe('Sun');

                expect(nodes.length).toBe(2);
            }));

            it('should delete filtration with empty condition', fakeAsync(() => {
                const initialNodesCount = 5;
                let nodes = getNodes(treeElement);

                expect(nodes.length).toBe(initialNodesCount);

                component.treeControl.filterNodes('app');
                fixture.detectChanges();
                tick();
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(5);

                component.treeControl.filterNodes('');
                tick();
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(initialNodesCount);
            }));
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

            it('should filter selected nodes by 1 level by click', fakeAsync(() => {
                const initialNodesCount = 5;
                let nodes = getNodes(treeElement);

                expect(nodes.length).toBe(initialNodesCount);
                component.modelValue = [];
                fixture.detectChanges();
                tick();

                const selectedNodes = nodes.slice(0, 2);

                selectedNodes.forEach((node) => dispatchFakeEvent(node, 'click'));
                fixture.detectChanges();
                flush();

                component.treeControl.filterNodes(null);
                fixture.detectChanges();
                tick();
                nodes = getNodes(treeElement);
                expect(nodes.length).toEqual(selectedNodes.length);
            }));

            it('should filter NOT selected nodes by 1 level by click', fakeAsync(() => {
                const initialNodesCount = 5;
                let nodes = getNodes(treeElement);

                expect(nodes.length).toBe(initialNodesCount);

                component.modelValue = [];
                fixture.detectChanges();
                tick();

                const selectedNodes = nodes.slice(0, 2);

                selectedNodes.forEach((node) => dispatchFakeEvent(node, 'click'));
                fixture.detectChanges();
                flush();

                const values = component.treeControl.dataNodes
                    .filter((node) => !component.modelValue.includes(component.treeControl.getValue(node)))
                    .map((node) => component.treeControl.getValue(node));

                component.filterByValues.setValues(values);

                component.treeControl.filterNodes(null);
                tick();
                nodes = getNodes(treeElement);

                expect(nodes.length).toEqual(component.tree.treeControl.dataNodes.length - selectedNodes.length + 1);
            }));

            it('should output selected nodes including parents when filtered by modelValue', fakeAsync(() => {
                component.modelValue = ['rootNode_1', 'Sun', 'Woods', 'PhotoBoothLibrary'];
                fixture.detectChanges();
                tick();

                component.treeControl.filterNodes(null);
                tick();
                const nodes = getNodes(treeElement);

                expect(nodes.length).toEqual(component.modelValue.length + 1);
            }));

            it('should apply different filters together', fakeAsync(() => {
                component.treeControl.filterNodes('app');
                tick();
                const filteredNodesLengthOnlyByText = component.tree.renderedOptions.map(
                    (option) => option.value
                ).length;

                component.treeControl.filterNodes(null);
                fixture.detectChanges();
                tick();

                component.modelValue = ['Chrome', 'Calendar'];
                fixture.detectChanges();
                tick();

                component.treeControl.filterNodes(null);
                tick();

                expect(getNodes(treeElement).length).not.toEqual(filteredNodesLengthOnlyByText);
            }));
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

            it('should rebind selectionModel orphans so ngModel selection stays toggleable', fakeAsync(() => {
                tick();
                fixture.detectChanges();

                const originalPicturesNode = component.treeControl.dataNodes.find(
                    (node) => component.treeControl.getValue(node) === 'Pictures'
                );

                expect(component.tree.selectionModel.selected[0]).toBe(originalPicturesNode);

                component.dataSource.data = buildFileTree(DATA_OBJECT, 0);
                fixture.detectChanges();
                tick();

                const newPicturesNode = component.treeControl.dataNodes.find(
                    (node) => component.treeControl.getValue(node) === 'Pictures'
                );

                expect(newPicturesNode).not.toBe(originalPicturesNode);
                expect(component.tree.selectionModel.selected[0]).toBe(newPicturesNode);

                const picturesOption = component.tree.renderedOptions.find((option) => option.value === 'Pictures');

                expect(picturesOption).toBeDefined();
                picturesOption!.selectViaInteraction();
                fixture.detectChanges();
                tick();

                expect(component.tree.selectionModel.selected.length).toBe(0);
                expect(component.modelValue).toEqual([]);
            }));
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

            it('should select all visible options and values', fakeAsync(() => {
                expect(component.modelValue.length).toBe(0);

                const onSelectionChange = jest.spyOn(component, 'onSelectionChange');
                const onSelectAll = jest.spyOn(component, 'onSelectAll');

                component.tree.onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                expect(component.savedSelectionChangeEvent!.option.selected).toBe(false);
                expect(onSelectionChange).toHaveBeenCalled();
                expect(component.savedSelectionChangeEvent!.options!.length).toBe(5);
                expect(onSelectAll).toHaveBeenCalled();
                expect(component.savedSelectAllEvent!.options.length).toBe(5);
                expect(component.modelValue.length).toBe(17);
            }));

            it('should deselect all visible options and values', fakeAsync(() => {
                component.selectAllToggle = true;
                fixture.detectChanges();

                component.tree.onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                component.savedSelectionChangeEvent = undefined;
                component.savedSelectAllEvent = undefined;

                expect(component.modelValue.length).toBe(17);

                component.tree.onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                expect(component.savedSelectionChangeEvent!.options!.length).toBe(5);
                expect(component.savedSelectAllEvent!.options.length).toBe(5);
                expect(component.modelValue.length).toBe(0);
            }));

            it('should select only the matches while a filter is active', fakeAsync(() => {
                component.treeControl.filterNodes('Sun');
                tick();
                fixture.detectChanges();

                component.tree.onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                // `FilterParentsForNodes` keeps the match's ancestors visible, so they take part too.
                expect(component.modelValue).toEqual(['Pictures', 'Sun']);
            }));

            it('should not emit selectionChange with an undefined option on a no-op CTRL + A (default)', fakeAsync(() => {
                // first press selects everything (default: selectAllToggle off)
                component.tree.onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                const onSelectionChange = jest.spyOn(component, 'onSelectionChange');

                component.savedSelectionChangeEvent = undefined;

                // second press is a no-op: everything is already selected and allowDeselect is off
                component.tree.onKeyDown(selectAllKeyEvent);
                fixture.detectChanges();

                expect(onSelectionChange).not.toHaveBeenCalled();
                expect(component.savedSelectionChangeEvent).toBeUndefined();
            }));
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
                expect(component.tree.renderedOptions.first).toBe(component.tree.selectAllOption());
            });

            it('should be unchecked when nothing is selected', () => {
                expect(component.tree.selectAllState).toBe('unchecked');
            });

            it('should report an empty state instead of throwing before treeControl is assigned', () => {
                // `treeControl` is an `@Input`, so a consumer reading these off a template reference —
                // e.g. to swap the trigger for a "select all" label — gets here on the very pass that
                // assigns it, while it is still undefined.
                const uninitialized = Object.create(KbqTreeSelection.prototype) as KbqTreeSelection;

                expect(() => uninitialized.allOptionsSelected).not.toThrow();
                expect(uninitialized.allOptionsSelected).toBe(false);
                expect(uninitialized.selectAllState).toBe('unchecked');
            });

            it('should be indeterminate when only some nodes are selected', () => {
                component.tree.selectionModel.select(component.tree.treeControl.hasValue('Sun'));
                fixture.detectChanges();

                expect(component.tree.selectAllState).toBe('indeterminate');
            });

            it('should be checked when every node is selected', () => {
                clickSelectAll();

                expect(component.tree.selectAllState).toBe('checked');
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
    children: FileNode[];
    name: string;
    type: any;
    isSpecial: boolean;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
    name: string;
    type: any;
    level: number;
    expandable: boolean;
    parent: any;
    isSpecial: boolean;
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

function expectFlatTreeToMatch(treeElement: Element, expectedPaddingIndent: number = 28, ...expectedTree: any[]) {
    const missedExpectations: string[] = [];

    function checkNode(node: Element, expectedNode: any[]) {
        const actualTextContent = node.textContent!.trim();
        const expectedTextContent = expectedNode[expectedNode.length - 1];

        if (actualTextContent !== expectedTextContent) {
            missedExpectations.push(`Expected node contents to be ${expectedTextContent} but was ${actualTextContent}`);
        }
    }

    function checkLevel(node: Element, expectedNode: any[]) {
        const actualLevel = (node as HTMLElement).style.paddingLeft;

        if (expectedNode.length === 1) {
            // root node can contain icon (padding = 8) and also can be without icon (padding = 32)
            if (actualLevel !== `8px` && actualLevel !== `32px`) {
                missedExpectations.push(`Expected node level to be 0 but was ${actualLevel}`);
            }
        } else {
            const expectedLevel = `${(expectedNode.length - 1) * expectedPaddingIndent + 12}px`;

            if (actualLevel !== expectedLevel) {
                missedExpectations.push(`Expected node level to be ${expectedLevel} but was ${actualLevel}`);
            }
        }
    }

    getNodes(treeElement).forEach((node, index) => {
        const expected = expectedTree ? expectedTree[index] : null;

        checkLevel(node, expected);
        checkNode(node, expected);
    });

    if (missedExpectations.length) {
        fail(missedExpectations.join('\n'));
    }
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
    tree: KbqTreeSelection;

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
    @ViewChild(KbqTreeSelection, { static: false }) tree: KbqTreeSelection;

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
    @ViewChild(KbqTreeSelection, { static: false }) tree: KbqTreeSelection;
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

    onModelValueChange(values) {
        this.modelValue = values;
        this.filterByValues.setValues(values);
    }
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
    @ViewChild(KbqTreeSelection) tree: KbqTreeSelection;
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
    @ViewChild(KbqTreeSelection, { static: false }) tree: KbqTreeSelection;

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
    @ViewChild(KbqTreeSelection, { static: false }) tree: KbqTreeSelection;

    constructor() {
        super();

        this.dataSource.data = this.treeData = buildFileTree(DEEP_DATA_OBJECT_WITH_SIBLINGS, 0);
    }
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
                {{ node.name }}
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
    @ViewChild(KbqTreeSelection, { static: false }) declare tree: KbqTreeSelection;
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

    const getOptions = (): KbqTreeOption[] =>
        fixture.debugElement.queryAll(By.directive(KbqTreeOption)).map(({ componentInstance }) => componentInstance);

    it('should start in the mode the binding asks for', () => {
        expect(component.tree.multipleMode).toBe(MultipleMode.CHECKBOX);
        expect(component.tree.selectionModel.isMultipleSelection()).toBe(true);
    });

    it('should render and drop the checkboxes', () => {
        expect(fixture.nativeElement.querySelectorAll('kbq-pseudo-checkbox').length).toBeGreaterThan(0);

        component.multiple = false;
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('kbq-pseudo-checkbox').length).toBe(0);
    });

    it('should swap the selection model instead of leaving it on the previous multiplicity', () => {
        component.multiple = 'single';
        fixture.detectChanges();

        expect(component.tree.multipleMode).toBeNull();
        expect(component.tree.selectionModel.isMultipleSelection()).toBe(false);
    });

    it('should keep the first selected node when narrowing to single selection', fakeAsync(() => {
        const options = getOptions();

        options[0].setSelected(true);
        options[1].setSelected(true);
        fixture.detectChanges();
        flush();

        expect(component.tree.selectionModel.selected.length).toBe(2);

        component.multiple = false;
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(component.tree.selectionModel.selected).toEqual([options[0].data]);
        expect(options[1].selected).toBe(false);
        // Single selection reports the bare value rather than an array — `getSelectedValues` has always
        // branched on the mode, so narrowing changes the shape the form control receives.
        expect(component.modelValue).toEqual(options[0].value);
    }));

    it('should let the swapped model keep driving the nodes', fakeAsync(() => {
        component.multiple = false;
        fixture.detectChanges();
        flush();

        const options = getOptions();
        const onChange = jest.fn();

        component.tree.registerOnChange(onChange);
        component.tree.selectionModel.select(options[1].data);
        fixture.detectChanges();

        expect(onChange).toHaveBeenCalledWith(options[1].value);
    }));

    it('should re-derive autoSelect and noUnselectLast the consumer left alone', () => {
        expect(component.tree.autoSelect).toBe(false);
        expect(component.tree.noUnselectLast).toBe(false);

        component.multiple = false;
        fixture.detectChanges();

        expect(component.tree.autoSelect).toBe(true);
        expect(component.tree.noUnselectLast).toBe(true);
    });

    it('should refuse a mode change once the selection model is owned by a tree-select', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const shared = new SelectionModel<any>(true);

        // What `KbqTreeSelect.ngAfterContentInit` does: hands the tree a model it also subscribes to.
        component.tree.selectionModel = shared;

        component.multiple = false;
        fixture.detectChanges();

        expect(component.tree.multipleMode).toBe(MultipleMode.CHECKBOX);
        expect(component.tree.selectionModel).toBe(shared);
        expect(warn).toHaveBeenCalledTimes(1);

        warn.mockRestore();
    });
});
