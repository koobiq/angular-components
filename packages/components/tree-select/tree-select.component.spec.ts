import { Directionality } from '@angular/cdk/bidi';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    Component,
    DebugElement,
    OnInit,
    Provider,
    QueryList,
    Type,
    ViewChild,
    ViewChildren,
    viewChild
} from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, inject, tick } from '@angular/core/testing';
import {
    AsyncValidatorFn,
    ControlValueAccessor,
    FormControl,
    FormControlStatus,
    FormGroup,
    FormGroupDirective,
    FormsModule,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
    UntypedFormControl,
    UntypedFormGroup,
    ValidationErrors,
    Validators
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { A, DOWN_ARROW, END, ENTER, ESCAPE, HOME, RIGHT_ARROW, SPACE, TAB, UP_ARROW } from '@koobiq/cdk/keycodes';
import {
    createFakeEvent,
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
    KbqPseudoCheckbox,
    KbqPseudoCheckboxModule,
    KbqPseudoCheckboxState,
    ShowOnControlDirtyErrorStateMatcher,
    ShowOnFormSubmitErrorStateMatcher,
    ThemePalette,
    getKbqSelectDynamicMultipleError,
    getKbqSelectNonArrayValueError,
    kbqDisableLegacyValidationDirectiveProvider,
    kbqErrorStateMatcherProvider
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import {
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule,
    KbqTreeOption
} from '@koobiq/components/tree';
import { Observable, Subject, map, of, timer } from 'rxjs';
import { KbqTreeSelect, KbqTreeSelectChange, KbqTreeSelectPanelWidth } from './tree-select.component';
import { KbqTreeSelectModule } from './tree-select.module';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getSubmitButton = (fixture: ComponentFixture<unknown>): HTMLButtonElement =>
    fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;

const getTreeSelectElement = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.debugElement.query(By.directive(KbqTreeSelect)).nativeElement;

const customErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control) => !!control?.untouched
};

/** Matches the timer used by getAsyncValidator below — tick this many ms to settle pending validation. */
const ASYNC_VALIDATOR_TIMER_DUE = 1000;

const getAsyncValidator =
    (valid: boolean = true): AsyncValidatorFn =>
    (): Observable<ValidationErrors | null> =>
        timer(ASYNC_VALIDATOR_TIMER_DUE).pipe(map(() => (!valid ? { test: { actual: valid } } : null)));

@Component({
    imports: [KbqFormFieldModule, KbqTreeSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-tree-select [formControl]="control" />
        </kbq-form-field>
    `
})
class LegacyTreeSelectControlWithAsyncValidators {
    readonly treeSelect = viewChild.required(KbqTreeSelect);
    readonly control = new FormControl<string>('', {
        nonNullable: true,
        asyncValidators: [getAsyncValidator()]
    });
}

@Component({
    imports: [KbqFormFieldModule, KbqTreeSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-tree-select [formControl]="control" />
        </kbq-form-field>
    `,
    providers: [kbqDisableLegacyValidationDirectiveProvider()]
})
class TreeSelectControlWithAsyncValidators {
    readonly treeSelect = viewChild.required(KbqTreeSelect);
    readonly control = new FormControl<string>('', {
        nonNullable: true,
        asyncValidators: [getAsyncValidator()]
    });
}

@Component({
    imports: [KbqFormFieldModule, KbqTreeSelectModule, ReactiveFormsModule],
    template: `
        <form [formGroup]="form">
            <kbq-form-field>
                <kbq-tree-select formControlName="treeSelect" />
            </kbq-form-field>
        </form>
    `,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider(),
        kbqErrorStateMatcherProvider(customErrorStateMatcher)
    ]
})
class TreeSelectWithDIErrorStateMatcher {
    readonly treeSelect = viewChild.required(KbqTreeSelect);
    readonly form = new FormGroup({ treeSelect: new FormControl('', Validators.required) });
}

@Component({
    imports: [KbqFormFieldModule, KbqTreeSelectModule, ReactiveFormsModule],
    template: `
        <form [formGroup]="form">
            <kbq-form-field>
                <kbq-tree-select formControlName="treeSelect" [errorStateMatcher]="errorStateMatcher" />
            </kbq-form-field>
            <button type="submit">Submit</button>
        </form>
    `,
    providers: [kbqDisableLegacyValidationDirectiveProvider()]
})
class TreeSelectWithErrorStateMatcher {
    readonly treeSelect = viewChild.required(KbqTreeSelect);
    readonly form = new FormGroup({ treeSelect: new FormControl('', Validators.required) });
    errorStateMatcher: ErrorStateMatcher = new ErrorStateMatcher();
}

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
    return of(node.children);
};

@Component({
    selector: 'basic-select',
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        ReactiveFormsModule
    ],
    template: `
        <div [style.height.px]="heightAbove"></div>
        <kbq-form-field>
            <kbq-tree-select
                placeholder="Food"
                [formControl]="control"
                [tabIndex]="tabIndexOverride"
                [panelClass]="panelClass"
            >
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option
                        *kbqTreeNodeDef="let node; when: hasChild"
                        kbqTreeNodePadding
                        [disabled]="node.name === 'Downloads'"
                    >
                        <i kbq-icon="kbq-chevron-down-s_16" kbqTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>

                <kbq-cleaner #kbqSelectCleaner />
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
    tabIndexOverride: number = 0;
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
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select
                (openedChange)="openedChangeListener($event)"
                (opened)="openedListener()"
                (closed)="closedListener()"
            >
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option
                        *kbqTreeNodeDef="let node; when: hasChild"
                        kbqTreeNodePadding
                        [disabled]="node.name === 'Downloads'"
                    >
                        <i kbq-icon="kbq-chevron-down-s_16" kbqTreeNodeToggle></i>
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

    openedChangeListener = jest.fn();
    openedListener = jest.fn();
    closedListener = jest.fn();

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
    selector: 'many-selects',
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select placeholder="First">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-tree-select placeholder="Second">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
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
    selector: 'select-with-search',
    imports: [
        KbqTreeModule,
        KbqInputModule,
        KbqTreeSelectModule,
        ReactiveFormsModule,
        KbqIconModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select [formControl]="control" [searchMinOptionsThreshold]="searchMinOptionsThreshold">
                <kbq-form-field kbqFormFieldWithoutBorders kbqSelectSearch>
                    <i kbqPrefix kbq-icon="kbq-magnifying-glass_16"></i>
                    <input class="search-input" kbqInput type="text" [formControl]="searchControl" />
                    <kbq-cleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Ничего не найдено</div>

                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class SelectWithSearch implements OnInit {
    control = new UntypedFormControl();
    searchMinOptionsThreshold: number;

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
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select (selectionChange)="selectionChangeListener($event)">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class SelectWithChangeEvent {
    @ViewChild(KbqTreeSelect) treeSelect: KbqTreeSelect;

    selectionChangeListener = jest.fn();

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
    imports: [
        KbqTreeSelectModule
    ],
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
    imports: [
        ReactiveFormsModule,
        CustomSelectAccessor
    ],
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
    selector: 'throws-error-on-init',
    template: ''
})
class ThrowsErrorOnInit implements OnInit {
    ngOnInit() {
        throw Error('Oh no!');
    }
}

@Component({
    selector: 'select-infinite-loop',
    imports: [
        KbqTreeSelectModule,
        FormsModule,
        ThrowsErrorOnInit
    ],
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
    selector: 'basic-select-on-push',
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select placeholder="Food" [formControl]="control">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
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
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select placeholder="Food" [formControl]="control">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
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
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select placeholder="Food" [multiple]="true" [formControl]="control">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
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
    imports: [
        KbqTreeSelectModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select />
        </kbq-form-field>
    `
})
class EmptySelect {}

