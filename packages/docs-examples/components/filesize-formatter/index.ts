import { NgModule } from '@angular/core';
import { FilesizeFormatterOverviewExample } from './filesize-formatter-overview/filesize-formatter-overview-example';

export { FilesizeFormatterOverviewExample };

const EXAMPLES = [
    FilesizeFormatterOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class FilesizeFormatterExamplesModule {}
