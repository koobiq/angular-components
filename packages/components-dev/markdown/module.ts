import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KbqMarkdownModule } from '@koobiq/components/markdown';
import { KbqMarkdownService } from 'packages/components/markdown';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['../main.scss', './styles.scss']
})
export class DemoComponent {
    markdownText: string = `
# Foobar

Foobar is a Python library for dealing with word pluralization.

## Installation

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install foobar.

\`\`\`bash
pip install foobar
\`\`\`

## Usage

\`\`\`python
import foobar

# returns 'words'
foobar.pluralize('word')

# returns 'geese'
foobar.pluralize('goose')

# returns 'phenomenon'
foobar.singularize('phenomena')
\`\`\`

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
`;
    parsedByService: string;

    constructor(markdownService: KbqMarkdownService) {
        this.parsedByService = markdownService.parseToHtml(this.markdownText);
    }
}


@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        KbqMarkdownModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
