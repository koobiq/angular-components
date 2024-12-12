import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'kbq-breadcrumbs',
    templateUrl: 'breadcrumbs.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBreadcrumbs {}
