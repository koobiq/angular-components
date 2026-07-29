import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    PrivateScrollbarScrollToExample,
    PrivateScrollbarVirtualScrollExample,
    PrivateScrollbarVisibilityExample,
    ScrollbarOverviewExample,
    ScrollbarScrollToTopExample,
    ScrollbarWithCustomConfigExample
} from 'packages/docs-examples/components/scrollbar';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        PrivateScrollbarVisibilityExample,
        PrivateScrollbarVirtualScrollExample,
        PrivateScrollbarScrollToExample,
        ScrollbarOverviewExample,
        ScrollbarScrollToTopExample,
        ScrollbarWithCustomConfigExample
    ],
    template: `
        <private-scrollbar-visibility-example />
        <hr />
        <private-scrollbar-virtual-scroll-example />
        <hr />
        <private-scrollbar-scroll-to-example />
        <hr />
        <scrollbar-overview-example />
        <hr />
        <scrollbar-scroll-to-top-example />
        <hr />
        <scrollbar-with-custom-config-example />
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
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
