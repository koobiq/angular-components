import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';

interface ICheckbox {
    name: string;
    checked: boolean;
}

/**
 * @title Checkbox indeterminate
 */
@Component({
    selector: 'checkbox-indeterminate-example',
    imports: [
        KbqCheckboxModule
    ],
    template: `
        <div class="kbq-text-big">
            <kbq-checkbox [checked]="parentChecked" [indeterminate]="parentIndeterminate" (change)="toggleChecked()">
                All fruits
            </kbq-checkbox>
            @for (fruit of fruits; track fruit) {
                <p>
                    <kbq-checkbox [checked]="fruit.checked" (change)="updateCheckboxes($index)">
                        {{ fruit.name }}
                    </kbq-checkbox>
                </p>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxIndeterminateExample {
    private ref = inject(ChangeDetectorRef);

    parentIndeterminate = true;
    parentChecked = true;

    fruits: ICheckbox[] = [
        { name: 'Apples', checked: true },
        { name: 'Bananas', checked: false },
        { name: 'Grapes', checked: false }
    ];

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
            if (fruit.checked) {
                checked++;
            } else {
                unchecked++;
            }
        });
        this.parentIndeterminate = checked !== length && unchecked !== length;
        this.parentChecked = this.parentIndeterminate || length === checked;
    }
}
