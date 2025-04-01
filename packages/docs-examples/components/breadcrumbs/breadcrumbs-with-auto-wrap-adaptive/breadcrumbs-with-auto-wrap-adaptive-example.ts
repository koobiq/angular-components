import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';

@Component({
    standalone: true,
    selector: 'example-breadcrumbs',
    template: `
        <nav [max]="null" wrapMode="auto" kbq-breadcrumbs>
            @for (breadcrumb of breadcrumbs; track breadcrumb; let last = $last) {
                <kbq-breadcrumb-item
                    [routerLink]="breadcrumb.url"
                    [queryParams]="{ queryParams: 'queryParam' }"
                    [fragment]="'fragment'"
                    [text]="breadcrumb.label"
                />
            }
        </nav>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            resize: horizontal;
            max-width: 100%;
            overflow: hidden;
            container-type: inline-size;
            background: var(--kbq-background-bg);
            padding: var(--kbq-size-l);
            border-radius: var(--kbq-size-l);
            box-shadow: var(--kbq-shadow-card);
        }
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbsModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleBreadcrumbs {
    breadcrumbs = [
        { label: 'Main', url: '/main' },
        { label: 'Standards', url: '/main/standards' },
        { label: 'Advanced Encryption Standard', url: '/main/standards/advanced-encryption-standard' },
        { label: 'Edit', url: '/main/standards/advanced-encryption-standard/edit' },
        { label: 'Test', url: '/main/standards/advanced-encryption-standard/edit/test' }
    ];
}

/**
 * @title Breadcrumbs Auto Wrap Adaptive
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-with-auto-wrap-adaptive-example',
    template: `
        <example-breadcrumbs class="layout-margin-bottom-3xl" />
        <example-breadcrumbs class="layout-margin-bottom-l" [style.width.px]="480" />
        <div class="example-description layout-margin-bottom-3xl">
            За основу берется автоматическое сокращение,
            <br />
            когда средние пункты скрываются при отсутствии свободного пространства.
        </div>

        <example-breadcrumbs class="layout-margin-bottom-l" [style.width.px]="320" />
        <div class="example-description layout-margin-bottom-3xl">
            Если пространство становится еще уже, то скрывается и левый крайний уровень у хлебных крошек,
            <br />
            оставляя видимым только крайний правый уровень.
        </div>

        <example-breadcrumbs class="layout-margin-bottom-l" [style.width.px]="137" />
        <div class="example-description layout-margin-bottom-3xl">
            Далее хлебные крошки возможность уменьшить только размера,
            <br />
            когда наименование видимого пункта обрежется до 3 символов.
        </div>
    `,
    styles: `
        ::ng-deep .docs-live-example__example_breadcrumbs-with-auto-wrap-adaptive {
            background: var(--kbq-background-bg-secondary);
        }

        .example-description {
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbsModule,
        ExampleBreadcrumbs
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsWithAutoWrapAdaptiveExample {
    breadcrumbs = [
        { label: 'Main', url: '/main' },
        { label: 'Standards', url: '/main/standards' },
        { label: 'Advanced Encryption Standard', url: '/main/standards/advanced-encryption-standard' },
        { label: 'Edit', url: '/main/standards/advanced-encryption-standard/edit' },
        { label: 'Test', url: '/main/standards/advanced-encryption-standard/edit/test' }
    ];
}
