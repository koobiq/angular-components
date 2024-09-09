import { Directionality } from '@angular/cdk/bidi';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, inject, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLocaleServiceModule, KbqPseudoCheckboxModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import {
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule,
    KbqTreeOption
} from '@koobiq/components/tree';
import { Observable, Subject, of as observableOf } from 'rxjs';
import { KbqTreeSelect, KbqTreeSelectModule } from './index';

const TREE_DATA = {
    rootNode_1: 'app',
    Pictures: {
        Sun: 'png',
        Woods: 'jpg',
        Photo_Booth_Library: {
            Contents: 'dir',
            Pictures: 'dir'
        }
    },
    Documents: {
        angular: {
            src: {
                core: 'ts',
                compiler: 'ts'
            }
        },
        material2: {
            src: {
                button: 'ts',
                checkbox: 'ts',
                input: 'ts'
            }
        }
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

class FileNode {
    children: FileNode[];
    name: string;
    type: any;
    value: any;
}

class FileFlatNode {
    name: string;
    type: any;
    level: number;
    expandable: boolean;
    value: any;
    parent: any;
}

/**
 * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
 * The return value is the list of `FileNode`.
 */
function buildFileTree(value: any, level: number): FileNode[] {
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

const transformer = (node: FileNode, level: number, parent: any) => {
    const flatNode = new FileFlatNode();

    flatNode.name = node.name;
    flatNode.parent = parent;
    flatNode.type = node.type;
    flatNode.level = level;
    flatNode.expandable = !!node.children;

    return flatNode;
};

const getLevel = (node: FileFlatNode) => node.level;

const getValue = (node: FileFlatNode) => node.name;

const isExpandable = (node: FileFlatNode) => node.expandable;

const getChildren = (node: FileNode): Observable<FileNode[]> => {
    return observableOf(node.children);
};

@Component({
    selector: 'basic-select',
    template: `
        <div [style.height.px]="heightAbove"></div>
        <kbq-form-field>
            <kbq-tree-select
                [formControl]="control"
                [tabIndex]="tabIndexOverride"
                [panelClass]="panelClass"
                placeholder="Food"
            >
                <kbq-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl"
                >
                    <kbq-tree-option
                        *kbqTreeNodeDef="let node"
                        kbqTreeNodePadding
                    >
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option
                        *kbqTreeNodeDef="let node; when: hasChild"
                        [disabled]="node.name === 'Downloads'"
                        kbqTreeNodePadding
                    >
                        <i
                            kbq-icon="kbq-chevron-down-s_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
        <div [style.height.px]="heightBelow"></div>
    `
})
class BasicTreeSelect {
    control = new UntypedFormControl();

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    heightAbove = 0;
    heightBelow = 0;
    tabIndexOverride: number;
    panelClass = ['custom-one', 'custom-two'];

    @ViewChild(KbqTreeSelect, { static: true }) select: KbqTreeSelect;
    @ViewChildren(KbqTreeOption) options: QueryList<KbqTreeOption>;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'basic-events',
    template: `
        <kbq-form-field>
            <kbq-tree-select
                (openedChange)="openedChangeListener($event)"
                (opened)="openedListener()"
                (closed)="closedListener()"
            >
                <kbq-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl"
                >
                    <kbq-tree-option
                        *kbqTreeNodeDef="let node"
                        kbqTreeNodePadding
                    >
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option
                        *kbqTreeNodeDef="let node; when: hasChild"
                        [disabled]="node.name === 'Downloads'"
                        kbqTreeNodePadding
                    >
                        <i
                            kbq-icon="kbq-chevron-down-s_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class BasicEvents {
    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    openedChangeListener = jasmine.createSpy('KbqTreeSelect openedChange listener');
    openedListener = jasmine.createSpy('KbqTreeSelect opened listener');
    closedListener = jasmine.createSpy('KbqTreeSelect closed listener');

    @ViewChild(KbqTreeSelect, { static: true }) select: KbqTreeSelect;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'ng-model-select',
    template: `
        <kbq-form-field>
            <kbq-tree-select
                [disabled]="isDisabled"
                placeholder="Food"
                ngModel
            >
                <kbq-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl"
                >
                    <kbq-tree-option
                        *kbqTreeNodeDef="let node"
                        kbqTreeNodePadding
                    >
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option
                        *kbqTreeNodeDef="let node; when: hasChild"
                        kbqTreeNodePadding
                    >
                        <i
                            kbq-icon="kbq-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class NgModelSelect {
    isDisabled: boolean;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;
    @ViewChildren(KbqTreeOption) options: QueryList<KbqTreeOption>;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'ng-if-select',
    template: `
        <div *ngIf="isShowing">
            <kbq-form-field>
                <kbq-tree-select
                    [formControl]="control"
                    placeholder="Food I want to eat right now"
                >
                    <kbq-tree-selection
                        [dataSource]="dataSource"
                        [treeControl]="treeControl"
                    >
                        <kbq-tree-option
                            *kbqTreeNodeDef="let node"
                            kbqTreeNodePadding
                        >
                            {{ treeControl.getViewValue(node) }}
                        </kbq-tree-option>

                        <kbq-tree-option
                            *kbqTreeNodeDef="let node; when: hasChild"
                            kbqTreeNodePadding
                        >
                            <i
                                kbq-icon="kbq-angle-S_16"
                                kbqTreeNodeToggle
                            ></i>
                            {{ treeControl.getViewValue(node) }}
                        </kbq-tree-option>
                    </kbq-tree-selection>
                </kbq-tree-select>
            </kbq-form-field>
        </div>
    `
})
class NgIfSelect {
    isShowing = false;

    control = new UntypedFormControl('rootNode_1');

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'select-with-change-event',
    template: `
        <kbq-form-field>
            <kbq-tree-select (selectionChange)="changeListener($event)">
                <kbq-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl"
                >
                    <kbq-tree-option
                        *kbqTreeNodeDef="let node"
                        kbqTreeNodePadding
                    >
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option
                        *kbqTreeNodeDef="let node; when: hasChild"
                        kbqTreeNodePadding
                    >
                        <i
                            kbq-icon="kbq-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class SelectWithChangeEvent {
    changeListener = jasmine.createSpy('KbqTreeSelect change listener');

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'multi-select',
    template: `
        <kbq-form-field>
            <kbq-tree-select
                [multiple]="true"
                [formControl]="control"
                placeholder="Food"
            >
                <kbq-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl"
                >
                    <kbq-tree-option
                        *kbqTreeNodeDef="let node"
                        kbqTreeNodePadding
                    >
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option
                        *kbqTreeNodeDef="let node; when: hasChild"
                        kbqTreeNodePadding
                    >
                        <i
                            kbq-icon="kbq-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class MultiSelect {
    control = new UntypedFormControl();

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;
    @ViewChildren(KbqTreeOption) options: QueryList<KbqTreeOption>;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'basic-select-initially-hidden',
    template: `
        <kbq-form-field>
            <kbq-tree-select [style.display]="isVisible ? 'block' : 'none'">
                <kbq-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl"
                >
                    <kbq-tree-option
                        *kbqTreeNodeDef="let node"
                        kbqTreeNodePadding
                    >
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option
                        *kbqTreeNodeDef="let node; when: hasChild"
                        kbqTreeNodePadding
                    >
                        <i
                            kbq-icon="kbq-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class BasicSelectInitiallyHidden {
    isVisible = false;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'basic-select-no-placeholder',
    template: `
        <kbq-form-field>
            <kbq-tree-select>
                <kbq-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl"
                >
                    <kbq-tree-option
                        *kbqTreeNodeDef="let node"
                        kbqTreeNodePadding
                    >
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option
                        *kbqTreeNodeDef="let node; when: hasChild"
                        kbqTreeNodePadding
                    >
                        <i
                            kbq-icon="kbq-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class BasicSelectNoPlaceholder {
    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    template: `
        <kbq-form-field>
            <!--<kbq-label>Select a thing</kbq-label>-->

            <kbq-tree-select [placeholder]="placeholder">
                <kbq-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl"
                >
                    <kbq-tree-option>A thing</kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class SelectWithFormFieldLabel {
    placeholder: string;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;
}

describe('KbqTreeSelect', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let dir: { value: 'ltr' | 'rtl' };
    const scrolledSubject: Subject<any> = new Subject();

    /**
     * Configures the test module for KbqTreeSelect with the given declarations. This is broken out so
     * that we're only compiling the necessary test components for each test in order to speed up
     * overall test time.
     * @param declarations Components to declare for this block
     */
    function configureKbqTreeSelectTestingModule(declarations: any[]) {
        TestBed.configureTestingModule({
            imports: [
                KbqFormFieldModule,
                KbqTreeModule,
                KbqTreeSelectModule,
                KbqSelectModule,
                KbqInputModule,
                ReactiveFormsModule,
                FormsModule,
                NoopAnimationsModule,
                KbqPseudoCheckboxModule,
                KbqLocaleServiceModule
            ],
            declarations,
            providers: [
                { provide: Directionality, useFactory: () => (dir = { value: 'ltr' }) },
                {
                    provide: ScrollDispatcher,
                    useFactory: () => ({
                        scrolled: () => scrolledSubject.asObservable()
                    })
                }
            ]
        }).compileComponents();

        inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        })();
    }

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    describe('core', () => {
        beforeEach(waitForAsync(() => {
            configureKbqTreeSelectTestingModule([
                BasicTreeSelect,
                BasicEvents,
                MultiSelect,
                SelectWithFormFieldLabel,
                SelectWithChangeEvent
            ]);
        }));

        describe('overlay panel', () => {
            let fixture: ComponentFixture<BasicTreeSelect>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicTreeSelect);
                fixture.detectChanges();
                fixture.detectChanges();
                trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

                tick(10);
            }));

            it('should set the width of the overlay based on the trigger', fakeAsync(() => {
                trigger.style.width = '200px';

                trigger.click();
                fixture.detectChanges();
                flush();

                const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
                expect(pane.style.minWidth).toBe('200px');
            }));
        });

        describe('disabled behavior', () => {
            it('should disable itself when control is disabled programmatically', fakeAsync(() => {
                const fixture = TestBed.createComponent(BasicTreeSelect);
                fixture.detectChanges();

                fixture.componentInstance.control.disable();
                fixture.detectChanges();
                const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                    .withContext(`Expected cursor to be default arrow on disabled control.`)
                    .toEqual('default');

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(overlayContainerElement.textContent)
                    .withContext(`Expected select panel to stay closed.`)
                    .toEqual('');

                expect(fixture.componentInstance.select.panelOpen)
                    .withContext(`Expected select panelOpen property to stay false.`)
                    .toBe(false);

                fixture.componentInstance.control.enable();
                fixture.detectChanges();
                expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                    .withContext(`Expected cursor to be a pointer on enabled control.`)
                    .toEqual('pointer');

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(overlayContainerElement.textContent)
                    .withContext('Expected select panel to open normally on re-enabled control')
                    .toContain('rootNode_1');

                expect(fixture.componentInstance.select.panelOpen)
                    .withContext('Expected select panelOpen property to become true.')
                    .toBe(true);
            }));
        });
    });

    describe('with ngModel', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([NgModelSelect])));

        it('should disable itself when control is disabled using the property', fakeAsync(() => {
            const fixture = TestBed.createComponent(NgModelSelect);
            fixture.detectChanges();

            fixture.componentInstance.isDisabled = true;
            fixture.detectChanges();
            flush();

            fixture.detectChanges();
            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                .withContext(`Expected cursor to be default arrow on disabled control.`)
                .toEqual('default');

            trigger.click();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent)
                .withContext(`Expected select panel to stay closed.`)
                .toEqual('');

            expect(fixture.componentInstance.select.panelOpen)
                .withContext(`Expected select panelOpen property to stay false.`)
                .toBe(false);

            fixture.componentInstance.isDisabled = false;
            fixture.detectChanges();
            flush();

            fixture.detectChanges();
            expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                .withContext(`Expected cursor to be a pointer on enabled control.`)
                .toEqual('pointer');

            trigger.click();
            fixture.detectChanges();
            flush();

            expect(overlayContainerElement.textContent)
                .withContext(`Expected select panel to open normally on re-enabled control`)
                .toContain('rootNode_1');

            expect(fixture.componentInstance.select.panelOpen)
                .withContext(`Expected select panelOpen property to become true.`)
                .toBe(true);
        }));
    });

    describe('with ngIf', () => {
        let fixture: ComponentFixture<NgIfSelect>;

        beforeEach(waitForAsync(() => {
            configureKbqTreeSelectTestingModule([NgIfSelect]);

            fixture = TestBed.createComponent(NgIfSelect);
            fixture.detectChanges();
            fixture.detectChanges();
        }));

        it('should handle nesting in an ngIf', fakeAsync(() => {
            fixture.componentInstance.isShowing = true;
            fixture.detectChanges();
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            trigger.style.width = '300px';

            trigger.click();
            fixture.detectChanges();
            flush();

            const value = fixture.debugElement.query(By.css('.kbq-select__matcher'));
            expect(value.nativeElement.textContent)
                .withContext(`Expected trigger to be populated by the control's initial value.`)
                .toContain('rootNode_1');

            const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
            expect(pane.style.minWidth).toEqual('300px');

            expect(fixture.componentInstance.select.panelOpen).toBe(true);
            expect(overlayContainerElement.textContent).toContain('rootNode_1');
            expect(overlayContainerElement.textContent).toContain('Pictures');
            expect(overlayContainerElement.textContent).toContain('Documents');
        }));
    });

    describe('when initially hidden', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([BasicSelectInitiallyHidden])));

        it('should set the width of the overlay if the element was hidden initially', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectInitiallyHidden);
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            trigger.style.width = '200px';
            fixture.componentInstance.isVisible = true;
            fixture.detectChanges();

            trigger.click();
            fixture.detectChanges();
            flush();

            const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
            expect(pane.style.minWidth).toBe('200px');
        }));
    });

    describe('with no placeholder', () => {
        let fixture: ComponentFixture<BasicSelectNoPlaceholder>;

        beforeEach(waitForAsync(() => {
            configureKbqTreeSelectTestingModule([BasicSelectNoPlaceholder]);

            fixture = TestBed.createComponent(BasicSelectNoPlaceholder);
            fixture.detectChanges();
        }));

        it('should set the width of the overlay if there is no placeholder', fakeAsync(() => {
            fixture.detectChanges();
            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            flush();

            const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
            expect(parseInt(pane.style.minWidth as string)).toBeGreaterThan(0);
        }));
    });

    describe('positioning', () => {
        beforeEach(waitForAsync(() =>
            configureKbqTreeSelectTestingModule([
                BasicTreeSelect,
                MultiSelect
            ])));

        let fixture: ComponentFixture<BasicTreeSelect>;
        let trigger: HTMLElement;
        let formField: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(BasicTreeSelect);
            fixture.detectChanges();
            fixture.detectChanges();
            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            formField = fixture.debugElement.query(By.css('kbq-form-field')).nativeElement;

            tick(10);
        }));

        describe('limited space to open horizontally', () => {
            beforeEach(fakeAsync(() => {
                formField.style.position = 'absolute';
                formField.style.top = '200px';
            }));

            it('should stay within the viewport when overflowing on the left in rtl', fakeAsync(() => {
                dir.value = 'rtl';
                formField.style.left = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const panelLeft = document.querySelector('.kbq-tree-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft)
                    .withContext(`Expected select panel to be inside the viewport in rtl.`)
                    .toBeGreaterThan(0);
            }));
        });
    });
});
