import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CLASS_PREFIX } from '@koobiq/components/markdown';

/** GitHub "new issue" URL surfaced when a document fails to load. */
export const DOCS_GITHUB_ISSUE_URL = 'https://github.com/koobiq/angular-components/issues/new';

/**
 * Class `tools/api-gen` puts on the `<pre>` code blocks of the API documents. Derived from the markdown
 * `CLASS_PREFIX` so a prefix change stays in sync instead of silently breaking the DOM queries that consume it.
 */
export const DOCS_MARKDOWN_PRE_CLASS = `${CLASS_PREFIX}__pre`;

/**
 * Heading classes of the compiled pages (`tools/docs-pages`) and the API documents (`tools/api-gen`), ordered
 * by depth (h2, h3, h4, h5). The anchor level is the index of the heading's class within this list.
 */
export const DOCS_MARKDOWN_HEADING_CLASSES: string[] = [2, 3, 4, 5].map((depth) => `${CLASS_PREFIX}__h${depth}`);

/** Escapes text so interpolated values cannot break out of an HTML string built for bypassed rendering. */
export function docsEscapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Builds the "failed to load document" HTML. The dynamic `url`/`statusText` are HTML-escaped so a
 * future refactor that makes them attacker-controlled cannot reintroduce an XSS sink through the
 * surrounding `bypassSecurityTrustHtml`.
 */
export function docsBuildDocumentErrorHtml(url: string, statusText: string, isRuLocale: boolean): string {
    const safeUrl = docsEscapeHtml(url);
    const safeStatus = docsEscapeHtml(statusText ?? '');

    return isRuLocale
        ? `Не удалось загрузить документ: ${safeUrl}. Ошибка: ${safeStatus}. <a href="${DOCS_GITHUB_ISSUE_URL}" class="kbq-markdown__a">Создать issue</a>`
        : `Failed to load document: ${safeUrl}. Error: ${safeStatus}. <a href="${DOCS_GITHUB_ISSUE_URL}" class="kbq-markdown__a">Create issue</a>`;
}

/**
 * Rewrites relative `href="#fragment"` links to absolute fragment URLs anchored at the current
 * path, so they do not redirect to `/#fragment`.
 */
export function docsRewriteFragmentUrls(rawDocument: string, sanitizer: DomSanitizer, pathname: string): string {
    return rawDocument.replace(/href="#([^"]*)"/g, (match: string, fragmentUrl: string) => {
        const absoluteUrl = `${pathname}#${fragmentUrl}`;
        const safeUrl = sanitizer.sanitize(SecurityContext.URL, absoluteUrl);

        // If sanitization strips the URL (null), keep the original relative link instead of href="null".
        return safeUrl ? `href="${safeUrl}"` : match;
    });
}

/**
 * Markup the migration step transform (`tools/markdown-to-html/migration`) adds to the migration
 * guide. Declared here, next to the other renderer-emitted names, so the build-time contract and
 * the DOM queries that consume it cannot drift apart.
 */
export const DOCS_MIGRATION_STEP_SELECTOR = '.docs-migration-step';

/** The upgrade plan and the closing note — shown unless the picked range holds no step at all. */
export const DOCS_MIGRATION_FRAMING_SELECTOR = '.docs-migration-framing';

/** Attribute naming the release a step lands in. */
export const DOCS_MIGRATION_VERSION_ATTR = 'data-docs-migration-version';

/** Attribute carrying a step's ordinal, on the step itself and on its upgrade-plan list item. */
export const DOCS_MIGRATION_STEP_ATTR = 'data-docs-migration-step';

/**
 * Marks the guide's own title, which names the release the whole document starts from. The filtered
 * page drops it once the reader starts somewhere later.
 */
export const DOCS_MIGRATION_TITLE_ATTR = 'data-docs-migration-title';
