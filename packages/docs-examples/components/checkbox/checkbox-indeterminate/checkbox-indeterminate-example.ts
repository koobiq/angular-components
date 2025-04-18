import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';

interface ICheckbox {
    name: string;
    checked: boolean;
}

/**
 * @title Checkbox indeterminate
 */
@Component({
    standalone: true,
    selector: 'checkbox-indeterminate-example',
    imports: [
        KbqCheckboxModule
    ],
    template: `
        <div class="kbq-text-big">
            <kbq-checkbox [checked]="parentChecked" [indeterminate]="parentIndeterminate" (change)="toggleChecked()">
                All fruits
            </kbq-checkbox>
            @for (fruit of fruits; track fruit; let i = $index) {
                <p>
                    <kbq-checkbox [checked]="fruit.checked" (change)="updateCheckboxes(i)">
                        {{ fruit.name }}
                    </kbq-checkbox>
                </p>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxIndeterminateExample {
    parentIndeterminate = true;
    parentChecked = true;

    fruits: ICheckbox[] = [
        { name: 'Apples', checked: true },
        { name: 'Bananas', checked: false },
        { name: 'Grapes', checked: false }
    ];

    constructor(private ref: ChangeDetectorRef) {}

    updateCheckboxes(index: number) {
        this.toggleFruitChecked(index);
        this.updateIndeterminate();
        this.ref.detectChanges();
    }

    toggleFruitChecked(index: number) {
        this.fruits[index].checked = !this.fruits[index].checked;
    }

    toggleChecked() {
        this.parentChecked = !this.parentChecked;

        for (const fruit of this.fruits) {
            fruit.checked = this.parentChecked;
        }

        this.parentIndeterminate = false;
        this.ref.detectChanges();
    }

    updateIndeterminate() {
        let checked: number = 0;
        let unchecked: number = 0;
        const length = this.fruits.length;

        this.fruits.forEach((fruit) => {
            fruit.checked ? checked++ : unchecked++;
        });
        this.parentIndeterminate = checked !== length && unchecked !== length;
        this.parentChecked = this.parentIndeterminate || length === checked;
    }
}
