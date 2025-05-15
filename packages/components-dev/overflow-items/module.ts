import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { OverflowItemsExamplesModule } from 'packages/docs-examples/components/overflow-items';

@Component({
    standalone: true,
    imports: [OverflowItemsExamplesModule],
    selector: 'dev-examples',
    template: `
        <overflow-items-overview-example />

        <overflow-items-with-order-example />
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
