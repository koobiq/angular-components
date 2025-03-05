import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsConfiguration, KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqSplitterModule } from '@koobiq/components/splitter';
import { BreadcrumbsOverviewExample } from '../breadcrumbs-overview/breadcrumbs-overview-example';

/**
 * @title Breadcrumbs Wrap
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-wrap-example',
    template: `
        <kbq-radio-group [(ngModel)]="wrapMode">
            <kbq-radio-button value="auto">auto</kbq-radio-button>
            <kbq-radio-button value="wrap">wrap</kbq-radio-button>
            <kbq-radio-button value="none">none</kbq-radio-button>
        </kbq-radio-group>

        <kbq-splitter>
            <div class="layout-align-start" kbq-splitter-area>
                <nav [wrapMode]="wrapMode" kbq-breadcrumbs>
                    @for (breadcrumb of breadcrumbs; track breadcrumb; let last = $last) {
                        <kbq-breadcrumb-item
                            [routerLink]="breadcrumb.url"
                            [queryParams]="{ queryParams: 'queryParam' }"
                            [fragment]="'fragment'"
                            [text]="breadcrumb.label"
                        />
                    }
                </nav>
            </div>
            <div class="flex" kbq-splitter-area>hold to resize</div>
        </kbq-splitter>
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbsModule,
        KbqRadioModule,
        FormsModule,
        BreadcrumbsOverviewExample,
        KbqSplitterModule
    ],
    styles: `
        kbq-splitter {
            height: 80px;
        }

        kbq-splitter > [kbq-splitter-area]:first-child {
            overflow-y: auto;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsWrapExample {
    wrapMode: KbqBreadcrumbsConfiguration['wrapMode'] = 'auto';

    breadcrumbs = [
        { label: 'Main', url: '/main' },
        { label: 'Standards', url: '/main/standards' },
        { label: 'Advanced Encryption Standard', url: '/main/standards/advanced-encryption-standard' },
        { label: 'Edit', url: '/main/standards/advanced-encryption-standard/edit' },
        { label: 'Test', url: '/main/standards/advanced-encryption-standard/edit/test' }
    ];
}
