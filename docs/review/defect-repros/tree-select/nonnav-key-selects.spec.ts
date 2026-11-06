import { Directionality } from '@angular/cdk/bidi';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, Directive, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { END, ENTER, createKeyboardEvent, dispatchEvent, dispatchKeyboardEvent } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelect, KbqTreeSelectChange, KbqTreeSelectModule } from '@koobiq/components/tree-select';

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

const SHIFT = 16;
const B = 66;

@Directive()
abstract class TreeSelectHost {
    readonly control = new FormControl<string | null | undefined>(null);
    readonly changes: KbqTreeSelectChange[] = [];
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

@Component({
    imports: [KbqFormFieldModule, KbqTreeModule, KbqTreeSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-tree-select placeholder="Fruit" [formControl]="control" (selectionChange)="changes.push($event)">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `
})
class SingleTreeSelect extends TreeSelectHost {}

@Component({
    imports: [KbqFormFieldModule, KbqInputModule, KbqTreeModule, KbqTreeSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-tree-select placeholder="Fruit" [formControl]="control" (selectionChange)="changes.push($event)">
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
class SingleTreeSelectWithSearch extends TreeSelectHost {
    readonly searchControl = new FormControl('');
}

describe('triage: tree-select keys that do not navigate', () => {
    let overlayContainerElement: HTMLElement;

    const create = async <T extends TreeSelectHost>(component: Type<T>): Promise<ComponentFixture<T>> => {
        TestBed.configureTestingModule({
            imports: [component],
            providers: [{ provide: Directionality, useFactory: () => ({ value: 'ltr' }) }]
        });

        const fixture = TestBed.createComponent(component);

        overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();

        fixture.detectChanges();
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        return fixture;
    };

    const settle = async (fixture: ComponentFixture<unknown>) => {
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();
    };

    const activeOption = (fixture: ComponentFixture<TreeSelectHost>): HTMLElement =>
        fixture.componentInstance.select().tree()!.keyManager.activeItem!.getHostElement();

    beforeEach(() => vi.useFakeTimers());

    afterEach(() => vi.useRealTimers());

    it('DEFECT: Shift alone in an open single panel selects the highlighted option', async () => {
        const fixture = await create(SingleTreeSelect);
        const { control, changes, select } = fixture.componentInstance;

        expect(select().panelOpen).toBe(true);
        expect(select().tree()!.keyManager.activeItem!.value).toBe('Apple');
        expect(control.value).toBeNull();

        const shift = createKeyboardEvent('keydown', SHIFT, undefined, 'Shift');

        Object.defineProperty(shift, 'shiftKey', { get: () => true });
        dispatchEvent(overlayContainerElement.querySelector('kbq-tree-option')!, shift);
        await settle(fixture);

        expect(control.value).toBe('Apple');
        expect(changes.length).toBe(1);
    });

    it('DEFECT: a typeahead letter selects the highlighted option at once, then moves the highlight 200 ms later without selecting', async () => {
        const fixture = await create(SingleTreeSelect);
        const { control, changes, select } = fixture.componentInstance;
        const keyManager = select().tree()!.keyManager;

        dispatchKeyboardEvent(activeOption(fixture), 'keydown', B, undefined, 'b');
        await settle(fixture);

        expect(control.value).toBe('Apple');
        expect(changes.length).toBe(1);
        expect(keyManager.activeItem!.value).toBe('Apple');

        await vi.advanceTimersByTimeAsync(200);
        fixture.detectChanges();

        expect(keyManager.activeItem!.value).toBe('Banana');
        expect(control.value).toBe('Apple');
    });

    it('DEFECT: typing a letter in the search field of a single tree-select selects the highlighted option', async () => {
        const fixture = await create(SingleTreeSelectWithSearch);
        const { control, changes } = fixture.componentInstance;
        const searchInput = overlayContainerElement.querySelector<HTMLInputElement>('.search-input')!;

        expect(document.activeElement).toBe(searchInput);
        expect(control.value).toBeNull();

        dispatchKeyboardEvent(searchInput, 'keydown', B, undefined, 'b');
        await settle(fixture);

        expect(control.value).toBe('Apple');
        expect(changes.length).toBe(1);
    });

    it('DEFECT: End moves the highlight without selecting, and Enter then closes the panel without selecting', async () => {
        const fixture = await create(SingleTreeSelect);
        const { control, select } = fixture.componentInstance;
        const keyManager = select().tree()!.keyManager;

        dispatchKeyboardEvent(activeOption(fixture), 'keydown', END);
        await settle(fixture);

        expect(keyManager.activeItem!.value).toBe('Cherry');
        expect(control.value).toBeNull();

        dispatchKeyboardEvent(activeOption(fixture), 'keydown', ENTER);
        await settle(fixture);

        expect(select().panelOpen).toBe(false);
        expect(control.value).toBeNull();
    });
});
