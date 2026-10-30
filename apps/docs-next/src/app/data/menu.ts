import { DOCS_NEXT_COMPONENTS } from './components';
import { docsNextGetSection, docsNextIsAvailable, DocsNextPage } from './sections';
import { DOCS_NEXT_I18N, DocsNextFramework, DocsNextLocale } from './site';

export interface DocsNextMenuItem {
    /** Section and page, the part of the address the open page is matched by. */
    id: string;
    title: string;
    url: string;
    /** Missing in the selected framework: grey, but still a link to the stub (spec/navigation/side-menu.md). */
    unavailable?: boolean;
    isNew?: boolean;
    isUpdated?: boolean;
    nested?: boolean;
}

export interface DocsNextMenuGroup {
    title?: string;
    items: DocsNextMenuItem[];
    /** Separates the group from the one above with a line instead of a title. */
    divided?: boolean;
}

/**
 * Menu of a section, shared by the side menu and the phone menu. Pages of the other framework are hidden; only
 * components show up greyed out.
 */
export const docsNextMenuGroups = (
    sectionId: string,
    locale: DocsNextLocale,
    framework: DocsNextFramework
): DocsNextMenuGroup[] => {
    const link = (...parts: string[]): string => ['', locale, framework, ...parts].join('/');

    if (sectionId === 'components') {
        return [
            {
                items: [{ id: 'components', title: DOCS_NEXT_I18N.allComponents[locale], url: link('components') }]
            },
            {
                items: DOCS_NEXT_COMPONENTS.map((component) => ({
                    id: `components/${component.id}`,
                    title: component.title,
                    url: link('components', component.id),
                    unavailable: !component[framework],
                    // Demo marks: the catalog has no dates of change yet.
                    isNew: component.id === 'username',
                    isUpdated: component.id === 'select'
                }))
            }
        ];
    }

    const toItem = (page: DocsNextPage, nested = false): DocsNextMenuItem => ({
        id: `${sectionId}/${page.id}`,
        title: page.title[locale],
        url: link(sectionId, page.id),
        isNew: page.isNew,
        isUpdated: page.isUpdated,
        nested
    });

    return (docsNextGetSection(sectionId)?.groups ?? []).map((group) => ({
        title: group.title?.[locale],
        divided: !group.title,
        items: group.pages
            .filter((page) => docsNextIsAvailable(page, framework))
            .flatMap((page) => [
                toItem(page),
                ...(page.children ?? [])
                    .filter((child) => docsNextIsAvailable(child, framework))
                    .map((child) => toItem(child, true))
            ])
    }));
};
