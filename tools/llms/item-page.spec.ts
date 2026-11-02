import { docsGetItemById, DocsStructureCategoryId, DocsStructureItemId } from '../../apps/docs/src/app/structure';
import { findTokensFiles, ownsExample } from './item-page';

const item = (id: DocsStructureItemId, categoryId: DocsStructureCategoryId) => docsGetItemById(id, categoryId)!;

describe(findTokensFiles.name, () => {
    it('takes the tokens file of the item first, then those of its parts no other item is named after', () => {
        expect(
            findTokensFiles(item(DocsStructureItemId.FormField, DocsStructureCategoryId.Components), undefined)
        ).toEqual([
            'packages/components/form-field/form-field-tokens.scss',
            'packages/components/form-field/fieldset-tokens.scss',
            'packages/components/form-field/hint-tokens.scss'
        ]);
        expect(
            findTokensFiles(item(DocsStructureItemId.Timezone, DocsStructureCategoryId.Components), undefined)
        ).toEqual(['packages/components/timezone/timezone-option-tokens.scss']);
    });

    it('leaves the tokens file of another item in the same directory to that item', () => {
        expect(
            findTokensFiles(item(DocsStructureItemId.TagInput, DocsStructureCategoryId.Components), undefined)
        ).toEqual(['packages/components/tags/tag-input-tokens.scss']);
    });

    it('looks next to the overview of an item without a path of its own', () => {
        expect(
            findTokensFiles(
                item(DocsStructureItemId.Forms, DocsStructureCategoryId.Other),
                'packages/components/core/forms/forms.en.mdx'
            )
        ).toEqual(['packages/components/core/forms/forms-tokens.scss']);
    });
});

describe(ownsExample.name, () => {
    it('gives an example to the item whose directory holds it, not to another page that shows it', () => {
        expect(
            ownsExample(
                item(DocsStructureItemId.Select, DocsStructureCategoryId.Components),
                'select-locale-configuration'
            )
        ).toBe(true);
        expect(
            ownsExample(
                item(DocsStructureItemId.Localization, DocsStructureCategoryId.Main),
                'select-locale-configuration'
            )
        ).toBe(false);
    });
});
