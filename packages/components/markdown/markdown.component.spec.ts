import { ChangeDetectionStrategy, Component, DebugElement, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqMarkdown, KbqMarkdownModule } from '@koobiq/components/markdown';

const createComponent = async <T>(component: Type<T>, providers: any[] = []): Promise<ComponentFixture<T>> => {
    await TestBed.configureTestingModule({ imports: [component], providers }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getMarkdownDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqMarkdown));
};

@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'generate-html-from-markdown-string',
    template: `
        <kbq-markdown [markdownText]="markdownText" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class GenerateHTMLFromMarkdownString {
    readonly markdownText: string = `
# H1

## H2

### H3

#### H4

##### H5

###### H6

**bold text**&#32;&#32;
__bold text__

_italic text_&#32;&#32;
*italic text*

***bold and italic text***&#32;&#32;
___bold and italic text___

> blockquote

1. First item
2. Second item
3. Third item

-   First item
-   Second item
-   Third item

\`inline code\`

First line&#32;&#32;
Second line

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
    `;
}

@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'generate-html-from-markdown-inline-template',
    // prettier-ignore
    template: `
<kbq-markdown ngPreserveWhitespaces>
# H1

## H2

### H3

#### H4

##### H5

###### H6

**bold text**&#32;&#32;
__bold text__

_italic text_&#32;&#32;
*italic text*

***bold and italic text***&#32;&#32;
___bold and italic text___

> blockquote

1. First item
2. Second item
3. Third item

-   First item
-   Second item
-   Third item

\`inline code\`

First line&#32;&#32;
Second line

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
class GenerateHTMLFromMarkdownInlineTemplate {}

describe(KbqMarkdown.name, () => {
    it('should generate html from markdown string', async () => {
        const { debugElement } = await createComponent(GenerateHTMLFromMarkdownString);

        expect(getMarkdownDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should generate html from markdown inline template', async () => {
        const { debugElement } = await createComponent(GenerateHTMLFromMarkdownInlineTemplate);

        expect(getMarkdownDebugElement(debugElement)).toMatchSnapshot();
    });
});
