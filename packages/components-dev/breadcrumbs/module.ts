import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqBreadcrumbs } from '../../components/breadcrumbs';

@Component({
    standalone: true,
    imports: [
        KbqBreadcrumbs
    ],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Breadcrumbs {}
