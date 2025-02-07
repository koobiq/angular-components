import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BreadcrumbsExamplesModule } from '../../docs-examples/components/breadcrumbs';

@Component({
    standalone: true,
    selector: 'app-product',
    imports: [
        RouterOutlet,
        RouterLink
    ],
    template: `
        <div>product</div>
        <a routerLink="./123">-> products/123</a>
        <router-outlet />
    `
})
export class ProductComponent {}

@Component({
    standalone: true,
    selector: 'app-product-details',
    template: '<div>product-details</div>'
})
export class ProductDetailsComponent {}

@Component({
    standalone: true,
    selector: 'app-about',
    template: '<div>about</div>'
})
export class AboutComponent {}

@Component({
    standalone: true,
    imports: [BreadcrumbsExamplesModule, RouterOutlet, RouterLink],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsDev {}
