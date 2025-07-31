import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';

/**
 * @title Code-block with link
 */
@Component({
    standalone: true,
    selector: 'code-block-with-link-example',
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block lineNumbers canCopy="false" [files]="files" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockWithLinkExample {
    readonly files: KbqCodeBlockFile[] = [
        {
            link: 'https://en.wikipedia.org/wiki/Cross-site_scripting',
            filename: 'vulnerabilities.xml',
            content: `<?xml version="1.0" encoding="UTF-8" ?>\n<vulnerabilities>\n\t<vulnerability>\n\t\t<name>Cross-site scripting</name>\n\t\t<abbreviation>XSS</abbreviation>\n\t\t<description>Cross-site scripting (XSS) is a type of security vulnerability that can be found in some web applications. XSS attacks enable attackers to inject client-side scripts into web pages viewed by other users. A cross-site scripting vulnerability may be used by attackers to bypass access controls such as the same-origin policy. During the second half of 2007, XSSed documented 11,253 site-specific cross-site vulnerabilities, compared to 2,134 "traditional" vulnerabilities documented by Symantec. XSS effects vary in range from petty nuisance to significant security risk, depending on the sensitivity of the data handled by the vulnerable site and the nature of any security mitigation implemented by the site's owner network.</description>\n\t</vulnerability>\n<vulnerabilities>`,
            language: 'xml'
        }
    ];
}
