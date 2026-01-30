import { Clipboard } from '@angular/cdk/clipboard';
import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { A, C } from '@koobiq/cdk/keycodes';
import { createKeyboardEvent, createMouseEvent, dispatchEvent, dispatchFakeEvent } from '@koobiq/cdk/testing';
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

                const manager = component.tree.keyManager;

                manager.setActiveItem(2);
                expect(manager.activeItemIndex).toBe(2);

                const copyKeyEvent = createKeyboardEvent('keydown', C);

                Object.defineProperty(copyKeyEvent, 'ctrlKey', { get: () => true });

                component.tree.onKeyDown(copyKeyEvent);
                fixture.detectChanges();

                expect(clipboardContent).toBe(treeOptions[2].componentInstance.value);
            }));

            // todo fix me after update angular
            xit('should not blur on focused option when copying', fakeAsync(() => {
                testScheduler.run(() => {
                    const treeOptions = fixture.debugElement.queryAll(By.directive(KbqTreeOption));

                    expect(treeOptions[2].componentInstance.hasFocus).toBeFalsy();

                    testScheduler.flush();

                    dispatchFakeEvent(treeOptions[2].nativeElement, 'focusin');
                    testScheduler.flush();
                    tick(10);
                    fixture.detectChanges();

                    expect(treeOptions[2].componentInstance.hasFocus).toBeTruthy();

                    const copyKeyEvent = createKeyboardEvent('keydown', C);

                    Object.defineProperty(copyKeyEvent, 'ctrlKey', { get: () => true });
                    component.tree.onKeyDown(copyKeyEvent);
                    fixture.detectChanges();

                    expect(clipboardContent).toBe(treeOptions[2].componentInstance.value);
                    expect(treeOptions[2].componentInstance.hasFocus).toBeTruthy();
                });
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

    @ViewChild(KbqTreeSelection, { static: false }) tree: KbqTreeSelection;

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
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            [(ngModel)]="modelValue"
            (onSelectAll)="onSelectAll($event)"
            (selectionChange)="onSelectionChange($event)"
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
class KbqTreeAppMultiple extends TreeParams {
    modelValue: string[] = [];
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

    @ViewChild(KbqTreeSelection, { static: false }) tree: KbqTreeSelection;

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

    @ViewChild(KbqTreeSelection, { static: false }) tree: KbqTreeSelection;

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

    @ViewChild(KbqTreeSelection, { static: false }) tree: KbqTreeSelection;

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
