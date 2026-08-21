import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqTableModule } from '@koobiq/components/table';
import { TableDisableHoverExample, TableStickyHeaderExample } from 'packages/docs-examples/components/table';

@Component({
    selector: 'dev-examples',
    imports: [TableDisableHoverExample, TableStickyHeaderExample],
    template: `
        <table-disable-hover-example />
        <hr />
        <table-sticky-header-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [KbqTableModule, KbqButtonModule, DevDocsExamples],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {
    protected readonly colors = KbqComponentColors;
}
