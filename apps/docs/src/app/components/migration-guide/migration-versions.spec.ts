import {
    docsBuildMigrationVersionOptions,
    docsCompareVersions,
    docsMigrationFromChoices,
    docsMigrationKnownValue,
    docsMigrationNormalizeTo,
    docsMigrationStepApplies,
    docsMigrationToChoices,
    docsParseVersion
} from './migration-versions';

describe('migration guide versions', () => {
    /** The releases the guide's steps are currently filed at. */
    const STEP_VERSIONS = ['18.5.3', '18.6.0', '18.22.0', '20.0.0', '20.2.0', '20.3.0', '21.0.0'];

    const parse = docsParseVersion;

    describe('docsCompareVersions', () => {
        it('should order by each part in turn', () => {
            expect(docsCompareVersions(parse('18.6.0'), parse('18.22.0'))).toBeLessThan(0);
            expect(docsCompareVersions(parse('20.3.0'), parse('21.0.0'))).toBeLessThan(0);
            expect(docsCompareVersions(parse('20.2.0'), parse('20.2.0'))).toBe(0);
        });

        // The case that makes a whole major usable as a starting point without a step of its own.
        it('should place a 19.x release below every 20 release', () => {
            expect(docsCompareVersions(parse('19.8.1'), parse('20.0.0'))).toBeLessThan(0);
            expect(docsCompareVersions(parse('19'), parse('18.22.0'))).toBeGreaterThan(0);
        });

        it('should treat a missing part as zero', () => {
            expect(docsCompareVersions(parse('20'), parse('20.0.0'))).toBe(0);
        });
    });

    describe('docsMigrationStepApplies', () => {
        // Half-open: a step that landed in the version you are already on is behind you; a step
        // that lands in the version you are going to is exactly what you came for.
        it('should exclude the starting release and include the destination', () => {
            expect(docsMigrationStepApplies(parse('20.2.0'), parse('20.2.0'), parse('21.0.0'))).toBe(false);
            expect(docsMigrationStepApplies(parse('21.0.0'), parse('20.2.0'), parse('21.0.0'))).toBe(true);
        });

        it('should apply every release above a 19.x start', () => {
            const applies = STEP_VERSIONS.filter((version) =>
                docsMigrationStepApplies(parse(version), parse('19'), parse('21.0.0'))
            );

            expect(applies).toEqual(['20.0.0', '20.2.0', '20.3.0', '21.0.0']);
        });

        it('should apply everything when no range is picked', () => {
            expect(docsMigrationStepApplies(parse('18.5.3'), null, null)).toBe(true);
        });
    });

    describe('docsBuildMigrationVersionOptions', () => {
        const options = docsBuildMigrationVersionOptions(STEP_VERSIONS);

        it('should offer every gate plus the majors that gate nothing, in order', () => {
            expect(options.map(({ value }) => value)).toEqual([
                '17',
                '18.5.3',
                '18.6.0',
                '18.22.0',
                '19',
                '20.0.0',
                '20.2.0',
                '20.3.0',
                '21.0.0'
            ]);
        });

        // The picker answers "which version am I on", so an option reads as a release, spelled the
        // way a `package.json` spells it. Only the two majors that carry no step of their own get
        // an `.x`, because there is no single release to name there.
        it('should label each option as the release it is', () => {
            expect(options.map(({ label }) => label)).toEqual([
                '17.x',
                '18.5.3',
                '18.6.0',
                '18.22.0',
                '19.x',
                '20.0.0',
                '20.2.0',
                '20.3.0',
                '21.0.0'
            ]);
        });

        it('should not drop a gate that repeats a major already listed', () => {
            expect(options.filter(({ value }) => value.startsWith('20'))).toHaveLength(3);
        });
    });

    // You upgrade forward. Offering a pair that would mean a downgrade is the one thing the two
    // pickers must not allow, whichever of them the reader touches first.
    describe('range direction', () => {
        const options = docsBuildMigrationVersionOptions(STEP_VERSIONS);

        const enabled = (choices: { value: string; disabled: boolean }[]) =>
            choices.filter(({ disabled }) => !disabled).map(({ value }) => value);

        it('should not let the start reach the destination or pass it', () => {
            expect(enabled(docsMigrationFromChoices(options, '20.0.0'))).toEqual([
                '17',
                '18.5.3',
                '18.6.0',
                '18.22.0',
                '19'
            ]);
        });

        it('should not let the destination fall to the start or below it', () => {
            expect(enabled(docsMigrationToChoices(options, '20.0.0'))).toEqual(['20.2.0', '20.3.0', '21.0.0']);
        });

        // Every release but the lowest: nothing sits below that one to upgrade *from*, so offering
        // it as a destination would empty the guide and then disable every starting point.
        it('should offer the whole scale above the floor while the other end is unset', () => {
            expect(enabled(docsMigrationToChoices(options, null))).toHaveLength(options.length - 1);
            expect(enabled(docsMigrationToChoices(options, null))).not.toContain('17');
        });

        // Nobody upgrades *from* a release that does not exist yet. Built by hand rather than from
        // the real gates: in a dev build `docsKoobiqVersion` is the placeholder, so nothing there
        // is ever marked unreleased.
        it('should never offer an unreleased start', () => {
            const shipped = { value: '20.3.0', version: parse('20.3.0'), label: '20.3.0', unreleased: false };
            const upcoming = { value: '21.0.0', version: parse('21.0.0'), label: '21.0.0', unreleased: true };

            expect(enabled(docsMigrationFromChoices([shipped, upcoming], null))).toEqual(['20.3.0']);
            // `20.3.0` is the floor of this two-option list, so only the upper one is a destination.
            expect(enabled(docsMigrationToChoices([shipped, upcoming], null))).toEqual(['21.0.0']);
        });

        // A gate retires when the release it belongs to rewrites its step, and links outlive it.
        // An unrecognised value parses as `Infinity`, which would silently empty the whole guide.
        it('should forget a value the picker does not offer', () => {
            expect(docsMigrationKnownValue(options, '20.2.0')).toBe('20.2.0');
            expect(docsMigrationKnownValue(options, 'v20.2.0')).toBeNull();
            expect(docsMigrationKnownValue(options, '20.4.0')).toBeNull();
            expect(docsMigrationKnownValue(options, null)).toBeNull();
        });

        it('should drop a destination that a shared link puts at or below the start', () => {
            expect(docsMigrationNormalizeTo('21.0.0', '18.5.3')).toBeNull();
            expect(docsMigrationNormalizeTo('20.2.0', '20.2.0')).toBeNull();
            expect(docsMigrationNormalizeTo('20.2.0', '21.0.0')).toBe('21.0.0');
            expect(docsMigrationNormalizeTo(null, '18.5.3')).toBe('18.5.3');
        });
    });
});
