import { parseVersionName } from './parse-version';
import { getAllowedPublishBranches, getSemverVersionType } from './publish-branches';

describe(getSemverVersionType.name, () => {
    it('should classify a version as major/minor/patch', () => {
        expect(getSemverVersionType(parseVersionName('1.0.0')!)).toBe('major');
        expect(getSemverVersionType(parseVersionName('1.2.0')!)).toBe('minor');
        expect(getSemverVersionType(parseVersionName('1.2.3')!)).toBe('patch');
    });
});

describe(getAllowedPublishBranches.name, () => {
    it('should publish a major only from master', () => {
        expect(getAllowedPublishBranches(parseVersionName('1.0.0')!)).toEqual(['master']);
    });

    it('should publish a minor from its line branch', () => {
        expect(getAllowedPublishBranches(parseVersionName('1.2.0')!)).toEqual(['1.2.x']);
    });

    it('should publish a patch from its line branch', () => {
        expect(getAllowedPublishBranches(parseVersionName('1.2.3')!)).toEqual(['1.2.x']);
    });
});
