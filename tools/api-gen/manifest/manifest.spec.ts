import { DocEntry, EntryType } from '../rendering/entities';
import { generateManifest } from './';

describe('api manifest generation', () => {
    it('should generate a manifest from multiple collections', () => {
        expect(
            generateManifest([
                {
                    moduleName: 'cdk',
                    packagesApiInfo: [
                        {
                            packageName: 'button',
                            entries: [
                                entry({ name: 'KbqButton', entryType: EntryType.Component }),
                                entry({ name: 'TOOLTIP_TIMEOUT', entryType: EntryType.Constant })
                            ]
                        }
                    ]
                }
            ])
        ).toMatchSnapshot();
    });

    it('should should filter private entries', () => {
        expect(
            generateManifest([
                {
                    moduleName: 'components',
                    packagesApiInfo: [
                        {
                            packageName: 'button',
                            entries: [
                                entry({ name: 'KbqButton', entryType: EntryType.Component }),
                                entry({
                                    name: 'PRIVATE_CONST',
                                    entryType: EntryType.Constant,
                                    jsdocTags: [{ name: 'docs-private', comment: 'test' }]
                                })

                            ]
                        }
                    ]
                }
            ])
        ).toMatchSnapshot();
    });
});

/** Creates a fake DocsEntry with the given object's fields patches onto the result. */
function entry(patch: Partial<DocEntry>): DocEntry {
    return {
        name: '',
        description: '',
        entryType: EntryType.Constant,
        jsdocTags: [],
        rawComment: '',
        ...patch
    };
}
