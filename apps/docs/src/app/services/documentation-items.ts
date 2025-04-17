import { Injectable } from '@angular/core';
import { DocsLocale } from '../constants/locale';
import { CDK, COMPONENTS, DOCS, ICONS, MAIN, OTHER } from './docs-metadata';

export type DocItem = {
    id: string;
    name: Record<DocsLocale, string>;
    hasApi: boolean;
    hasExamples: boolean;
    isGuide?: boolean;
    apiId?: string;
    svgPreview?: string;
    packageName?: string;
    /**
     * Creation date of new items.
     * Used for sidenav badge marking documentation item as "new"
     * TTL = 2w
     */
    createdAt?: string;
};

export type DocCategory = {
    id: string;
    name: Record<DocsLocale, string>;
    items: DocItem[];
    isPreviewed?: boolean;
};

function updatePackageName(categories, name) {
    categories.forEach((category) => category.items.forEach((doc) => (doc.packageName = name)));
}

export const DOCS_ITEM_SECTIONS = ['overview', 'api', 'examples'];

updatePackageName(DOCS[MAIN], MAIN);
updatePackageName(DOCS[COMPONENTS], COMPONENTS);
updatePackageName(DOCS[OTHER], OTHER);
updatePackageName(DOCS[ICONS], ICONS);
updatePackageName(DOCS[CDK], CDK);

const ALL_MAIN = DOCS[MAIN].reduce((result, category) => result.concat(category.items), [] as DocItem[]);

const ALL_COMPONENTS = DOCS[COMPONENTS].reduce((result, category) => result.concat(category.items), [] as DocItem[]);

const ALL_OTHER = DOCS[OTHER].reduce((result, category) => result.concat(category.items), [] as DocItem[]);

const ALL_ICONS = DOCS[ICONS].reduce((result, category) => result.concat(category.items), [] as DocItem[]);

const ALL_CDK = DOCS[CDK].reduce((result, cdk) => result.concat(cdk.items), [] as DocItem[]);

const ALL_DOCS = [
    ...ALL_MAIN,
    ...ALL_COMPONENTS,
    ...ALL_OTHER,
    ...ALL_ICONS,
    ...ALL_CDK
];

const ALL_CATEGORIES = [
    ...DOCS[MAIN],
    ...DOCS[COMPONENTS],
    ...DOCS[OTHER],
    ...DOCS[ICONS],
    ...DOCS[CDK]
];

@Injectable({ providedIn: 'root' })
export class DocumentationItems {
    getCategories(section?: string): DocCategory[] {
        if (section) {
            return DOCS[section];
        }

        return ALL_CATEGORIES;
    }

    getItems(section: string): DocItem[] {
        switch (section) {
            case COMPONENTS: {
                return ALL_COMPONENTS;
            }
            case CDK: {
                return ALL_CDK;
            }
            default: {
                return [];
            }
        }
    }

    getItemById(id: string, section: string): DocItem | undefined {
        if (!id) {
            return;
        }

        return ALL_DOCS.find((doc) => doc.id === id && doc.packageName === section);
    }

    getCategoryById(id: string): DocCategory | undefined {
        return ALL_CATEGORIES.find((c) => c.id === id);
    }
}
