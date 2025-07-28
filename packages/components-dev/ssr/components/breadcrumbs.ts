import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { of, timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    standalone: true,
    selector: 'dev-breadcrumbs-hydration',
    template: `
        <kbq-top-bar>
            @if (breadcrumbItems$ | async; as breadcrumbs) {
                <nav kbq-breadcrumbs wrapMode="none">
                    @for (breadcrumb of breadcrumbs; track breadcrumb.label; let last = $last) {
                        <kbq-breadcrumb-item [routerLink]="breadcrumb.url" [text]="breadcrumb.label">
                            <a *kbqBreadcrumbView [routerLink]="breadcrumb.url" tabindex="-1">
                                <button
                                    [disabled]="last"
                                    [attr.aria-current]="last ? 'page' : null"
                                    kbq-button
                                    kbqBreadcrumb
                                >
                                    <span>{{ breadcrumb.label }}</span>
                                </button>
                            </a>
                        </kbq-breadcrumb-item>
                    }
                </nav>
            }
        </kbq-top-bar>
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbsModule,
        KbqButtonModule,
        AsyncPipe,
        KbqTopBarModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevBreadcrumbsHydration {
    breadcrumbItems$ = of(null).pipe(
        map(() => [
            { label: 'Main', url: '/main' },
            { label: 'Standards', url: '/main/standards' },
            { label: 'Advanced Encryption Standard', url: '/main/standards/advanced-encryption-standard' },
            { label: 'Edit', url: '/main/standards/advanced-encryption-standard/edit' }
        ])
    );

    constructor() {
        /*
        When setTimeout in the code, it delays the time when hydration kicks off the cleanup operation (is depends on the ApplicationRef.isStable).
        As a result, the cleanup operation happens a bit later, thus leaving duplicated content visible.
        link: https://github.com/angular/angular/issues/50543#issuecomment-1572900259
        */
        timer(2000).subscribe(() => console.log('Timer!'));
    }
}
