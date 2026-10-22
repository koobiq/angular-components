import { Directionality } from '@angular/cdk/bidi';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';

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
            <kbq-tree-select multiple aria-label="Fruit" [formControl]="control">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class MultipleTreeSelect {
    readonly control = new FormControl<string[]>(['Apple', 'Banana'], { nonNullable: true });

    readonly treeControl = new FlatTreeControl<FlatNode>(getLevel, isExpandable, getValue, getValue);
    readonly dataSource = new KbqTreeFlatDataSource(
        this.treeControl,
        new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren)
    );

    constructor() {
        this.dataSource.data = [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Cherry' }];
    }
}

describe('triage: tree-select tag remove control', () => {
    let fixture: ComponentFixture<MultipleTreeSelect>;

    const removeIcons = (): HTMLElement[] =>
        Array.from(fixture.nativeElement.querySelectorAll('.kbq-select__trigger .kbq-tag-remove'));

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [MultipleTreeSelect],
            providers: [{ provide: Directionality, useFactory: () => ({ value: 'ltr' }) }]
        });

        fixture = TestBed.createComponent(MultipleTreeSelect);
        fixture.autoDetectChanges();
        await fixture.whenStable();
    });

    // `KbqIcon` defaults its host to `aria-hidden="true"` and `kbqTagRemove` sits on the same `<i kbq-icon>`. axe's
    // `aria-hidden-focus` rule does not report it under jsdom, which lays nothing out, so the attributes are asserted.
    it('DEFECT: the focusable remove button of a tag is aria-hidden', () => {
        const icons = removeIcons();

        expect(icons.length).toBe(2);

        for (const icon of icons) {
            expect(icon.getAttribute('role')).toBe('button');
            expect(icon.getAttribute('tabindex')).toBe('0');
            expect(icon.getAttribute('aria-hidden')).toBe('true');
        }
    });

    it('DEFECT: every remove button has the same name, without the label of its node', () => {
        const [apple, banana] = removeIcons();

        expect(apple.closest('kbq-tag')!.textContent).toContain('Apple');
        expect(banana.closest('kbq-tag')!.textContent).toContain('Banana');

        expect(apple.getAttribute('aria-label')).toBeTruthy();
        expect(apple.getAttribute('aria-label')).toBe(banana.getAttribute('aria-label'));
        expect(apple.getAttribute('aria-label')).not.toContain('Apple');
    });
});
