import { DocsLocale } from '../../apps/docs/src/app/constants/locale';
import { DocsStructureItemId, DocsStructureItemTab } from '../../apps/docs/src/app/structure';
import { LiveExample } from '../../packages/docs-examples/example-module';
import { CompiledPage } from './compile-page';
import { emitPage, emitPagesRegistry } from './emit-page';
import { DocsPageSource } from './sources';

const alertOverview = (locale: DocsLocale): DocsPageSource => ({
    path: `packages/components/alert/alert.${locale}.mdx`,
    id: DocsStructureItemId.Alert,
    tab: DocsStructureItemTab.Overview,
    locale,
    url: `/${locale}/components/alert/overview`
});

const example = (componentName: string, importPath: string) => ({ componentName, importPath }) as LiveExample;

describe(emitPage.name, () => {
    it('emits a component that imports what its template uses', () => {
        const page: CompiledPage = {
            template: '<p class="kbq-markdown__p">Intro</p>',
            codeBlocks: [{ content: 'const a = `{{ b }}`;', language: 'ts' }],
            examples: [
                example('AlertStatusExample', 'components/alert'),
                example('ButtonOverviewExample', 'components/button'),
                example('AlertOverviewExample', 'components/alert')
            ],
            browserExamples: [example('AgGridOverviewExample', 'components/ag-grid')]
        };
        const { modulePath, component, template } = emitPage(page, alertOverview(DocsLocale.En));

        expect(modulePath).toBe('alert/alert.en.page');
        expect(template).toBe('<p class="kbq-markdown__p">Intro</p>\n');
        expect(component).toMatchSnapshot();
    });

    it('imports nothing a page of plain text does not use', () => {
        const page: CompiledPage = {
            template: '<p class="kbq-markdown__p">Intro</p>',
            codeBlocks: [],
            examples: [],
            browserExamples: []
        };

        expect(emitPage(page, alertOverview(DocsLocale.Ru)).component).toMatchSnapshot();
    });
});

describe(emitPagesRegistry.name, () => {
    it('registers the pages by item, tab and locale', () => {
        const examplesTab: DocsPageSource = {
            path: 'packages/components/alert/examples.alert.en.mdx',
            id: DocsStructureItemId.Alert,
            tab: DocsStructureItemTab.Examples,
            locale: DocsLocale.En,
            url: '/en/components/alert/examples'
        };

        expect(
            emitPagesRegistry([
                { source: alertOverview(DocsLocale.Ru), modulePath: 'alert/alert.ru.page' },
                { source: examplesTab, modulePath: 'alert/examples.alert.en.page' },
                { source: alertOverview(DocsLocale.En), modulePath: 'alert/alert.en.page' }
            ])
        ).toMatchSnapshot();
    });
});
