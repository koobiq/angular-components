import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import {
    TextareaCanGrowExample,
    TextareaDisabledExample,
    TextareaErrorStateExample,
    TextareaMaxRowsExample,
    TextareaOverviewExample
} from 'packages/docs-examples/components/textarea';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [
        TextareaOverviewExample,
        TextareaDisabledExample,
        TextareaErrorStateExample,
        TextareaCanGrowExample,
        TextareaMaxRowsExample
    ],
    selector: 'dev-examples',
    template: `
        <textarea-overview-example />
        <hr />
        <textarea-disabled-example />
        <hr />
        <textarea-error-state-example />
        <hr />
        <textarea-can-grow-example />
        <hr />
        <textarea-max-rows-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [KbqTextareaModule, KbqFormFieldModule, FormsModule, DevExamples, DevThemeToggle],
    selector: 'dev-app',
    templateUrl: './template.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    value: string;
}
