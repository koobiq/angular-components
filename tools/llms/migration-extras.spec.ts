import { resolveBreakingChangesUrl } from './migration-extras';

describe(resolveBreakingChangesUrl.name, () => {
    const github = 'https://github.com/koobiq/angular-components/blob/main/docs/guides';

    it('leads a list of breaking changes on GitHub to the copy the site serves, keeping the anchor', () => {
        expect(resolveBreakingChangesUrl(`${github}/angular-21-breaking-changes.en.md#signals`)).toBe(
            'https://koobiq.io/en/main/migration/angular-21-breaking-changes.md#signals'
        );
    });

    it('leaves a list the site does not serve and any other link alone', () => {
        expect(resolveBreakingChangesUrl(`${github}/angular-17-breaking-changes.en.md`)).toBeNull();
        expect(resolveBreakingChangesUrl(`${github}/installation.en.mdx`)).toBeNull();
    });
});
