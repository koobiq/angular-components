import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { OverflowItemsExamplesModule } from 'packages/docs-examples/components/overflow-items';

@Component({
    standalone: true,
    imports: [OverflowItemsExamplesModule],
    selector: 'dev-overflow-items-examples',
    template: `
        <overflow-items-overview-example />

        <overflow-items-overflow-order-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevOverflowItemsExamples {}

@Component({
    standalone: true,
    imports: [
        DevOverflowItemsExamples
    ],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverflowItemsDev {}
