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
    selector: 'dev-examples',
    imports: [
        TextareaOverviewExample,
        TextareaDisabledExample,
        TextareaErrorStateExample,
        TextareaCanGrowExample,
        TextareaMaxRowsExample
    ],
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
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [KbqTextareaModule, KbqFormFieldModule, FormsModule, DevDocsExamples, DevThemeToggle],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    value: string;
}
