import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    InjectionToken,
    input,
    Signal,
    ViewEncapsulation
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Params, RouterLink } from '@angular/router';
import { KbqBadge } from '@koobiq/components/badge';
import { KbqCodeBlock, KbqCodeBlockFile } from '@koobiq/components/code-block';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { DOCS_API_MEMBER_PARAM, DOCS_API_WITHOUT_MEMBER } from '../../constants/api-page';
import { DocsLocale } from '../../constants/locale';
import { DocsClipboardService } from '../../services/clipboard';
import { docsTranslateTemplate } from '../../services/i18n';
import { DocsLocaleState } from '../../services/locale';
import {
    DocsApiBlock,
    DocsApiEntryPoint,
    DocsApiMember,
    DocsApiParam,
    DocsApiReturns,
    DocsApiTypePart
} from './api-page.types';

/** The locale of the interface, which the links of the tab carry: one signal for the page, not one for each link. */
const DOCS_API_LOCALE = new InjectionToken<Signal<DocsLocale>>('DOCS_API_LOCALE');

/** Whether a click opens its link in a new tab or window, which the router leaves to the browser. */
const opensElsewhere = ({ button, ctrlKey, metaKey, shiftKey, altKey }: MouseEvent): boolean =>
    button !== 0 || ctrlKey || metaKey || shiftKey || altKey;

/**
 * Holds the place of a code block until the block renders. On a tab reached in the app the blocks render as they come
 * into view, and the page has to be as tall before a block renders as after, or a link to a heading below it would
 * land off its heading. The block's own classes lay the placeholder out, down to the table the line numbers plugin
 * wraps a file of several lines in; a file of one line stays text, as the plugin leaves it. Never rendered on the
 * server, which renders the block itself.
 */
