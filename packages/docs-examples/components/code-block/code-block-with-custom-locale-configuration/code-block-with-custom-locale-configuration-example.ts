import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    KbqCodeBlockFile,
    kbqCodeBlockLocaleConfigurationProvider,
    KbqCodeBlockModule
} from '@koobiq/components/code-block';
import { KBQ_LOCALE_SERVICE } from '@koobiq/components/core';

/**
 * @title Code-block with custom locale configuration, without KBQ_LOCALE_SERVICE
 */
@Component({
    standalone: true,
    selector: 'code-block-with-custom-locale-configuration-example',
    imports: [KbqCodeBlockModule],
    providers: [
        // Disable global KBQ_LOCALE_SERVICE for locale configuration overriding
        { provide: KBQ_LOCALE_SERVICE, useValue: null },
        kbqCodeBlockLocaleConfigurationProvider({
            softWrapOnTooltip: '*CUSTOM* Enable word wrap',
            softWrapOffTooltip: '*CUSTOM* Disable word wrap',
            downloadTooltip: '*CUSTOM* Download',
            copiedTooltip: '*CUSTOM* ✓ Copied',
            copyTooltip: '*CUSTOM* Copy',
            viewAllText: '*CUSTOM* Show all',
            viewLessText: '*CUSTOM* Show less',
            openExternalSystemTooltip: '*CUSTOM* Open in the external system'
        })
    ],
    template: `
        <kbq-code-block [files]="files" canToggleSoftWrap maxHeight="200" lineNumbers canDownload />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockWithCustomLocaleConfigurationExample {
    readonly files: KbqCodeBlockFile[] = [
        {
            content: `<?xml version="1.0" encoding="UTF-8" ?>\n<vulnerabilities>\n\t<vulnerability>\n\t\t<name>Cross-site scripting</name>\n\t\t<abbreviation>XSS</abbreviation>\n\t\t<description>Cross-site scripting (XSS) is a type of security vulnerability that can be found in some web applications. XSS attacks enable attackers to inject client-side scripts into web pages viewed by other users. A cross-site scripting vulnerability may be used by attackers to bypass access controls such as the same-origin policy. During the second half of 2007, XSSed documented 11,253 site-specific cross-site vulnerabilities, compared to 2,134 "traditional" vulnerabilities documented by Symantec. XSS effects vary in range from petty nuisance to significant security risk, depending on the sensitivity of the data handled by the vulnerable site and the nature of any security mitigation implemented by the site's owner network.</description>\n\t</vulnerability>\n\t<vulnerability>\n\t\t<name>Denial-of-service attack</name>\n\t\t<abbreviation>DoS</abbreviation>\n\t\t<description>In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network. Denial of service is typically accomplished by flooding the targeted machine or resource with superfluous requests in an attempt to overload systems and prevent some or all legitimate requests from being fulfilled. The range of attacks varies widely, spanning from inundating a server with millions of requests to slow its performance, overwhelming a server with a substantial amount of invalid data, to submitting requests with an illegitimate IP address.</description>\n\t</vulnerability>\n<vulnerabilities>`,
            language: 'xml',
            link: 'https://github.com/koobiq/angular-components'
        }
    ];
}
