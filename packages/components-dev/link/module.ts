import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { LinkExamplesModule } from 'packages/docs-examples/components/link';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [LinkExamplesModule],
    selector: 'dev-examples',
    template: `
        <link-application-example />
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [KbqLinkModule, KbqIconModule, DevExamples, DevThemeToggle],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    readonly url = 'http://localhost:3003/';
}
