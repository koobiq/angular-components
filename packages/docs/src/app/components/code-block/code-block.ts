import {
    ChangeDetectionStrategy,
    Component,
    Input,
    ViewEncapsulation
} from '@angular/core';


@Component({
    selector: 'code-block',
    templateUrl: 'code-block.html',
    styleUrls: ['code-block.scss'],
    host: {
        class: 'code-block'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CodeBlock {
    isSourceShown: boolean = false;

    /** Map of example files that should be displayed in the view-source tab. */
    exampleTabs: { [tabName: string]: string } = {};

    fileExtensionRegex = /(.*)\.(\w+)/;

    @Input() fileOrder = ['HTML', 'TS', 'CSS'];

    /** String key of the currently displayed example. */
    @Input()
    get exampleData() {
        return this._exampleData;
    }

    set exampleData(data) {
        this._exampleData = data;

        this.generateExampleTabs();
    }

    private _exampleData;

    get exampleId() {
        return this.exampleData.selector.replace('-example', '');
    }

    getExampleTabNames() {
        return new Set([...this.fileOrder, ...Object.keys(this.exampleTabs)]);
    }

    toggleSourceView() {
        this.isSourceShown = !this.isSourceShown;
    }

    private generateExampleTabs() {
        if (!this.exampleData) { return; }

        const docsContentPath = `docs-content/examples-highlighted/${this.exampleData.packagePath}`;

        for (const fileName of this.exampleData.files) {
            // Since the additional files refer to the original file name, we need to transform
            // the file name to match the highlighted HTML file that displays the source.
            const fileSourceName = fileName.replace(this.fileExtensionRegex, '$1-$2.html');
            const importPath = `${docsContentPath}/${fileSourceName}`;

            if (fileName === `${this.exampleData.selector}.ts`) {
                this.exampleTabs.TS = importPath;
            } else if (fileName === `${this.exampleData.selector}.css`) {
                this.exampleTabs.CSS = importPath;
            } else if (fileName === `${this.exampleData.selector}.html`) {
                this.exampleTabs.HTML = importPath;
            } else {
                this.exampleTabs[fileName] = importPath;
            }
        }
    }
}
