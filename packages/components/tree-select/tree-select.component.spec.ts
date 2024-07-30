import { Directionality } from '@angular/cdk/bidi';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    Component,
    DebugElement,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, inject, tick, waitForAsync } from '@angular/core/testing';
import {
    ControlValueAccessor,
    FormGroupDirective,
    FormsModule,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
    UntypedFormControl,
    UntypedFormGroup,
    Validators
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    A,
    DOWN_ARROW,
    END,
    ENTER,
    ESCAPE,
    HOME,
    LEFT_ARROW,
    RIGHT_ARROW,
    SPACE,
    TAB,
    UP_ARROW
} from '@koobiq/cdk/keycodes';
import {
    createKeyboardEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    wrappedErrorMessage
} from '@koobiq/cdk/testing';
import {
    ErrorStateMatcher,
    KBQ_LOCALE_SERVICE,
    KbqLocaleService,
    KbqLocaleServiceModule,
    KbqPseudoCheckboxModule,
    KbqPseudoCheckboxState,
    ThemePalette,
    getKbqSelectDynamicMultipleError,
    getKbqSelectNonArrayValueError,
    getKbqSelectNonFunctionValueError
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import {
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule,
    KbqTreeOption,
    KbqTreeSelectionChange
} from '@koobiq/components/tree';
import { Observable, Subject, Subscription, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';
import { KbqTreeSelect, KbqTreeSelectChange, KbqTreeSelectModule } from './index';

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

const TREE_DATA_RESET = {
    rootNode_1: 'app',
    Downloads: {
        Tutorial: 'html',
        November: 'pdf',
        October: 'pdf'
    },
    'Null-option': null,
    'Falsy-option': false,
    'Undefined-option': undefined
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
function buildFileTreeWithValues(value: any, level: number): FileNode[] {
    const data: any[] = [];

    for (const k of Object.keys(value)) {
        const v = value[k];
        const node = new FileNode();

        node.name = `${k}`;

        if (v === null || v === false || v === undefined) {
            node.value = v;
        } else if (typeof v === 'object') {
            node.children = buildFileTree(v, level + 1);
        } else {
            node.value = v;
        }

        data.push(node);
    }

    return data;
}

/** The debounce interval when typing letters to select an option. */
const LETTER_KEY_DEBOUNCE_INTERVAL = 200;

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

const getVal = (node: FileFlatNode) => node.value;

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
                            kbq-icon="mc-angle-down-S_16"
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
                            kbq-icon="mc-angle-down-S_16"
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
                            kbq-icon="mc-angle-S_16"
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
    selector: 'many-selects',
    template: `
        <kbq-form-field>
            <kbq-tree-select placeholder="First">
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
                            kbq-icon="mc-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-tree-select placeholder="Second">
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
                            kbq-icon="mc-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class ManySelects {
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
                                kbq-icon="mc-angle-S_16"
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
    selector: 'select-with-search',
    template: `
        <kbq-form-field>
            <kbq-tree-select [formControl]="control">
                <kbq-form-field
                    kbqFormFieldWithoutBorders
                    kbqSelectSearch
                >
                    <i
                        kbqPrefix
                        kbq-icon="mc-search_16"
                    ></i>
                    <input
                        [formControl]="searchControl"
                        kbqInput
                        type="text"
                    />
                    <kbq-cleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Ничего не найдено</div>

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
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class SelectWithSearch implements OnInit {
    control = new UntypedFormControl();

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;
    searchControl: UntypedFormControl = new UntypedFormControl();

    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    ngOnInit(): void {
        this.searchControl.valueChanges.subscribe((value) => this.treeControl.filterNodes(value));
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
                            kbq-icon="mc-angle-S_16"
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
    selector: 'select-init-without-options',
    template: `
        <kbq-form-field>
            <kbq-tree-select
                [(ngModel)]="selected"
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
                            kbq-icon="mc-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class SelectInitWithoutOptions {
    control = new UntypedFormControl('rootNode_1');
    selected = '';

    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;
    @ViewChildren(KbqTreeOption) options: QueryList<KbqTreeOption>;

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
    selector: 'custom-select-accessor',
    template: `
        <kbq-form-field>
            <kbq-tree-select />
        </kbq-form-field>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: CustomSelectAccessor,
            multi: true
        }
    ]
})
class CustomSelectAccessor implements ControlValueAccessor {
    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;

    writeValue: (value?: any) => void = () => {};
    registerOnChange: (changeFn?: (value: any) => void) => void = () => {};
    registerOnTouched: (touchedFn?: () => void) => void = () => {};
}

@Component({
    selector: 'comp-with-custom-select',
    template: `
        <custom-select-accessor [formControl]="ctrl" />
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: CustomSelectAccessor,
            multi: true
        }
    ]
})
class CompWithCustomSelect {
    ctrl = new UntypedFormControl('initial value');
    @ViewChild(CustomSelectAccessor, { static: true }) customAccessor: CustomSelectAccessor;
}

@Component({
    selector: 'select-infinite-loop',
    template: `
        <kbq-form-field>
            <kbq-tree-select [(ngModel)]="value" />
        </kbq-form-field>
        <throws-error-on-init />
    `
})
class SelectWithErrorSibling {
    value: string;
}

@Component({
    selector: 'throws-error-on-init',
    template: ''
})
class ThrowsErrorOnInit implements OnInit {
    ngOnInit() {
        throw Error('Oh no!');
    }
}

@Component({
    selector: 'basic-select-on-push',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <kbq-tree-select
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
                            kbq-icon="mc-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class BasicSelectOnPush {
    control = new UntypedFormControl();

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
    selector: 'basic-select-on-push-preselected',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <kbq-tree-select
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
                            kbq-icon="mc-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class BasicSelectOnPushPreselected {
    control = new UntypedFormControl('rootNode_1');

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
                            kbq-icon="mc-angle-S_16"
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
    selector: 'select-with-plain-tabindex',
    template: `
        <kbq-form-field>
            <kbq-tree-select />
        </kbq-form-field>
    `
})
class EmptySelect {}

@Component({
    selector: 'select-early-sibling-access',
    template: `
        <kbq-form-field>
            <kbq-tree-select #select="kbqTreeSelect" />
        </kbq-form-field>
    `
})
class SelectEarlyAccessSibling {}

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
                            kbq-icon="mc-angle-S_16"
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
                            kbq-icon="mc-angle-S_16"
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
    selector: 'basic-select-with-theming',
    template: `
        <kbq-form-field [color]="theme">
            <kbq-tree-select placeholder="Food">
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
                            kbq-icon="mc-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class BasicSelectWithTheming {
    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;
    theme: ThemePalette;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA_RESET, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'reset-values-select',
    template: `
        <kbq-form-field>
            <kbq-tree-select [formControl]="control">
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
                            kbq-icon="mc-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class ResetValuesSelect {
    control = new UntypedFormControl();

    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getVal, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTreeWithValues(TREE_DATA_RESET, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    template: `
        <kbq-form-field>
            <kbq-tree-select [formControl]="control">
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
                            kbq-icon="mc-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class FalsyValueSelect {
    @ViewChildren(KbqTreeOption) options: QueryList<KbqTreeOption>;

    control = new UntypedFormControl();

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
        <form>
            <kbq-form-field>
                <kbq-tree-select [(ngModel)]="value" />
            </kbq-form-field>
        </form>
    `
})
class InvalidSelectInForm {
    value: any;
}

@Component({
    template: `
        <form
            [formGroup]="formGroup"
            (ngSubmit)="submitReactive()"
        >
            <kbq-form-field>
                <kbq-tree-select
                    placeholder="Food"
                    formControlName="food"
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
                                kbq-icon="mc-angle-S_16"
                                kbqTreeNodeToggle
                            ></i>
                            {{ treeControl.getViewValue(node) }}
                        </kbq-tree-option>
                    </kbq-tree-selection>
                </kbq-tree-select>
                <!--<kbq-error>This field is required</kbq-error>-->
            </kbq-form-field>
        </form>
    `
})
class SelectInsideFormGroup {
    @ViewChild(FormGroupDirective, { static: false }) formGroupDirective: FormGroupDirective;
    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;

    formControl = new UntypedFormControl('', Validators.required);
    formGroup = new UntypedFormGroup({
        food: this.formControl
    });

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;
    submitResult: string;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    submitReactive() {
        this.submitResult = this.formGroup.invalid ? 'invalid' : 'valid';
    }
}

@Component({
    template: `
        <kbq-form-field>
            <kbq-tree-select
                [(ngModel)]="selectedFood"
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
                            kbq-icon="mc-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class BasicSelectWithoutForms {
    selectedFood: string | null;

    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;

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
            <kbq-tree-select
                [(ngModel)]="selectedFood"
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
                            kbq-icon="mc-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class BasicSelectWithoutFormsPreselected {
    selectedFood = 'Pictures';

    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    avoidCollisionMockTarget() {}

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    template: `
        <kbq-form-field>
            <kbq-tree-select
                [(ngModel)]="selectedFoods"
                [multiple]="true"
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
                            kbq-icon="mc-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class BasicSelectWithoutFormsMultiple {
    selectedFoods: string[];

    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;

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
    selector: 'select-with-custom-trigger',
    template: `
        <kbq-form-field>
            <kbq-tree-select
                #select="kbqTreeSelect"
                [formControl]="control"
                placeholder="Food"
            >
                <kbq-select-trigger>
                    {{ select.triggerValue?.split('').reverse().join('') }}
                </kbq-select-trigger>
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
                            kbq-icon="mc-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class SelectWithCustomTrigger {
    control = new UntypedFormControl();

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
    selector: 'ng-model-compare-with',
    template: `
        <kbq-form-field>
            <kbq-tree-select
                [ngModel]="selected"
                [compareWith]="comparator"
                (ngModelChange)="setFoodByCopy($event)"
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
                            kbq-icon="mc-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class NgModelCompareWithSelect {
    selected: { name: string; type: string } = { name: 'rootNode_1', type: 'app' };
    comparator: ((f1: any, f2: any) => boolean) | null;

    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;
    @ViewChildren(KbqTreeOption) options: QueryList<KbqTreeOption>;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.useCompareByValue();
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    useCompareByValue() {
        this.comparator = this.compareByValue;
    }

    useCompareByReference() {
        this.comparator = this.compareByReference;
    }

    useNullComparator() {
        this.comparator = null;
    }

    compareByValue(f1: any, f2: any) {
        return f1 && f2 && f1.value === f2.value;
    }

    compareByReference(f1: any, f2: any) {
        return f1 === f2;
    }

    setFoodByCopy(newValue: { name: string; type: string }) {
        this.selected = { ...{}, ...newValue };
    }
}

@Component({
    template: `
        <kbq-tree-select
            [formControl]="control"
            [errorStateMatcher]="errorStateMatcher"
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
                        kbq-icon="mc-angle-S_16"
                        kbqTreeNodeToggle
                    ></i>
                    {{ treeControl.getViewValue(node) }}
                </kbq-tree-option>
            </kbq-tree-selection>
        </kbq-tree-select>
    `
})
class CustomErrorBehaviorSelect {
    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;

    control = new UntypedFormControl();

    errorStateMatcher: ErrorStateMatcher;

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
            <kbq-tree-select
                [(ngModel)]="selectedFood"
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
                            kbq-icon="mc-angle-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class SingleSelectWithPreselectedArrayValues {
    selectedFood: string | null;

    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;
    @ViewChildren(KbqTreeOption) options: QueryList<KbqTreeOption>;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.selectedFood = 'Pictures';
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

@Component({
    template: `
        <kbq-form-field>
            <kbq-tree-select
                [multiple]="true"
                [formControl]="control"
                (selectionChange)="onSelectionChange($event)"
            >
                <kbq-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl"
                >
                    <kbq-tree-option
                        #option
                        *kbqTreeNodeDef="let node"
                        kbqTreeNodePadding
                    >
                        <kbq-pseudo-checkbox [state]="pseudoCheckboxState(option)" />
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option
                        #option
                        *kbqTreeNodeDef="let node; when: hasChild"
                        kbqTreeNodePadding
                    >
                        <kbq-pseudo-checkbox [state]="pseudoCheckboxState(option)" />
                        <i
                            [style.transform]="treeControl.isExpanded(node) ? '' : 'rotate(-90deg)'"
                            kbq-icon="mc-angle-down-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class ChildSelection {
    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    control = new UntypedFormControl(['Downloads', 'rootNode_1']);

    @ViewChild(KbqTreeSelect) select: KbqTreeSelect;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    onSelectionChange($event: KbqTreeSelectChange) {
        this.toggleChildren($event);
        this.toggleParents($event.value.data.parent);
    }

    /** Whether all the descendants of the node are selected. */
    descendantsAllSelected(node: FileFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);

        return descendants.every((child: any) => this.select?.selectionModel.isSelected(child));
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: FileFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);

        return descendants.some((child: any) => this.select?.selectionModel.isSelected(child));
    }

    pseudoCheckboxState(option: KbqTreeOption): KbqPseudoCheckboxState {
        if (option.isExpandable) {
            const node: FileFlatNode = option.data as unknown as FileFlatNode;

            if (this.descendantsAllSelected(node)) {
                return 'checked';
            } else if (this.descendantsPartiallySelected(node)) {
                return 'indeterminate';
            }
        }

        return option.selected ? 'checked' : 'unchecked';
    }

    private toggleChildren($event: KbqTreeSelectChange) {
        const valuesToChange: any = this.treeControl.getDescendants($event.value.data);
        if ($event.value.selected) {
            this.select.selectionModel.deselect(...valuesToChange);
        } else {
            this.select.selectionModel.select(...valuesToChange);
        }
    }

    private toggleParents(parent) {
        if (!parent) {
            return;
        }

        const descendants = this.treeControl.getDescendants(parent);
        const isParentSelected = this.select.selectionModel.selected.includes(parent);

        if (!isParentSelected && descendants.every((d: any) => this.select.selectionModel.selected.includes(d))) {
            this.select.selectionModel.select(parent);
            this.toggleParents(parent.parent);
        } else if (isParentSelected) {
            this.select.selectionModel.deselect(parent);
            this.toggleParents(parent.parent);
        }
    }
}

