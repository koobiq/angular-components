import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';
import { firstValueFrom } from 'rxjs';
import { docsGetMarkdownPath } from '../../page-paths';
import { DocsClipboardService } from '../../services/clipboard';
import { DOCS_COPY_PAGE_PROMPTS } from '../../services/i18n';
import { DocsLocaleState } from '../../services/locale';
import { DocsStructureItem } from '../../structure';

/** The Markdown of one item: loading, and once it has loaded, its text. */
type DocsPageMarkdown = { path: string; text: Promise<string>; loaded?: string };

/**
 * Copies the Markdown of a structure item — every tab of it in one file, which `tools/llms` generates — to paste into
 * an AI assistant, and opens it in one: the menu opens the file itself, or a new conversation that points at it.
 */
@Component({
    selector: 'docs-copy-page',
    imports: [
        KbqSplitButtonModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqDividerModule,
        KbqIconModule
    ],
    template: `
        <kbq-split-button kbqStyle="outline" [attr.aria-label]="t('copyPageActions')">
            <button kbq-button (click)="copy()" (focus)="prefetch()" (pointerenter)="prefetch()">
                <i kbq-icon="kbq-square-multiple-o_16"></i>
                {{ t('copyPage') }}
            </button>
            <button kbq-button [attr.aria-label]="t('copyPageMore')" [kbqDropdownTriggerFor]="menu">
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>
        </kbq-split-button>

        <kbq-dropdown #menu="kbqDropdown" xPosition="before">
            <a kbq-dropdown-item target="_blank" rel="noopener noreferrer" [href]="markdownPath()">
                {{ t('viewAsMarkdown') }}
            </a>
            <kbq-divider />
            <a kbq-dropdown-item target="_blank" rel="noopener noreferrer" [href]="claudeUrl()">
                {{ t('openInClaude') }}
            </a>
            <a kbq-dropdown-item [href]="claudeCodeUrl()">{{ t('openInClaudeCode') }}</a>
            <a kbq-dropdown-item [href]="claudeCodeTerminalUrl()">{{ t('openInClaudeCodeTerminal') }}</a>
            <kbq-divider />
            <a kbq-dropdown-item target="_blank" rel="noopener noreferrer" [href]="chatGptUrl()">
                {{ t('openInChatGpt') }}
            </a>
            <a kbq-dropdown-item [href]="codexUrl()">{{ t('openInCodex') }}</a>
            <kbq-divider />
            <a kbq-dropdown-item [href]="cursorUrl()">{{ t('openInCursor') }}</a>
        </kbq-dropdown>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'docs-copy-page'
    }
})
export class DocsCopyPage extends DocsLocaleState {
    /** The structure item whose Markdown the button copies. */
    readonly item = input.required<Pick<DocsStructureItem, 'categoryId' | 'id'>>();

    private readonly http = inject(HttpClient);
    private readonly clipboard = inject(DocsClipboardService);
    private readonly document = inject(DOCUMENT);

    protected readonly markdownPath = computed(() => docsGetMarkdownPath(this.item()));

    // The links of the menu render only once it opens, in the browser, where the page has an origin of its own: the
    // documentation of a pull request or of the next version points at its own files.
    private readonly prompt = (kind: keyof typeof DOCS_COPY_PAGE_PROMPTS): string => {
        const { origin } = this.document.location;

        return encodeURIComponent(
            DOCS_COPY_PAGE_PROMPTS[kind][this.locale()](`${origin}${this.markdownPath()}`, `${origin}/llms.txt`)
        );
    };

    protected readonly claudeUrl = computed(() => `https://claude.ai/new?q=${this.prompt('chat')}`);
    protected readonly chatGptUrl = computed(() => `https://chatgpt.com/?q=${this.prompt('chat')}`);
    /** Claude Desktop opens a new Claude Code session with the prompt filled in; the user picks the folder. */
    protected readonly claudeCodeUrl = computed(() => `claude://code/new?q=${this.prompt('agent')}`);
    /** The Claude Code command-line tool opens in a new terminal window, with the prompt filled in. */
    protected readonly claudeCodeTerminalUrl = computed(() => `claude-cli://open?q=${this.prompt('agent')}`);
    /** The Codex app opens a new chat with the prompt in its composer. */
    protected readonly codexUrl = computed(() => `codex://new?prompt=${this.prompt('agent')}`);
    /** Cursor opens with the prompt filled in its chat. */
    protected readonly cursorUrl = computed(
        () => `cursor://anysphere.cursor-deeplink/prompt?text=${this.prompt('agent')}`
    );

    private markdown: DocsPageMarkdown | null = null;

    /** Starts loading the Markdown as the pointer or the focus reaches the button, so that the click copies it at once. */
    protected prefetch(): void {
        this.load();
    }

    protected copy(): void {
        const { text, loaded } = this.load();

        // A copy of loaded text the browser refused goes the other way, which reports a failure too.
        if (loaded === undefined || !this.clipboard.copyWithToast(loaded)) {
            void this.clipboard.copyLaterWithToast(text, 'copyPageFailed');
        }
    }

    private load(): DocsPageMarkdown {
        const path = this.markdownPath();

        if (this.markdown?.path !== path) {
            const markdown: DocsPageMarkdown = {
                path,
                text: firstValueFrom(this.http.get(path, { responseType: 'text' }))
            };

            markdown.text.then(
                (text) => (markdown.loaded = text),
                // A failed load is tried again on the next attempt instead of failing every copy of the page.
                () => this.markdown === markdown && (this.markdown = null)
            );

            this.markdown = markdown;
        }

        return this.markdown;
    }
}
