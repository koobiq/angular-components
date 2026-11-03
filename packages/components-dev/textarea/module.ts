import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import {
    TextareaCanGrowExample,
    TextareaDisabledExample,
    TextareaErrorStateExample,
    TextareaMaxRowsExample,
    TextareaOverviewExample,
    TextareaReadonlyExample
} from 'packages/docs-examples/components/textarea';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        TextareaOverviewExample,
        TextareaDisabledExample,
        TextareaErrorStateExample,
        TextareaCanGrowExample,
        TextareaMaxRowsExample,
        TextareaReadonlyExample
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
        <hr />
        <textarea-readonly-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [KbqTextareaModule, FormsModule, DevDocsExamples, DevThemeToggle],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {
    value: string;
}
