import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { OverflowItemsExamplesModule } from 'packages/docs-examples/components/overflow-items';

@Component({
    standalone: true,
    imports: [OverflowItemsExamplesModule],
    selector: 'dev-examples',
    template: `
        <overflow-items-with-vertical-orientation-example />
        <hr />
        <overflow-items-overview-example />
        <hr />
        <overflow-items-with-always-visible-item-example />
        <hr />
        <overflow-items-with-order-example />
        <hr />
        <overflow-items-justify-content-example />
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [
        DevExamples
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
