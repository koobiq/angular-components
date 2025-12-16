import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BreadcrumbsExamplesModule } from '../../docs-examples/components/breadcrumbs';

@Component({
    selector: 'dev-examples',
    imports: [BreadcrumbsExamplesModule],
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
export class DevDocsExamples {}

@Component({
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
    selector: 'dev-product-details-page',
    template: '<div>product-details</div>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevProductDetailsPage {}

@Component({
    selector: 'dev-about-page',
    template: '<div>about</div>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevAboutPage {}

@Component({
    selector: 'dev-app',
    imports: [RouterOutlet, RouterLink, DevDocsExamples],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
