import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTextareaModule } from '@koobiq/components/textarea';

/**
 * @title Textarea with maxRows attribute
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'textarea-max-rows-example',
    imports: [KbqFormFieldModule, KbqTextareaModule, FormsModule, KbqInputModule],
    template: `
        <kbq-form-field>
            <kbq-label>Label</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" [maxRows]="5" [(ngModel)]="value"></textarea>
        </kbq-form-field>
    `,
    host: {
        class: 'layout-margin-xl layout-row'
    }
})
export class TextareaMaxRowsExample {
    protected readonly value = model(
        'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network. Denial of service is typically accomplished by flooding the targeted machine or resource with superfluous requests in an attempt to overload systems and prevent some or all legitimate requests from being fulfilled. The range of attacks varies widely, spanning from inundating a server with millions of requests to slow its performance, overwhelming a server with a substantial amount of invalid data, to submitting requests with an illegitimate IP address.'
    );
}
