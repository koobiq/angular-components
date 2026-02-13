import { Pipe, PipeTransform } from '@angular/core';

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as const;
const HTML_SPECIAL_CHARS = /[&<>"']/;
const HTML_SPECIAL_CHARS_GLOBAL = new RegExp(HTML_SPECIAL_CHARS.source, 'g');

export function escapeRegExp(value: string) {
    if (value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    return value;
}

function escapeHtml(value: string): string {
    if (!HTML_SPECIAL_CHARS.test(value)) return value;

    return value.replace(HTML_SPECIAL_CHARS_GLOBAL, (chr) => HTML_ESCAPES[chr] ?? chr);
}

@Pipe({ name: 'mcHighlight' })
export class KbqHighlightPipe implements PipeTransform {
    transform(value: any, args: any): any {
        const escapedValue = escapeHtml(value ?? '');

        if (!args || typeof args !== 'string') return escapedValue;

        return escapedValue.replace(
            new RegExp(`(${escapeRegExp(escapeHtml(args))})`, 'gi'),
            '<mark class="kbq-highlight">$1</mark>'
        );
    }
}
