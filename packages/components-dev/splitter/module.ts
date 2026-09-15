import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    SplitterAppearanceExample,
    SplitterCollapsibleExample,
    SplitterConstraintsExample,
    SplitterDisabledExample,
    SplitterNestedExample,
    SplitterOrientationExample,
    SplitterOverviewExample,
    SplitterSnapExample
} from 'packages/docs-examples/components/splitter';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        SplitterOverviewExample,
        SplitterAppearanceExample,
        SplitterOrientationExample,
        SplitterDisabledExample,
        SplitterConstraintsExample,
        SplitterSnapExample,
        SplitterCollapsibleExample,
        SplitterNestedExample
    ],
    template: `
        <splitter-overview-example />
        <hr />
        <splitter-appearance-example />
        <hr />
        <splitter-orientation-example />
        <hr />
        <splitter-disabled-example />
        <hr />
        <splitter-constraints-example />
        <hr />
        <splitter-snap-example />
        <hr />
        <splitter-collapsible-example />
        <hr />
        <splitter-nested-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [DevDocsExamples, DevThemeToggle],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
