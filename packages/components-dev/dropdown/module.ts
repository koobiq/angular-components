import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqOptionModule } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTitleModule } from '@koobiq/components/title';
import {
    DropdownDisabledExample,
    DropdownLazyloadDataExample,
    DropdownNavigationWrapExample,
    DropdownNestedExample,
    DropdownOpenByArrowDownExample,
    DropdownOverviewExample,
    DropdownRecursiveTemplateExample,
    DropdownWithFilterExample
} from 'packages/docs-examples/components/dropdown';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        DropdownNestedExample,
        DropdownOverviewExample,
        DropdownNavigationWrapExample,
        DropdownDisabledExample,
        DropdownLazyloadDataExample,
        DropdownOpenByArrowDownExample,
        DropdownRecursiveTemplateExample,
        DropdownWithFilterExample
    ],
    template: `
        <dropdown-with-filter-example />
        <hr />

        <dropdown-nested-example />
        <hr />

        <dropdown-disabled-example />
        <hr />

        <dropdown-lazyload-data-example />
        <hr />

        <dropdown-navigation-wrap-example />
        <hr />

        <dropdown-open-by-arrow-down-example />
        <hr />

        <dropdown-overview-example />
        <hr />

        <dropdown-recursive-template-example />
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        FormsModule,
        KbqLinkModule,
        KbqIconModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqTitleModule,
        KbqDividerModule,
        KbqOptionModule,
        DevThemeToggle,
        DevDocsExamples
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    colors = KbqComponentColors;
    styles = KbqButtonStyles;

    pools = [
        {
            id: 1,
            name: 'x',
            domains: [
                { id: 10, name: 'ax' },
                { id: 11, name: 'bx' }
            ]
        },
        {
            id: 2,
            name: 'y',
            domains: [
                { id: 20, name: 'ay' },
                { id: 21, name: 'by' }
            ]
        },
        {
            id: 3,
            name: 'z',
            domains: [
                { id: 30, name: 'az' },
                { id: 31, name: 'bz' }
            ]
        }
    ];

    someValue = 'Lazy Value';

    selectDomain(id: string): void {
        console.log('selected domain id', id);
    }
}
