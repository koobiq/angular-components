import { DateTime } from 'luxon';
import {
    docsGetCategories,
    docsGetCategoryById,
    docsGetIsNewExpiryDates,
    docsGetItemById,
    docsGetItems,
    DocsStructureCategoryId
} from './structure';

describe('docs structure registry', () => {
    const items = docsGetItems();

    it('assigns every item to a category that resolves back to a real category', () => {
        for (const item of items) {
            expect(item.categoryId).toBeDefined();
            expect(docsGetCategoryById(item.categoryId!)).toBeDefined();
        }
    });

    it('resolves every item by its (id, categoryId) pair', () => {
        for (const item of items) {
            expect(docsGetItemById(item.id, item.categoryId!)).toBe(item);
        }
    });

    it('has unique (categoryId, id) pairs', () => {
        const keys = items.map((item) => `${item.categoryId}/${item.id}`);

        expect(new Set(keys).size).toBe(keys.length);
    });

    it('exposes a category for every DocsStructureCategoryId', () => {
        for (const categoryId of Object.values(DocsStructureCategoryId)) {
            expect(docsGetCategoryById(categoryId)?.id).toBe(categoryId);
            expect(docsGetCategories().some((category) => category.id === categoryId)).toBe(true);
        }
    });

    it('returns undefined when an item id is looked up under the wrong category', () => {
        const [item] = items;
        const wrongCategory = Object.values(DocsStructureCategoryId).find((id) => id !== item.categoryId)!;

        expect(docsGetItemById(item.id, wrongCategory)).toBeUndefined();
    });

    it('only registers valid ISO dates for isNew badges', () => {
        const dates = docsGetIsNewExpiryDates();

        expect(dates.length).toBeGreaterThan(0);

        for (const date of dates) {
            expect(DateTime.fromISO(date).isValid).toBe(true);
        }
    });

    // `expiresAt` flips a badge off silently once its date passes, so an expired entry lingers in the
    // registry forever with nothing to signal it. Failing here turns that silent expiry into a CI
    // signal: when this breaks, delete the `isNew: expiresAt(...)` line the message names.
    it('has no isNew badge whose expiry date has already passed', () => {
        const expired = docsGetIsNewExpiryDates().filter((date) => DateTime.fromISO(date).diffNow('days').days <= 0);

        expect(expired).toEqual([]);
    });
});
