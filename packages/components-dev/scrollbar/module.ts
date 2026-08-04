import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    ScrollbarDisableInteractionExample,
    ScrollbarNativeExample,
    ScrollbarOverviewExample,
    ScrollbarRtlExample,
    ScrollbarScrollToExample,
    ScrollbarVirtualScrollExample
} from 'packages/docs-examples/components/scrollbar';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        ScrollbarOverviewExample,
        ScrollbarVirtualScrollExample,
        ScrollbarScrollToExample,
        ScrollbarRtlExample,
        ScrollbarNativeExample,
        ScrollbarDisableInteractionExample
    ],
    template: `
        <scrollbar-overview-example />
        <hr />
        <scrollbar-virtual-scroll-example />
        <hr />
        <scrollbar-scroll-to-example />
        <hr />
        <scrollbar-rtl-example />
        <hr />
        <scrollbar-native-example />
        <hr />
        <scrollbar-disable-interaction-example />
        <hr />
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
