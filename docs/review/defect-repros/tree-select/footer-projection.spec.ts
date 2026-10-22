import { Directionality } from '@angular/cdk/bidi';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ENTER, TAB, dispatchKeyboardEvent } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
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

const createDataSource = (treeControl: FlatTreeControl<FlatNode>) => {
    const dataSource = new KbqTreeFlatDataSource(
        treeControl,
        new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren)
    );

    dataSource.data = [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Cherry' }];

    return dataSource;
};

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

                <div kbq-select-footer class="attribute-footer">Attribute footer</div>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class AttributeFooter {
    readonly control = new FormControl<string[]>([], { nonNullable: true });
    readonly select = viewChild.required(KbqTreeSelect);
    readonly treeControl = new FlatTreeControl<FlatNode>(getLevel, isExpandable, getValue, getValue);
    readonly dataSource = createDataSource(this.treeControl);
}

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

                <div kbq-tree-select-footer class="tree-select-footer">
                    <button class="footer-action" type="button" (click)="actions = actions + 1">Act</button>
                </div>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class TreeSelectFooter {
    readonly control = new FormControl<string[]>([], { nonNullable: true });
    readonly select = viewChild.required(KbqTreeSelect);
    readonly treeControl = new FlatTreeControl<FlatNode>(getLevel, isExpandable, getValue, getValue);
    readonly dataSource = createDataSource(this.treeControl);
    actions = 0;
}

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

                <kbq-select-footer class="element-footer">Element footer</kbq-select-footer>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class ElementFooter {
    readonly control = new FormControl<string[]>([], { nonNullable: true });
    readonly select = viewChild.required(KbqTreeSelect);
    readonly treeControl = new FlatTreeControl<FlatNode>(getLevel, isExpandable, getValue, getValue);
    readonly dataSource = createDataSource(this.treeControl);
}

describe('triage: tree-select footer slot', () => {
    let overlayContainerElement: HTMLElement;

    const createOpen = async <T>(component: Type<T>): Promise<ComponentFixture<T>> => {
        TestBed.configureTestingModule({
            imports: [component],
            providers: [{ provide: Directionality, useFactory: () => ({ value: 'ltr' }) }]
        });

        const fixture = TestBed.createComponent(component);

        overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();

        fixture.detectChanges();
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        return fixture;
    };

    beforeEach(() => vi.useFakeTimers());

    afterEach(() => vi.useRealTimers());

    it('control: the element form kbq-select-footer is projected into the panel with the footer class', async () => {
        await createOpen(ElementFooter);

        const footer = overlayContainerElement.querySelector('.element-footer');

        expect(footer).not.toBeNull();
        expect(footer!.classList).toContain('kbq-select__footer');
    });

    it('DEFECT: the attribute form [kbq-select-footer] is not rendered at all', async () => {
        const fixture = await createOpen(AttributeFooter);

        expect(fixture.componentInstance.select().panelOpen).toBe(true);
        expect(overlayContainerElement.querySelector('kbq-tree-option')).not.toBeNull();
        expect(document.querySelector('.attribute-footer')).toBeNull();
    });

    it('DEFECT: [kbq-tree-select-footer] is projected but gets no footer directive or class', async () => {
        await createOpen(TreeSelectFooter);

        const footer = overlayContainerElement.querySelector('.tree-select-footer');

        expect(footer).not.toBeNull();
        expect(footer!.classList).not.toContain('kbq-select__footer');
    });

    it('DEFECT: Enter on a focused footer button is prevented and toggles the active option instead', async () => {
        const fixture = await createOpen(TreeSelectFooter);
        const { control, select } = fixture.componentInstance;
        const button = overlayContainerElement.querySelector<HTMLButtonElement>('.footer-action')!;

        expect(select().tree()!.keyManager.activeItem!.value).toBe('Apple');

        button.focus();

        const event = dispatchKeyboardEvent(button, 'keydown', ENTER, undefined, 'Enter');

        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        expect(event.defaultPrevented).toBe(true);
        expect(control.value).toEqual(['Apple']);
    });

    it('DEFECT: Tab on a focused footer button closes the panel', async () => {
        const fixture = await createOpen(TreeSelectFooter);
        const button = overlayContainerElement.querySelector<HTMLButtonElement>('.footer-action')!;

        button.focus();
        dispatchKeyboardEvent(button, 'keydown', TAB, undefined, 'Tab');
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        expect(fixture.componentInstance.select().panelOpen).toBe(false);
    });
});
