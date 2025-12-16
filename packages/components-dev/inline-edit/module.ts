import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { InlineEditExamplesModule } from '../../docs-examples/components/inline-edit';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [InlineEditExamplesModule],
    template: `
        <inline-edit-overview-example />
        <inline-edit-unfilled-example />
        <inline-edit-menu-example />
        <inline-edit-disabled-example />
        <inline-edit-horizontal-list-example />
        <inline-edit-on-clean-example />
        <inline-edit-validation-example />
        <inline-edit-custom-handler-example />
        <inline-edit-vertical-list-example />
        <inline-edit-without-label-example />
        <inline-edit-controls-example />
        <inline-edit-editable-header-example />
        <inline-edit-customized-design-example />
        <inline-edit-content-alignment-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        DevDocsExamples,
        DevThemeToggle
    ],
    providers: [],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
