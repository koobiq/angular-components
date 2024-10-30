import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/** Pipes which convert HTML to SafeHtml. */
@Pipe({
    standalone: true,
    name: 'kbqSafeHtml'
})
export class KbqSafeHtmlPipe implements PipeTransform {
    private readonly sanitizer = inject(DomSanitizer);

    transform(html: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
