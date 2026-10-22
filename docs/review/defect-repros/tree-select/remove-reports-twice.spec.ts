import { Directionality } from '@angular/cdk/bidi';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqCleaner, KbqFormFieldModule } from '@koobiq/components/form-field';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelect, KbqTreeSelectModule } from '@koobiq/components/tree-select';

interface DataNode {
    name: string;
}

interface FlatNode {
    name: string;
    level: number;
    expandable: boolean;
}

const transformer = (node: DataNode, level: number): FlatNode => ({ name: node.name, level, expandable: false });
const getLevel = (node: FlatNode): number => node.level;
const isExpandable = (node: FlatNode): boolean => node.expandable;
const getValue = (node: FlatNode): string => node.name;
const getChildren = (): DataNode[] => [];

@Component({
    imports: [KbqFormFieldModule, KbqTreeModule, KbqTreeSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-tree-select multiple placeholder="Fruit" [formControl]="control">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>

                <kbq-cleaner />
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class MultipleTreeSelect {
    readonly control = new FormControl<string[]>(['Apple', 'Banana', 'Cherry'], { nonNullable: true });
    readonly select = viewChild.required(KbqTreeSelect);

    readonly treeControl = new FlatTreeControl<FlatNode>(getLevel, isExpandable, getValue, getValue);
    readonly dataSource = new KbqTreeFlatDataSource(
        this.treeControl,
        new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren)
    );

    constructor() {
        this.dataSource.data = [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Cherry' }];
    }
}

describe('triage: tree-select removal reporting', () => {
    let fixture: ComponentFixture<MultipleTreeSelect>;

    const settle = async () => {
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(1);
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();
    };

    beforeEach(async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({
            imports: [MultipleTreeSelect],
            providers: [{ provide: Directionality, useFactory: () => ({ value: 'ltr' }) }]
        });

        fixture = TestBed.createComponent(MultipleTreeSelect);
        fixture.detectChanges();
        fixture.detectChanges();
        await settle();
    });

    afterEach(() => vi.useRealTimers());

    it('DEFECT: removing a tag reports the same value to the form twice', async () => {
        const { control } = fixture.componentInstance;
        const reported: string[][] = [];

        control.valueChanges.subscribe((value) => reported.push(value));

        const removeIcons = fixture.nativeElement.querySelectorAll('.kbq-select__trigger .kbq-tag-remove');

        expect(removeIcons.length).toBe(3);

        (removeIcons[0] as HTMLElement).click();
        await settle();

        expect(control.value).toEqual(['Banana', 'Cherry']);
        expect(reported).toEqual([
            ['Banana', 'Cherry'],
            ['Banana', 'Cherry']
        ]);
    });

    it('DEFECT: the cleaner reports the cleared value to the form twice', async () => {
        const { control } = fixture.componentInstance;
        const reported: string[][] = [];

        control.valueChanges.subscribe((value) => reported.push(value));

        fixture.debugElement.query(By.directive(KbqCleaner)).nativeElement.click();
        await settle();

        expect(control.value).toEqual([]);
        expect(reported).toEqual([[], []]);
    });
});
