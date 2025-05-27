import { NgModule } from '@angular/core';
import { FilesizeFormatterOverviewExample } from './filesize-formatter-overview/filesize-formatter-overview-example';
import { FilesizeFormatterTableNumberExample } from './filesize-formatter-table-number/filesize-formatter-table-number-example';

export { FilesizeFormatterOverviewExample, FilesizeFormatterTableNumberExample };

const EXAMPLES = [
    FilesizeFormatterOverviewExample,
    FilesizeFormatterTableNumberExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class FilesizeFormatterExamplesModule {}
