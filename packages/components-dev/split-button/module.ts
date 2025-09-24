import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';
import { SplitButtonExamplesModule } from '../../docs-examples/components/split-button';

@Component({
    standalone: true,
    imports: [SplitButtonExamplesModule],
    selector: 'dev-examples',
    template: `
        <!--        <split-button-overview-example />-->
        <!--        <br />-->
        <!--        <split-button-styles-example />-->
        <!--        <br />-->
        <!--        <split-button-content-example />-->
        <!--        <br />-->
        <!--        <split-button-text-overflow-example />-->
        <!--        <br />-->
        <!--        <split-button-disabled-state-example />-->
        <!--        <br />-->
        <!--        <split-button-progress-state-example />-->
        <br />
        <split-button-menu-width-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [
        KbqLocaleServiceModule,
        KbqSplitButtonModule,
        DevExamples,
        FormsModule,
        KbqButtonModule
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    search: string;
}
