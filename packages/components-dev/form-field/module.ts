/* tslint:disable:no-console */
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { COMMA, ENTER, SPACE, TAB } from '@koobiq/cdk/keycodes';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqHighlightModule, KbqPseudoCheckboxModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTagModule } from '@koobiq/components/tag';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import {
    defaultCompareValues, defaultCompareViewValues,
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule
} from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';

import { FileFlatNode, FileNode } from '../tree-select/module';


const OPTIONS = [
    'Value Value Value Value Value Value Value Value Value Value',
    'Abakan',
    'Almetyevsk',
    'Anadyr',
    'Anapa',
    'Arkhangelsk',
    'Astrakhan',
    'Barnaul',
    'Belgorod',
    'Beslan',
    'Biysk',
    'Birobidzhan',
    'Blagoveshchensk',
    'Bologoye',
    'Bryansk',
    'Veliky Novgorod'
];


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

export const DATA_OBJECT = {
    rootNode_1: 'app',
    Pictures: {
        Sun: 'png',
        Woods: 'jpg',
        PhotoBoothLibrary: {
            Contents: 'dir',
            Pictures_2: 'dir'
        }
    },
    Documents: {
        Pictures_3: 'Pictures',
        angular: {
            src1: {
                core: 'ts',
                compiler: 'ts'
            }
        },
        material2: {
            src2: {
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
    },
    rootNode_1_long_text_long_long_text_long_long_text_long_long_text_long_text_: 'app'
};


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    placeholder = 'PlaceHolder PlaceHolder PlaceHolder PlaceHolder PlaceHolder';
    value = 'Value Value Value Value Value Value Value Value Value Value';
    singleSelected = 'Moscow';
    multipleSelected = [
        'Abakan',
        'Almetyevsk',
        'Anadyr',
        'Anapa',
        'Arkhangelsk',
        'Astrakhan',
        'Barnaul',
        'Belgorod',
        'Beslan',
        'Biysk',
        'Birobidzhan',
        'Blagoveshchensk',
        'Bologoye',
        'Bryansk',
        'Veliky Novgorod'
    ];

    emptyMultipleValue = [];

    treeModel = 'rootNode_1';
    multipleTreeModel = ['rootNode_1', 'Documents', 'November'];

    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    inputTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7'];

    tagModel = ['tag', 'tag1'];

    readonly separatorKeysCodes: number[] = [ENTER, SPACE, TAB, COMMA];

    autocompleteSelectedTags: string[] = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7'];

    options: string[] = OPTIONS.sort();

    password = '456';

    numberValue: number | null = null;

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(
            this.transformer, this.getLevel, this.isExpandable, this.getChildren
        );

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel, this.isExpandable, this.getValue, this.getViewValue,
            defaultCompareValues, defaultCompareViewValues, this.isDisabled
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    private transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    }

    private getLevel = (node: FileFlatNode) => {
        return node.level;
    }

    private isExpandable = (node: FileFlatNode) => {
        return node.expandable;
    }

    private getChildren = (node: FileNode): FileNode[] => {
        return node.children;
    }

    private getValue = (node: FileFlatNode): string => {
        return node.name;
    }

    private getViewValue = (node: FileFlatNode): string => {
        return `${node.name} view`;
    }

    private isDisabled = (node: FileFlatNode): boolean => {
        return node.name === 'November';
    }
}


@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,

        KbqSelectModule,
        KbqInputModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqTagModule,
        KbqToolTipModule,
        KbqHighlightModule,
        KbqTreeModule,
        KbqTreeSelectModule,
        KbqPseudoCheckboxModule,
        KbqAutocompleteModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