@Component({
    selector: 'select-early-sibling-access',
    imports: [
        KbqTreeSelectModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select #select="kbqTreeSelect" />
        </kbq-form-field>
    `
})
class SelectEarlyAccessSibling {}

@Component({
    selector: 'basic-select-with-theming',
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field [color]="theme">
            <kbq-tree-select placeholder="Food">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
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
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select [formControl]="control">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
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
    imports: [
        KbqTreeSelectModule,
        FormsModule
    ],
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
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        ReactiveFormsModule
    ],
    template: `
        <form [formGroup]="formGroup" (ngSubmit)="submitReactive()">
            <kbq-form-field>
                <kbq-tree-select placeholder="Food" formControlName="food">
                    <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                        <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                            {{ treeControl.getViewValue(node) }}
                        </kbq-tree-option>

                        <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                            <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
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
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select placeholder="Food" [(ngModel)]="selectedFood">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
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
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select placeholder="Food" [(ngModel)]="selectedFood">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
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

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select placeholder="Food" [multiple]="true" [(ngModel)]="selectedFoods">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
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
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select #select="kbqTreeSelect" placeholder="Food" [formControl]="control">
                <kbq-select-trigger>
                    {{ select.triggerValue?.split('').reverse().join('') }}
                </kbq-select-trigger>
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
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
    selector: 'select-with-custom-matcher',
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select #select="kbqTreeSelect" placeholder="Food" [formControl]="control">
                <kbq-select-matcher class="custom-matcher" [useDefaultHandlers]="useDefaultHandlers">
                    {{ select.triggerValue?.split('').reverse().join('') }}
                </kbq-select-matcher>
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class SelectWithCustomMatcher {
    @ViewChild('select') select: KbqTreeSelect;

    useDefaultHandlers: boolean = true;

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
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select [ngModel]="selectedModel">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class NgModelCompareWithFlatTreeControl {
    selectedModel: { name: string; type: string };

    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;
    @ViewChildren(KbqTreeOption) options: QueryList<KbqTreeOption>;

    treeControl = new FlatTreeControl<FileFlatNode>(
        getLevel,
        isExpandable,
        (node) => node,
        getValue,
        this.compareValues
    );
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

    compareValues(firstValue: FileFlatNode, secondValue: { name: string; type: string }): boolean {
        return firstValue.name === secondValue?.name;
    }
}

@Component({
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-tree-select placeholder="Food" [formControl]="control" [errorStateMatcher]="errorStateMatcher">
            <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                    {{ treeControl.getViewValue(node) }}
                </kbq-tree-option>

                <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                    <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
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
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select placeholder="Food" [(ngModel)]="selectedFood">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i kbq-icon="kbq-angle-S_16" kbqTreeNodeToggle></i>
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
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        ReactiveFormsModule,
        KbqPseudoCheckbox
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select [multiple]="true" [formControl]="control" (selectionChange)="onSelectionChange($event)">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" #option kbqTreeNodePadding>
                        <kbq-pseudo-checkbox [state]="pseudoCheckboxState(option)" />
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" #option kbqTreeNodePadding>
                        <kbq-pseudo-checkbox [state]="pseudoCheckboxState(option)" />
                        <i
                            kbq-icon="kbq-chevron-down-s_16"
                            kbqTreeNodeToggle
                            [style.transform]="treeControl.isExpanded(node) ? '' : 'rotate(-90deg)'"
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
    imports: [
        KbqTreeModule,
        KbqTreeSelectModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field style="width: 300px;">
            <kbq-tree-select
                placeholder="Food"
                [multiple]="true"
                [formControl]="control"
                [tabIndex]="tabIndexOverride"
                [panelClass]="panelClass"
            >
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option
                        *kbqTreeNodeDef="let node; when: hasChild"
                        kbqTreeNodePadding
                        [disabled]="node.name === 'Downloads'"
                    >
                        <i kbq-icon="kbq-chevron-down-s_16" kbqTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class LocalizedTreeSelect extends BasicTreeSelect {}

@Component({
    selector: 'ng-if-tree-select',
    imports: [
        KbqFormFieldModule,
        KbqTreeModule,
        KbqTreeSelectModule,
        ReactiveFormsModule
    ],
    template: `
        @if (isShowing) {
            <div>
                <kbq-form-field>
                    <kbq-tree-select placeholder="Food I want to eat right now" [formControl]="control">
                        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                                {{ treeControl.getViewValue(node) }}
                            </kbq-tree-option>
                            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                                <i kbq-icon="kbq-angle-s_16" kbqTreeNodeToggle></i>
                                {{ treeControl.getViewValue(node) }}
                            </kbq-tree-option>
                        </kbq-tree-selection>
                    </kbq-tree-select>
                </kbq-form-field>
            </div>
        }
    `
})
class NgIfTreeSelect {
    isShowing = false;

    control = new UntypedFormControl('rootNode_1');

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    @ViewChild(KbqTreeSelect, { static: false }) select: KbqTreeSelect;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'tree-select-with-panel-width',
    imports: [KbqFormFieldModule, KbqTreeModule, KbqTreeSelectModule],
    template: `
        <kbq-form-field style="width: 300px">
            <kbq-tree-select [panelWidth]="panelWidth">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node">
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.Default
})
class TreeSelectWithPanelWidth {
    panelWidth: KbqTreeSelectPanelWidth;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren);
    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }
}

describe('KbqTreeSelect', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
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
                KbqLocaleServiceModule,
                ...declarations
            ],
            providers: [
                { provide: Directionality, useFactory: () => ({ value: 'ltr' }) },
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
        overlayContainer?.ngOnDestroy();
    });

    describe('core', () => {
        beforeEach(() => {
            configureKbqTreeSelectTestingModule([
                BasicTreeSelect,
                BasicEvents,
                MultiSelect,
                SelectWithChangeEvent
            ]);
        });

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

                it('should set the tabindex of the select to 0 by default', () => {
                    expect(select.getAttribute('tabindex')).toEqual('0');
                });

                it('should be able to override the tabindex', () => {
                    fixture.componentInstance.tabIndexOverride = 3;
                    fixture.detectChanges();

                    expect(select.getAttribute('tabindex')).toBe('3');
                });

                it('should set the tabindex of the select to -1 if disabled', () => {
                    fixture.componentInstance.control.disable();
                    fixture.detectChanges();
                    expect(select.getAttribute('tabindex')).toEqual('-1');

                    fixture.componentInstance.control.enable();
                    fixture.detectChanges();
                    expect(select.getAttribute('tabindex')).toEqual('0');
                });

                it('should resume focus from selected item after selecting via click', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).toBeFalsy();

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

                it('should open a single-selection select using ALT + DOWN_ARROW', fakeAsync(() => {
                    const { control: formControl, select: selectInstance } = fixture.componentInstance;

                    expect(selectInstance.panelOpen).toBe(false);

                    expect(formControl.value).toBeFalsy();

                    const event = createKeyboardEvent('keydown', DOWN_ARROW);

                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).toBe(true);

                    expect(formControl.value).toBeFalsy();
                }));

                it('should open a single-selection select using ALT + UP_ARROW', fakeAsync(() => {
                    const { control: formControl, select: selectInstance } = fixture.componentInstance;

                    expect(selectInstance.panelOpen).toBe(false);

                    expect(formControl.value).toBeFalsy();

                    const event = createKeyboardEvent('keydown', UP_ARROW);

                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).toBe(true);

                    expect(formControl.value).toBeFalsy();
                }));

                it('should close when pressing ALT + DOWN_ARROW', fakeAsync(() => {
                    const { select: selectInstance } = fixture.componentInstance;

                    selectInstance.open();

                    expect(selectInstance.panelOpen).toBe(true);

                    const event = createKeyboardEvent('keydown', DOWN_ARROW);

                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).toBe(false);

                    expect(event.defaultPrevented).toBe(true);
                }));

                it('should close when pressing ALT + UP_ARROW', fakeAsync(() => {
                    const { select: selectInstance } = fixture.componentInstance;

                    selectInstance.open();

                    expect(selectInstance.panelOpen).toBe(true);

                    const event = createKeyboardEvent('keydown', UP_ARROW);

                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).toBe(false);

                    expect(event.defaultPrevented).toBe(true);
                }));

                it('should open the panel when pressing a vertical arrow key on a closed multiple select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const instance = multiFixture.componentInstance;

                    multiFixture.detectChanges();
                    multiFixture.detectChanges();

                    select = multiFixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;

                    const initialValue = instance.control.value;

                    expect(instance.select.panelOpen).toBe(false);

                    const event = dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

                    tick(10);

                    expect(instance.select.panelOpen).toBe(true);

                    expect(instance.control.value).toBe(initialValue);

                    expect(event.defaultPrevented).toBe(true);
                }));

                it('should open the panel when pressing a horizontal arrow key on closed multiple select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const instance = multiFixture.componentInstance;

                    multiFixture.detectChanges();
                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;

                    const initialValue = instance.control.value;

                    expect(instance.select.panelOpen).toBe(false);

                    const event = dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);

                    tick(10);

                    expect(instance.select.panelOpen).toBe(true);

                    expect(instance.control.value).toBe(initialValue);

                    expect(event.defaultPrevented).toBe(true);
                }));

                it('should do nothing when typing on a closed multi-select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const instance = multiFixture.componentInstance;

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;

                    const initialValue = instance.control.value;

                    expect(instance.select.panelOpen).toBe(false);

                    dispatchEvent(select, createKeyboardEvent('keydown', 80, undefined, 'p'));
                    tick(10);

                    expect(instance.select.panelOpen).toBe(false);

                    expect(instance.control.value).toBe(initialValue);
                }));

                it('should do nothing if the key manager did not change the active item', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;

                    expect(formControl.value).toBeNull();

                    expect(formControl.pristine).toBe(true);

                    dispatchKeyboardEvent(select, 'keydown', 16); // Press a random key.
                    flush();

                    expect(formControl.value).toBeNull();

                    expect(formControl.pristine).toBe(true);
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
                    expect(document.activeElement).toBe(options[2]);

                    multiFixture.componentInstance.control.setValue(['steak-0', 'sushi-7']);
                    tick(10);

                    expect(document.activeElement).toBe(options[2]);
                }));

                it('should not cycle through the options if the control is disabled', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;

                    formControl.setValue('eggs-5');
                    formControl.disable();

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    tick(10);

                    expect(formControl.value).toBe('eggs-5');
                }));

                it('should not wrap selection after reaching the end of the options', fakeAsync(() => {
                    const lastOption = fixture.componentInstance.options.last;

                    fixture.componentInstance.options.forEach(() => {
                        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                        tick(10);
                    });

                    expect(lastOption.selected).toBe(true);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    tick(10);

                    expect(lastOption.selected).toBe(true);
                }));

                it('should not open a multiple select when tabbing through', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;

                    expect(multiFixture.componentInstance.select.panelOpen).toBe(false);

                    dispatchKeyboardEvent(select, 'keydown', TAB);
                    tick(10);

                    expect(multiFixture.componentInstance.select.panelOpen).toBe(false);
                }));

                it('should prevent the default action when pressing space', fakeAsync(() => {
                    const event = dispatchKeyboardEvent(select, 'keydown', SPACE);

                    flush();

                    expect(event.defaultPrevented).toBe(true);
                }));

                it('should consider the selection a result of a user action when closed', fakeAsync(() => {
                    const option = fixture.componentInstance.options.first;
                    const spy = jest.fn();
                    const subscription = option.userInteraction.subscribe(spy);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    tick(10);

                    expect(spy).toHaveBeenCalled();

                    subscription.unsubscribe();
                }));

                it('should be able to focus the select trigger', fakeAsync(() => {
                    document.body.focus(); // ensure that focus isn't on the trigger already

                    fixture.componentInstance.select.focus();

                    expect(document.activeElement).toBe(select);
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

                expect(fixture.componentInstance.select.panelOpen).toBe(true);

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
                const focusSpyFn = jest.spyOn(select, 'focus');

                dispatchKeyboardEvent(trigger, 'keydown', TAB);
                fixture.detectChanges();
                flush();

                expect(focusSpyFn).toHaveBeenCalled();
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

                expect(selectInstance.focused).toBe(true);

                selectInstance.open();
                fixture.detectChanges();
                flush();
                dispatchFakeEvent(selectElement, 'blur');
                fixture.detectChanges();
                tick(10);

                expect(selectInstance.focused).toBe(true);
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

                expect(options[0].classList).not.toContain('kbq-selected');

                expect(options[1].classList).toContain('kbq-selected');

                const optionInstances = fixture.componentInstance.options.toArray();

                expect(optionInstances[0].selected).toBe(false);

                expect(optionInstances[1].selected).toBe(true);
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
                const focusSpyFn = jest.spyOn(selectInstance, 'focus');

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
                expect(focusSpyFn).toHaveBeenCalledTimes(closeAndFocusKeys.length * 2);
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

                expect(value.nativeElement.textContent).toContain('rootNode_1');

                trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                trigger.click();
                fixture.detectChanges();
                flush();

                const options = overlayContainerElement.querySelectorAll('kbq-tree-option');

                fixture.autoDetectChanges();

                expect(options[0].classList).toContain('kbq-selected');
            }));

            it('should set the view value from the form', fakeAsync(() => {
                let value = fixture.debugElement.query(By.css('.kbq-select__matcher'));

                expect(value.nativeElement.textContent.trim()).toBe('Food');

                fixture.componentInstance.control.setValue('rootNode_1');
                fixture.detectChanges();

                value = fixture.debugElement.query(By.css('.kbq-select__matcher'));
                expect(value.nativeElement.textContent).toContain('rootNode_1');

                trigger.click();
                fixture.detectChanges();
                tick(1);
                flush();

                const options = overlayContainerElement.querySelectorAll('kbq-tree-option');

                fixture.autoDetectChanges();

                expect(options[0].classList).toContain('kbq-selected');
            }));

            it('should update the form value when the view changes', fakeAsync(() => {
                expect(fixture.componentInstance.control.value).toEqual(null);

                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement;

                option.click();
                fixture.detectChanges();
                tick(1);
                flush();

                expect(fixture.componentInstance.control.value).toEqual('rootNode_1');
            }));

            // todo сейчас логика позволяет устанавливать несуществующие значения
            it('should clear the selection when a nonexistent option value is selected', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                fixture.componentInstance.control.setValue('gibberish');
                fixture.detectChanges();

                const value = fixture.debugElement.query(By.css('.kbq-select__matcher'));

                expect(value.nativeElement.textContent.trim()).toBe('Food');

                expect(trigger.textContent).not.toContain('Pizza');

                trigger.click();
                fixture.detectChanges();
                flush();

                const options = overlayContainerElement.querySelectorAll('kbq-tree-option');

                expect(options[1].classList).not.toContain('kbq-selected');
            }));

            it('should clear the selection when the control is reset', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                fixture.componentInstance.control.reset();
                fixture.detectChanges();

                const value = fixture.debugElement.query(By.css('.kbq-select__matcher'));

                expect(value.nativeElement.textContent.trim()).toBe('Food');

                expect(trigger.textContent).not.toContain('Pizza');

                trigger.click();
                fixture.detectChanges();
                flush();

                const options = overlayContainerElement.querySelectorAll('kbq-tree-option');

                expect(options[1].classList).not.toContain('kbq-selected');
            }));

            it('should set the control to touched when the select is blurred', fakeAsync(() => {
                expect(fixture.componentInstance.control.touched).toEqual(false);

                trigger.click();
                dispatchFakeEvent(trigger, 'blur');
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched).toEqual(false);

                document.body.click();
                dispatchFakeEvent(trigger, 'blur');
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched).toEqual(true);
            }));

            it('should set the control to touched when the panel is closed', fakeAsync(() => {
                expect(fixture.componentInstance.control.touched).toBe(false);

                trigger.click();
                dispatchFakeEvent(trigger, 'blur');
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched).toBe(false);

                fixture.componentInstance.select.close();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched).toBe(true);
            }));

            it('should not set touched when a disabled select is touched', fakeAsync(() => {
                expect(fixture.componentInstance.control.touched).toBe(false);

                fixture.componentInstance.control.disable();
                dispatchFakeEvent(trigger, 'blur');

                expect(fixture.componentInstance.control.touched).toBe(false);
            }));

            it('should set the control to dirty when the select value changes in DOM', fakeAsync(() => {
                expect(fixture.componentInstance.control.dirty).toEqual(false);

                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('kbq-tree-option') as HTMLElement;

                option.click();
                fixture.detectChanges();
                tick(1);
                flush();

                expect(fixture.componentInstance.control.dirty).toEqual(true);
            }));

            it('should not set the control to dirty when the value changes programmatically', fakeAsync(() => {
                expect(fixture.componentInstance.control.dirty).toEqual(false);

                fixture.componentInstance.control.setValue('pizza-1');

                expect(fixture.componentInstance.control.dirty).toEqual(false);
            }));
        });

        describe('Clear value', () => {
            let fixture: ComponentFixture<BasicTreeSelect>;
            let cleaner: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicTreeSelect);
                fixture.detectChanges();
                fixture.detectChanges();
                tick(10);
                flush();
            }));

            it('should reset selection on clear', fakeAsync(() => {
                fixture.componentInstance.control.setValue('rootNode_1');
                fixture.detectChanges();
                flush();

                const value = fixture.debugElement.query(By.css('.kbq-select__matcher'));

                expect(value.nativeElement.textContent).toContain('rootNode_1');

                cleaner = fixture.debugElement.query(By.css('.kbq-select__cleaner')).nativeElement;
                cleaner.click();
                fixture.detectChanges();
                tick();
                flush();

                expect(value.nativeElement.textContent).toContain('Food');
            }));
        });

        describe('keyboard scrolling', () => {
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

                expect(panel.scrollTop).toBe(initialScrollPosition);
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

    describe('with a selectionChange event handler', () => {
        let fixture: ComponentFixture<SelectWithChangeEvent>;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            configureKbqTreeSelectTestingModule([SelectWithChangeEvent]);

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

            expect(fixture.componentInstance.selectionChangeListener).toHaveBeenCalled();
        }));

        it('should emit an event on clearValue', fakeAsync(() => {
            expect(fixture.componentInstance.selectionChangeListener).not.toHaveBeenCalled();

            fixture.componentInstance.treeSelect.clearValue(createFakeEvent('click'));

            expect(fixture.componentInstance.selectionChangeListener).toHaveBeenCalled();
        }));
        // todo эта проверка для ситуации когда нельзя снять выделение с элемента,
        // но для этого требуется реализация параметра noUnselect, поэтому пока этот TC добавлен в исключения.

        it('should only emit one event when pressing arrow keys on closed select', fakeAsync(() => {
            const select = fixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;

            dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

            flush();

            expect(fixture.componentInstance.selectionChangeListener).toHaveBeenCalledTimes(1);
        }));
    });

    describe('with search', () => {
        let fixture: ComponentFixture<SelectWithSearch>;
        let trigger: HTMLElement;

        beforeEach(() => {
            configureKbqTreeSelectTestingModule([SelectWithSearch]);

            fixture = TestBed.createComponent(SelectWithSearch);
            fixture.detectChanges();
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
        });

        it('should have search input', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            expect(fixture.debugElement.query(By.css('input'))).toBeDefined();
        }));

        it('should focus search field after open', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const searchInput: HTMLElement = overlayContainerElement.querySelector('.search-input')!;

            expect(document.activeElement).toBe(searchInput);
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
                .map((el) => el.nativeElement.textContent.trim());

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

        it('should hide search if options count less than threshold', fakeAsync(() => {
            const { componentInstance } = fixture;

            componentInstance.searchMinOptionsThreshold = 4;
            componentInstance.dataSource.data = buildFileTree(
                {
                    Documents: {
                        ProjectPlan: 'docx',
                        MeetingNotes: 'txt'
                    }
                },
                0
            );
            fixture.detectChanges();

            tick();

            trigger.click();
            fixture.detectChanges();
            flush();

            expect(fixture.debugElement.query(By.css('input'))).toBeFalsy();
        }));

        it('should show search if options count more than threshold', fakeAsync(() => {
            const { componentInstance } = fixture;

            componentInstance.searchMinOptionsThreshold = 2;
            fixture.detectChanges();

            tick();

            trigger.click();
            fixture.detectChanges();
            flush();

            expect(fixture.debugElement.query(By.css('input'))).toBeTruthy();
        }));

        it('should NOT hide search field if options filtered via search', fakeAsync(() => {
            const { componentInstance } = fixture;

            componentInstance.searchMinOptionsThreshold = 3;
            fixture.detectChanges();
            tick();

            trigger.click();
            fixture.detectChanges();
            flush();

            componentInstance.searchControl.setValue('Downloads');
            fixture.detectChanges();
            flush();
            tick(1);

            const options = fixture.debugElement.queryAll(By.css('kbq-tree-option'));

            expect(options.length).toBe(1);
            expect(fixture.debugElement.query(By.css('input'))).toBeTruthy();
        }));

        it('should focus the active tree option when ArrowDown does not change the index (boundary)', fakeAsync(() => {
            const { componentInstance } = fixture;
            const select = fixture.debugElement.query(By.css('kbq-tree-select')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            flush();

            const keyManager = componentInstance.select.tree.keyManager;
            // Navigate to the last rendered option so the next ArrowDown can't move further —
            // exactly the boundary condition the fix targets.
            const lastIndex = componentInstance.select.tree.renderedOptions.length - 1;

            while (keyManager.activeItemIndex < lastIndex) {
                dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                fixture.detectChanges();
                flush();
            }

            expect(keyManager.activeItemIndex).toBe(lastIndex);

            const activeItem = keyManager.activeItem!;

            expect(activeItem).toBeTruthy();

            const focusSpy = jest.spyOn(activeItem, 'focus');

            dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
            fixture.detectChanges();
            flush();

            // Index did not change (we were already at the last option), so the fix's
            // explicit focus call should have fired with 'keyboard' origin.
            expect(keyManager.activeItemIndex).toBe(lastIndex);
            expect(focusSpy).toHaveBeenCalledWith('keyboard');
        }));
    });

    describe('with multiple kbq-select elements in one view', () => {
        let fixture: ComponentFixture<ManySelects>;
        let triggers: DebugElement[];
        let options: NodeListOf<HTMLElement>;

        beforeEach(fakeAsync(() => {
            configureKbqTreeSelectTestingModule([ManySelects]);

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

            expect(options[0].id).toContain('kbq-tree-option');

            expect(options[0].id).not.toEqual(options[1].id);

            document.body.click();
            fixture.detectChanges();
            flush();

            triggers[1].nativeElement.click();
            fixture.detectChanges();
            flush();

            options = overlayContainerElement.querySelectorAll('kbq-tree-option');
            expect(options[0].id).toContain('kbq-tree-option');

            expect(options[0].id).not.toEqual(firstOptionID);

            expect(options[0].id).not.toEqual(options[1].id);
        }));
    });

    describe('with a sibling component that throws an error', () => {
        beforeEach(() => {
            configureKbqTreeSelectTestingModule([
                SelectWithErrorSibling,
                ThrowsErrorOnInit
            ]);
        });

        it('should not crash the browser when a sibling throws an error on init', fakeAsync(() => {
            // Note that this test can be considered successful if the error being thrown didn't
            // end up crashing the testing setup altogether.
            expect(() => TestBed.createComponent(SelectWithErrorSibling).detectChanges()).toThrow(
                new RegExp('Oh no!', 'g')
            );
        }));
    });

    describe('change events', () => {
        beforeEach(() => configureKbqTreeSelectTestingModule([EmptySelect]));

        it('should complete the stateChanges stream on destroy', () => {
            const fixture = TestBed.createComponent(EmptySelect);

            fixture.detectChanges();

            const debugElement = fixture.debugElement.query(By.directive(KbqTreeSelect));
            const select = debugElement.componentInstance;

            const spy = jest.fn();
            const subscription = select.stateChanges.subscribe(undefined, undefined, spy);

            fixture.destroy();
            expect(spy).toHaveBeenCalled();
            subscription.unsubscribe();
        });
    });

    describe('with theming', () => {
        beforeEach(() => configureKbqTreeSelectTestingModule([BasicSelectWithTheming]));

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
        beforeEach(() => configureKbqTreeSelectTestingModule([InvalidSelectInForm]));

        it('should not throw SelectionModel errors in addition to ngModel errors', fakeAsync(() => {
            const fixture = TestBed.createComponent(InvalidSelectInForm);

            // The first change detection run will throw the "ngModel is missing a name" error.
            expect(() => fixture.detectChanges()).toThrow(/the name attribute must be set/g);

            // The second run shouldn't throw selection-model related errors.
            expect(() => fixture.detectChanges()).not.toThrow();
        }));
    });

    describe('with using compareValues in FlatTreeControl', () => {
        beforeEach(() => configureKbqTreeSelectTestingModule([NgModelCompareWithFlatTreeControl]));

        let fixture: ComponentFixture<NgModelCompareWithFlatTreeControl>;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(NgModelCompareWithFlatTreeControl);
            fixture.detectChanges();

            tick(0);
        }));

        describe('comparing by name', () => {
            it('should have a selection', fakeAsync(() => {
                const instance = fixture.componentInstance;

                expect(instance.select.selected).toBeUndefined();

                instance.selectedModel = { name: 'rootNode_1', type: 'app' };
                fixture.detectChanges();
                tick(0);

                const selectedOption = instance.select.selected as FileFlatNode;

                expect(selectedOption.name).toEqual('rootNode_1');
            }));
        });
    });

    describe(`when the select's value is accessed on initialization`, () => {
        beforeEach(() => configureKbqTreeSelectTestingModule([SelectEarlyAccessSibling]));

        it('should not throw when trying to access the selected value on init', fakeAsync(() => {
            expect(() => {
                TestBed.createComponent(SelectEarlyAccessSibling).detectChanges();
            }).not.toThrow();
        }));
    });

    describe('inside of a form group', () => {
        beforeEach(() => configureKbqTreeSelectTestingModule([SelectInsideFormGroup]));

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

        // TODO(DS-2838): legacy validation behavior — see select.component.spec.ts for full note.
        it.skip('should not set the invalid class on a clean select', fakeAsync(() => {
            expect(testComponent.formGroup.untouched).toBe(true);

            expect(testComponent.formControl.invalid).toBe(false);

            expect(select.classList).not.toContain('kbq-invalid');
        }));

        it.skip('should not appear as invalid if it becomes touched', fakeAsync(() => {
            expect(select.classList).not.toContain('kbq-invalid');

            testComponent.formControl.markAsTouched();
            fixture.detectChanges();

            expect(select.classList).not.toContain('kbq-invalid');
        }));

        it.skip('should not have the invalid class when the select becomes valid', fakeAsync(() => {
            testComponent.formControl.markAsTouched();
            fixture.detectChanges();

            expect(select.classList).not.toContain('kbq-invalid');

            testComponent.formControl.setValue('pizza-1');
            fixture.detectChanges();
            flush();

            expect(select.classList).not.toContain('kbq-invalid');
        }));

        it('should appear as invalid when the parent form group is submitted', fakeAsync(() => {
            expect(select.classList).not.toContain('kbq-invalid');

            dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
            fixture.detectChanges();

            expect(select.classList).toContain('kbq-invalid');
        }));

        it('should override error matching behavior via injection token', fakeAsync(() => {
            const errorStateMatcher: ErrorStateMatcher = {
                isErrorState: jest.fn(() => true)
            };

            fixture.destroy();

            TestBed.resetTestingModule().configureTestingModule({
                imports: [
                    KbqFormFieldModule,
                    KbqTreeModule,
                    KbqTreeSelectModule,
                    ReactiveFormsModule,
                    FormsModule,
                    NoopAnimationsModule,
                    SelectInsideFormGroup
                ],
                providers: [kbqErrorStateMatcherProvider(errorStateMatcher)]
            });

            const errorFixture = TestBed.createComponent(SelectInsideFormGroup);
            const component = errorFixture.componentInstance;

            errorFixture.detectChanges();

            tick(10);

            expect(component.select.errorState).toBe(true);
            expect(errorStateMatcher.isErrorState).toHaveBeenCalled();
        }));

        it('should set proper form group validation state on ngSubmit handler, without setTimeout', fakeAsync(() => {
            const submitReactiveSpyFn = jest.spyOn(fixture.componentInstance, 'submitReactive');

            dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');

            expect(submitReactiveSpyFn).toHaveBeenCalled();
            expect(fixture.componentInstance.submitResult).toEqual('invalid');
        }));
    });

    describe('with custom error behavior', () => {
        beforeEach(() => configureKbqTreeSelectTestingModule([CustomErrorBehaviorSelect]));

        it('should be able to override the error matching behavior via an @Input', fakeAsync(() => {
            const fixture = TestBed.createComponent(CustomErrorBehaviorSelect);
            const component = fixture.componentInstance;
            const matcher = jest.fn(() => true);

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
        beforeEach(() => {
            configureKbqTreeSelectTestingModule([
                SingleSelectWithPreselectedArrayValues
            ]);
        });

        it('should be able to preselect an array value in single-selection mode', fakeAsync(() => {
            const fixture = TestBed.createComponent(SingleSelectWithPreselectedArrayValues);

            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            fixture.detectChanges();
            tick(600);

            expect(trigger.textContent).toContain('Pictures');
        }));
    });

    describe('with custom value accessor', () => {
        beforeEach(() => {
            configureKbqTreeSelectTestingModule([
                CompWithCustomSelect,
                CustomSelectAccessor
            ]);
        });

        it('should support use inside a custom value accessor', fakeAsync(() => {
            const fixture = TestBed.createComponent(CompWithCustomSelect);
            const writeValueSpyFn = jest.spyOn(fixture.componentInstance.customAccessor, 'writeValue');

            fixture.detectChanges();

            expect(fixture.componentInstance.customAccessor.select.ngControl).toBeFalsy();
            expect(writeValueSpyFn).toHaveBeenCalled();
        }));
    });

    describe('with OnPush', () => {
        beforeEach(() => {
            configureKbqTreeSelectTestingModule([
                BasicSelectOnPush,
                BasicSelectOnPushPreselected
            ]);
        });

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
        beforeEach(() => {
            configureKbqTreeSelectTestingModule([SelectWithCustomTrigger]);
        });

        it('should allow the user to customize the label', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectWithCustomTrigger);

            fixture.detectChanges();

            fixture.componentInstance.control.setValue('Downloads');
            fixture.detectChanges();
            tick(1);
            flush();

            const label = fixture.debugElement.query(By.css('.kbq-select__matcher')).nativeElement;

            expect(label.textContent).toContain('sdaolnwoD');
        }));
    });

    describe('with custom matcher', () => {
        beforeEach(() => {
            configureKbqTreeSelectTestingModule([SelectWithCustomMatcher]);
        });

        it('should allow the user to customize matcher', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectWithCustomMatcher);

            fixture.detectChanges();

            fixture.componentInstance.control.setValue('Downloads');
            fixture.detectChanges();
            tick(1);
            flush();

            const label = fixture.debugElement.query(By.css('.custom-matcher')).nativeElement;

            expect(label.textContent).toContain('sdaolnwoD');
        }));

        it('should allow to disable handlers for click with custom matcher', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectWithCustomMatcher);

            fixture.autoDetectChanges();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            const toggleSpyFn = jest.spyOn(fixture.componentInstance.select, 'toggle');

            expect(toggleSpyFn).toHaveBeenCalledTimes(0);

            trigger.click();
            fixture.detectChanges();
            flush();

            expect(toggleSpyFn).toHaveBeenCalledTimes(1);

            fixture.componentInstance.useDefaultHandlers = false;

            trigger.click();
            fixture.detectChanges();
            flush();

            expect(toggleSpyFn).toHaveBeenCalledTimes(1);
        }));

        it('should allow to disable handlers for keydown with custom matcher', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectWithCustomMatcher);

            fixture.autoDetectChanges();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            const triggerKeydownHandlerSpyFn = jest.spyOn(fixture.componentInstance.select, 'triggerKeydownHandler');
            const panelKeydownHandlerSpyFn = jest.spyOn(fixture.componentInstance.select, 'panelKeydownHandler');

            expect(triggerKeydownHandlerSpyFn).toHaveBeenCalledTimes(0);
            expect(panelKeydownHandlerSpyFn).toHaveBeenCalledTimes(0);

            dispatchKeyboardEvent(trigger, 'keydown', DOWN_ARROW);
            fixture.detectChanges();
            flush();

            expect(triggerKeydownHandlerSpyFn).toHaveBeenCalledTimes(1);
            expect(panelKeydownHandlerSpyFn).toHaveBeenCalledTimes(0);

            fixture.componentInstance.useDefaultHandlers = false;
            fixture.detectChanges();

            dispatchKeyboardEvent(trigger, 'keydown', DOWN_ARROW);
            fixture.detectChanges();
            flush();

            expect(triggerKeydownHandlerSpyFn).toHaveBeenCalledTimes(1);
            expect(panelKeydownHandlerSpyFn).toHaveBeenCalledTimes(0);
        }));
    });

    describe('when resetting the value by setting null or undefined', () => {
        beforeEach(() => {
            configureKbqTreeSelectTestingModule([ResetValuesSelect]);
        });

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

        it('should reset when an option with a null value is selected', fakeAsync(() => {
            fixture.componentInstance.control.setValue(null);
            options[2].click();
            tick(1);

            expect(formField.classList).not.toContain('kbq-form-field-should-float');
            expect(trigger.textContent).not.toContain('Null-option');
        }));

        it('should not mark the reset option as selected ', fakeAsync(() => {
            options[4].click();

            fixture.componentInstance.select.open();
            tick(1);

            expect(options[4].classList).not.toContain('kbq-selected');
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

        beforeEach(() => {
            configureKbqTreeSelectTestingModule([
                BasicSelectWithoutForms,
                BasicSelectWithoutFormsPreselected,
                BasicSelectWithoutFormsMultiple
            ]);

            fixture = TestBed.createComponent(BasicSelectWithoutForms);

            fixture.detectChanges();
            fixture.detectChanges();
        });

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
            const spy = jest.fn();

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
        beforeEach(() =>
            configureKbqTreeSelectTestingModule([
                BasicTreeSelect,
                MultiSelect
            ])
        );

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

        describe('limited space to open horizontally', () => {
            beforeEach(fakeAsync(() => {
                formField.style.position = 'absolute';
                formField.style.top = '200px';
            }));

            it('should stay within the viewport when overflowing on the right in ltr', fakeAsync(() => {
                formField.style.right = '-100px';
                trigger.click();
                tick(10);
                fixture.detectChanges();
                flush();

                const viewportRect = viewportRuler.getViewportRect().right;
                const panelRight = document.querySelector('.kbq-tree-select__panel')!.getBoundingClientRect().right;

                expect(viewportRect - panelRight).toBeGreaterThan(0);
            }));
        });
    });

    describe('with multiple selection', () => {
        let fixture: ComponentFixture<MultiSelect>;
        let testInstance: MultiSelect;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            configureKbqTreeSelectTestingModule([MultiSelect]);

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

        it('should throw an exception when trying to set a non-array value', fakeAsync(() => {
            expect(() => {
                testInstance.control.setValue('not-an-array');
            }).toThrow(wrappedErrorMessage(getKbqSelectNonArrayValueError()));
        }));

        it('should throw an exception when trying to change multiple mode after init', fakeAsync(() => {
            expect(() => {
                testInstance.select.multiple = false;
            }).toThrow(wrappedErrorMessage(getKbqSelectDynamicMultipleError()));
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

        it('should select all options when pressing CTRL + A', fakeAsync(() => {
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
            tick(0);

            expect(options.every((option) => option.selected)).toBe(true);
            expect(testInstance.control.value).toEqual([
                'rootNode_1',
                'Pictures',
                'Sun',
                'Woods',
                'Photo_Booth_Library',
                'Contents',
                'Pictures',
                'Documents',
                'angular',
                'src',
                'core',
                'compiler',
                'material2',
                'src',
                'button',
                'checkbox',
                'input',
                'Downloads',
                'Tutorial',
                'November',
                'October',
                'Applications',
                'Chrome',
                'Calendar',
                'Webstorm'
            ]);
        }));

        it('should skip disabled options when using CTRL + A', () => {
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
                'Sun',
                'Woods',
                'Photo_Booth_Library',
                'Contents',
                'Pictures',
                'angular',
                'src',
                'core',
                'compiler',
                'material2',
                'src',
                'button',
                'checkbox',
                'input',
                'Downloads',
                'Tutorial',
                'November',
                'October',
                'Applications',
                'Chrome',
                'Calendar',
                'Webstorm'
            ]);
        });

        it('should select all options when pressing CTRL + A when some options are selected', fakeAsync(() => {
            const selectElement = fixture.nativeElement.querySelector('kbq-tree-select');
            const options = fixture.componentInstance.options.toArray();

            testInstance.control.setValue([
                'Contents',
                'Pictures',
                'Documents',
                'angular',
                'src'
            ]);

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);

            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(options.every((option) => option.selected)).toBe(false);
            tick(0);
            expect(options.every((option) => option.selected)).toBe(true);
            expect(testInstance.control.value).toEqual([
                'Contents',
                'Pictures',
                'Documents',
                'angular',
                'src',
                'rootNode_1',
                'Sun',
                'Woods',
                'Photo_Booth_Library',
                'Pictures',
                'core',
                'compiler',
                'material2',
                'src',
                'button',
                'checkbox',
                'input',
                'Downloads',
                'Tutorial',
                'November',
                'October',
                'Applications',
                'Chrome',
                'Calendar',
                'Webstorm'
            ]);
        }));

        it('should deselect all options with CTRL + A if all options are selected', () => {
            const selectElement = fixture.nativeElement.querySelector('kbq-tree-select');

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);

            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);

            expect(testInstance.control.getRawValue().length).toEqual(25);

            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(testInstance.control.getRawValue()).toEqual([]);
        });
    });

    describe('with parent selection', () => {
        let fixture: ComponentFixture<ChildSelection>;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            configureKbqTreeSelectTestingModule([ChildSelection]);

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
                if (['Calendar', 'Chrome', 'Webstorm'].includes(o.textContent!.trim())) {
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
        beforeEach(() => configureKbqTreeSelectTestingModule([LocalizedTreeSelect]));

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
            ).toContain(fixture.componentInstance.select.hiddenItems.toString());
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

    describe('ErrorStateMatcher', () => {
        describe('default error state matcher', () => {
            it('should not be in error state initially when invalid but untouched', () => {
                const fixture = createComponent(TreeSelectWithErrorStateMatcher);

                expect(fixture.componentInstance.treeSelect().errorState).toBe(false);
            });

            it('should be in error state when invalid and touched', () => {
                const fixture = createComponent(TreeSelectWithErrorStateMatcher);

                fixture.componentInstance.form.controls.treeSelect.markAsTouched();
                fixture.detectChanges();

                expect(fixture.componentInstance.treeSelect().errorState).toBe(true);
            });

            it('should be in error state when form is submitted and control is invalid', () => {
                const fixture = createComponent(TreeSelectWithErrorStateMatcher);

                getSubmitButton(fixture).click();
                fixture.detectChanges();

                expect(fixture.componentInstance.treeSelect().errorState).toBe(true);
            });

            it('should call errorStateMatcher and update errorState on blur', () => {
                const fixture = createComponent(TreeSelectWithErrorStateMatcher);
                const spy = jest.spyOn(fixture.componentInstance.errorStateMatcher, 'isErrorState');

                expect(spy).not.toHaveBeenCalled();
                expect(fixture.componentInstance.treeSelect().errorState).toBe(false);

                getTreeSelectElement(fixture).dispatchEvent(new Event('blur'));
                fixture.detectChanges();

                expect(spy).toHaveBeenCalled();
                expect(fixture.componentInstance.treeSelect().errorState).toBe(true);
            });
        });

        describe('show-on-form-submit error state matcher', () => {
            it('should not be in error state when invalid and touched but form not submitted', () => {
                const fixture = createComponent(TreeSelectWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
                fixture.componentInstance.form.controls.treeSelect.markAsTouched();
                fixture.detectChanges();

                expect(fixture.componentInstance.treeSelect().errorState).toBe(false);
            });

            it('should be in error state after form is submitted when invalid', () => {
                const fixture = createComponent(TreeSelectWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
                fixture.detectChanges();

                getSubmitButton(fixture).click();
                fixture.detectChanges();

                expect(fixture.componentInstance.treeSelect().errorState).toBe(true);
            });

            it('should call errorStateMatcher and NOT update errorState on blur', () => {
                const fixture = createComponent(TreeSelectWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
                fixture.detectChanges();

                const spy = jest.spyOn(fixture.componentInstance.errorStateMatcher, 'isErrorState');

                expect(spy).not.toHaveBeenCalled();
                expect(fixture.componentInstance.treeSelect().errorState).toBe(false);

                getTreeSelectElement(fixture).dispatchEvent(new Event('blur'));
                fixture.detectChanges();

                expect(spy).toHaveBeenCalled();
                expect(fixture.componentInstance.treeSelect().errorState).toBe(false);
            });
        });

        describe('show-on-control-dirty error state matcher', () => {
            it('should not be in error state when invalid but pristine', () => {
                const fixture = createComponent(TreeSelectWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnControlDirtyErrorStateMatcher();
                fixture.detectChanges();

                expect(fixture.componentInstance.treeSelect().errorState).toBe(false);
            });

            it('should be in error state when invalid and dirty', () => {
                const fixture = createComponent(TreeSelectWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnControlDirtyErrorStateMatcher();
                fixture.componentInstance.form.controls.treeSelect.markAsDirty();
                fixture.detectChanges();

                expect(fixture.componentInstance.treeSelect().errorState).toBe(true);
            });

            it('should call errorStateMatcher and NOT update errorState on blur', () => {
                const fixture = createComponent(TreeSelectWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnControlDirtyErrorStateMatcher();
                fixture.detectChanges();

                const spy = jest.spyOn(fixture.componentInstance.errorStateMatcher, 'isErrorState');

                expect(spy).not.toHaveBeenCalled();
                expect(fixture.componentInstance.treeSelect().errorState).toBe(false);

                getTreeSelectElement(fixture).dispatchEvent(new Event('blur'));
                fixture.detectChanges();

                expect(spy).toHaveBeenCalled();
                expect(fixture.componentInstance.treeSelect().errorState).toBe(false);
            });
        });

        describe('custom ErrorStateMatcher', () => {
            it('should override errorStateMatcher by kbqErrorStateMatcherProvider', () => {
                const fixture = createComponent(TreeSelectWithDIErrorStateMatcher);

                expect(fixture.componentInstance.treeSelect().errorState).toBe(true);

                fixture.componentInstance.form.controls.treeSelect.markAsTouched();
                fixture.detectChanges();

                expect(fixture.componentInstance.treeSelect().errorState).toBe(false);
            });

            it('should use custom errorStateMatcher logic', () => {
                const fixture = createComponent(TreeSelectWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = customErrorStateMatcher;
                fixture.detectChanges();

                expect(fixture.componentInstance.treeSelect().errorState).toBe(true);

                fixture.componentInstance.form.controls.treeSelect.markAsTouched();
                fixture.detectChanges();

                expect(fixture.componentInstance.treeSelect().errorState).toBe(false);
            });
        });
    });

    describe('async validation', () => {
        it.skip('should emit PENDING via statusChanges on blur (KbqValidateDirective)', fakeAsync(() => {
            const fixture = createComponent(LegacyTreeSelectControlWithAsyncValidators);
            const { control, treeSelect } = fixture.componentInstance;
            const statuses: FormControlStatus[] = [];

            const subscription = control.statusChanges.subscribe((status) => statuses.push(status));

            control.setValue('1');

            expect(control.status).toBe('PENDING');
            expect(statuses).toEqual(['PENDING']);

            tick(ASYNC_VALIDATOR_TIMER_DUE);

            expect(control.status).toBe('VALID');
            expect(statuses).toEqual(['PENDING', 'VALID']);

            treeSelect().onBlur();
            tick(ASYNC_VALIDATOR_TIMER_DUE);

            expect(control.status).toBe('VALID');
            expect(statuses).toEqual(['PENDING', 'VALID', 'PENDING']);

            subscription.unsubscribe();
        }));

        it('should emit VALID via statusChanges on blur', fakeAsync(() => {
            const fixture = createComponent(TreeSelectControlWithAsyncValidators);
            const { control, treeSelect } = fixture.componentInstance;
            const statuses: FormControlStatus[] = [];

            const subscription = control.statusChanges.subscribe((status) => statuses.push(status));

            control.setValue('1');

            expect(control.status).toBe('PENDING');
            expect(statuses).toEqual(['PENDING']);

            tick(ASYNC_VALIDATOR_TIMER_DUE);

            expect(control.status).toBe('VALID');
            expect(statuses).toEqual(['PENDING', 'VALID']);

            treeSelect().onBlur();
            tick(ASYNC_VALIDATOR_TIMER_DUE);

            expect(control.status).toBe('VALID');
            expect(statuses).toEqual(['PENDING', 'VALID']);

            subscription.unsubscribe();
        }));
    });

    describe('with ngIf', () => {
        beforeEach(() => configureKbqTreeSelectTestingModule([NgIfTreeSelect]));

        it('should handle nesting in an ngIf', fakeAsync(() => {
            const fixture = TestBed.createComponent(NgIfTreeSelect);

            fixture.detectChanges();
            fixture.detectChanges();

            fixture.componentInstance.isShowing = true;
            fixture.detectChanges();
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            flush();

            const matcher = fixture.debugElement.query(By.css('.kbq-select__matcher')).nativeElement;

            expect(matcher.textContent).toContain('rootNode_1');

            expect(fixture.componentInstance.select.panelOpen).toBe(true);
            expect(overlayContainerElement.textContent).toContain('rootNode_1');
            expect(overlayContainerElement.textContent).toContain('Pictures');
            expect(overlayContainerElement.textContent).toContain('Documents');
        }));
    });

    describe('panelWidth', () => {
        beforeEach(() => configureKbqTreeSelectTestingModule([TreeSelectWithPanelWidth]));

        it('should set custom panel width by panelWidth attribute', () => {
            const fixture = TestBed.createComponent(TreeSelectWithPanelWidth);

            fixture.componentInstance.panelWidth = 344;
            fixture.detectChanges();

            fixture.debugElement.query(By.directive(KbqTreeSelect)).nativeElement.click();
            fixture.detectChanges();

            const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

            expect(pane.style.width).toBe('344px');
        });
    });
});
