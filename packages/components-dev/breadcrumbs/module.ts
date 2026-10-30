import {
    afterRenderEffect,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    signal,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { KbqBreadcrumbsModule, KbqBreadcrumbsWrapMode } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { BreadcrumbsExamplesModule } from '../../docs-examples/components/breadcrumbs';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-breadcrumbs-item-count',
    imports: [
        FormsModule,
        KbqBreadcrumbsModule,
        KbqButtonModule,
        KbqButtonToggleModule,
        KbqCheckboxModule
    ],
    template: `
        <div class="dev-breadcrumbs-item-count__controls">
            <button kbq-button [disabled]="count() === 1" (click)="count.set(count() - 1)">−</button>
            <span>{{ count() }}</span>
            <button kbq-button [disabled]="count() === items.length" (click)="count.set(count() + 1)">+</button>
            <kbq-checkbox [(ngModel)]="firstItemNegativeMargin">firstItemNegativeMargin</kbq-checkbox>
            <kbq-button-toggle-group [(ngModel)]="wrapMode">
                <kbq-button-toggle value="auto">auto</kbq-button-toggle>
                <kbq-button-toggle value="wrap">wrap</kbq-button-toggle>
                <kbq-button-toggle value="none">none</kbq-button-toggle>
            </kbq-button-toggle-group>
        </div>

        <div #stage class="dev-breadcrumbs-item-count__stage">
            <nav kbq-breadcrumbs [firstItemNegativeMargin]="firstItemNegativeMargin()" [wrapMode]="wrapMode()">
                @for (item of items.slice(0, count()); track item) {
                    <kbq-breadcrumb-item [text]="item" />
                }
            </nav>
            <h1 #title class="kbq-title">Page title</h1>
        </div>

        <code>first item left: {{ firstItemLeft() }}px, title top: {{ titleTop() }}px</code>
    `,
    styles: `
        .dev-breadcrumbs-item-count__controls {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-m);
            margin-bottom: var(--kbq-size-m);
        }

        .dev-breadcrumbs-item-count__stage {
            margin-left: var(--kbq-size-l);
            border-left: 1px dashed var(--kbq-line-contrast-less);
        }

        .dev-breadcrumbs-item-count__stage .kbq-title {
            margin: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevBreadcrumbsItemCount {
    protected readonly items = ['Home', 'Products', 'Laptops', 'Ultrabooks', 'Model X', 'Specifications'];
    protected readonly count = signal(1);
    protected readonly firstItemNegativeMargin = signal(true);
    protected readonly wrapMode = signal<KbqBreadcrumbsWrapMode>('auto');
    protected readonly firstItemLeft = signal(0);
    protected readonly titleTop = signal(0);

    private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
    private readonly title = viewChild.required<ElementRef<HTMLElement>>('title');

    constructor() {
        afterRenderEffect(() => {
            this.count();
            this.firstItemNegativeMargin();
            this.wrapMode();

            const stage = this.stage().nativeElement.getBoundingClientRect();
            const firstItem = this.stage().nativeElement.querySelector('.kbq-breadcrumb-item');

            this.firstItemLeft.set(firstItem ? firstItem.getBoundingClientRect().left - stage.left : 0);
            this.titleTop.set(this.title().nativeElement.getBoundingClientRect().top - stage.top);
        });
    }
}

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
        <breadcrumbs-selectable-text-example />
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
    imports: [RouterOutlet, RouterLink, DevDocsExamples, DevThemeToggle, DevBreadcrumbsItemCount],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
