import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { BreadcrumbsExamplesModule } from '../../docs-examples/components/breadcrumbs';

@Component({
    standalone: true,
    imports: [BreadcrumbsExamplesModule],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Breadcrumbs {}
