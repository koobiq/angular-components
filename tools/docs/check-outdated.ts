import { DOCS } from '../../apps/docs/src/app/services/docs-metadata';

const TTL_DAYS = 14;

export const isNew = (createdAt?: string) => {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= TTL_DAYS;
};

export const main = () => {
    for (const categoryList of Object.values(DOCS)) {
        let hasOutdatedDocItem = false;
        for (const categoryInfo of Object.values(categoryList)) {
            for (const docItem of categoryInfo.items) {
                hasOutdatedDocItem = !isNew(docItem.createdAt);
                if (hasOutdatedDocItem) {
                    process.exitCode = 1;
                    return;
                }
            }
        }
    }
};
main();