@Component({
    selector: 'basic-select',
    template: `
        <kbq-form-field style="width: 300px;">
            <kbq-tree-select
                [multiple]="true"
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
                            kbq-icon="mc-angle-down-S_16"
                            kbqTreeNodeToggle
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class LocalizedTreeSelect extends BasicTreeSelect {
    constructor() {
        super();
    }
}

describe('KbqTreeSelect', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let dir: { value: 'ltr' | 'rtl' };
    const scrolledSubject: Subject<any> = new Subject();
    let viewportRuler: ViewportRuler;

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

        describe('accessibility', () => {
            describe('for select', () => {
                let fixture: ComponentFixture<BasicTreeSelect>;
                let select: HTMLElement;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(BasicTreeSelect);
                    fixture.detectChanges();
                    fixture.detectChanges();
                    select = fixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;

                    tick(100);
                }));

                it('should set the tabindex of the select to 0 by default', fakeAsync(() => {
                    expect(select.getAttribute('tabindex')).toEqual('0');
                }));

                it('should be able to override the tabindex', fakeAsync(() => {
                    fixture.componentInstance.tabIndexOverride = 3;
                    fixture.detectChanges();

                    expect(select.getAttribute('tabindex')).toBe('3');
                }));

                it('should set the tabindex of the select to -1 if disabled', fakeAsync(() => {
                    fixture.componentInstance.control.disable();
                    fixture.detectChanges();
                    expect(select.getAttribute('tabindex')).toEqual('-1');

                    fixture.componentInstance.control.enable();
                    fixture.detectChanges();
                    expect(select.getAttribute('tabindex')).toEqual('0');
                }));

                xit('should select options via the UP/DOWN arrow keys on a closed select', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).withContext('Expected no initial value.').toBeFalsy();

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

                    expect(options[0].selected).withContext('Expected first option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from first option to have been set on the model.')
                        .toBe(options[0].value);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

                    // Note that the third option is skipped, because it is disabled.
                    expect(options[3].selected).withContext('Expected fourth option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from fourth option to have been set on the model.')
                        .toBe(options[3].value);

                    dispatchKeyboardEvent(select, 'keydown', UP_ARROW);

                    expect(options[1].selected).withContext('Expected second option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from second option to have been set on the model.')
                        .toBe(options[1].value);
                }));

                it('should resume focus from selected item after selecting via click', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).withContext('Expected no initial value.').toBeFalsy();

                    fixture.componentInstance.select.open();
                    fixture.detectChanges();
                    flush();

                    const optionToClick = overlayContainerElement.querySelectorAll('kbq-tree-option')[2] as HTMLElement;
                    optionToClick.click();
                    fixture.detectChanges();
                    flush();

                    expect(formControl.value).toBe(options[2].value);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    tick(10);
                    fixture.detectChanges();

                    expect(formControl.value).toBe(options[4].value);
                }));

                xit('should select options via LEFT/RIGHT arrow keys on a closed select', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).withContext('Expected no initial value.').toBeFalsy();

                    dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);

                    expect(options[0].selected).withContext('Expected first option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from first option to have been set on the model.')
                        .toBe(options[0].value);

                    dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);
                    dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);

                    // Note that the third option is skipped, because it is disabled.
                    expect(options[3].selected).withContext('Expected fourth option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from fourth option to have been set on the model.')
                        .toBe(options[3].value);

                    dispatchKeyboardEvent(select, 'keydown', LEFT_ARROW);

                    expect(options[1].selected).withContext('Expected second option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from second option to have been set on the model.')
                        .toBe(options[1].value);
                }));

                it('should open a single-selection select using ALT + DOWN_ARROW', fakeAsync(() => {
                    const { control: formControl, select: selectInstance } = fixture.componentInstance;

                    expect(selectInstance.panelOpen).withContext('Expected select to be closed.').toBe(false);

                    expect(formControl.value).withContext('Expected no initial value.').toBeFalsy();

                    const event = createKeyboardEvent('keydown', DOWN_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).withContext('Expected select to be open.').toBe(true);

                    expect(formControl.value).withContext('Expected value not to have changed.').toBeFalsy();
                }));

                it('should open a single-selection select using ALT + UP_ARROW', fakeAsync(() => {
                    const { control: formControl, select: selectInstance } = fixture.componentInstance;

                    expect(selectInstance.panelOpen).withContext('Expected select to be closed.').toBe(false);

                    expect(formControl.value).withContext('Expected no initial value.').toBeFalsy();

                    const event = createKeyboardEvent('keydown', UP_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).withContext('Expected select to be open.').toBe(true);

                    expect(formControl.value).withContext('Expected value not to have changed.').toBeFalsy();
                }));

                it('should close when pressing ALT + DOWN_ARROW', fakeAsync(() => {
                    const { select: selectInstance } = fixture.componentInstance;

                    selectInstance.open();

                    expect(selectInstance.panelOpen).withContext('Expected select to be open.').toBe(true);

                    const event = createKeyboardEvent('keydown', DOWN_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).withContext('Expected select to be closed.').toBe(false);

                    expect(event.defaultPrevented).withContext('Expected default action to be prevented.').toBe(true);
                }));

                it('should close when pressing ALT + UP_ARROW', fakeAsync(() => {
                    const { select: selectInstance } = fixture.componentInstance;

                    selectInstance.open();

                    expect(selectInstance.panelOpen).withContext('Expected select to be open.').toBe(true);

                    const event = createKeyboardEvent('keydown', UP_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).withContext('Expected select to be closed.').toBe(false);

                    expect(event.defaultPrevented).withContext('Expected default action to be prevented.').toBe(true);
                }));

                xit('should be able to select options by typing on a closed select', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).withContext('Expected no initial value.').toBeFalsy();

                    dispatchEvent(select, createKeyboardEvent('keydown', 80, undefined, 'p'));
                    tick(200);

                    expect(options[1].selected).withContext('Expected second option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from second option to have been set on the model.')
                        .toBe(options[1].value);

                    dispatchEvent(select, createKeyboardEvent('keydown', 69, undefined, 'e'));
                    tick(200);

                    expect(options[5].selected).withContext('Expected sixth option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from sixth option to have been set on the model.')
                        .toBe(options[5].value);
                }));

                it('should open the panel when pressing a vertical arrow key on a closed multiple select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const instance = multiFixture.componentInstance;

                    multiFixture.detectChanges();
                    multiFixture.detectChanges();

                    select = multiFixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;

                    const initialValue = instance.control.value;

                    expect(instance.select.panelOpen).withContext('Expected panel to be closed.').toBe(false);

                    const event = dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    tick(10);

                    expect(instance.select.panelOpen).withContext('Expected panel to be open.').toBe(true);

                    expect(instance.control.value).withContext('Expected value to stay the same.').toBe(initialValue);

                    expect(event.defaultPrevented).withContext('Expected default to be prevented.').toBe(true);
                }));

                it('should open the panel when pressing a horizontal arrow key on closed multiple select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const instance = multiFixture.componentInstance;

                    multiFixture.detectChanges();
                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;

                    const initialValue = instance.control.value;

                    expect(instance.select.panelOpen).withContext('Expected panel to be closed.').toBe(false);

                    const event = dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);
                    tick(10);

                    expect(instance.select.panelOpen).withContext('Expected panel to be open.').toBe(true);

                    expect(instance.control.value).withContext('Expected value to stay the same.').toBe(initialValue);

                    expect(event.defaultPrevented).withContext('Expected default to be prevented.').toBe(true);
                }));

                it('should do nothing when typing on a closed multi-select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const instance = multiFixture.componentInstance;

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;

                    const initialValue = instance.control.value;

                    expect(instance.select.panelOpen).withContext('Expected panel to be closed.').toBe(false);

                    dispatchEvent(select, createKeyboardEvent('keydown', 80, undefined, 'p'));
                    tick(10);

                    expect(instance.select.panelOpen).withContext('Expected panel to stay closed.').toBe(false);

                    expect(instance.control.value).withContext('Expected value to stay the same.').toBe(initialValue);
                }));

                it('should do nothing if the key manager did not change the active item', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;

                    expect(formControl.value).withContext('Expected form control value to be empty.').toBeNull();

                    expect(formControl.pristine).withContext('Expected form control to be clean.').toBe(true);

                    dispatchKeyboardEvent(select, 'keydown', 16); // Press a random key.
                    flush();

                    expect(formControl.value).withContext('Expected form control value to stay empty.').toBeNull();

                    expect(formControl.pristine).withContext('Expected form control to stay clean.').toBe(true);
                }));

                it('should continue from the selected option when the value is set programmatically', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;

                    formControl.setValue('Pictures');

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    tick(10);

                    expect(formControl.value).toBe('Documents');
                    expect(fixture.componentInstance.select.tree.keyManager.activeItem!.value).toBe('Documents');
                }));

                it('should focus preselected option when select is being opened', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    multiFixture.detectChanges();

                    multiFixture.componentInstance.control.setValue(['Applications']);

                    multiFixture.componentInstance.select.open();
                    multiFixture.detectChanges();
                    tick(10);

                    const options: NodeListOf<HTMLElement> =
                        overlayContainerElement.querySelectorAll('kbq-tree-option');
                    expect(document.activeElement).toBe(options[4]);
                }));

                it('should not shift focus when the selected options are updated programmatically in a multi select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    multiFixture.detectChanges();
                    multiFixture.detectChanges();

                    multiFixture.componentInstance.select.open();
                    multiFixture.detectChanges();
                    flush();

                    const options: NodeListOf<HTMLElement> =
                        overlayContainerElement.querySelectorAll('kbq-tree-option');

                    options[2].focus();
                    expect(document.activeElement).withContext('Expected third option to be focused.').toBe(options[2]);

                    multiFixture.componentInstance.control.setValue(['steak-0', 'sushi-7']);
                    tick(10);

                    expect(document.activeElement)
                        .withContext('Expected fourth option to remain focused.')
                        .toBe(options[2]);
                }));

                it('should not cycle through the options if the control is disabled', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;

                    formControl.setValue('eggs-5');
                    formControl.disable();

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    tick(10);

                    expect(formControl.value).withContext('Expected value to remain unchanged.').toBe('eggs-5');
                }));

                it('should not wrap selection after reaching the end of the options', fakeAsync(() => {
                    const lastOption = fixture.componentInstance.options.last;

                    fixture.componentInstance.options.forEach(() => {
                        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                        tick(10);
                    });

                    expect(lastOption.selected).withContext('Expected last option to be selected.').toBe(true);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    tick(10);

                    expect(lastOption.selected).withContext('Expected last option to stay selected.').toBe(true);
                }));

                it('should not open a multiple select when tabbing through', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;

                    expect(multiFixture.componentInstance.select.panelOpen)
                        .withContext('Expected panel to be closed initially.')
                        .toBe(false);

                    dispatchKeyboardEvent(select, 'keydown', TAB);
                    tick(10);

                    expect(multiFixture.componentInstance.select.panelOpen)
                        .withContext('Expected panel to stay closed.')
                        .toBe(false);
                }));

                xit('should toggle the next option when pressing shift + DOWN_ARROW on a multi-select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);

                    const event = createKeyboardEvent('keydown', DOWN_ARROW);
                    Object.defineProperty(event, 'shiftKey', { get: () => true });

                    // multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;

                    multiFixture.componentInstance.select.open();
                    multiFixture.detectChanges();
                    flush();

                    expect(multiFixture.componentInstance.select.value).toBeFalsy();

                    dispatchEvent(select, event);
                    expect(multiFixture.componentInstance.select.value).toEqual(['pizza-1']);

                    dispatchEvent(select, event);
                    expect(multiFixture.componentInstance.select.value).toEqual(['pizza-1', 'tacos-2']);
                }));

                xit('should toggle the previous option when pressing shift + UP_ARROW on a multi-select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const event = createKeyboardEvent('keydown', UP_ARROW);
                    Object.defineProperty(event, 'shiftKey', { get: () => true });

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;

                    multiFixture.componentInstance.select.open();
                    multiFixture.detectChanges();
                    flush();

                    // Move focus down first.
                    for (let i = 0; i < 5; i++) {
                        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                        multiFixture.detectChanges();
                    }

                    expect(multiFixture.componentInstance.select.value).toBeFalsy();

                    dispatchEvent(select, event);
                    expect(multiFixture.componentInstance.select.value).toEqual(['chips-4']);

                    dispatchEvent(select, event);
                    expect(multiFixture.componentInstance.select.value).toEqual(['sandwich-3', 'chips-4']);
                }));

                it('should prevent the default action when pressing space', fakeAsync(() => {
                    const event = dispatchKeyboardEvent(select, 'keydown', SPACE);
                    flush();

                    expect(event.defaultPrevented).toBe(true);
                }));

                it('should consider the selection a result of a user action when closed', fakeAsync(() => {
                    const option = fixture.componentInstance.options.first;
                    const spy = jasmine.createSpy('option selection spy');
                    const subscription = option.onSelectionChange.pipe(map((e) => e.isUserInput)).subscribe(spy);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    tick(10);

                    expect(spy).toHaveBeenCalledWith(true);

                    subscription.unsubscribe();
                }));

                it('should be able to focus the select trigger', fakeAsync(() => {
                    document.body.focus(); // ensure that focus isn't on the trigger already

                    fixture.componentInstance.select.focus();

                    expect(document.activeElement).withContext('Expected select element to be focused.').toBe(select);
                }));

                // todo тех долг
                xit('should restore focus to the trigger after selecting an option in multi-select mode', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const instance = multiFixture.componentInstance;

                    multiFixture.detectChanges();
                    flush();

                    select = multiFixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;
                    instance.select.open();
                    multiFixture.detectChanges();
                    flush();

                    // Ensure that the select isn't focused to begin with.
                    select.blur();
                    tick(10);
                    expect(document.activeElement).withContext('Expected trigger not to be focused.').not.toBe(select);

                    const option = overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement;
                    option.click();
                    tick(10);

                    expect(document.activeElement).withContext('Expected trigger to be focused.').toBe(select);
                }));
            });

            describe('for options', () => {
                let fixture: ComponentFixture<BasicTreeSelect>;
                let trigger: HTMLElement;
                let options: NodeListOf<HTMLElement>;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(BasicTreeSelect);
                    fixture.detectChanges();
                    fixture.detectChanges();

                    trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    options = overlayContainerElement.querySelectorAll('kbq-tree-option');
                }));

                it('should set the tabindex of each option according to disabled state', fakeAsync(() => {
                    expect(options[0].getAttribute('tabindex')).toEqual('-1');
                    expect(options[3].getAttribute('tabindex')).toEqual('-1');
                }));
            });
        });

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

            it('should not throw when attempting to open too early', () => {
                // Create component and then immediately open without running change detection
                fixture = TestBed.createComponent(BasicTreeSelect);
                expect(() => fixture.componentInstance.select.open()).not.toThrow();
            });

            it('should open the panel when trigger is clicked', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);
                expect(overlayContainerElement.textContent).toContain('rootNode_1');
                expect(overlayContainerElement.textContent).toContain('Pictures');
                expect(overlayContainerElement.textContent).toContain('Documents');
            }));

            it('should close the panel when an item is clicked', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                tick(1);
                flush();

                expect(overlayContainerElement.textContent).toEqual('');
                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should close the panel when a click occurs outside the panel', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                document.body.click();
                fixture.detectChanges();
                flush();

                expect(overlayContainerElement.textContent).toEqual('');
                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should set the width of the overlay based on the trigger', fakeAsync(() => {
                trigger.style.width = '200px';

                trigger.click();
                fixture.detectChanges();
                flush();

                const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
                expect(pane.style.minWidth).toBe('200px');
            }));

            it('should not attempt to open a select that does not have any options', fakeAsync(() => {
                fixture.componentInstance.dataSource.data = [];
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                tick(1);
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should close the panel when tabbing out', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);

                dispatchKeyboardEvent(trigger, 'keydown', TAB);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should restore focus to the host before tabbing away', fakeAsync(() => {
                const select = fixture.nativeElement.querySelector('.kbq-tree-select');

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);

                // Use a spy since focus can be flaky in unit tests.
                spyOn(select, 'focus').and.callThrough();

                dispatchKeyboardEvent(trigger, 'keydown', TAB);
                fixture.detectChanges();
                flush();

                expect(select.focus).toHaveBeenCalled();
            }));

            it('should close when tabbing out from inside the panel', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);

                const panel = overlayContainerElement.querySelector('.kbq-tree-select__panel')!;
                dispatchKeyboardEvent(panel, 'keydown', TAB);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should focus the first option when pressing HOME', fakeAsync(() => {
                fixture.componentInstance.control.setValue('Applications');
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                const event = dispatchKeyboardEvent(trigger, 'keydown', HOME);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.tree.keyManager.activeItemIndex).toBe(0);
                expect(event.defaultPrevented).toBe(true);
            }));

            it('should focus the last option when pressing END', fakeAsync(() => {
                fixture.componentInstance.control.setValue('rootNode_1');
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                const event = dispatchKeyboardEvent(trigger, 'keydown', END);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.tree.keyManager.activeItemIndex).toBe(4);
                expect(event.defaultPrevented).toBe(true);
            }));

            it('should be able to set extra classes on the panel', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const panel = overlayContainerElement.querySelector('.kbq-tree-select__panel') as HTMLElement;

                expect(panel.classList).toContain('custom-one');
                expect(panel.classList).toContain('custom-two');
            }));

            it('should prevent the default action when pressing SPACE on an option', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement;
                option.focus();
                const event = dispatchKeyboardEvent(option, 'keydown', SPACE);
                tick(10);

                expect(event.defaultPrevented).toBe(true);
            }));

            it('should prevent the default action when pressing ENTER on an option', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);

                const option = overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement;
                option.focus();
                const event = dispatchKeyboardEvent(option, 'keydown', ENTER);
                tick(10);

                expect(event.defaultPrevented).toBe(true);
            }));

            it('should not consider itself as blurred if the trigger loses focus while the panel is still open', fakeAsync(() => {
                const selectElement = fixture.nativeElement.querySelector('.kbq-tree-select');
                const selectInstance = fixture.componentInstance.select;

                dispatchFakeEvent(selectElement, 'focus');
                fixture.detectChanges();

                expect(selectInstance.focused).withContext('Expected select to be focused.').toBe(true);

                selectInstance.open();
                fixture.detectChanges();
                flush();
                dispatchFakeEvent(selectElement, 'blur');
                fixture.detectChanges();
                tick(10);

                expect(selectInstance.focused).withContext('Expected select element to remain focused.').toBe(true);
            }));
        });

        describe('selection logic', () => {
            let fixture: ComponentFixture<BasicTreeSelect>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicTreeSelect);
                fixture.detectChanges();
                fixture.detectChanges();
                trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

                tick(10);
            }));

            it('should focus the first option if no option is selected', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.tree.keyManager.activeItemIndex).toEqual(0);
            }));

            it('should select an option when it is clicked', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                let option = overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                tick(1);
                flush();

                option = overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement;

                fixture.autoDetectChanges();
                expect(option.classList).toContain('kbq-selected');
                expect(fixture.componentInstance.options.first.selected).toBe(true);
                expect(fixture.componentInstance.select.selectedValues).toBe(
                    fixture.componentInstance.options.first.value
                );
            }));

            xit('should be able to select an option using the KbqTreeOption API', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const optionInstances = fixture.componentInstance.options.toArray();
                const optionNodes: NodeListOf<HTMLElement> =
                    overlayContainerElement.querySelectorAll('kbq-tree-option');

                optionInstances[1].select();
                fixture.detectChanges();
                flush();

                expect(optionNodes[1].classList).toContain('kbq-selected');
                expect(optionInstances[1].selected).toBe(true);
                expect(fixture.componentInstance.select.selected).toBe(optionInstances[1]);
            }));

            it('should deselect other options when one is selected', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();

                let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');

                options[0].click();
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                tick(10);

                options = overlayContainerElement.querySelectorAll('kbq-tree-option');
                expect(options[1].classList).not.toContain('kbq-selected');
                expect(options[2].classList).not.toContain('kbq-selected');

                const optionInstances = fixture.componentInstance.options.toArray();
                expect(optionInstances[1].selected).toBe(false);
                expect(optionInstances[2].selected).toBe(false);
            }));

            it('should deselect other options when one is programmatically selected', fakeAsync(() => {
                const control = fixture.componentInstance.control;
                const treeOptions = fixture.componentInstance.dataSource.data;

                trigger.click();
                fixture.detectChanges();
                flush();

                let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');

                options[0].click();
                fixture.detectChanges();
                flush();

                control.setValue(treeOptions[1].name);
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                options = overlayContainerElement.querySelectorAll('kbq-tree-option');

                fixture.autoDetectChanges();

                expect(options[0].classList)
                    .withContext('Expected first option to no longer be selected')
                    .not.toContain('kbq-selected');

                expect(options[1].classList)
                    .withContext('Expected second option to be selected')
                    .toContain('kbq-selected');

                const optionInstances = fixture.componentInstance.options.toArray();

                expect(optionInstances[0].selected)
                    .withContext('Expected first option to no longer be selected')
                    .toBe(false);

                expect(optionInstances[1].selected).withContext('Expected second option to be selected').toBe(true);
            }));

            xit('should remove selection if option has been removed', fakeAsync(() => {
                const select = fixture.componentInstance.select;

                trigger.click();
                fixture.detectChanges();
                flush();

                const firstOption = overlayContainerElement.querySelectorAll('kbq-tree-option')[0] as HTMLElement;

                firstOption.click();
                fixture.detectChanges();

                expect(select.selected).withContext('Expected first option to be selected.').toBe(select.options.first);

                fixture.componentInstance.dataSource.data = [];
                fixture.detectChanges();
                flush();

                // todo не очищается селект
                expect(select.selected)
                    .withContext('Expected selection to be removed when option no longer exists.')
                    .toBeUndefined();
            }));

            it('should display the selected option in the trigger', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                tick(1);
                flush();

                const value = fixture.debugElement.query(By.css('.kbq-select__matcher')).nativeElement;

                expect(value.textContent).toContain('rootNode_1');
            }));

            it('should focus the selected option if an option is selected', fakeAsync(() => {
                // must wait for initial writeValue promise to finish
                flush();

                fixture.componentInstance.control.setValue('Pictures');
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                // must wait for animation to finish
                fixture.detectChanges();
                expect(fixture.componentInstance.select.tree.keyManager.activeItemIndex).toEqual(1);
            }));

            xit('should select an option that was added after initialization', fakeAsync(() => {
                // fixture.componentInstance.dataSource.data.push({ name: 'Potatoes', type: 'app' });
                trigger.click();
                fixture.detectChanges();
                flush();

                const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');
                options[8].click();
                fixture.detectChanges();
                flush();

                expect(trigger.textContent).toContain('Potatoes');
                expect(fixture.componentInstance.select.selected).toBe(fixture.componentInstance.options.last);
            }));

            xit('should update the trigger when the selected option label is changed', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                expect(trigger.querySelector('.kbq-select__matcher-text')!.textContent!.trim()).toBe('Pizza');

                fixture.componentInstance.dataSource.data[1].name = 'Calzone';
                fixture.detectChanges();
                flush();

                expect(trigger.querySelector('.kbq-select__matcher-text')!.textContent!.trim()).toBe('Calzone');
            }));

            it('should not select disabled options', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();

                const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');
                options[3].click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);
                expect(options[2].classList).not.toContain('kbq-selected');
                expect(fixture.componentInstance.select.selected).toBeUndefined();
            }));

            it('should not throw if triggerValue accessed with no selected value', fakeAsync(() => {
                expect(() => fixture.componentInstance.select.triggerValue).not.toThrow();
            }));

            xit('should emit to `optionSelectionChanges` when an option is selected', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const spy = jasmine.createSpy('option selection spy');
                const subscription = fixture.componentInstance.select.optionSelectionChanges.subscribe(spy);
                const option = overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                expect(spy).toHaveBeenCalledWith(jasmine.any(KbqTreeSelectionChange));

                subscription.unsubscribe();
            }));

            xit('should handle accessing `optionSelectionChanges` before the options are initialized', fakeAsync(() => {
                fixture.destroy();
                fixture = TestBed.createComponent(BasicTreeSelect);

                const spy = jasmine.createSpy('option selection spy');
                let subscription: Subscription;

                expect(fixture.componentInstance.select.options).toBeFalsy();
                expect(() => {
                    subscription = fixture.componentInstance.select.optionSelectionChanges.subscribe(spy);
                }).not.toThrow();

                fixture.detectChanges();
                trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                expect(spy).toHaveBeenCalledWith(jasmine.any(KbqTreeSelectionChange));

                subscription!.unsubscribe();
            }));

            it('should scroll to selected element on panel open', fakeAsync(() => {
                const dataMock = Array(30)
                    .fill('option')
                    .reduce((accum, value, index) => {
                        accum[`${value}-${index}`] = `${value}-${index}`;

                        return accum;
                    }, {});
                fixture.componentInstance.dataSource.data = buildFileTree(dataMock, 0);

                trigger.click();
                fixture.detectChanges();

                const options = overlayContainerElement.querySelectorAll<HTMLElement>('kbq-tree-option');
                options[options.length - 1].click();
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                const {
                    bottom: elementBottom,
                    height: elementHeight,
                    top: elementTop
                } = options[options.length - 1].getBoundingClientRect();
                const { top: containerTop, bottom: containerBottom } =
                    fixture.componentInstance.select.panel.nativeElement.getBoundingClientRect();

                const isInView =
                    elementTop <= containerTop
                        ? containerTop - elementTop <= elementHeight
                        : elementBottom - containerBottom <= elementHeight;
                expect(isInView).toBeTruthy();
            }));

            it('should focus itself after list closed by KeyBoard events', fakeAsync(() => {
                const closeAndFocusKeys: number[] = [TAB, ESCAPE, DOWN_ARROW, UP_ARROW];
                const selectInstance = fixture.componentInstance.select;
                spyOn(selectInstance, 'focus');

                closeAndFocusKeys.forEach((keyCode) => {
                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const option = overlayContainerElement.querySelectorAll('kbq-tree-option')[0];
                    const keyBoardEvent: KeyboardEvent = createKeyboardEvent('keydown', keyCode, option);
                    Object.defineProperties(keyBoardEvent, {
                        altKey: { get: () => true }
                    });

                    dispatchEvent(option, keyBoardEvent);
                    fixture.detectChanges();
                    flush();
                });

                // Double it, since open and close events are involved
                expect(selectInstance.focus).toHaveBeenCalledTimes(closeAndFocusKeys.length * 2);
            }));
        });

        describe('forms integration', () => {
            let fixture: ComponentFixture<BasicTreeSelect>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicTreeSelect);
                fixture.detectChanges();
                fixture.detectChanges();
                trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

                tick(10);
            }));

            it('should take an initial view value with reactive forms', fakeAsync(() => {
                fixture.componentInstance.control = new UntypedFormControl('rootNode_1');
                fixture.detectChanges();

                const value = fixture.debugElement.query(By.css('.kbq-select__matcher'));
                expect(value.nativeElement.textContent)
                    .withContext(`Expected trigger to be populated by the control's initial value.`)
                    .toContain('rootNode_1');

                trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                trigger.click();
                fixture.detectChanges();
                flush();

                const options = overlayContainerElement.querySelectorAll('kbq-tree-option');

                fixture.autoDetectChanges();

                expect(options[0].classList)
                    .withContext(`Expected option with the control's initial value to be selected.`)
                    .toContain('kbq-selected');
            }));

            it('should set the view value from the form', fakeAsync(() => {
                let value = fixture.debugElement.query(By.css('.kbq-select__matcher'));
                expect(value.nativeElement.textContent.trim()).toBe('Food');

                fixture.componentInstance.control.setValue('rootNode_1');
                fixture.detectChanges();

                value = fixture.debugElement.query(By.css('.kbq-select__matcher'));
                expect(value.nativeElement.textContent)
                    .withContext(`Expected trigger to be populated by the control's new value.`)
                    .toContain('rootNode_1');

                trigger.click();
                fixture.detectChanges();
                tick(1);
                flush();

                const options = overlayContainerElement.querySelectorAll('kbq-tree-option');

                fixture.autoDetectChanges();

                expect(options[0].classList)
                    .withContext(`Expected option with the control's new value to be selected.`)
                    .toContain('kbq-selected');
            }));

            it('should update the form value when the view changes', fakeAsync(() => {
                expect(fixture.componentInstance.control.value)
                    .withContext(`Expected the control's value to be empty initially.`)
                    .toEqual(null);

                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                tick(1);
                flush();

                expect(fixture.componentInstance.control.value)
                    .withContext(`Expected control's value to be set to the new option.`)
                    .toEqual('rootNode_1');
            }));

            // todo сейчас логика позволяет устанавливать несуществующие значения
            xit('should clear the selection when a nonexistent option value is selected', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                fixture.componentInstance.control.setValue('gibberish');
                fixture.detectChanges();

                const value = fixture.debugElement.query(By.css('.kbq-select__matcher'));
                expect(value.nativeElement.textContent.trim())
                    .withContext(`Expected trigger to show the placeholder.`)
                    .toBe('Food');

                expect(trigger.textContent)
                    .withContext(`Expected trigger is cleared when option value is not found.`)
                    .not.toContain('Pizza');

                trigger.click();
                fixture.detectChanges();
                flush();

                const options = overlayContainerElement.querySelectorAll('kbq-tree-option');
                expect(options[1].classList)
                    .withContext(`Expected option w/ the old value not to be selected.`)
                    .not.toContain('kbq-selected');
            }));

            it('should clear the selection when the control is reset', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                fixture.componentInstance.control.reset();
                fixture.detectChanges();

                const value = fixture.debugElement.query(By.css('.kbq-select__matcher'));
                expect(value.nativeElement.textContent.trim())
                    .withContext(`Expected trigger to show the placeholder.`)
                    .toBe('Food');

                expect(trigger.textContent)
                    .withContext(`Expected trigger is cleared when option value is not found.`)
                    .not.toContain('Pizza');

                trigger.click();
                fixture.detectChanges();
                flush();

                const options = overlayContainerElement.querySelectorAll('kbq-tree-option');
                expect(options[1].classList)
                    .withContext(`Expected option w/ the old value not to be selected.`)
                    .not.toContain('kbq-selected');
            }));

            it('should set the control to touched when the select is blurred', fakeAsync(() => {
                expect(fixture.componentInstance.control.touched)
                    .withContext(`Expected the control to start off as untouched.`)
                    .toEqual(false);

                trigger.click();
                dispatchFakeEvent(trigger, 'blur');
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .withContext(`Expected the control to stay untouched when menu opened.`)
                    .toEqual(false);

                document.body.click();
                dispatchFakeEvent(trigger, 'blur');
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .withContext(`Expected the control to be touched as soon as focus left the select.`)
                    .toEqual(true);
            }));

            it('should set the control to touched when the panel is closed', fakeAsync(() => {
                expect(fixture.componentInstance.control.touched)
                    .withContext('Expected the control to start off as untouched.')
                    .toBe(false);

                trigger.click();
                dispatchFakeEvent(trigger, 'blur');
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .withContext('Expected the control to stay untouched when dropdown opened.')
                    .toBe(false);

                fixture.componentInstance.select.close();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .withContext('Expected the control to be touched when the panel was closed.')
                    .toBe(true);
            }));

            it('should not set touched when a disabled select is touched', fakeAsync(() => {
                expect(fixture.componentInstance.control.touched)
                    .withContext('Expected the control to start off as untouched.')
                    .toBe(false);

                fixture.componentInstance.control.disable();
                dispatchFakeEvent(trigger, 'blur');

                expect(fixture.componentInstance.control.touched)
                    .withContext('Expected the control to stay untouched.')
                    .toBe(false);
            }));

            it('should set the control to dirty when the select value changes in DOM', fakeAsync(() => {
                expect(fixture.componentInstance.control.dirty)
                    .withContext(`Expected control to start out pristine.`)
                    .toEqual(false);

                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                tick(1);
                flush();

                expect(fixture.componentInstance.control.dirty)
                    .withContext(`Expected control to be dirty after value was changed by user.`)
                    .toEqual(true);
            }));

            xit('should not set the control to dirty when the value changes programmatically', fakeAsync(() => {
                expect(fixture.componentInstance.control.dirty)
                    .withContext(`Expected control to start out pristine.`)
                    .toEqual(false);

                fixture.componentInstance.control.setValue('pizza-1');

                expect(fixture.componentInstance.control.dirty)
                    .withContext(`Expected control to stay pristine after programmatic change.`)
                    .toEqual(false);
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

        xdescribe('keyboard scrolling', () => {
            let fixture: ComponentFixture<BasicTreeSelect>;
            let host: HTMLElement;
            let panel: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicTreeSelect);

                fixture.detectChanges();
                fixture.componentInstance.select.open();
                fixture.detectChanges();
                flush();

                host = fixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;
                panel = overlayContainerElement.querySelector('.kbq-tree-select__panel') as HTMLElement;
            }));

            it('should not scroll to options that are completely in the view', fakeAsync(() => {
                const initialScrollPosition = panel.scrollTop;

                [1, 2, 3].forEach(() => {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                });

                expect(panel.scrollTop)
                    .withContext('Expected scroll position not to change')
                    .toBe(initialScrollPosition);
            }));

            it('should scroll down to the active option', fakeAsync(() => {
                for (let i = 0; i < 15; i++) {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                }

                // <option index * height> - <panel height> = 16 * 32 - 224 = 288
                expect(panel.scrollTop).withContext('Expected scroll to be at the 16th option.').toBe(288);
            }));

            it('should scroll up to the active option', fakeAsync(() => {
                // Scroll to the bottom.
                for (let i = 0; i < fixture.componentInstance.dataSource.data.length; i++) {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                }

                for (let i = 0; i < 20; i++) {
                    dispatchKeyboardEvent(host, 'keydown', UP_ARROW);
                }

                // <option index * height> = 9 * 32 = 432
                expect(panel.scrollTop).withContext('Expected scroll to be at the 9th option.').toBe(288);
            }));

            it('should scroll top the top when pressing HOME', fakeAsync(() => {
                for (let i = 0; i < 20; i++) {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                    fixture.detectChanges();
                }

                expect(panel.scrollTop).withContext('Expected panel to be scrolled down.').toBeGreaterThan(0);

                dispatchKeyboardEvent(host, 'keydown', HOME);
                fixture.detectChanges();

                expect(panel.scrollTop).withContext('Expected panel to be scrolled to the top').toBe(0);
            }));

            it('should scroll to the bottom of the panel when pressing END', fakeAsync(() => {
                dispatchKeyboardEvent(host, 'keydown', END);
                fixture.detectChanges();

                // <option amount> * <option height> - <panel height> = 30 * 32 - 228 = 736
                expect(panel.scrollTop).withContext('Expected panel to be scrolled to the bottom').toBe(732);
            }));

            it('should scroll to the active option when typing', fakeAsync(() => {
                for (let i = 0; i < 15; i++) {
                    // Press the letter 'o' 15 times since all the options are named 'Option <index>'
                    dispatchEvent(host, createKeyboardEvent('keydown', 79, undefined, 'o'));
                    fixture.detectChanges();
                    tick(LETTER_KEY_DEBOUNCE_INTERVAL);
                }
                flush();

                // <option index * height> - <panel height> = 16 * 32 - 224 = 288
                expect(panel.scrollTop).withContext('Expected scroll to be at the 16th option.').toBe(288);
            }));
        });

        describe('Events', () => {
            let fixture: ComponentFixture<BasicEvents>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicEvents);
                fixture.detectChanges();
                fixture.detectChanges();

                trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

                tick(10);
            }));

            it('should fire openedChange event on open select', fakeAsync(() => {
                expect(fixture.componentInstance.openedChangeListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedChangeListener).toHaveBeenCalled();
            }));

            it('should fire openedChange event on close select', fakeAsync(() => {
                expect(fixture.componentInstance.openedChangeListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedChangeListener).toHaveBeenCalled();

                document.body.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedChangeListener).toHaveBeenCalledTimes(2);
            }));

            it('should fire opened event on open select', fakeAsync(() => {
                expect(fixture.componentInstance.openedListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedListener).toHaveBeenCalled();
            }));

            it('should fire closed event on close select', fakeAsync(() => {
                expect(fixture.componentInstance.closedListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.closedListener).not.toHaveBeenCalled();

                document.body.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.closedListener).toHaveBeenCalled();
            }));
        });
    });

    describe('when initialized without options', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([SelectInitWithoutOptions])));

        // todo fix
        xit('should select the proper option when option list is initialized later', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectInitWithoutOptions);
            const instance = fixture.componentInstance;
            const originalData = instance.dataSource.data;
            instance.dataSource.data = [];

            fixture.detectChanges();
            flush();

            // Wait for the initial writeValue promise.
            expect(instance.select.selected).toBeFalsy();

            instance.dataSource.data = originalData;
            fixture.detectChanges();
            flush();

            // Wait for the next writeValue promise.
            expect(instance.select.selected).toBe(instance.options.toArray()[0]);
        }));
    });

    describe('with a selectionChange event handler', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([SelectWithChangeEvent])));

        let fixture: ComponentFixture<SelectWithChangeEvent>;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SelectWithChangeEvent);
            fixture.detectChanges();
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            tick(10);
        }));

        it('should emit an event when the selected option has changed', fakeAsync(() => {
            trigger.click();
            tick(0);
            fixture.detectChanges();

            (overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement).click();
            tick(0);
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.changeListener).toHaveBeenCalled();
        }));
        // todo эта проверка для ситуации когда нельзя снять выделение с элемента,
        // но для этого требуется реализация параметра noUnselect, поэтому пока этот TC добавлен в исключения.
        xit('should not emit multiple change events for the same option', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            const option = overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement;

            option.click();
            option.click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.changeListener).toHaveBeenCalledTimes(1);
        }));

        it('should only emit one event when pressing arrow keys on closed select', fakeAsync(() => {
            const select = fixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;
            dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

            flush();

            expect(fixture.componentInstance.changeListener).toHaveBeenCalledTimes(1);
        }));
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

    describe('with search', () => {
        let fixture: ComponentFixture<SelectWithSearch>;
        let trigger: HTMLElement;

        beforeEach(waitForAsync(() => {
            configureKbqTreeSelectTestingModule([SelectWithSearch]);

            fixture = TestBed.createComponent(SelectWithSearch);
            fixture.detectChanges();
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
        }));

        it('should have search input', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            expect(fixture.debugElement.query(By.css('input'))).toBeDefined();
        }));

        it('should search filed should be focused after open', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');

            expect(document.activeElement).toBe(options[0]);
        }));

        it('should show empty message', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            inputElementDebug.nativeElement.value = 'cgr8e912eha';

            inputElementDebug.triggerEventHandler('input', { target: inputElementDebug.nativeElement });
            tick();
            flush();

            const options = fixture.debugElement.queryAll(By.css('kbq-tree-option'));
            expect(options.length).toEqual(0);
            expect(fixture.debugElement.query(By.css('.kbq-select__no-options-message'))).toBeDefined();
        }));

        it('should search', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            inputElementDebug.nativeElement.value = 'App';

            inputElementDebug.triggerEventHandler('input', { target: inputElementDebug.nativeElement });
            tick();
            flush();

            const optionsTexts = fixture.debugElement
                .queryAll(By.css('kbq-tree-option'))
                .map((el) => el.nativeElement.innerText);

            expect(optionsTexts).toEqual(['Applications']);
        }));

        it('should clear search by esc', () => {
            trigger.click();
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            inputElementDebug.nativeElement.value = 'lu';

            inputElementDebug.triggerEventHandler('input', { target: inputElementDebug.nativeElement });
            fixture.detectChanges();

            dispatchKeyboardEvent(inputElementDebug.nativeElement, 'keydown', ESCAPE);

            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.value).toBe('');
        });

        it('should close list by esc if input is empty', () => {
            trigger.click();
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            dispatchKeyboardEvent(inputElementDebug.nativeElement, 'keydown', ESCAPE);

            fixture.detectChanges();

            const selectInstance = fixture.componentInstance.select;

            expect(selectInstance.panelOpen).toBe(false);
        });
    });

    describe('with multiple kbq-select elements in one view', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([ManySelects])));

        let fixture: ComponentFixture<ManySelects>;
        let triggers: DebugElement[];
        let options: NodeListOf<HTMLElement>;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ManySelects);
            fixture.detectChanges();
            fixture.detectChanges();
            triggers = fixture.debugElement.queryAll(By.css('.kbq-select__trigger'));

            triggers[0].nativeElement.click();
            fixture.detectChanges();
            tick(10);

            flush();

            options = overlayContainerElement.querySelectorAll('kbq-tree-option');
        }));

        it('should set the option id properly', fakeAsync(() => {
            const firstOptionID = options[0].id;

            expect(options[0].id)
                .withContext(`Expected option ID to have the correct prefix.`)
                .toContain('kbq-tree-option');

            expect(options[0].id).withContext(`Expected option IDs to be unique.`).not.toEqual(options[1].id);

            document.body.click();
            fixture.detectChanges();
            flush();

            triggers[1].nativeElement.click();
            fixture.detectChanges();
            flush();

            options = overlayContainerElement.querySelectorAll('kbq-tree-option');
            expect(options[0].id)
                .withContext(`Expected option ID to have the correct prefix.`)
                .toContain('kbq-tree-option');

            expect(options[0].id).withContext(`Expected option IDs to be unique.`).not.toEqual(firstOptionID);

            expect(options[0].id).withContext(`Expected option IDs to be unique.`).not.toEqual(options[1].id);
        }));
    });

    describe('with a sibling component that throws an error', () => {
        beforeEach(waitForAsync(() =>
            configureKbqTreeSelectTestingModule([
                SelectWithErrorSibling,
                ThrowsErrorOnInit
            ])));

        it('should not crash the browser when a sibling throws an error on init', fakeAsync(() => {
            // Note that this test can be considered successful if the error being thrown didn't
            // end up crashing the testing setup altogether.
            expect(() => TestBed.createComponent(SelectWithErrorSibling).detectChanges()).toThrowError(
                new RegExp('Oh no!', 'g')
            );
        }));
    });

    describe('change events', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([EmptySelect])));

        it('should complete the stateChanges stream on destroy', () => {
            const fixture = TestBed.createComponent(EmptySelect);
            fixture.detectChanges();

            const debugElement = fixture.debugElement.query(By.directive(KbqTreeSelect));
            const select = debugElement.componentInstance;

            const spy = jasmine.createSpy('stateChanges complete');
            const subscription = select.stateChanges.subscribe(undefined, undefined, spy);

            fixture.destroy();
            expect(spy).toHaveBeenCalled();
            subscription.unsubscribe();
        });
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

    describe('with theming', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([BasicSelectWithTheming])));

        let fixture: ComponentFixture<BasicSelectWithTheming>;

        beforeEach(() => {
            fixture = TestBed.createComponent(BasicSelectWithTheming);
            fixture.detectChanges();
        });

        it('should transfer the theme to the select panel', () => {
            fixture.componentInstance.theme = ThemePalette.Error;
            fixture.detectChanges();
            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            trigger.click();
            fixture.detectChanges();

            const panel = overlayContainerElement.querySelector('.kbq-tree-select__panel')!;
            expect(panel.classList).toContain('kbq-error');
        });
    });

    describe('when invalid inside a form', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([InvalidSelectInForm])));

        it('should not throw SelectionModel errors in addition to ngModel errors', fakeAsync(() => {
            const fixture = TestBed.createComponent(InvalidSelectInForm);

            // The first change detection run will throw the "ngModel is missing a name" error.
            expect(() => fixture.detectChanges()).toThrowError(/the name attribute must be set/g);

            // The second run shouldn't throw selection-model related errors.
            expect(() => fixture.detectChanges()).not.toThrow();
        }));
    });

    // todo fix
    xdescribe('with ngModel using compareWith', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([NgModelCompareWithSelect])));

        let fixture: ComponentFixture<NgModelCompareWithSelect>;
        let instance: NgModelCompareWithSelect;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(NgModelCompareWithSelect);
            instance = fixture.componentInstance;
            fixture.detectChanges();
        }));

        describe('comparing by value', () => {
            xit('should have a selection', fakeAsync(() => {
                const selectedOption = instance.select.selected as KbqTreeOption;
                expect(selectedOption.value).toEqual('rootNode_1');
            }));

            xit('should update when making a new selection', fakeAsync(() => {
                const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                trigger.click();
                fixture.detectChanges();

                instance.options.last.selectViaInteraction();
                fixture.detectChanges();
                flush();

                const selectedOption = instance.select.selected as KbqTreeOption;
                expect(instance.selected.name).toEqual('tacos-2');
                expect(selectedOption.value).toEqual('tacos-2');
            }));
        });

        describe('comparing by reference', () => {
            beforeEach(fakeAsync(() => {
                spyOn(instance, 'compareByReference').and.callThrough();
                instance.useCompareByReference();
                fixture.detectChanges();
                flush();
            }));

            it('should use the comparator', fakeAsync(() => {
                expect(instance.compareByReference).toHaveBeenCalled();
            }));

            it('should initialize with no selection despite having a value', fakeAsync(() => {
                expect(instance.selected.name).toBe('rootNode_1');
                expect(instance.select.selected).toBeUndefined();
            }));

            it('should not update the selection if value is copied on change', fakeAsync(() => {
                instance.options.first.selectViaInteraction();
                fixture.detectChanges();
                flush();

                expect(instance.selected.name).toEqual('steak-0');
                expect(instance.select.selected).toBeUndefined();
            }));

            it('should throw an error when using a non-function comparator', fakeAsync(() => {
                instance.useNullComparator();

                expect(() => {
                    fixture.detectChanges();
                }).toThrowError(wrappedErrorMessage(getKbqSelectNonFunctionValueError()));
            }));
        });
    });

    describe(`when the select's value is accessed on initialization`, () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([SelectEarlyAccessSibling])));

        it('should not throw when trying to access the selected value on init', fakeAsync(() => {
            expect(() => {
                TestBed.createComponent(SelectEarlyAccessSibling).detectChanges();
            }).not.toThrow();
        }));
    });

    describe('inside of a form group', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([SelectInsideFormGroup])));

        let fixture: ComponentFixture<SelectInsideFormGroup>;
        let testComponent: SelectInsideFormGroup;
        let select: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SelectInsideFormGroup);
            fixture.detectChanges();
            testComponent = fixture.componentInstance;
            select = fixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;

            tick(10);
        }));

        it('should not set the invalid class on a clean select', fakeAsync(() => {
            expect(testComponent.formGroup.untouched).withContext('Expected the form to be untouched.').toBe(true);

            expect(testComponent.formControl.invalid).withContext('Expected form control to be invalid.').toBe(false);

            expect(select.classList).withContext('Expected select not to appear invalid.').not.toContain('kbq-invalid');
        }));

        it('should not appear as invalid if it becomes touched', fakeAsync(() => {
            expect(select.classList).withContext('Expected select not to appear invalid.').not.toContain('kbq-invalid');

            testComponent.formControl.markAsTouched();
            fixture.detectChanges();

            expect(select.classList).withContext('Expected select to appear invalid.').not.toContain('kbq-invalid');
        }));

        it('should not have the invalid class when the select becomes valid', fakeAsync(() => {
            testComponent.formControl.markAsTouched();
            fixture.detectChanges();

            expect(select.classList).withContext('Expected select to appear invalid.').not.toContain('kbq-invalid');

            testComponent.formControl.setValue('pizza-1');
            fixture.detectChanges();
            flush();

            expect(select.classList).withContext('Expected select not to appear invalid.').not.toContain('kbq-invalid');
        }));

        it('should appear as invalid when the parent form group is submitted', fakeAsync(() => {
            expect(select.classList).withContext('Expected select not to appear invalid.').not.toContain('kbq-invalid');

            dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
            fixture.detectChanges();

            expect(select.classList).withContext('Expected select to appear invalid.').toContain('kbq-invalid');
        }));

        // todo fix
        xit('should render the error messages when the parent form is submitted', fakeAsync(() => {
            const debugEl = fixture.debugElement.nativeElement;

            expect(debugEl.querySelectorAll('kbq-error').length).withContext('Expected no error messages').toBe(0);

            dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
            fixture.detectChanges();

            expect(debugEl.querySelectorAll('kbq-error').length).withContext('Expected one error message').toBe(1);
        }));

        it('should override error matching behavior via injection token', fakeAsync(() => {
            const errorStateMatcher: ErrorStateMatcher = {
                isErrorState: jasmine.createSpy('error state matcher').and.returnValue(true)
            };

            fixture.destroy();

            TestBed.resetTestingModule().configureTestingModule({
                imports: [
                    KbqFormFieldModule,
                    KbqTreeModule,
                    KbqTreeSelectModule,
                    ReactiveFormsModule,
                    FormsModule,
                    NoopAnimationsModule
                ],
                declarations: [SelectInsideFormGroup],
                providers: [{ provide: ErrorStateMatcher, useValue: errorStateMatcher }]
            });

            const errorFixture = TestBed.createComponent(SelectInsideFormGroup);
            const component = errorFixture.componentInstance;

            errorFixture.detectChanges();

            tick(10);

            expect(component.select.errorState).toBe(true);
            expect(errorStateMatcher.isErrorState).toHaveBeenCalled();
        }));

        it('should set proper form group validation state on ngSubmit handler, without setTimeout', fakeAsync(() => {
            spyOn(fixture.componentInstance, 'submitReactive').and.callThrough();

            dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');

            expect(fixture.componentInstance.submitReactive).toHaveBeenCalled();
            expect(fixture.componentInstance.submitResult).toEqual('invalid');
        }));
    });

    describe('with custom error behavior', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([CustomErrorBehaviorSelect])));

        it('should be able to override the error matching behavior via an @Input', fakeAsync(() => {
            const fixture = TestBed.createComponent(CustomErrorBehaviorSelect);
            const component = fixture.componentInstance;
            const matcher = jasmine.createSpy('error state matcher').and.returnValue(true);

            fixture.detectChanges();

            expect(component.control.invalid).toBe(false);
            expect(component.select.errorState).toBe(false);

            fixture.componentInstance.errorStateMatcher = { isErrorState: matcher };
            fixture.detectChanges();
            tick(10);

            expect(component.select.errorState).toBe(true);
            expect(matcher).toHaveBeenCalled();
        }));
    });

    describe('with preselected array values', () => {
        beforeEach(waitForAsync(() =>
            configureKbqTreeSelectTestingModule([
                SingleSelectWithPreselectedArrayValues
            ])));

        it('should be able to preselect an array value in single-selection mode', fakeAsync(() => {
            const fixture = TestBed.createComponent(SingleSelectWithPreselectedArrayValues);
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            fixture.detectChanges();
            tick(600);

            expect(trigger.textContent).toContain('Pictures');
            // expect(fixture.componentInstance.options.toArray()[1].selected).toBe(true);
        }));
    });

    describe('with custom value accessor', () => {
        beforeEach(waitForAsync(() =>
            configureKbqTreeSelectTestingModule([
                CompWithCustomSelect,
                CustomSelectAccessor
            ])));

        it('should support use inside a custom value accessor', fakeAsync(() => {
            const fixture = TestBed.createComponent(CompWithCustomSelect);
            spyOn(fixture.componentInstance.customAccessor, 'writeValue');
            fixture.detectChanges();

            expect(fixture.componentInstance.customAccessor.select.ngControl)
                .withContext('Expected kbq-select NOT to inherit control from parent value accessor.')
                .toBeFalsy();
            expect(fixture.componentInstance.customAccessor.writeValue).toHaveBeenCalled();
        }));
    });

    // todo оставлено как тех долг
    xdescribe('with a falsy value', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([FalsyValueSelect])));

        it('should be able to programmatically select a falsy option', fakeAsync(() => {
            const fixture = TestBed.createComponent(FalsyValueSelect);

            fixture.detectChanges();
            fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
            fixture.componentInstance.control.setValue(0);
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.options.first.selected)
                .withContext('Expected first option to be selected')
                .toBe(true);

            expect(overlayContainerElement.querySelectorAll('kbq-tree-option')[0].classList)
                .withContext('Expected first option to be selected')
                .toContain('kbq-selected');
        }));
    });

    describe('with OnPush', () => {
        beforeEach(waitForAsync(() =>
            configureKbqTreeSelectTestingModule([
                BasicSelectOnPush,
                BasicSelectOnPushPreselected
            ])));

        it('should set the trigger text based on the value when initialized', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectOnPushPreselected);
            fixture.detectChanges();
            flush();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            fixture.detectChanges();
            tick();

            expect(trigger.textContent).toContain('rootNode_1');
        }));

        it('should update the trigger based on the value', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectOnPush);
            fixture.detectChanges();
            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            fixture.componentInstance.control.setValue('rootNode_1');
            fixture.detectChanges();
            flush();

            expect(trigger.textContent).toContain('rootNode_1');

            fixture.componentInstance.control.reset();
            fixture.detectChanges();
            tick(1);
            flush();

            expect(trigger.textContent).not.toContain('Pizza');
        }));
    });

    describe('with custom trigger', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([SelectWithCustomTrigger])));

        it('should allow the user to customize the label', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectWithCustomTrigger);
            fixture.detectChanges();

            fixture.componentInstance.control.setValue('Downloads');
            fixture.detectChanges();
            tick(1);
            flush();

            const label = fixture.debugElement.query(By.css('.kbq-select__matcher')).nativeElement;

            expect(label.textContent)
                .withContext('Expected the displayed text to be "Pizza" in reverse.')
                .toContain('sdaolnwoD');
        }));
    });

    describe('when resetting the value by setting null or undefined', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([ResetValuesSelect])));

        let fixture: ComponentFixture<ResetValuesSelect>;
        let trigger: HTMLElement;
        let formField: HTMLElement;
        let options: NodeListOf<HTMLElement>;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ResetValuesSelect);
            fixture.autoDetectChanges();

            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            formField = fixture.debugElement.query(By.css('.kbq-form-field')).nativeElement;

            trigger.click();
            tick(10);

            options = overlayContainerElement.querySelectorAll('kbq-tree-option');
            options[1].click();
            tick(1);
        }));

        xit('should reset when an option with an undefined value is selected', fakeAsync(() => {
            options[4].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.value).toBeUndefined();
            expect(fixture.componentInstance.select.selected).toBeFalsy();
            expect(formField.classList).not.toContain('kbq-form-field-should-float');
            expect(trigger.textContent).not.toContain('Undefined-option');
        }));

        it('should reset when an option with a null value is selected', fakeAsync(() => {
            fixture.componentInstance.control.setValue(null);
            options[2].click();
            tick(1);

            expect(formField.classList).not.toContain('kbq-form-field-should-float');
            expect(trigger.textContent).not.toContain('Null-option');
        }));

        // todo fix ?
        xit('should reset when a blank option is selected', fakeAsync(() => {
            options[6].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.value).toBeUndefined();
            expect(fixture.componentInstance.select.selected).toBeFalsy();
            expect(formField.classList).not.toContain('kbq-form-field-should-float');
            expect(trigger.textContent).not.toContain('None');
        }));

        it('should not mark the reset option as selected ', fakeAsync(() => {
            options[4].click();

            fixture.componentInstance.select.open();
            tick(1);

            expect(options[4].classList).not.toContain('kbq-selected');
        }));

        // todo fix
        xit('should not reset when any other falsy option is selected', fakeAsync(() => {
            options[3].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.value).toBe(false);
            expect(fixture.componentInstance.select.selected).toBeTruthy();
            expect(trigger.textContent).toContain('Falsy-option');
        }));

        it('should not consider the reset values as selected when resetting the form control', fakeAsync(() => {
            fixture.componentInstance.control.reset();
            tick(1);

            expect(fixture.componentInstance.control.value).toBeUndefined();
            expect(fixture.componentInstance.select.selected).toBeFalsy();
            expect(trigger.textContent).not.toContain('Null');
            expect(trigger.textContent).not.toContain('Undefined-option');
        }));
    });

    describe('without Angular forms', () => {
        let fixture: ComponentFixture<BasicSelectWithoutForms>;

        beforeEach(waitForAsync(() => {
            configureKbqTreeSelectTestingModule([
                BasicSelectWithoutForms,
                BasicSelectWithoutFormsPreselected,
                BasicSelectWithoutFormsMultiple
            ]);

            fixture = TestBed.createComponent(BasicSelectWithoutForms);

            fixture.detectChanges();
            fixture.detectChanges();
        }));

        it('should set the value when options are clicked', fakeAsync(() => {
            expect(fixture.componentInstance.selectedFood).toBeFalsy();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement).click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.selectedFood).toBe('rootNode_1');
            expect(fixture.componentInstance.select.value).toBe('rootNode_1');
            expect(trigger.textContent).toContain('rootNode_1');

            trigger.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelectorAll('kbq-tree-option')[2] as HTMLElement).click();
            fixture.detectChanges();
            tick(1);
            flush();

            expect(fixture.componentInstance.selectedFood).toBe('Documents');
            expect(fixture.componentInstance.select.value).toBe('Documents');
            expect(trigger.textContent).toContain('Documents');
        }));

        it('should mark options as selected when the value is set', fakeAsync(() => {
            fixture = TestBed.createComponent(BasicSelectWithoutForms);

            fixture.detectChanges();
            fixture.componentInstance.selectedFood = 'rootNode_1';
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            tick(600);
            fixture.detectChanges();

            expect(trigger.textContent).toContain('rootNode_1');

            const option = overlayContainerElement.querySelectorAll('kbq-tree-option')[0];

            expect(option.classList).toContain('kbq-selected');
            // expect(fixture.componentInstance.select.value).toBe('sandwich-2');
        }));

        it('should reset the label when a null value is set', fakeAsync(() => {
            expect(fixture.componentInstance.selectedFood).toBeFalsy();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();

            (overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement).click();
            fixture.detectChanges();

            expect(fixture.componentInstance.selectedFood).toBe('rootNode_1');
            expect(trigger.textContent).toContain('rootNode_1');

            fixture.componentInstance.selectedFood = null;
            fixture.detectChanges();
            tick(1);
            flush();

            expect(trigger.textContent).not.toContain('rootNode_1');
        }));

        it('should reflect the preselected value', fakeAsync(() => {
            fixture = TestBed.createComponent(BasicSelectWithoutFormsPreselected);

            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            fixture.detectChanges();
            tick(600);

            expect(trigger.textContent).toContain('Pictures');
            trigger.click();
            fixture.detectChanges();

            flush();
            fixture.detectChanges();

            const option = overlayContainerElement.querySelectorAll('kbq-tree-option')[1];

            expect(option.classList).toContain('kbq-selected');
            expect(fixture.componentInstance.select.value).toBe('Pictures');
        }));

        it('should be able to select multiple values', fakeAsync(() => {
            const localFixture = TestBed.createComponent(BasicSelectWithoutFormsMultiple);
            localFixture.detectChanges();
            localFixture.detectChanges();

            expect(localFixture.componentInstance.selectedFoods).toBeFalsy();

            const trigger = localFixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            trigger.click();
            localFixture.detectChanges();
            tick();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');

            options[0].click();
            localFixture.detectChanges();
            tick();
            flush();

            expect(localFixture.componentInstance.selectedFoods).toEqual(['rootNode_1']);
            expect(localFixture.componentInstance.select.value).toEqual(['rootNode_1']);
            expect(trigger.textContent).toContain('rootNode_1');

            options[2].click();
            localFixture.detectChanges();
            tick();
            flush();

            expect(localFixture.componentInstance.selectedFoods).toEqual(['rootNode_1', 'Documents']);
            expect(localFixture.componentInstance.select.value).toEqual(['rootNode_1', 'Documents']);
            expect(trigger.textContent).toContain('rootNode_1');
            expect(trigger.textContent).toContain('Documents');

            options[1].click();
            localFixture.detectChanges();
            tick();
            flush();

            expect(localFixture.componentInstance.selectedFoods).toEqual(['rootNode_1', 'Documents', 'Pictures']);
            expect(localFixture.componentInstance.select.value).toEqual(['rootNode_1', 'Documents', 'Pictures']);
            expect(trigger.textContent).toContain('rootNode_1');
            expect(trigger.textContent).toContain('Pictures');
            expect(trigger.textContent).toContain('Documents');
        }));

        it('should restore focus to the host element', fakeAsync(() => {
            fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement).click();
            fixture.detectChanges();
            tick(1);
            flush();

            const select = fixture.debugElement.nativeElement.querySelector('kbq-tree-select');

            expect(document.activeElement).toBe(select);
        }));

        it('should not restore focus to the host element when clicking outside', fakeAsync(() => {
            fixture = TestBed.createComponent(BasicSelectWithoutForms);
            const select = fixture.debugElement.nativeElement.querySelector('kbq-tree-select');

            fixture.detectChanges();
            fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');

            expect(document.activeElement).toBe(options[0]);

            select.blur(); // Blur manually since the programmatic click might not do it.
            document.body.click();
            fixture.detectChanges();
            flush();

            expect(document.activeElement).not.toBe(select);
        }));

        it('should update the data binding before emitting the change event', fakeAsync(() => {
            const instance = fixture.componentInstance;
            const spy = jasmine.createSpy('change spy');

            fixture.detectChanges();
            instance.select.selectionChange.subscribe(() => spy(instance.selectedFood));

            expect(instance.selectedFood).toBeFalsy();

            fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement).click();
            fixture.detectChanges();
            tick(1);
            flush();

            expect(instance.selectedFood).toBe('rootNode_1');
            expect(spy).toHaveBeenCalledWith('rootNode_1');
        }));
    });

    describe('positioning', () => {
        beforeEach(waitForAsync(() =>
            configureKbqTreeSelectTestingModule([
                BasicTreeSelect,
                MultiSelect
            ])));

        beforeEach(inject([ViewportRuler], (vr: ViewportRuler) => {
            viewportRuler = vr;
        }));

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

        /**
         * Asserts that the given option is aligned with the trigger.
         * @param index The index of the option.
         * @param selectInstance Instance of the `kbq-select` component to check against.
         */
        function checkTriggerAlignedWithOption(index: number, selectInstance = fixture.componentInstance.select): void {
            const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
            const triggerTop: number = trigger.getBoundingClientRect().top;
            const overlayTop: number = overlayPane.getBoundingClientRect().top;
            const options: NodeListOf<HTMLElement> = overlayPane.querySelectorAll('kbq-tree-option');
            const optionTop = options[index].getBoundingClientRect().top;
            const triggerFontSize = parseInt(window.getComputedStyle(trigger)['font-size']);
            const triggerLineHeightEm = 1.125;

            // Extra trigger height beyond the font size caused by the fact that the line-height is
            // greater than 1em.
            const triggerExtraLineSpaceAbove = ((1 - triggerLineHeightEm) * triggerFontSize) / 2;
            const topDifference =
                Math.floor(optionTop) - Math.floor(triggerTop - triggerFontSize - triggerExtraLineSpaceAbove);

            // Expect the coordinates to be within a pixel of each other. We can't rely on comparing
            // the exact value, because different browsers report the various sizes with slight (< 1px)
            // deviations.
            expect(Math.abs(topDifference) < 2)
                .withContext(`Expected trigger to align with option ${index}.`)
                .toBe(true);

            // For the animation to start at the option's center, its origin must be the distance
            // from the top of the overlay to the option top + half the option height (48/2 = 24).
            const expectedOrigin = Math.floor(optionTop - overlayTop + 24);
            const rawYOrigin = selectInstance.transformOrigin.split(' ')[1].trim();
            const origin = Math.floor(parseInt(rawYOrigin));

            // Because the origin depends on the Y axis offset, we also have to
            // round down and check that the difference is within a pixel.
            expect(Math.abs(expectedOrigin - origin) < 2)
                .withContext(`Expected panel animation to originate in the center of option ${index}.`)
                .toBe(true);
        }

        describe('ample space to open', () => {
            beforeEach(fakeAsync(() => {
                // these styles are necessary because we are first testing the overlay's position
                // if there is room for it to open to its full extent in either direction.
                formField.style.position = 'fixed';
                formField.style.top = '285px';
                formField.style.left = '20px';
            }));

            xit('should align the first option with trigger text if no option is selected', fakeAsync(() => {
                // We shouldn't push it too far down for this one, because the default may
                // end up being too much when running the tests on mobile browsers.
                formField.style.top = '100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-tree-select__panel')!;

                // The panel should be scrolled to 0 because centering the option is not possible.
                expect(scrollContainer.scrollTop).withContext(`Expected panel not to be scrolled.`).toEqual(0);
                checkTriggerAlignedWithOption(0);
            }));

            xit('should align a selected option too high to be centered with the trigger text', fakeAsync(() => {
                // Select the second option, because it can't be scrolled any further downward
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-tree-select__panel')!;

                // The panel should be scrolled to 0 because centering the option is not possible.
                expect(scrollContainer.scrollTop).withContext(`Expected panel not to be scrolled.`).toEqual(0);
                checkTriggerAlignedWithOption(1);
            }));

            xit('should align a selected option in the middle with the trigger text', fakeAsync(() => {
                // Select the fifth option, which has enough space to scroll to the center
                fixture.componentInstance.control.setValue('chips-4');
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-tree-select__panel')!;

                // The selected option should be scrolled to the center of the panel.
                // This will be its original offset from the scrollTop - half the panel height + half
                // the option height. 4 (index) * 48 (option height) = 192px offset from scrollTop
                // 192 - 256/2 + 48/2 = 88px
                expect(scrollContainer.scrollTop)
                    .withContext(`Expected overlay panel to be scrolled to center the selected option.`)
                    .toEqual(88);

                checkTriggerAlignedWithOption(4);
            }));

            xit('should align a selected option at the scroll max with the trigger text', fakeAsync(() => {
                // Select the last option in the list
                fixture.componentInstance.control.setValue('sushi-7');
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-tree-select__panel')!;

                // The selected option should be scrolled to the max scroll position.
                // This will be the height of the scrollContainer - the panel height.
                // 8 options * 48px = 384 scrollContainer height, 384 - 256 = 128px max scroll
                expect(scrollContainer.scrollTop)
                    .withContext(`Expected overlay panel to be scrolled to its maximum position.`)
                    .toEqual(128);

                checkTriggerAlignedWithOption(7);
            }));
        });

        describe('limited space to open vertically', () => {
            beforeEach(fakeAsync(() => {
                formField.style.position = 'fixed';
                formField.style.left = '20px';
            }));

            xit('should adjust position of centered option if there is little space above', fakeAsync(() => {
                const selectMenuHeight = 256;
                const selectMenuViewportPadding = 8;
                const selectItemHeight = 48;
                const selectedIndex = 4;
                const fontSize = 16;
                const lineHeightEm = 1.125;
                const expectedExtraScroll = 5;

                // Trigger element height.
                const triggerHeight = fontSize * lineHeightEm;

                // Ideal space above selected item in order to center it.
                const idealSpaceAboveSelectedItem = (selectMenuHeight - selectItemHeight) / 2;

                // Actual space above selected item.
                const actualSpaceAboveSelectedItem = selectItemHeight * selectedIndex;

                // Ideal scroll position to center.
                const idealScrollTop = actualSpaceAboveSelectedItem - idealSpaceAboveSelectedItem;

                // Top-most select-position that allows for perfect centering.
                const topMostPositionForPerfectCentering =
                    idealSpaceAboveSelectedItem + selectMenuViewportPadding + (selectItemHeight - triggerHeight) / 2;

                // Position of select relative to top edge of kbq-form-field.
                const formFieldTopSpace = trigger.getBoundingClientRect().top - formField.getBoundingClientRect().top;

                const formFieldTop = topMostPositionForPerfectCentering - formFieldTopSpace - expectedExtraScroll;

                formField.style.top = `${formFieldTop}px`;

                // Select an option in the middle of the list
                fixture.componentInstance.control.setValue('chips-4');
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-tree-select__panel')!;

                expect(Math.ceil(scrollContainer.scrollTop))
                    .withContext(`Expected panel to adjust scroll position to fit in viewport.`)
                    .toEqual(Math.ceil(idealScrollTop + 5));

                checkTriggerAlignedWithOption(4);
            }));

            xit('should adjust position of centered option if there is little space below', fakeAsync(() => {
                const selectMenuHeight = 256;
                const selectMenuViewportPadding = 8;
                const selectItemHeight = 48;
                const selectedIndex = 4;
                const fontSize = 16;
                const lineHeightEm = 1.125;
                const expectedExtraScroll = 5;

                // Trigger element height.
                const triggerHeight = fontSize * lineHeightEm;

                // Ideal space above selected item in order to center it.
                const idealSpaceAboveSelectedItem = (selectMenuHeight - selectItemHeight) / 2;

                // Actual space above selected item.
                const actualSpaceAboveSelectedItem = selectItemHeight * selectedIndex;

                // Ideal scroll position to center.
                const idealScrollTop = actualSpaceAboveSelectedItem - idealSpaceAboveSelectedItem;

                // Bottom-most select-position that allows for perfect centering.
                const bottomMostPositionForPerfectCentering =
                    idealSpaceAboveSelectedItem + selectMenuViewportPadding + (selectItemHeight - triggerHeight) / 2;

                // Position of select relative to bottom edge of kbq-form-field:
                const formFieldBottomSpace =
                    formField.getBoundingClientRect().bottom - trigger.getBoundingClientRect().bottom;

                const formFieldBottom =
                    bottomMostPositionForPerfectCentering - formFieldBottomSpace - expectedExtraScroll;

                // Push the select to a position with not quite enough space on the bottom to open
                // with the option completely centered (needs 113px at least: 256/2 - 48/2 + 9)
                formField.style.bottom = `${formFieldBottom}px`;

                // Select an option in the middle of the list
                fixture.componentInstance.control.setValue('chips-4');
                fixture.detectChanges();
                flush();

                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-tree-select__panel')!;

                // Scroll should adjust by the difference between the bottom space available
                // (56px from the bottom of the screen - 8px padding = 48px)
                // and the height of the panel below the option (113px).
                // 113px - 48px = 75px difference. Original scrollTop 88px - 75px = 23px
                const difference =
                    Math.ceil(scrollContainer.scrollTop) - Math.ceil(idealScrollTop - expectedExtraScroll);

                // Note that different browser/OS combinations report the different dimensions with
                // slight deviations (< 1px). We round the expectation and check that the values
                // are within a pixel of each other to avoid flakes.
                expect(Math.abs(difference) < 2)
                    .withContext(`Expected panel to adjust scroll position to fit in viewport.`)
                    .toBe(true);

                checkTriggerAlignedWithOption(4);
            }));

            xit('should fall back to "above" positioning if scroll adjustment will not help', fakeAsync(() => {
                // Push the select to a position with not enough space on the bottom to open
                formField.style.bottom = '56px';
                fixture.detectChanges();

                // Select an option that cannot be scrolled any farther upward
                fixture.componentInstance.control.setValue('coke-0');
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                const overlayPane = document.querySelector('.cdk-overlay-pane')!;
                const triggerBottom: number = trigger.getBoundingClientRect().bottom;
                const overlayBottom: number = overlayPane.getBoundingClientRect().bottom;
                const scrollContainer = overlayPane.querySelector('.kbq-tree-select__panel')!;

                // Expect no scroll to be attempted
                expect(scrollContainer.scrollTop).withContext(`Expected panel not to be scrolled.`).toEqual(0);

                const difference = Math.floor(overlayBottom) - Math.floor(triggerBottom);

                // Check that the values are within a pixel of each other. This avoids sub-pixel
                // deviations between OS and browser versions.
                expect(Math.abs(difference) < 2)
                    .withContext(`Expected trigger bottom to align with overlay bottom.`)
                    .toEqual(true);

                expect(fixture.componentInstance.select.transformOrigin)
                    .withContext(`Expected panel animation to originate at the bottom.`)
                    .toContain(`bottom`);
            }));

            xit('should fall back to "below" positioning if scroll adjustment won\'t help', fakeAsync(() => {
                // Push the select to a position with not enough space on the top to open
                formField.style.top = '85px';

                // Select an option that cannot be scrolled any farther downward
                fixture.componentInstance.control.setValue('sushi-7');
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                const overlayPane = document.querySelector('.cdk-overlay-pane')!;
                const triggerTop: number = trigger.getBoundingClientRect().top;
                const overlayTop: number = overlayPane.getBoundingClientRect().top;
                const scrollContainer = overlayPane.querySelector('.kbq-tree-select__panel')!;

                // Expect scroll to remain at the max scroll position
                expect(scrollContainer.scrollTop).withContext(`Expected panel to be at max scroll.`).toEqual(128);

                expect(Math.floor(overlayTop))
                    .withContext(`Expected trigger top to align with overlay top.`)
                    .toEqual(Math.floor(triggerTop));

                expect(fixture.componentInstance.select.transformOrigin)
                    .withContext(`Expected panel animation to originate at the top.`)
                    .toContain(`top`);
            }));
        });

        describe('limited space to open horizontally', () => {
            beforeEach(fakeAsync(() => {
                formField.style.position = 'absolute';
                formField.style.top = '200px';
            }));

            xit('should stay within the viewport when overflowing on the left in ltr', fakeAsync(() => {
                formField.style.left = '100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const panelLeft = document.querySelector('.kbq-tree-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft)
                    .withContext(`Expected select panel to be inside the viewport in ltr.`)
                    .toBeGreaterThan(0);
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

            it('should stay within the viewport when overflowing on the right in ltr', fakeAsync(() => {
                formField.style.right = '-100px';
                trigger.click();
                tick(10);
                fixture.detectChanges();
                flush();

                const viewportRect = viewportRuler.getViewportRect().right;
                const panelRight = document.querySelector('.kbq-tree-select__panel')!.getBoundingClientRect().right;

                expect(viewportRect - panelRight)
                    .withContext(`Expected select panel to be inside the viewport in ltr.`)
                    .toBeGreaterThan(0);
            }));

            xit('should stay within the viewport when overflowing on the right in rtl', fakeAsync(() => {
                dir.value = 'rtl';
                formField.style.right = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const viewportRect = viewportRuler.getViewportRect().right;
                const panelRight = document.querySelector('.kbq-tree-select__panel')!.getBoundingClientRect().right;

                expect(viewportRect - panelRight)
                    .withContext(`Expected select panel to be inside the viewport in rtl.`)
                    .toBeGreaterThan(0);
            }));

            xit('should keep the position within the viewport on repeat openings', fakeAsync(() => {
                formField.style.left = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                let panelLeft = document.querySelector('.kbq-tree-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft)
                    .withContext(`Expected select panel to be inside the viewport.`)
                    .toBeGreaterThanOrEqual(0);

                fixture.componentInstance.select.close();
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                panelLeft = document.querySelector('.kbq-tree-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft)
                    .withContext(`Expected select panel continue being inside the viewport.`)
                    .toBeGreaterThanOrEqual(0);
            }));
        });
    });

    describe('with multiple selection', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([MultiSelect])));

        let fixture: ComponentFixture<MultiSelect>;
        let testInstance: MultiSelect;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(MultiSelect);
            testInstance = fixture.componentInstance;
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            tick(10);
            fixture.detectChanges();
        }));

        it('should render checkboxes', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');

            options.forEach((option) => {
                expect(option.querySelector('kbq-pseudo-checkbox')).not.toBeNull();
            });
        }));

        it('should be able to select multiple values', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');

            options[0].click();
            options[2].click();
            options[4].click();
            tick(100);
            fixture.detectChanges();
            flush();

            expect(testInstance.control.value).toEqual(['rootNode_1', 'Documents', 'Applications']);
        }));

        it('should be able to toggle an option on and off', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            const option = overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement;

            option.click();
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual(['rootNode_1']);

            option.click();
            fixture.detectChanges();
            tick(1);
            flush();

            expect(testInstance.control.value).toEqual([]);
        }));

        it('should update the label', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');

            options[0].click();
            options[2].click();
            options[4].click();
            fixture.detectChanges();
            flush();

            const expandableNode = fixture.componentInstance.treeControl.dataNodes.find(
                (node) => node.name === 'Downloads'
            );
            fixture.componentInstance.treeControl.expand(expandableNode!);

            fixture.detectChanges();
            flush();

            const optionsExpanded: NodeListOf<HTMLElement> =
                overlayContainerElement.querySelectorAll('kbq-tree-option');

            optionsExpanded[5].click();

            fixture.detectChanges();
            flush();

            expect(Array.from(trigger.querySelectorAll('kbq-tag'), (item) => item.textContent!.trim())).toEqual([
                'rootNode_1',
                'Documents',
                'Applications',
                'November'
            ]);

            fixture.componentInstance.treeControl.collapse(expandableNode!);

            fixture.detectChanges();
            flush();

            expect(Array.from(trigger.querySelectorAll('kbq-tag'), (item) => item.textContent!.trim())).toEqual([
                'rootNode_1',
                'Documents',
                'Applications',
                'November'
            ]);

            optionsExpanded[2].click();
            tick(100);
            fixture.detectChanges();
            flush();

            expect(Array.from(trigger.querySelectorAll('kbq-tag'), (item) => item.textContent!.trim())).toEqual([
                'rootNode_1',
                'Applications',
                'November'
            ]);
        }));

        it('should be able to set the selected value by taking an array', fakeAsync(() => {
            trigger.click();
            testInstance.control.setValue(['rootNode_1', 'Applications']);
            fixture.detectChanges();
            flush();
            tick();

            const optionNodes = overlayContainerElement.querySelectorAll('kbq-tree-option');

            const optionInstances = testInstance.options.toArray();

            fixture.autoDetectChanges();

            expect(optionNodes[0].classList).toContain('kbq-selected');
            expect(optionNodes[4].classList).toContain('kbq-selected');

            expect(optionInstances[0].selected).toBe(true);
            expect(optionInstances[4].selected).toBe(true);
        }));

        it('should override the previously-selected value when setting an array', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');

            expect(options[0].classList).not.toContain('kbq-selected');

            options[0].click();
            fixture.autoDetectChanges();
            tick();
            flush();

            expect(options[0].classList).toContain('kbq-selected');

            testInstance.control.setValue(['Applications']);
            fixture.detectChanges();
            flush();
            tick();

            fixture.autoDetectChanges();
            expect(options[0].classList).not.toContain('kbq-selected');
            expect(options[4].classList).toContain('kbq-selected');
        }));

        it('should not close the panel when clicking on options', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            expect(testInstance.select.panelOpen).toBe(true);

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');

            options[0].click();
            options[1].click();
            tick(100);
            fixture.detectChanges();
            flush();

            expect(testInstance.select.panelOpen).toBe(true);
        }));

        xit('should sort the selected options based on their order in the panel', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');

            options[2].click();
            options[0].click();
            options[1].click();
            fixture.detectChanges();

            expect(trigger.querySelector('.kbq-select__match-list')!.textContent).toContain('Steak, Pizza, Tacos');
            expect(fixture.componentInstance.control.value).toEqual(['steak-0', 'pizza-1', 'tacos-2']);
        }));

        xit('should sort the selected options in reverse in rtl', fakeAsync(() => {
            dir.value = 'rtl';
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[2].click();
            options[0].click();
            options[1].click();
            fixture.detectChanges();

            expect(trigger.textContent).toContain('Tacos, Pizza, Steak');
            expect(fixture.componentInstance.control.value).toEqual(['steak-0', 'pizza-1', 'tacos-2']);
        }));

        xit('should be able to customize the value sorting logic', fakeAsync(() => {
            // fixture.componentInstance.sortComparator = (a, b, optionsArray) => {
            //     return optionsArray.indexOf(b) - optionsArray.indexOf(a);
            // };
            fixture.detectChanges();

            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');

            for (let i = 0; i < 3; i++) {
                options[i].click();
            }
            fixture.detectChanges();

            // Expect the items to be in reverse order.
            expect(trigger.querySelector('.kbq-select__match-list')!.textContent).toContain('Tacos, Pizza, Steak');
            expect(fixture.componentInstance.control.value).toEqual(['tacos-2', 'pizza-1', 'steak-0']);
        }));

        xit('should sort the values that get set via the model based on the panel order', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            testInstance.control.setValue(['tacos-2', 'steak-0', 'pizza-1']);
            fixture.detectChanges();
            flush();

            // expect(trigger.querySelector('.kbq-select__match-list')!.textContent.trim())
            //     .toContain('Steak, Pizza, Tacos');
            expect(trigger.textContent).toContain('Steak, Pizza, Tacos');
        }));

        xit('should reverse sort the values, that get set via the model in rtl', fakeAsync(() => {
            dir.value = 'rtl';
            trigger.click();
            fixture.detectChanges();

            testInstance.control.setValue(['tacos-2', 'steak-0', 'pizza-1']);
            fixture.detectChanges();

            expect(trigger.textContent).toContain('Tacos, Pizza, Steak');
        }));

        it('should throw an exception when trying to set a non-array value', fakeAsync(() => {
            expect(() => {
                testInstance.control.setValue('not-an-array');
            }).toThrowError(wrappedErrorMessage(getKbqSelectNonArrayValueError()));
        }));

        it('should throw an exception when trying to change multiple mode after init', fakeAsync(() => {
            expect(() => {
                testInstance.select.multiple = false;
            }).toThrowError(wrappedErrorMessage(getKbqSelectDynamicMultipleError()));
        }));

        xit('should pass the `multiple` value to all of the option instances', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            expect(testInstance.options.toArray().every((option: any) => option.multiple))
                .withContext('Expected `multiple` to have been added to initial set of options.')
                .toBe(true);

            // testInstance.dataSource.data.push({ name: 'cake-8', type: 'app' });
            fixture.detectChanges();

            expect(testInstance.options.toArray().every((option) => !!option.tree.multiple))
                .withContext('Expected `multiple` to have been set on dynamically-added option.')
                .toBe(true);
        }));

        it('should update the active item index on click', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            tick();
            flush();

            expect(fixture.componentInstance.select.tree.keyManager.activeItemIndex).toBe(0);

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');

            options[2].focus();
            options[2].click();
            fixture.detectChanges();
            tick();
            flush();

            expect(fixture.componentInstance.select.tree.keyManager.activeItemIndex).toBe(2);
        }));

        xit('should be to select an option with a `null` value', fakeAsync(() => {
            fixture.detectChanges();
            trigger.click();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');

            options[0].click();
            options[1].click();
            options[2].click();
            fixture.detectChanges();
            flush();

            expect(testInstance.control.value).toEqual([null, 'pizza-1', null]);
        }));

        xit('should select all options when pressing ctrl + a', () => {
            const selectElement = fixture.nativeElement.querySelector('kbq-tree-select');
            const options = fixture.componentInstance.options.toArray();

            expect(testInstance.control.value).toBeFalsy();
            expect(options.every((option) => option.selected)).toBe(false);

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(options.every((option) => option.selected)).toBe(true);
            expect(testInstance.control.value).toEqual([
                'steak-0',
                'pizza-1',
                'tacos-2',
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
        });

        xit('should skip disabled options when using ctrl + a', () => {
            const selectElement = fixture.nativeElement.querySelector('kbq-tree-select');
            const options = fixture.componentInstance.options.toArray();

            for (let i = 0; i < 3; i++) {
                options[i].disabled = true;
            }

            expect(testInstance.control.value).toBeFalsy();

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual([
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
        });

        xit('should select all options when pressing ctrl + a when some options are selected', () => {
            const selectElement = fixture.nativeElement.querySelector('kbq-tree-select');
            const options = fixture.componentInstance.options.toArray();

            options[0].select();
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual(['steak-0']);
            expect(options.some((option) => option.selected)).toBe(true);

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(options.every((option) => option.selected)).toBe(true);
            expect(testInstance.control.value).toEqual([
                'steak-0',
                'pizza-1',
                'tacos-2',
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
        });

        xit('should deselect all options with ctrl + a if all options are selected', () => {
            const selectElement = fixture.nativeElement.querySelector('kbq-tree-select');
            const options = fixture.componentInstance.options.toArray();

            options.forEach((option) => option.select());
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual([
                'steak-0',
                'pizza-1',
                'tacos-2',
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
            expect(options.every((option) => option.selected)).toBe(true);

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(options.some((option) => option.selected)).toBe(false);
            expect(testInstance.control.value).toEqual([]);
        });
    });

    describe('with parent selection', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([ChildSelection])));

        let fixture: ComponentFixture<ChildSelection>;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ChildSelection);
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            flush();
        }));

        it('should select children with parent', fakeAsync(() => {
            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');
            options[4].click();
            tick(100);
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.value).toContain('Chrome');
        }));

        it('should select parent when all children are selected', fakeAsync(() => {
            fixture.componentInstance.treeControl.expandAll();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-tree-option');
            options.forEach((o) => {
                if (['Calendar', 'Chrome', 'Webstorm'].includes(o.innerText)) {
                    o.click();
                    tick(100);
                    fixture.detectChanges();
                    flush();
                }
            });

            expect(fixture.componentInstance.control.value).toContain('Applications');
        }));
    });

    describe('with localization', () => {
        beforeEach(waitForAsync(() => configureKbqTreeSelectTestingModule([LocalizedTreeSelect])));

        let fixture: ComponentFixture<LocalizedTreeSelect>;
        let localeService: KbqLocaleService;

        beforeEach(inject([KBQ_LOCALE_SERVICE], (l: KbqLocaleService) => {
            localeService = l;
        }));

        const hideItems = (fixture: ComponentFixture<any>) => {
            fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
            fixture.detectChanges();
            flush();

            const options = overlayContainerElement.querySelectorAll<HTMLElement>('kbq-tree-option');
            options.forEach((option) => {
                option.click();
                fixture.detectChanges();
                tick(1);
                flush();
            });
        };

        beforeEach(() => {
            fixture = TestBed.createComponent(LocalizedTreeSelect);
            fixture.detectChanges();
        });

        it('should calculate hidden items and output in show more button', fakeAsync(() => {
            hideItems(fixture);

            expect(
                fixture.debugElement.query(By.css('.kbq-select__match-hidden-text')).nativeElement.textContent
            ).toContain(fixture.componentInstance.select.hiddenItems);
        }));

        it('should change show more text according to locale', fakeAsync(() => {
            hideItems(fixture);
            localeService.setLocale('en-US');
            fixture.detectChanges();
            tick(1);
            flush();

            expect(fixture.componentInstance.select.hiddenItemsText).toEqual(
                localeService.getParams('select').hiddenItemsText
            );
        }));
    });
});