@Component({
    selector: 'docs-api-code-placeholder',
    template: `
        <div class="kbq-code-block__main kbq-scrollbar-viewport_native-scrollbar-hidden">
            @if (lines().length > 1) {
                <pre
                    class="kbq-code-block__pre"
                ><code class="hljs kbq-code-block__code"><table class="hljs-ln"><tbody>@for (line of lines(); track $index) {<tr><td class="hljs-ln-line hljs-ln-code">{{ line }}</td></tr>}</tbody></table></code></pre>
            } @else {
                <pre class="kbq-code-block__pre"><code class="hljs kbq-code-block__code">{{ code() }}</code></pre>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'docs-code-block kbq-code-block kbq-code-block_hide-tabs kbq-code-block_hide-line-numbers',
        '[class.kbq-code-block_filled]': 'filled()',
        '[class.kbq-code-block_no-border]': 'filled()',
        '[class.kbq-code-block_outline]': '!filled()'
    }
})
export class DocsApiCodePlaceholder {
    readonly code = input.required<string>();
    /** Whether the block is filled, as the blocks of JSDoc are, rather than outlined, as a signature is. */
    readonly filled = input(false, { transform: booleanAttribute });

    /** The lines of the code, a last line of whitespace alone dropped, as the plugin drops it. */
    protected readonly lines = computed(() => {
        const lines = this.code().split(/\r\n|\r|\n/);

        if (lines[lines.length - 1].trim() === '') lines.pop();

        return lines;
    });
}

/** JSDoc text: the HTML compiled from its Markdown, and the code in between, highlighted. */
@Component({
    selector: 'docs-api-text',
    imports: [KbqCodeBlock, DocsApiCodePlaceholder],
    template: `
        @for (block of renderedBlocks(); track $index) {
            @if (block.type === 'code') {
                <!-- Triggered like the other code blocks of the API tab: see its template. -->
                @defer (on viewport; hydrate on hover) {
                    <kbq-code-block
                        class="docs-code-block"
                        filled
                        [files]="[{ content: block.code, language: block.language }]"
                    />
                } @placeholder {
                    <docs-api-code-placeholder filled [code]="block.code" />
                }
            } @else {
                <div [innerHTML]="block.html"></div>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'docs-api__text' }
})
export class DocsApiText {
    readonly blocks = input.required<DocsApiBlock[]>();

    private readonly sanitizer = inject(DomSanitizer);

    // The HTML is compiled from the JSDoc of the repository at build time, so it is trusted rather than sanitized: the
    // sanitizer would drop the `data-docsearch-*` attributes the search crawler reads the text by.
    protected readonly renderedBlocks = computed(() =>
        this.blocks().map((block) =>
            block.type === 'code' ? block : { ...block, html: this.sanitizer.bypassSecurityTrustHtml(block.html) }
        )
    );
}

/**
 * A type, the names of the entries documented on an API tab in it linked to their sections. Each piece of text is an
 * `ng-container` of its own: the whitespace of the template around it is then dropped, not kept as a space in the type.
 */
@Component({
    selector: 'docs-api-type',
    imports: [RouterLink, KbqLink],
    template: `
        @for (part of parts(); track $index) {
            @if (!part.link) {
                <ng-container>{{ part.text }}</ng-container>
            } @else if (part.link.page) {
                <a kbqLink underline="none" [fragment]="part.text" [routerLink]="getTabPath(part.link.page)">
                    <ng-container>{{ part.text }}</ng-container>
                </a>
            } @else {
                <a
                    kbqLink
                    underline="none"
                    queryParamsHandling="merge"
                    [fragment]="part.text"
                    [queryParams]="withoutMember"
                    [routerLink]="[]"
                    (click)="scrollToSection(part.text, $event)"
                >
                    <ng-container>{{ part.text }}</ng-container>
                </a>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DocsApiType {
    readonly parts = input.required<DocsApiTypePart[]>();

    protected readonly withoutMember = DOCS_API_WITHOUT_MEMBER;

    private readonly locale = inject(DOCS_API_LOCALE);
    private readonly document = inject(DOCUMENT);

    /** The path of another API tab, in the locale of the interface. */
    protected getTabPath(page: string): string {
        return `/${this.locale()}/${page}`;
    }

    /**
     * Scrolls to a section of this tab the way the list of its sections does: the router only sets the fragment. A
     * click that opens the link in a new tab or window leaves this one where it is.
     */
    protected scrollToSection(id: string, event: MouseEvent): void {
        if (!opensElsewhere(event)) this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * The link to a section of the tab — a group, an entry or a member — as an icon beside its name: it puts the address of
 * the section in the URL, a member through the query and highlighted, a heading through the fragment, and copies it.
 * The page stays where the reader is; one opened at that address scrolls to the section. The link is named by its
 * text rather than `aria-label`: a tooltip repeating the text of its trigger is not announced twice.
 */
@Component({
    selector: 'docs-api-link',
    imports: [RouterLink, KbqIcon, KbqTooltipTrigger],
    template: `
        <a
            #link
            class="docs-api__link"
            queryParamsHandling="merge"
            [attr.lang]="locale()"
            [fragment]="heading()"
            [kbqTooltip]="label()"
            [queryParams]="queryParams()"
            [routerLink]="[]"
            (click)="follow(link, $event)"
        >
            <i aria-hidden="true" color="contrast" kbq-icon="kbq-link_16"></i>
            <span class="cdk-visually-hidden">{{ label() }}</span>
        </a>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DocsApiLink {
    /** What the link leads to, as its label names it. */
    readonly name = input.required<string>();
    /** The id of the member the link selects. */
    readonly member = input<string>();
    /** The id of the heading the link leads to. */
    readonly heading = input<string>();

    protected readonly locale = inject(DOCS_API_LOCALE);

    /** The name of the link, in the language of the interface rather than of the JSDoc. */
    protected readonly label = computed(() => docsTranslateTemplate('apiCopyLink', this.locale(), this.name()));

    protected readonly queryParams = computed((): Params => {
        const member = this.member();

        return member ? { [DOCS_API_MEMBER_PARAM]: member } : DOCS_API_WITHOUT_MEMBER;
    });

    private readonly clipboard = inject(DocsClipboardService);

    protected follow(link: HTMLAnchorElement, event: MouseEvent): void {
        if (!opensElsewhere(event)) this.clipboard.copyWithToast(link.href);
    }
}

/** The parameters of a function or a method and the value it returns, laid out alike. */
@Component({
    selector: 'docs-api-call',
    imports: [DocsApiText, DocsApiType],
    template: `
        @if (params(); as params) {
            <div class="docs-api__note-title">Parameters</div>
            <dl class="docs-api__params">
                @for (param of params; track param.name) {
                    <div class="docs-api__param">
                        <dt>
                            <code class="docs-api__term-name">{{ param.name }}</code>
                            <code class="docs-api__term-type"><docs-api-type [parts]="param.type" /></code>
                        </dt>
                        <dd><docs-api-text [blocks]="param.description" /></dd>
                    </div>
                }
            </dl>
        }

        @if (returns(); as returns) {
            <div class="docs-api__note-title">Returns</div>
            <dl class="docs-api__params">
                <div class="docs-api__param">
                    <dt>
                        <code class="docs-api__term-type"><docs-api-type [parts]="returns.type" /></code>
                    </dt>
                    <dd><docs-api-text [blocks]="returns.description" /></dd>
                </div>
            </dl>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'docs-api__call' }
})
export class DocsApiCall {
    readonly params = input<DocsApiParam[]>();
    readonly returns = input<DocsApiReturns>();
}

/** Kinds a template uses directly; their badge is set apart from the plain TypeScript ones. */
const TEMPLATE_KINDS = new Set(['component', 'directive', 'pipe']);

/**
 * The API tab of an entry point: each entry with its signature and the members worth explaining, rendered
 * from the data `tools/api-gen` writes.
 */
@Component({
    selector: 'docs-api-page',
    imports: [KbqBadge, KbqCodeBlock, DocsApiCodePlaceholder, DocsApiText, DocsApiCall, DocsApiLink, DocsApiType],
    templateUrl: './api-page.html',
    providers: [{ provide: DOCS_API_LOCALE, useFactory: () => inject(DocsApiPage).locale }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-page kbq-markdown docs-api',
        // JSDoc is English, and the `ru` locale shows the same page: say so to a screen reader.
        lang: 'en'
    }
})
export class DocsApiPage extends DocsLocaleState {
    readonly entryPoint = input.required<DocsApiEntryPoint>();
    /** The id of the member a link points at, which the page highlights. */
    readonly selectedMember = input<string | null>(null);

    /** Whether the entries are under the headings of their groups: a tab of one group has none. */
    protected readonly isGrouped = computed(() => this.entryPoint().groups.length > 1);

    /** The import line above the entries: a code block like the signatures below it. */
    protected readonly importFiles = computed((): KbqCodeBlockFile[] => {
        const { path, primaryExport } = this.entryPoint();

        return primaryExport
            ? [{ content: `import { ${primaryExport} } from '${path}';`, language: 'typescript' }]
            : [];
    });

    protected getKindColor(kind: string): string {
        return TEMPLATE_KINDS.has(kind) ? 'fade-theme' : 'fade-contrast';
    }

    /** Whether a member has more than its name and type to show, below them. */
    protected hasDetails({ description, deprecated, examples, params, returns }: DocsApiMember): boolean {
        return !!(description || deprecated?.reason || examples || params || returns);
    }
}
