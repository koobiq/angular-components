import { ChangeDetectionStrategy, Component, InjectionToken, input, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqClampedTextConfig } from './types';

const baseClass = 'kbq-clamped-text';

export const KBQ_CLAMPED_TEXT_CONFIGURATION = new InjectionToken<KbqClampedTextConfig>('KbqInputFileLabel');

@Component({
    selector: 'kbq-clamped-text',
    standalone: true,
    exportAs: 'kbqClampedText',
    imports: [
        KbqIcon,
        KbqButtonModule,
        KbqLinkModule
    ],
    template: `
        <span #text class="kbq-clamped-text__content" [class.kbq-clamped-text__content_hidden]="!innerExpanded()">
            <ng-content />
        </span>

        <span
            class="kbq-clamped-text__toggle"
            kbq-link
            pseudo
            role="link"
            (click)="toggleExpanded()"
            (keydown.enter)="toggleExpanded()"
            (keydown.space)="toggleExpanded()"
        >
            <ng-content select="clamped-text-toggle,[clamped-text-toggle]" />

            @if (innerExpanded()) {
                <i kbq-icon="kbq-chevron-up-s_16"></i>
                {{ config.closeText }}
            } @else {
                <i kbq-icon="kbq-chevron-down-s_16"></i>
                {{ config.openText }}
            }
        </span>
    `,
    styleUrls: ['./clamped-text.scss', './clamped-text-tokens.scss'],
    host: {
        class: baseClass,
        '[attr.aria-expanded]': 'this.innerExpanded().toString()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqClampedText {
    expanded = input(false);
    innerExpanded = signal(this.expanded());

    config: KbqClampedTextConfig = {
        openText: 'Развернуть',
        closeText: 'Свернуть'
    };

    toggleExpanded() {
        this.innerExpanded.update((state) => !state);
    }
}
