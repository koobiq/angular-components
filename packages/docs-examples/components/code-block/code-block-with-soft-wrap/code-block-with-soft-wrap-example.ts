import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Code-block with softWrap attribute
 */
@Component({
    standalone: true,
    selector: 'code-block-with-soft-wrap-example',
    imports: [
        KbqCodeBlockModule,
        KbqToggleModule,
        FormsModule
    ],
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="softWrap">Word wrap</kbq-toggle>
        <kbq-code-block canToggleSoftWrap lineNumbers [files]="files" [(softWrap)]="softWrap" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockWithSoftWrapExample {
    readonly files: KbqCodeBlockFile[] = [
        {
            content: `[\n\t{\n\t\t"name": "Cross-site scripting",\n\t\t"abbreviation": "XSS",\n\t\t"description": "Cross-site scripting (XSS) is a type of security vulnerability that can be found in some web applications. XSS attacks enable attackers to inject client-side scripts into web pages viewed by other users. A cross-site scripting vulnerability may be used by attackers to bypass access controls such as the same-origin policy. During the second half of 2007, XSSed documented 11,253 site-specific cross-site vulnerabilities, compared to 2,134 \"traditional\" vulnerabilities documented by Symantec. XSS effects vary in range from petty nuisance to significant security risk, depending on the sensitivity of the data handled by the vulnerable site and the nature of any security mitigation implemented by the site's owner network."\n\t}\n]`,
            language: 'json'
        }
    ];

    softWrap: boolean = false;
}
