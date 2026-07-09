import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/** GitHub "new issue" URL surfaced when a document fails to load. */
export const DOCS_GITHUB_ISSUE_URL = 'https://github.com/koobiq/angular-components/issues/new';

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
    return rawDocument.replace(/href="#([^"]*)"/g, (_m: string, fragmentUrl: string) => {
        const absoluteUrl = `${pathname}#${fragmentUrl}`;

        return `href="${sanitizer.sanitize(SecurityContext.URL, absoluteUrl)}"`;
    });
}
