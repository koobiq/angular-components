import { generateManifest } from './index.js';
import { DocEntry, EntryType } from '../rendering/entities.js';

// TODO: testing environment needed
describe('api manifest generation', () => {
    it('should generate a manifest from multiple collections', () => {
        const manifest = generateManifest([{
            moduleName: 'cdk',
            packagesApiInfo: [{
                packageName: 'button',
                entries: [
                    entry({ name: 'KbqButton', entryType: EntryType.Component }),
                    entry({ name: 'TOOLTIP_TIMEOUT', entryType: EntryType.Constant })
                ]
            }]
        }]);

        expect(manifest).toEqual([{
            moduleName: 'cdk',
            packagesApiInfo: [{
                packageName: 'button',
                entries: [
                    {
                        name: 'KbqButton',
                        description: '',
                        jsdocTags: [],
                        rawComment: '',
                        entryType: EntryType.Component,
                        publicUrl: 'cdk/button/api#KbqButton',
                    },
                    {
                        name: 'TOOLTIP_TIMEOUT',
                        description: '',
                        jsdocTags: [],
                        rawComment: '',
                        entryType: EntryType.Constant,
                        publicUrl: 'cdk/button/api#TOOLTIP_TIMEOUT',
                    }
                ]
            }]
        }])
    })

    it('should should filter private entries', () => {
        const manifest = generateManifest([{
            moduleName: 'components',
            packagesApiInfo: [{
                packageName: 'button',
                entries: [
                    entry({ name: 'KbqButton', entryType: EntryType.Component }),
                    entry({ name: 'PRIVATE_CONST', entryType: EntryType.Constant, jsdocTags: [{ name: 'docs-private', comment: 'test' }] })
                ]
            }]
        }]);

        expect(manifest).toEqual([{
            moduleName: 'cdk',
            packagesApiInfo: [{
                packageName: 'button',
                entries: [
                    {
                        name: 'KbqButton',
                        description: '',
                        jsdocTags: [],
                        rawComment: '',
                        entryType: EntryType.Component,
                        publicUrl: 'cdk/button/api#KbqButton',
                    }
                ]
            }]
        }])
    })
});

/** Creates a fake DocsEntry with the given object's fields patches onto the result. */
function entry(patch: Partial<DocEntry>): DocEntry {
    return {
        name: '',
        description: '',
        entryType: EntryType.Constant,
        jsdocTags: [],
        rawComment: '',
        ...patch,
    };
}
