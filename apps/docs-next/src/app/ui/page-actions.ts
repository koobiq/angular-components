import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { DocsNextSiteState } from '../services/site-state';

/** The MCP server of the docs, as editors install it from a link (packages/mcp). */
const MCP_SERVER = { command: 'npx', args: ['-y', '@koobiq/mcp'] };

/**
 * "Copy" with a menu, like shadcn: view as Markdown, add the docs to an editor, open in ChatGPT or Claude. A component
 * also links its source on GitHub. The Markdown versions of pages come later, so the prototype copies the text of the
 * article (Figma: Right, 83:39960).
 */
@Component({
    selector: 'docs-next-page-actions',
    imports: [KbqButtonModule, KbqDropdownModule, KbqIconModule, KbqLinkModule],
    template: `
        @if (state.isMobile()) {
            <!-- On a phone: one link-styled trigger with the whole menu, no split button. -->
            <button kbqLink pseudo class="docs-next-page-actions__link" type="button" [kbqDropdownTriggerFor]="menu">
                <i kbq-icon="kbq-square-multiple-o_16"></i>
                {{ copied() ? state.t('copied') : state.t('copyPage') }}
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>
        } @else {
            @if (githubUrl(); as url) {
                <a
                    kbq-button
                    class="kbq-button-icon"
                    color="contrast-fade"
                    rel="noopener noreferrer"
                    target="_blank"
                    [attr.aria-label]="state.t('codeOnGithub')"
                    [href]="url"
                >
                    <i kbq-icon="kbq-github_16"></i>
                </a>
            }
            <div class="docs-next-page-actions__group">
                <button kbq-button class="docs-next-page-actions__copy" color="contrast-fade" (click)="copy()">
                    <i kbq-icon="" kbqButtonPrefix [class]="copied() ? 'kbq-check_16' : 'kbq-square-multiple-o_16'"></i>
                    {{ copied() ? state.t('copied') : state.t('copyPage') }}
                </button>
                <button
                    kbq-button
                    class="kbq-button-icon docs-next-page-actions__more"
                    color="contrast-fade"
                    [attr.aria-label]="state.t('pageActions')"
                    [kbqDropdownTriggerFor]="menu"
                >
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </div>
        }

        <kbq-dropdown #menu="kbqDropdown" xPosition="before">
            @if (state.isMobile()) {
                <button kbq-dropdown-item (click)="copy()">{{ state.t('copyPage') }}</button>
            }
            <a kbq-dropdown-item [href]="location.pathname + '.md'">{{ state.t('viewMarkdown') }}</a>
            <a kbq-dropdown-item [href]="cursorUrl">{{ state.t('addToCursor') }}</a>
            <a kbq-dropdown-item [href]="vsCodeUrl">{{ state.t('addToVsCode') }}</a>
            <a
                kbq-dropdown-item
                rel="noopener noreferrer"
                target="_blank"
                [href]="aiUrl('https://chatgpt.com/?hints=search&q=')"
            >
                {{ state.t('openInChatGpt') }}
            </a>
            <a kbq-dropdown-item rel="noopener noreferrer" target="_blank" [href]="aiUrl('https://claude.ai/new?q=')">
                {{ state.t('openInClaude') }}
            </a>
            <!-- On a phone the menu is the only place for the source. -->
            @if (state.isMobile() && githubUrl(); as url) {
                <a kbq-dropdown-item rel="noopener noreferrer" target="_blank" [href]="url">
                    {{ state.t('codeOnGithub') }}
                </a>
            }
        </kbq-dropdown>
    `,
    styles: `
        .docs-next-page-actions__link {
            display: inline-flex;
            align-items: center;
            gap: var(--kbq-size-s);
            padding: 0;
            border: none;
            background: none;
            font-size: var(--kbq-typography-text-normal-font-size);
            line-height: var(--kbq-typography-text-normal-line-height);
            cursor: pointer;
        }

        :host {
            display: inline-flex;
            gap: var(--kbq-size-s);
        }

        .docs-next-page-actions__group {
            display: inline-flex;
        }

        .docs-next-page-actions__copy {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }

        .docs-next-page-actions__more {
            margin-left: 1px;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextPageActions {
    protected readonly state = inject(DocsNextSiteState);
    private readonly window = inject(KBQ_WINDOW);
    protected readonly location = this.window.location;
    private readonly sanitizer = inject(DomSanitizer);

    // Constant links to editors, whose schemes the sanitizer would otherwise turn into `unsafe:`.
    protected readonly cursorUrl = this.sanitizer.bypassSecurityTrustUrl(
        `cursor://anysphere.cursor-deeplink/mcp/install?name=koobiq&config=${this.window.btoa(JSON.stringify(MCP_SERVER))}`
    );
    protected readonly vsCodeUrl = this.sanitizer.bypassSecurityTrustUrl(
        `vscode:mcp/install?${encodeURIComponent(JSON.stringify({ name: 'koobiq', ...MCP_SERVER }))}`
    );

    /** Element whose text the main action copies. */
    readonly source = input.required<HTMLElement>();
    /** Source of a component on GitHub; other pages have none. */
    readonly githubUrl = input<string>();

    protected readonly copied = signal(false);

    protected copy(): void {
        this.window.navigator.clipboard?.writeText(this.source().innerText).then(() => {
            this.copied.set(true);
            setTimeout(() => this.copied.set(false), 2000);
        });
    }

    /** The address of the page and a short request, as shadcn passes them. */
    protected aiUrl(base: string): string {
        const request =
            this.state.locale() === 'ru'
                ? `Прочитай ${this.location.href} и ответь на вопросы по этой странице документации Koobiq.`
                : `Read ${this.location.href} and answer questions about this page of the Koobiq docs.`;

        return base + encodeURIComponent(request);
    }
}
