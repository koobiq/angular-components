import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

@Component({
    selector: 'e2e-link-states',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <!-- Default Links -->
        <p>
            Text
            <a kbq-link>default link</a>
            text.
        </p>
        <p>
            Text
            <a kbq-link big>big link</a>
            text
        </p>
        <p>
            Text
            <a kbq-link compact>compact link</a>
            text
        </p>

        <!-- Pseudo Links -->
        <p>
            Text
            <span kbq-link pseudo>pseudo link</span>
            text.
        </p>

        <!-- Disabled Links -->
        <p>
            Text
            <a kbq-link [disabled]="true">disabled link</a>
            text.
        </p>
        <p>
            Text
            <span kbq-link pseudo [disabled]="true">disabled pseudo link</span>
            text.
        </p>

        <!-- No Underline -->
        <p>
            Text
            <a kbq-link noUnderline>no underline link</a>
            text.
        </p>

        <!-- External -->
        <p>
            Text
            <a class="kbq-link_external" kbq-link>
                <span class="kbq-link__text">external with icon</span>
                <i kbq-icon="kbq-north-east_16"></i>
            </a>
            text.
        </p>

        <!-- Links with Icons -->
        <p>
            Text
            <a kbq-link>
                <i kbq-icon="kbq-calendar-o_16"></i>
                <span class="kbq-link__text">both icons</span>
                <i kbq-icon="kbq-arrow-right_16"></i>
            </a>
            text.
        </p>
        <p>
            Text
            <a kbq-link compact>
                <i kbq-icon="kbq-calendar-o_16"></i>
                <span class="kbq-link__text">both icons</span>
                <i kbq-icon="kbq-arrow-right_16"></i>
            </a>
            text.
        </p>
        <p>
            Text
            <a kbq-link big>
                <i kbq-icon="kbq-calendar-o_16"></i>
                <span class="kbq-link__text">both icons</span>
                <i kbq-icon="kbq-arrow-right_16"></i>
            </a>
            text.
        </p>

        <!-- Hovered -->
        <p>
            Text
            <a kbq-link class="kbq-hovered">
                <i kbq-icon="kbq-calendar-o_16"></i>
                <span class="kbq-link__text">hovered link</span>
            </a>
            text.
        </p>
        <p>
            Text
            <a kbq-link pseudo class="kbq-hovered">
                <i kbq-icon="kbq-calendar-o_16"></i>
                <span class="kbq-link__text">pseudo hovered</span>
            </a>
            text.
        </p>
        <p>
            Text
            <a kbq-link useVisited class="kbq-hovered kbq-visited">
                <i kbq-icon="kbq-calendar-o_16"></i>
                <span class="kbq-link__text">hovered visited link</span>
            </a>
            text.
        </p>

        <!-- Hovered -->
        <p>
            Text
            <a kbq-link class="kbq-active">
                <i kbq-icon="kbq-calendar-o_16"></i>
                <span class="kbq-link__text">active link</span>
            </a>
            text.
        </p>
        <p>
            Text
            <a kbq-link pseudo class="kbq-active">
                <i kbq-icon="kbq-calendar-o_16"></i>
                <span class="kbq-link__text">pseudo active</span>
            </a>
            text.
        </p>
        <p>
            Text
            <a kbq-link useVisited class="kbq-visited kbq-active">
                <i kbq-icon="kbq-calendar-o_16"></i>
                <span class="kbq-link__text">active visited link</span>
            </a>
            text.
        </p>

        <p>
            Text
            <a kbq-link useVisited class="kbq-visited">
                <i kbq-icon="kbq-calendar-o_16"></i>
                <span class="kbq-link__text">visited link</span>
            </a>
            text.
        </p>
        <p>
            Text
            <a kbq-link useVisited pseudo class="kbq-visited">
                <i kbq-icon="kbq-calendar-o_16"></i>
                <span class="kbq-link__text">pseudo visited</span>
            </a>
            text.
        </p>
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(3, 120px);
            gap: var(--kbq-size-xs);
            padding: var(--kbq-size-s);
        }

        p {
            margin: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLinkStates'
    }
})
export class E2eLinkStates {}
