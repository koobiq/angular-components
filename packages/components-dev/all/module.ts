// tslint:disable:no-console

import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqMomentDateModule } from '@koobiq/angular-moment-adapter/adapter';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqCardModule } from '@koobiq/components/card';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { PopUpPlacements, ThemePalette } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqListModule } from '@koobiq/components/list';
import { KbqMarkdownModule } from '@koobiq/components/markdown';
import { KbqModalModule, KbqModalService } from '@koobiq/components/modal';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';
import { KbqProgressSpinnerModule, ProgressSpinnerMode } from '@koobiq/components/progress-spinner';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSplitterModule } from '@koobiq/components/splitter';
import { KbqTagModule } from '@koobiq/components/tag';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqTimepickerModule } from '@koobiq/components/timepicker';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { Observable, of as observableOf } from 'rxjs';

import { buildFileTree, FileFlatNode, FileNode, DATA_OBJECT } from '../tree/module';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
// tslint:disable-next-line:ordered-imports
import * as _moment from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';


const moment = _rollupMoment || _moment;


const INTERVAL: number = 300;
const STEP: number = 4;
const MAX_PERCENT: number = 100;


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    themePalette = ThemePalette;
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
        {name: 'Yes', value: 'true', selected: false},
        {name: 'No', value: 'false', selected: true}
    ];

    singleSelected = 'Normal';
    multipleSelected = ['Normal', 'Hovered', 'Selected', 'Selected1', 'Boots', 'Clogs'];

    singleSelectFormControl = new UntypedFormControl('', Validators.required);

    multiSelectSelectFormControl = new UntypedFormControl([], Validators.pattern(/^w/));

    timeValue1: Moment = moment();

    treeControl: FlatTreeControl<FileFlatNode>;
    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    constructor(private modalService: KbqModalService) {
        setInterval(
            () => this.percent = (this.percent + STEP) % (MAX_PERCENT + STEP),
            INTERVAL
        );

        this.treeFlattener = new KbqTreeFlattener(
            this.transformer, this.getLevel, this.isExpandable, this.getChildren
        );

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel, this.isExpandable, this.getValue, this.getViewValue
        );

        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);
    }

    showConfirm() {
        this.modalService.success({
            kbqContent   : 'Сохранить сделанные изменения в запросе "Все активы с виндой"?',
            kbqOkText    : 'Сохранить',
            kbqCancelText: 'Отмена',
            kbqOnOk      : () => console.log('OK')
        });
    }

    toggleDisable() {
        this.isDisabled = !this.isDisabled;
    }

    transformer = (node: FileNode, level: number) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    }

    hasChild(_: number, nodeData: FileFlatNode) { return nodeData.expandable; }

    hasNestedChild(_: number, nodeData: FileNode) {
        return !(nodeData.type);
    }

    ngOnDestroy() {
        clearInterval(this.intervalId);
    }

    private getValue = (node: FileFlatNode): string => {
        return node.name;
    }

    private getViewValue = (node: FileFlatNode): string => {
        return `${node.name} view`;
    }

    private getLevel = (node: FileFlatNode) => node.level;

    private isExpandable = (node: FileFlatNode) => node.expandable;

    private getChildren = (node: FileNode): Observable<FileNode[]> => {
        return observableOf(node.children);
    }
}


@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        KbqIconModule,
        KbqButtonModule,
        KbqButtonToggleModule,
        KbqLinkModule,
        KbqCardModule,
        KbqCheckboxModule,
        KbqDropdownModule,
        KbqInputModule,
        KbqFormFieldModule,
        KbqNavbarModule,
        KbqListModule,
        KbqMarkdownModule,
        KbqModalModule,
        KbqMomentDateModule,
        KbqLuxonDateModule,
        KbqProgressBarModule,
        KbqProgressSpinnerModule,
        KbqRadioModule,
        KbqSelectModule,
        KbqSplitterModule,
        KbqTagModule,
        KbqTextareaModule,
        KbqTimepickerModule,
        KbqToggleModule,
        KbqToolTipModule,
        KbqTreeModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
