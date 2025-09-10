import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { InlineEditExamplesModule } from '../../docs-examples/components/inline-edit';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [InlineEditExamplesModule],
    selector: 'dev-examples',
    template: `
        <!--        <inline-edit-overview-example />-->
        <!--        <inline-edit-unfilled-example />-->
        <!--        <inline-edit-menu-example />-->
        <!--        <inline-edit-disabled-example />-->
        <!--        <inline-edit-horizontal-list-example />-->
        <!--        <inline-edit-on-clean-example />-->
        <!--        <inline-edit-validation-example />-->
        <!--        <inline-edit-custom-handler-example />-->
        <!--        <inline-edit-vertical-list-example />-->
        <!--        <inline-edit-without-label-example />-->
        <inline-edit-controls-example />
        <!--        <inline-edit-editable-header-example />-->
        <!--        <inline-edit-customized-design-example />-->
        <!--        <inline-edit-content-alignment-example />-->
    `,
    styles: `
        :host {
            display: flex;
            gap: var(--kbq-size-l);
            flex-wrap: wrap;
            padding-bottom: 100px;
        }
        :host > * {
            display: flex;
            align-items: flex-start;
            border-radius: var(--kbq-size-border-radius);
            border: 1px solid var(--kbq-line-contrast-less);
            margin-bottom: var(--kbq-size-l);
            padding: var(--kbq-size-m);
            flex: 1 0 auto;
            width: 40%;
        }

        ::ng-deep .kbq-inline-edit {
            width: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    selector: 'dev-app',
    standalone: true,
    imports: [
        DevExamples,
        DevThemeToggle
    ],
    providers: [],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
