import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { KbqFlagShape } from '@koobiq/components/flag';
import * as flags1x1 from 'country-flag-icons/string/1x1';
import * as flags3x2 from 'country-flag-icons/string/3x2';

type FlagStringMap = Record<string, string>;

/**
 * Resolves an ISO country code to an inline flag SVG from `country-flag-icons`, ready to be
 * projected into `<kbq-flag>` via `[innerHTML]="code | flagSvg"`.
 *
 * `square`/`circle` shapes use the 1:1 (square) source, the rest use the default 3:2 source.
 * Returns `null` for unknown codes so the caller can render a placeholder instead.
 */
@Pipe({ name: 'flagSvg' })
export class FlagSvgPipe implements PipeTransform {
    private readonly sanitizer = inject(DomSanitizer);

    transform(code: string, shape: KbqFlagShape = 'rectangle'): SafeHtml | null {
        const source = shape === 'rectangle' ? (flags3x2 as FlagStringMap) : (flags1x1 as FlagStringMap);
        // Barrel exports use underscores for subdivision codes (e.g. GB-ENG → GB_ENG).
        const key = code.toUpperCase().replace(/-/g, '_');
        const svg = source[key];

        return svg ? this.sanitizer.bypassSecurityTrustHtml(svg) : null;
    }
}
