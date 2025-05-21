import { Component } from '@angular/core';
import { KbqDataSizePipe } from '@koobiq/components/core';

/**
 * @title Filesize formatter
 */
@Component({
    standalone: true,
    selector: 'filesize-formatter-overview-example',
    imports: [
        KbqDataSizePipe
    ],
    template: `
        {{ 1234 | kbqDataSize: undefined : 'IEC' : 'pt-BR' }}
    `
})
export class FilesizeFormatterOverviewExample {}
