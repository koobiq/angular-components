import { Directionality } from '@angular/cdk/bidi';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DOWN_ARROW, dispatchKeyboardEvent } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
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
class SingleTreeSelect {
    readonly control = new FormControl<string | null | undefined>('Apple');
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

describe('triage: tree-select single pick', () => {
    let fixture: ComponentFixture<SingleTreeSelect>;
    let overlayContainerElement: HTMLElement;

    const getOption = (name: string): HTMLElement =>
        Array.from(overlayContainerElement.querySelectorAll<HTMLElement>('kbq-tree-option')).find(
            (option) => option.textContent!.trim() === name
        )!;

    const open = async () => {
        fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();
    };

    const settle = async () => {
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(1);
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();
    };

    beforeEach(async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({
            imports: [SingleTreeSelect],
            providers: [{ provide: Directionality, useFactory: () => ({ value: 'ltr' }) }]
        });

        fixture = TestBed.createComponent(SingleTreeSelect);
        overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();

        fixture.detectChanges();
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();
    });

    afterEach(() => vi.useRealTimers());

    // The click emits `userInteraction` first, which closes the panel; the tree then moves the key manager onto the
    // clicked option, and the tree-select's `keyManager.change` handler takes a move while closed as keyboard
    // navigation and calls `selectViaInteraction()` again, so the whole clear-and-select runs twice.
    it('DEFECT: switching from one value to another by click reports undefined before the new value, twice, and emits selectionChange twice', async () => {
        const { control, changes } = fixture.componentInstance;

        expect(control.value).toBe('Apple');

        const reported: unknown[] = [];

        control.valueChanges.subscribe((value) => reported.push(value));

        await open();
        getOption('Banana').click();
        await settle();

        expect(reported).toEqual([undefined, 'Banana', undefined, 'Banana']);
        expect(changes.length).toBe(2);
        expect(control.value).toBe('Banana');
    });

    it('DEFECT: clicking the already selected option re-emits selectionChange and marks the control dirty', async () => {
        const { control, changes } = fixture.componentInstance;

        expect(control.pristine).toBe(true);

        const reported: unknown[] = [];

        control.valueChanges.subscribe((value) => reported.push(value));

        await open();
        getOption('Apple').click();
        await settle();

        expect(control.value).toBe('Apple');
        expect(reported).toEqual([undefined, 'Apple']);
        expect(changes.length).toBe(1);
        expect(control.dirty).toBe(true);
    });

    it('DEFECT: moving to the next option with ArrowDown reports undefined to the form before the new value', async () => {
        const { control } = fixture.componentInstance;
        const reported: unknown[] = [];

        await open();

        expect(fixture.componentInstance.select().tree()!.keyManager.activeItem!.value).toBe('Apple');

        control.valueChanges.subscribe((value) => reported.push(value));

        dispatchKeyboardEvent(getOption('Apple'), 'keydown', DOWN_ARROW);
        await settle();

        expect(reported).toEqual([undefined, 'Banana']);
        expect(control.value).toBe('Banana');
    });
});
