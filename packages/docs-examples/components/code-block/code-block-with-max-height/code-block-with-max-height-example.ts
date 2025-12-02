import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Code-block with maxHeight attribute
 */
@Component({
    selector: 'code-block-with-max-height-example',
    imports: [
        KbqCodeBlockModule,
        KbqToggleModule,
        FormsModule
    ],
    template: `
        <kbq-toggle class="layout-margin-bottom-m layout-margin-right-m" [(ngModel)]="viewAll">Show all</kbq-toggle>
        <kbq-toggle [(ngModel)]="filled">Filled</kbq-toggle>

        <kbq-code-block
            canToggleSoftWrap
            maxHeight="200"
            lineNumbers
            [filled]="filled()"
            [files]="files"
            [(viewAll)]="viewAll"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockWithMaxHeightExample {
    readonly files: KbqCodeBlockFile[] = [
        {
            content: `<?xml version="1.0" encoding="UTF-8" ?>\n<vulnerabilities>\n\t<vulnerability>\n\t\t<name>Cross-site scripting</name>\n\t\t<abbreviation>XSS</abbreviation>\n\t\t<description>Cross-site scripting (XSS) is a type of security vulnerability that can be found in some web applications. XSS attacks enable attackers to inject client-side scripts into web pages viewed by other users. A cross-site scripting vulnerability may be used by attackers to bypass access controls such as the same-origin policy. During the second half of 2007, XSSed documented 11,253 site-specific cross-site vulnerabilities, compared to 2,134 "traditional" vulnerabilities documented by Symantec. XSS effects vary in range from petty nuisance to significant security risk, depending on the sensitivity of the data handled by the vulnerable site and the nature of any security mitigation implemented by the site's owner network.</description>\n\t</vulnerability>\n\t<vulnerability>\n\t\t<name>Denial-of-service attack</name>\n\t\t<abbreviation>DoS</abbreviation>\n\t\t<description>In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network. Denial of service is typically accomplished by flooding the targeted machine or resource with superfluous requests in an attempt to overload systems and prevent some or all legitimate requests from being fulfilled. The range of attacks varies widely, spanning from inundating a server with millions of requests to slow its performance, overwhelming a server with a substantial amount of invalid data, to submitting requests with an illegitimate IP address.</description>\n\t</vulnerability>\n<vulnerabilities>`,
            language: 'xml'
        }
    ];

    readonly viewAll = model(false);
    readonly filled = model(false);
}
