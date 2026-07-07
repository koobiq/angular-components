import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { KbqFlagShape } from '@koobiq/components/flag';
import * as flags1x1 from 'country-flag-icons/string/1x1';
import * as flags3x2 from 'country-flag-icons/string/3x2';

type FlagStringMap = Record<string, string>;

/**
 * Resolves an ISO country code to a flag image `src` (an SVG data URL) from `country-flag-icons`,
 * ready to be projected into `<kbq-flag>` as `<img [src]="code | flagSrc" alt="" />`.
 *
 * `square`/`circle` shapes use the 1:1 (square) source, the rest use the default 3:2 source.
 * Returns `null` for unknown codes so the caller can render a placeholder instead.
 */
@Pipe({ name: 'flagSrc' })
export class FlagSrcPipe implements PipeTransform {
    private readonly sanitizer = inject(DomSanitizer);

    transform(code: string, shape: KbqFlagShape = 'rectangle'): SafeUrl | null {
        const source = shape === 'rectangle' ? (flags3x2 as FlagStringMap) : (flags1x1 as FlagStringMap);
        // Barrel exports use underscores for subdivision codes (e.g. GB-ENG → GB_ENG).
        const key = code.toUpperCase().replace(/-/g, '_');
        const svg = source[key];

        if (!svg) {
            return null;
        }

        return this.sanitizer.bypassSecurityTrustUrl(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
    }
}
