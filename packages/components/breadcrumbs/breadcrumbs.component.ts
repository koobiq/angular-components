import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'kbq-breadcrumbs',
    templateUrl: 'breadcrumbs.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsComponent {}
