import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip relative to caret
 */
@Component({
    selector: 'tooltip-relative-to-caret-example',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        KbqTextareaModule,
        KbqToolTipModule
    ],
    template: `
        <kbq-form-field>
            <input
                #inputTooltip="kbqTooltip"
                kbqInput
                placeholder="Type here"
                [kbqPlacement]="'top'"
                [kbqRelativeToCaret]="true"
                [kbqTooltip]="'Follows the caret'"
                [kbqTrigger]="'manual'"
                (input)="inputTooltip.show()"
                (blur)="inputTooltip.hide()"
            />
        </kbq-form-field>

        <kbq-form-field>
            <textarea
                #textareaTooltip="kbqTooltip"
                kbqTextarea
                placeholder="Type here"
                [kbqPlacement]="'top'"
                [kbqRelativeToCaret]="true"
                [kbqTooltip]="'Follows the caret'"
                [kbqTrigger]="'manual'"
                (input)="textareaTooltip.show()"
                (blur)="textareaTooltip.hide()"
            ></textarea>
        </kbq-form-field>
    `,
    styles: `
        kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-column layout-align-center-center layout-gap-l'
    }
})
export class TooltipRelativeToCaretExample {}
