import { parseVersionName, serializeVersion, Version, versionNameRegex } from './parse-version';

describe(parseVersionName.name, () => {
    it('should parse a release version', () => {
        expect(parseVersionName('18.10.0')).toEqual(new Version(18, 10, 0, null, null));
    });

    it('should parse a pre-release version', () => {
        expect(parseVersionName('18.10.0-rc.4')).toEqual(new Version(18, 10, 0, 'rc', 4));
        expect(parseVersionName('18.10.0-alpha.12')).toEqual(new Version(18, 10, 0, 'alpha', 12));
    });

    it('should parse the zeroth pre-release of a series', () => {
        expect(parseVersionName('18.10.0-rc.0')).toEqual(new Version(18, 10, 0, 'rc', 0));
    });

    it.each(['18.10', '18.10.0-rc', '18.10.0-gamma.1', 'v18.10.0', '18.10.0-rc.4!'])(
        'should not parse %p',
        (version) => {
            expect(parseVersionName(version)).toBeNull();
        }
    );

    /**
     * The pre-release number is matched by `(\d+)`. It used to be `(\d+)+`, and with two nested
     * quantifiers over the same digits there were exponentially many ways to split a run of them
     * between the two — every one of which the engine tried before rejecting a string that ends in
     * a character no split can rescue: 26 digits took ~0.5 s, quadrupling with every two added.
     * Checked on the pattern rather than timed, which depends on the machine: it repeats no group.
     */
    it('should repeat no group, which could backtrack exponentially over a near miss', () => {
        expect(versionNameRegex.source).not.toMatch(/\)(?:[*+]|\{\d+,\})/);
    });
});

describe(serializeVersion.name, () => {
    it.each(['18.10.0', '18.10.0-rc.4', '18.10.0-rc.0'])('should round-trip %p', (version) => {
        expect(serializeVersion(parseVersionName(version)!)).toBe(version);
    });
});
