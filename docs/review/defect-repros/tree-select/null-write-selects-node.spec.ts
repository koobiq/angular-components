import { Directionality } from '@angular/cdk/bidi';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelect, KbqTreeSelectModule } from '@koobiq/components/tree-select';

interface DataNode {
    name: string;
    value: string | null | undefined;
}

interface FlatNode extends DataNode {
    level: number;
    expandable: boolean;
}

const transformer = (node: DataNode, level: number): FlatNode => ({ ...node, level, expandable: false });
const getLevel = (node: FlatNode): number => node.level;
const isExpandable = (node: FlatNode): boolean => node.expandable;
const getValue = (node: FlatNode): string | null | undefined => node.value;
const getViewValue = (node: FlatNode): string => node.name;
const getChildren = (): DataNode[] => [];

@Component({
    imports: [KbqFormFieldModule, KbqTreeModule, KbqTreeSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-tree-select placeholder="Fruit" [formControl]="control">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class TreeSelectWithMissingValues {
    readonly control = new FormControl<string | null | undefined>('apple');
    readonly select = viewChild.required(KbqTreeSelect);

    readonly treeControl = new FlatTreeControl<FlatNode>(getLevel, isExpandable, getValue, getViewValue);
    readonly dataSource = new KbqTreeFlatDataSource(
        this.treeControl,
        new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren)
    );

    constructor() {
        this.dataSource.data = [
            { name: 'Apple', value: 'apple' },
            { name: 'Not chosen', value: null },
            { name: 'Unset', value: undefined }
        ];
    }
}

describe('triage: tree-select writing a missing value', () => {
    let fixture: ComponentFixture<TreeSelectWithMissingValues>;

    const triggerText = (): string =>
        fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.textContent.trim();

    const settle = async () => {
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(1);
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();
    };

    beforeEach(async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({
            imports: [TreeSelectWithMissingValues],
            providers: [{ provide: Directionality, useFactory: () => ({ value: 'ltr' }) }]
        });

        fixture = TestBed.createComponent(TreeSelectWithMissingValues);
        fixture.detectChanges();
        fixture.detectChanges();
        await settle();
    });

    afterEach(() => vi.useRealTimers());

    it('DEFECT: resetting the form control selects the node whose value is null instead of clearing', async () => {
        const { control, select } = fixture.componentInstance;

        expect((select().selected as FlatNode).name).toBe('Apple');

        control.reset();
        await settle();

        expect(control.value).toBeNull();
        expect(select().empty()).toBe(false);
        expect((select().selected as FlatNode).name).toBe('Not chosen');
        expect(triggerText()).toContain('Not chosen');
    });

    it('DEFECT: writing undefined selects the node whose value is undefined instead of clearing', async () => {
        const { control, select } = fixture.componentInstance;

        control.setValue(undefined);
        await settle();

        expect(select().empty()).toBe(false);
        expect((select().selected as FlatNode).name).toBe('Unset');
        expect(triggerText()).toContain('Unset');
    });
});
