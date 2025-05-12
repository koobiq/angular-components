import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqMarkdownModule, KbqMarkdownService } from 'packages/components/markdown';

@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'dev-inline-template-markdown',
    // prettier-ignore
    template: `
<kbq-markdown ngPreserveWhitespaces>
# H1

## H2

### H3

#### H4

##### H5

###### H6

**bold text**

_italic text_

> blockquote

1. First item
2. Second item
3. Third item

-   First item
-   Second item
-   Third item

\`inline code\`

---

[title](https://www.koobiq.io)

![](https://koobiq.io/assets/images/koobiq-illustration-wip.png)

![With caption text](https://koobiq.io/assets/images/koobiq-illustration-wip.png)
_Image caption text_

| Syntax    | Description | Left-aligned | Center-aligned | Right-aligned |
| --------- | ----------- | :----------- | :------------: | ------------: |
| Header    | Title       | git status   |   git status   |    git status |
| Paragraph | Text        | git diff     |    git diff    |      git diff |

\`\`\`bash
npm install jquery
\`\`\`
</kbq-markdown>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevInlineTemplateMarkdown {}

@Component({
    standalone: true,
    imports: [KbqMarkdownModule, DevInlineTemplateMarkdown],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {
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

    constructor(readonly markdownService: KbqMarkdownService) {
        this.parsedByService = markdownService.parseToHtml(this.markdownText);
    }
}
