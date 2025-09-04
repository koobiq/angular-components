import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAppSwitcherModule } from '@koobiq/components/app-switcher';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIcon } from '@koobiq/components/icon';
import { PopoverExamplesModule } from 'packages/docs-examples/components/popover';

@Component({
    standalone: true,
    imports: [PopoverExamplesModule, KbqButtonModule, KbqIcon],
    selector: 'dev-examples',
    template: `
        <button kbq-button kbqAppSwitcher>
            <i kbq-icon="kbq-bento-menu_16"></i>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DevExamples {}

@Component({
    standalone: true,
    selector: 'dev-app',
    styleUrls: ['./styles.scss'],
    templateUrl: './template.html',
    imports: [
        A11yModule,
        FormsModule,
        KbqAppSwitcherModule,
        DevExamples
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
