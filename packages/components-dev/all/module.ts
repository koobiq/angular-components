import { ChangeDetectionStrategy, Component, inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqMomentDateModule } from '@koobiq/angular-moment-adapter/adapter';
import { KbqAlertColors, KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';
import { devAppNames } from './routes';

/**
 * Navigation shell over the sibling dev apps: every one of them is a lazy route, so this catalogue
 * covers whatever those apps cover and cannot drift from them.
 *
 * Deliberately not `ViewEncapsulation.None`, and deliberately `dev-all`-prefixed: the routed apps
 * ship global stylesheets that target `dev-app`, `.dev-shell`, `.dev-sidebar` and `.dev-container`,
 * and would otherwise restyle this shell.
 */
@Component({
    selector: 'dev-all',
    imports: [
        FormsModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        CdkScrollable,
        KbqInputModule,
        KbqIconModule,
        KbqHighlightModule,
        DevThemeToggle,
        DevLocaleSelector
    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevAllApp {
    protected readonly searchQuery = signal<string | null>('');
    protected readonly filteredAppNames = computed(() => {
        const query = this.searchQuery()?.trim().toLowerCase() ?? '';

    popUpPlacements = PopUpPlacements;

    checked: boolean[] = [true, true, false];
    indeterminate: boolean = true;
    disabled: boolean = false;
    labelPosition = 'after';

    valueBigOn: boolean = true;
    valueSmallOn: boolean = true;

    value: any;
    min: any;

    numberValue: number | null = null;

    buttonToggleModelResult: string;

    s1 = false;
    s2 = false;
    s3 = false;
    s4 = false;

    typesOfShoes = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];

    folders = [
        {
            name: 'Photos',
            updated: new Date('1/1/16')
        },
        {
            name: 'Recipes',
            updated: new Date('1/17/16')
        },
        {
            name: 'Work',
            updated: new Date('1/28/16')
        }
    ];

    notes = [
        {
            name: 'Vacation Itinerary',
            updated: new Date('2/20/16')
        },
        {
            name: 'Kitchen Remodel',
            updated: new Date('1/18/16')
        }
    ];

    mode: ProgressSpinnerMode = 'determinate';
    percent: number = 0;
    intervalId: number;

    favoriteFruit: string;

    isDisabled: boolean = true;

    fruits = [
        'Apple',
        'Banana',
        'Tomato',
        'Крякать как уточка'
    ];

    selectionList = [
        { name: 'Yes', value: 'true', selected: false },
        { name: 'No', value: 'false', selected: true }
    ];

    singleSelected = 'Normal';
    multipleSelected = ['Normal', 'Hovered', 'Selected', 'Selected1', 'Boots', 'Clogs'];

    singleSelectFormControl = new UntypedFormControl('', Validators.required);

    multiSelectSelectFormControl = new UntypedFormControl([], Validators.pattern(/^w/));

    timeValue1: Moment = moment();

    treeControl: FlatTreeControl<DevFileFlatNode>;
    dataSource: KbqTreeFlatDataSource<DevFileNode, DevFileFlatNode>;
    treeFlattener: KbqTreeFlattener<DevFileNode, DevFileFlatNode>;

    constructor() {
        setInterval(() => (this.percent = (this.percent + STEP) % (MAX_PERCENT + STEP)), INTERVAL);

        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<DevFileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );

        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = devBuildFileTree(DEV_DATA_OBJECT, 0);
    }

    showConfirm() {
        this.modalService.success({
            kbqContent: 'Сохранить сделанные изменения в запросе "Все активы с виндой"?',
            kbqOkText: 'Сохранить',
            kbqCancelText: 'Отмена',
            kbqOkClick: () => console.log('OK')
        });
    }

    toggleDisable() {
        this.isDisabled = !this.isDisabled;
    }

    transformer = (node: DevFileNode, level: number) => {
        const flatNode = new DevFileFlatNode();

        flatNode.name = node.name;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    hasChild(_: number, nodeData: DevFileFlatNode) {
        return nodeData.expandable;
    }

    hasNestedChild(_: number, nodeData: DevFileNode) {
        return !nodeData.type;
    }

    ngOnDestroy() {
        clearInterval(this.intervalId);
    }

    private getValue = (node: DevFileFlatNode): string => {
        return node.name;
    };

    private getViewValue = (node: DevFileFlatNode): string => {
        return `${node.name} view`;
    };

    private getLevel = (node: DevFileFlatNode) => node.level;

    private isExpandable = (node: DevFileFlatNode) => node.expandable;

    private getChildren = (node: DevFileNode): Observable<DevFileNode[]> => {
        return observableOf(node.children);
    };
    protected readonly colors = KbqComponentColors;
    protected readonly alertColors = KbqAlertColors;
}
