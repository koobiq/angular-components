import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';

@Component({
    standalone: true,
    selector: 'example-breadcrumbs',
    template: `
        <nav [max]="null" wrapMode="auto" kbq-breadcrumbs>
            @for (breadcrumb of breadcrumbs; track breadcrumb; let last = $last) {
                <kbq-breadcrumb-item [text]="breadcrumb.label" />
            }
        </nav>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            max-width: 100%;
            min-width: 137px;
            overflow: hidden;
            container-type: inline-size;
            background: var(--kbq-background-bg);
            padding: var(--kbq-size-l);
            border-radius: var(--kbq-size-l);
            box-shadow: var(--kbq-shadow-card);
            box-sizing: border-box;
        }
    `,
    imports: [KbqBreadcrumbsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleBreadcrumbs {
    breadcrumbs = [
        { label: 'Main' },
        { label: 'Standards' },
        { label: 'Advanced Encryption Standard' },
        { label: 'Edit' },
        { label: 'Test' }];
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
            Automatic truncation is used as a basis when middle items are hidden due to lack of free space.
        </div>

        <example-breadcrumbs class="layout-margin-bottom-l" [style.width.px]="320" />
        <div class="example-description layout-margin-bottom-3xl">
            If space becomes even smaller, the leftmost breadcrumb level is also hidden, leaving only the rightmost
            level visible.
        </div>

        <example-breadcrumbs class="layout-margin-bottom-l" [style.width.px]="137" />
        <div class="example-description layout-margin-bottom-3xl">
            Next, breadcrumbs can only reduce in size when the visible item's name is trimmed to 3 characters.
        </div>
    `,
    styles: `
        .example-description {
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    imports: [ExampleBreadcrumbs],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsWithAutoWrapAdaptiveExample {}
