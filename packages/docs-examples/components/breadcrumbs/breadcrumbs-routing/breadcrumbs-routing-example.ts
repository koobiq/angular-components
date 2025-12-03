import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';

/**
 * @title Breadcrumbs Routing
 */
@Component({
    selector: 'breadcrumbs-routing-example',
    imports: [
        RouterLink,
        KbqBreadcrumbsModule
    ],
    template: `
        <nav kbq-breadcrumbs>
            @for (breadcrumb of breadcrumbs; track breadcrumb) {
                <kbq-breadcrumb-item [routerLink]="breadcrumb.url" [text]="breadcrumb.label" />
            }
        </nav>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsRoutingExample {
    readonly router = inject(Router);
    readonly activatedRoute = inject(ActivatedRoute);
    breadcrumbs: { label: string; url: string }[] = this.buildBreadcrumbs(this.activatedRoute.root);

    /* react on dynamic changes on routing events. Cannot possible to show in docs
    breadcrumbs: Observable<{ label: string; url: string }[]>;
    constructor() {
        this.breadcrumbs = this.router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            map(() => this.buildBreadcrumbs(this.activatedRoute.root)),
            takeUntilDestroyed()
        );
    }*/

    private buildBreadcrumbs(
        route: ActivatedRoute,
        url: string = '',
        breadcrumbs: { label: string; url: string }[] = []
    ): { label: string; url: string }[] {
        const children: ActivatedRoute[] = route.children;

        if (children.length === 0) {
            return breadcrumbs;
        }

        children.forEach((child) => {
            const routeURL: string = child.snapshot.url.map((segment) => segment.path).join('/');

            if (routeURL) {
                url += `/${routeURL}`;
            }

            const label =
                child.snapshot.data['breadcrumb'] ||
                (child.snapshot.url.length && child.snapshot.url[0].path) ||
                'test';

            if (label) {
                breadcrumbs.push({ label, url });
            }

            return this.buildBreadcrumbs(child, url, breadcrumbs);
        });

        return breadcrumbs;
    }
}
