import {
    docsBuildMigrationVersionOptions,
    docsCompareVersions,
    docsMigrationFromChoices,
    docsMigrationKnownValue,
    docsMigrationNormalizeTo,
    docsMigrationStepApplies,
    docsMigrationToChoices,
    docsMigrationUpdateCommand,
    docsMigrationUpdateMajors,
    docsParseVersion
} from './migration-versions';

describe('migration guide versions', () => {
    /** The releases the guide's steps are currently filed at. */
    const STEP_VERSIONS = ['18.5.3', '18.6.0', '18.22.0', '20.0.0', '20.2.0', '21.0.0'];
    const LATEST_RELEASE = '20.3.0';

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

            expect(applies).toEqual(['20.0.0', '20.2.0', '21.0.0']);
        });
    });

    describe('docsMigrationUpdateMajors', () => {
        const majors = (from: string, to: string) =>
            docsMigrationUpdateMajors(parse(from), parse(to), STEP_VERSIONS.map(parse));

        it('should pass through every major between the start and the destination', () => {
            expect(majors('17', '21.0.0')).toEqual([18, 19, 20, 21]);
            expect(majors('18.22.0', '21.0.0')).toEqual([19, 20, 21]);
        });

        // No major is crossed, and a step of the starting one is still ahead.
        it('should update within the starting major while a step of it is ahead', () => {
            expect(majors('20.0.0', '20.2.0')).toEqual([20]);
            expect(majors('18.6.0', '19')).toEqual([18, 19]);
        });

        it('should pass through a major that files no step', () => {
            expect(majors('18.22.0', '19')).toEqual([19]);
        });
    });

    describe('docsMigrationUpdateCommand', () => {
        it('should update Angular in the same run only when the major changes', () => {
            expect(docsMigrationUpdateCommand(21, true)).toBe(
                'ng update @angular/core@21 @angular/cli@21 @angular/cdk@21 @koobiq/components@21'
            );
            expect(docsMigrationUpdateCommand(20, false)).toBe('ng update @koobiq/components@20');
        });

        it('should name @koobiq/cdk up to the major that folded it into the components', () => {
            expect(docsMigrationUpdateCommand(19, true)).toBe(
                'ng update @angular/core@19 @angular/cli@19 @angular/cdk@19 @koobiq/cdk@19 @koobiq/components@19'
            );
            expect(docsMigrationUpdateCommand(20, true)).not.toContain('@koobiq/cdk');
        });
    });

    describe('docsBuildMigrationVersionOptions', () => {
        const options = docsBuildMigrationVersionOptions(STEP_VERSIONS, LATEST_RELEASE);

        it('should offer every gate plus the majors that gate nothing and the latest release, in order', () => {
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
            const gates = docsBuildMigrationVersionOptions(STEP_VERSIONS, null);

            expect(gates.filter(({ value }) => value.startsWith('20'))).toHaveLength(2);
        });

        it('should mark what lies above the latest release as unreleased', () => {
            expect(options.filter(({ unreleased }) => unreleased).map(({ value }) => value)).toEqual(['21.0.0']);
        });

        it('should list the latest release once when a step lands in it', () => {
            const released = docsBuildMigrationVersionOptions(STEP_VERSIONS, '21.0.0');

            expect(released.map(({ value }) => value)).toEqual(
                options.map(({ value }) => value).filter((value) => value !== LATEST_RELEASE)
            );
            expect(released.some(({ unreleased }) => unreleased)).toBe(false);
        });

        it('should judge nothing unreleased without a latest release', () => {
            expect(docsBuildMigrationVersionOptions(STEP_VERSIONS, null).some(({ unreleased }) => unreleased)).toBe(
                false
            );
        });
    });

    // You upgrade forward. Offering a pair that would mean a downgrade is the one thing the two
    // pickers must not allow, whichever of them the reader touches first.
    describe('range direction', () => {
        const options = docsBuildMigrationVersionOptions(STEP_VERSIONS, LATEST_RELEASE);

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

        // Nobody upgrades *from* a release that does not exist yet, but it is what the guide prepares for.
        it('should never offer an unreleased start', () => {
            expect(enabled(docsMigrationFromChoices(options, null))).toEqual(
                options.map(({ value }) => value).filter((value) => value !== '21.0.0')
            );
            expect(enabled(docsMigrationToChoices(options, null))).toContain('21.0.0');
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
