import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { OverflowItemsExamplesModule } from 'packages/docs-examples/components/overflow-items';

@Component({
    standalone: true,
    imports: [
        OverflowItemsExamplesModule
    ],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverflowItemsDev {}
