import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
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
            <button
                kbq-button
                class="docs-next-page-actions__copy"
                color="contrast"
                kbqStyle="transparent"
                (click)="copy()"
            >
                <i kbq-icon="" kbqButtonPrefix [class]="copied() ? 'kbq-check_16' : 'kbq-square-multiple-o_16'"></i>
                {{ copied() ? state.t('copied') : state.t('copyPage') }}
            </button>
            @if (githubUrl(); as url) {
                <a
                    kbq-button
                    class="kbq-button-icon docs-next-page-actions__github"
                    color="contrast"
                    kbqStyle="transparent"
                    rel="noopener noreferrer"
                    target="_blank"
                    [attr.aria-label]="state.t('codeOnGithub')"
                    [href]="url"
                >
                    <i kbq-icon="kbq-github_16"></i>
                </a>
            }
            <button
                kbq-button
                class="kbq-button-icon docs-next-page-actions__more"
                color="contrast"
                kbqStyle="transparent"
                [attr.aria-label]="state.t('pageActions')"
                [kbqDropdownTriggerFor]="menu"
            >
                <i kbq-icon="kbq-ellipsis-vertical_16"></i>
            </button>
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

        /* Figma: Actions (126:24337), 2px apart. Beside the tabs the order is "Copy", GitHub, the menu; without them
           "Copy" and the menu stand on the left and GitHub on the right edge (126:23395). */
        :host {
            display: inline-flex;
            align-items: center;
            gap: var(--kbq-size-3xs);
        }

        :host(.docs-next-page-actions_without-tabs) {
            display: flex;
        }

        /* The library draws the keyboard focus as a border and a round outline outside it, which part ways on the
           rounded corners into two rings. One ring of the same 2px is drawn on the border instead. */
        :is(.kbq-button, .kbq-button-icon).kbq-button_transparent.kbq-contrast.cdk-keyboard-focused:not(.kbq-disabled) {
            outline: none;
            box-shadow: inset 0 0 0 1px var(--kbq-states-line-focus-theme);
        }

        .docs-next-page-actions__copy {
            order: 1;
        }

        .docs-next-page-actions__github {
            order: 2;
        }

        .docs-next-page-actions__more {
            order: 3;
        }

        :host(.docs-next-page-actions_without-tabs) .docs-next-page-actions__more {
            order: 2;
        }

        :host(.docs-next-page-actions_without-tabs) .docs-next-page-actions__github {
            order: 3;
            margin-left: auto;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { '[class.docs-next-page-actions_without-tabs]': '!withTabs()' }
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
    /** Whether the tabs stand in the same row, which puts the actions to their right. */
    readonly withTabs = input(false);

    protected readonly copied = signal(false);
    private resetTimer?: ReturnType<typeof setTimeout>;

    constructor() {
        inject(DestroyRef).onDestroy(() => clearTimeout(this.resetTimer));
    }

    protected async copy(): Promise<void> {
        const clipboard = this.window.navigator.clipboard;

        if (!clipboard) return;

        try {
            await clipboard.writeText(this.source().innerText);
        } catch {
            // The browser refused the clipboard, so there is nothing to confirm.
            return;
        }

        this.copied.set(true);
        clearTimeout(this.resetTimer);
        this.resetTimer = setTimeout(() => this.copied.set(false), 2000);
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
