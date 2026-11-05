import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title select two line option
 */
@Component({
    selector: 'select-two-line-option-example',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select multiple panelClass="example-select-multiline-options" panelWidth="auto" [value]="selected">
                @for (option of options; track option) {
                    <kbq-option [value]="option" [viewValue]="option">
                        <div>{{ option }}</div>
                        <div class="kbq-option-caption">caption</div>
                    </kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 320px;
        }

        ::ng-deep .example-select-multiline-options .kbq-option-text {
            white-space: normal;
            overflow-wrap: break-word;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectTwoLineOptionExample {
    readonly options = [
        'Option #0',
        'Option #1',
        'Option #2 with a very long label that does not fit on a single line of the panel',
        'Option #3',
        'Option #4 with another quite long label that also has to wrap onto the next line'
    ];
    readonly selected = [this.options[0]];
}
