import { parseVersionName, serializeVersion, Version } from './parse-version';

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

    it.each(['18.10', '18.10.0-rc', '18.10.0-gamma.1', 'v18.10.0'])('should not parse %p', (version) => {
        expect(parseVersionName(version)).toBeNull();
    });

    /**
     * The pre-release number is matched by `(\d+)`. It used to be `(\d+)+`, and with two nested
     * quantifiers over the same digits there were exponentially many ways to split a run of them
     * between the two — every one of which the engine tried before rejecting a string that ends in
     * a character no split can rescue. 26 digits cost ~0.5s when this was written, quadrupling with
     * every two digits added, so the budget below is a floor rather than a measurement.
     */
    it('should reject a long run of digits without backtracking over it', () => {
        const start = Date.now();

        expect(parseVersionName(`18.10.0-rc.${'0'.repeat(26)}!`)).toBeNull();

        expect(Date.now() - start).toBeLessThan(100);
    });
});

describe(serializeVersion.name, () => {
    it.each(['18.10.0', '18.10.0-rc.4', '18.10.0-rc.0'])('should round-trip %p', (version) => {
        expect(serializeVersion(parseVersionName(version)!)).toBe(version);
    });
});
