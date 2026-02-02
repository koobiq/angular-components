import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    IconButtonExample,
    IconButtonSizeExample,
    IconButtonStyleExample
} from '../../docs-examples/components/icon-button';

@Component({
    selector: 'dev-examples',
    imports: [
        IconButtonExample,
        IconButtonSizeExample,
        IconButtonStyleExample
    ],
    template: `
        <icon-button-example />
        <hr />
        <icon-button-size-example />
        <hr />
        <icon-button-style-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [KbqIconModule, DevDocsExamples],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    colors = KbqComponentColors;
}
