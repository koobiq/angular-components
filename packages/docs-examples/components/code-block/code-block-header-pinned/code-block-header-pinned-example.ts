import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Code block header pinned
 */
@Component({
    selector: 'code-block-header-pinned-example',
    imports: [
        KbqCodeBlockModule,
        KbqToggleModule,
        KbqIcon,
        FormsModule
    ],
    template: `
        <kbq-code-block
            canToggleSoftWrap
            canDownload
            lineNumbers
            filled
            [files]="files"
            [softWrap]="true"
            [hideTabs]="false"
        >
            <ng-template let-file let-fallback="fallbackFileName" kbqCodeBlockTabLinkContent>data</ng-template>
        </kbq-code-block>

        <kbq-code-block canToggleSoftWrap canDownload lineNumbers [softWrap]="true" [files]="files" [hideTabs]="false">
            <ng-template let-file let-fallback="fallbackFileName" kbqCodeBlockTabLinkContent>
                <i kbq-icon="kbq-diamond_16" class="layout-margin-right-xs"></i>
                <span class="kbq-caps-normal-strong">
                    {{ file.language || fallback }}
                </span>
            </ng-template>
        </kbq-code-block>
    `,
    styles: `
        .kbq-code-block {
            height: 350px;
            &:first-of-type {
                margin-bottom: var(--kbq-size-xs);
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockHeaderPinnedExample {
    readonly files: KbqCodeBlockFile[] = [
        {
            language: 'json',
            content: `{
  "data": [{
    "id": "1",
    "attributes": {
      "title": "JSON:API paints my hyper-super-duper mighty bikeshed!",
      "body": "The shortest article. Ever."
    },
    "relationships": {
      "author": {
        "data": {"id": "42", "type": "people"}
      }
    }
  }],
  "included": [
    {
      "type": "people",
      "id": "42",
      "attributes": {
        "name": "John"
      }
    }
  ]
}`
        }
    ];
}
