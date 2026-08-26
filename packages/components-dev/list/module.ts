import { Clipboard } from '@angular/cdk/clipboard';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule, UntypedFormControl } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqMultipleInput, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    KbqListDragPreview,
    KbqListModule,
    KbqListSelectionChange,
    KbqListSelectionDroppedEvent
} from '@koobiq/components/list';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { ListExamplesModule } from 'packages/docs-examples/components/list';
import { of } from 'rxjs';
import { debounceTime, startWith, switchMap } from 'rxjs/operators';
import { DevThemeToggle } from '../theme-toggle';

type DevItem = { id: number; label: string; caption?: string };

const devItems = (prefix: string, offset: number, length: number): DevItem[] =>
    Array.from({ length }, (_, i) => ({ id: offset + i, label: `${prefix} #${offset + i}` }));

@Component({
    selector: 'dev-examples',
    imports: [ListExamplesModule],
    template: `
        <list-virtual-scroll-example />
        <br />
        <br />
        <list-intermediate-state-example />
        <br />
        <br />
        <list-action-button-example />
        <br />
        <br />
        <list-multiple-checkbox-example />
        <br />
        <br />
        <list-draggable-example />
        <br />
        <br />
        <list-draggable-handle-example />
        <br />
        <br />
        <list-draggable-connected-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        FormsModule,
        KbqButtonModule,
        KbqListModule,
        KbqToolTipModule,
        KbqDropdownModule,
        KbqIconModule,
        KbqTitleModule,
        DevDocsExamples,
        JsonPipe,
        AsyncPipe,
        DevThemeToggle,
        ScrollingModule
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {
    private clipboard = inject(Clipboard);

    list = signal(Array.from({ length: 5 }, (_, i) => `Item ${i}`));

    readonly dragPreview = signal<KbqListDragPreview>('text');

    // One option with a caption and one with a label nobody could fit, so the text preview shows off
    // both of its lines and its truncation.
    readonly draggableItems = signal<DevItem[]>([
        ...devItems('Task', 0, 3),
        { id: 3, label: 'Task #3', caption: 'Caption on a line of its own' },
        {
            id: 4,
            label: 'Task #4 with a deliberately long label that has to be cut off somewhere before it runs off the screen'
        }
    ]);
    draggableSelected: DevItem[] = [];

    readonly availableItems = signal(devItems('Available', 0, 4));
    readonly chosenItems = signal(devItems('Chosen', 10, 3));

    readonly comparatorItems = signal(devItems('Item', 0, 4));
    readonly comparatorByReference = signal(false);
    // A separate object rather than `comparatorItems()[1]`, so only `compareById` can match it.
    comparatorSelected: DevItem[] = [{ id: 1, label: 'Item #1' }];

    compareById = (o1: DevItem | null, o2: DevItem | null): boolean => !!o1 && !!o2 && o1.id === o2.id;
    compareByReference = (o1: DevItem | null, o2: DevItem | null): boolean => o1 === o2;

    readonly options = Array.from({ length: 10000 }).map((_, i) => ({
        id: i,
        label: `Option #${i}`
    }));

    popUpPlacements = PopUpPlacements;

    typesOfShoes = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];

    readonly switchableModes: { label: string; value: KbqMultipleInput }[] = [
        { label: 'checkbox', value: 'checkbox' },
        { label: 'keyboard', value: 'keyboard' },
        { label: 'single', value: false }
    ];
    readonly switchableMultiple = signal<KbqMultipleInput>('checkbox');
    switchableSelected: string[] = ['Boots', 'Clogs', 'Loafers'];

    multipleSelected = ['Boots', 'Clogs'];
    multipleSelectedCheckbox: string[] = [];
    selected = [];
    singleSelected = [];

    asyncUpdate = new UntypedFormControl();

    asyncUpdate$ = this.asyncUpdate.valueChanges.pipe(
        startWith(null),
        debounceTime(3000),
        switchMap(() => {
            return of(this.typesOfShoes);
        })
    );

    onSelectionChange($event: KbqListSelectionChange) {
        console.log(`onSelectionChange: ${$event.option.value}`);
    }

    onSelectAll($event) {
        console.log('onSelectAll', $event);
    }

    onCopy($event) {
        console.log('onCopy', $event);
        this.clipboard.copy($event.option.value);
    }

    onRemove(item: string) {
        this.list.update((list) => list.filter((listItem) => listItem !== item));
    }

    /** Replaces every option value with an equal-but-new object, the way an immutable refetch would. */
    reloadComparatorItems() {
        this.comparatorItems.update((items) => items.map((item) => ({ ...item })));
    }

    onDropped({ previousIndex, currentIndex }: KbqListSelectionDroppedEvent) {
        const items = [...this.draggableItems()];

        moveItemInArray(items, previousIndex, currentIndex);

        this.draggableItems.set(items);
    }

    onTransferred({ previousIndex, currentIndex, previousContainer, container, option }: KbqListSelectionDroppedEvent) {
        const fromAvailable = this.availableItems().includes(option.value);
        const source = fromAvailable ? this.availableItems : this.chosenItems;

        if (previousContainer === container) {
            const items = [...source()];

            moveItemInArray(items, previousIndex, currentIndex);
            source.set(items);

            return;
        }

        const target = fromAvailable ? this.chosenItems : this.availableItems;
        const from = [...source()];
        const to = [...target()];

        transferArrayItem(from, to, previousIndex, currentIndex);

        source.set(from);
        target.set(to);
    }
}
