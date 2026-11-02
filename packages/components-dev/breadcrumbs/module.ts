import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BreadcrumbsExamplesModule } from '../../docs-examples/components/breadcrumbs';

@Component({
    standalone: true,
    imports: [BreadcrumbsExamplesModule],
    selector: 'dev-examples',
    template: `
        <breadcrumbs-with-wrap-example />
        <hr />
        <breadcrumbs-with-auto-wrap-adaptive-example />
        <hr />
        <breadcrumbs-overview-example />
        <hr />
        <breadcrumbs-size-example />
        <hr />
        <breadcrumbs-dropdown-example />
        <hr />
        <breadcrumbs-custom-template-example />
        <hr />
        <breadcrumbs-truncate-head-items-example />
        <hr />
        <breadcrumbs-truncate-tail-items-example />
        <hr />
        <breadcrumbs-truncate-by-abbrev-items-example />
        <hr />
        <breadcrumbs-truncate-center-items-example />
        <hr />
        <breadcrumbs-routing-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    selector: 'dev-products-page',
    imports: [
        RouterOutlet,
        RouterLink
    ],
    template: `
        <div>product</div>
        <a routerLink="./123">-> products/123</a>
        <router-outlet />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevProductsPage {}

@Component({
    standalone: true,
    selector: 'dev-product-details-page',
    template: '<div>product-details</div>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevProductDetailsPage {}

@Component({
    standalone: true,
    selector: 'dev-about-page',
    template: '<div>about</div>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevAboutPage {}

@Component({
    standalone: true,
    imports: [RouterOutlet, RouterLink, DevExamples],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
