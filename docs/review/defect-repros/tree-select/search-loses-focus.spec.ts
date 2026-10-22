import { Directionality } from '@angular/cdk/bidi';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DOWN_ARROW, PAGE_DOWN, dispatchFakeEvent, dispatchKeyboardEvent } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
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
    imports: [KbqFormFieldModule, KbqInputModule, KbqTreeModule, KbqTreeSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-tree-select multiple placeholder="Fruit" [formControl]="control">
                <kbq-form-field noBorders kbqSelectSearch>
                    <input class="search-input" kbqInput type="text" [formControl]="searchControl" />
                </kbq-form-field>

                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class TreeSelectWithSearch {
    readonly control = new FormControl<string[]>([], { nonNullable: true });
    readonly searchControl = new FormControl('');
    readonly select = viewChild.required(KbqTreeSelect);

    readonly treeControl = new FlatTreeControl<FlatNode>(getLevel, isExpandable, getValue, getValue);
    readonly dataSource = new KbqTreeFlatDataSource(
        this.treeControl,
        new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren)
    );

    constructor() {
        this.dataSource.data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig'].map((name) => ({ name }));
    }
}

describe('triage: tree-select search field focus', () => {
    let fixture: ComponentFixture<TreeSelectWithSearch>;
    let overlayContainerElement: HTMLElement;
    let searchInput: HTMLInputElement;

    const options = (): HTMLElement[] =>
        Array.from(overlayContainerElement.querySelectorAll<HTMLElement>('kbq-tree-option'));

    const settle = async () => {
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(1);
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();
    };

    beforeEach(async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({
            imports: [TreeSelectWithSearch],
            providers: [{ provide: Directionality, useFactory: () => ({ value: 'ltr' }) }]
        });

        fixture = TestBed.createComponent(TreeSelectWithSearch);
        overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();

        fixture.detectChanges();
        fixture.detectChanges();
        await settle();

        fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
        await settle();

        searchInput = overlayContainerElement.querySelector<HTMLInputElement>('.search-input')!;
    });

    afterEach(() => vi.useRealTimers());

    it('DEFECT: PageDown pressed in the search field leaves the focus on the option it moved to', async () => {
        const keyManager = fixture.componentInstance.select().tree()!.keyManager;

        expect(document.activeElement).toBe(searchInput);
        expect(keyManager.activeItemIndex).toBe(0);

        // jsdom lays nothing out, so the page size the tree measures from the option height stays 0.
        keyManager.withScrollSize(2);

        dispatchKeyboardEvent(searchInput, 'keydown', PAGE_DOWN);
        await settle();

        expect(keyManager.activeItemIndex).toBe(2);
        expect(document.activeElement).toBe(options()[2]);
        expect(document.activeElement).not.toBe(searchInput);
    });

    it('control: ArrowDown pressed in the search field gives the focus back to the search field', async () => {
        const keyManager = fixture.componentInstance.select().tree()!.keyManager;

        dispatchKeyboardEvent(searchInput, 'keydown', DOWN_ARROW);
        await settle();

        expect(keyManager.activeItemIndex).toBe(1);
        expect(document.activeElement).toBe(searchInput);
    });

    it('DEFECT: hovering an option takes DOM focus out of the search field', async () => {
        expect(document.activeElement).toBe(searchInput);

        const hovered = options()[3];

        dispatchFakeEvent(hovered, 'mouseenter');
        await settle();

        expect(document.activeElement).toBe(hovered);
        expect(document.activeElement).not.toBe(searchInput);
    });
});
