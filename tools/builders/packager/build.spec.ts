import { assertNoPlaceholders, IPackageJson, syncComponentsVersion, syncNgVersion } from './version-placeholders';

const VERSION = '{{VERSION}}';
const NG_VERSION = '{{NG_VERSION}}';

const context = { logger: { info: () => {} } };

const rootPackageJson: IPackageJson = { version: '20.2.0', requiredAngularVersion: '^20.0.0' };

const release = (peerDependencies?: Record<string, string>): IPackageJson => ({
    version: VERSION,
    requiredAngularVersion: '',
    ...(peerDependencies ? { peerDependencies } : {})
});

describe('packager version substitution', () => {
    describe('syncComponentsVersion', () => {
        it('should keep the range operator the source manifest declares', () => {
            const result = syncComponentsVersion(
                release({ '@koobiq/angular-luxon-adapter': `^${VERSION}` }),
                rootPackageJson,
                VERSION,
                context
            );

            // Publishing `20.2.0` instead would pin our packages to each other exactly, which makes
            // them mutually unsatisfiable the moment their versions drift apart — this is DS-4889.
            expect(result.peerDependencies!['@koobiq/angular-luxon-adapter']).toBe('^20.2.0');
        });

        it('should resolve a bare placeholder to the root version', () => {
            const result = syncComponentsVersion(
                release({ '@koobiq/components': VERSION }),
                rootPackageJson,
                VERSION,
                context
            );

            expect(result.version).toBe('20.2.0');
            expect(result.peerDependencies!['@koobiq/components']).toBe('20.2.0');
        });

        it('should leave a peer without a placeholder untouched', () => {
            const result = syncComponentsVersion(
                release({ '@koobiq/icons': '^12.1.1' }),
                rootPackageJson,
                VERSION,
                context
            );

            expect(result.peerDependencies!['@koobiq/icons']).toBe('^12.1.1');
        });

        it('should not write through to the manifest it was given', () => {
            const source = release({ '@koobiq/components': `^${VERSION}` });

            syncComponentsVersion(source, rootPackageJson, VERSION, context);

            expect(source.peerDependencies!['@koobiq/components']).toBe(`^${VERSION}`);
        });

        it('should handle a package without peerDependencies', () => {
            const result = syncComponentsVersion(release(), rootPackageJson, VERSION, context);

            // Publishing an empty `peerDependencies` object would be a change to the manifest.
            expect(result.version).toBe('20.2.0');
            expect(result.peerDependencies).toBeUndefined();
        });
    });

    describe('syncNgVersion', () => {
        it('should substitute the required Angular version', () => {
            const result = syncNgVersion(
                release({ '@angular/core': NG_VERSION }),
                rootPackageJson,
                NG_VERSION,
                context
            );

            expect(result.peerDependencies!['@angular/core']).toBe('^20.0.0');
        });

        it('should keep the rest of a compound range', () => {
            const result = syncNgVersion(
                release({ '@angular/cdk': `${NG_VERSION} || ^21.0.0` }),
                rootPackageJson,
                NG_VERSION,
                context
            );

            expect(result.peerDependencies!['@angular/cdk']).toBe('^20.0.0 || ^21.0.0');
        });
    });

    describe('assertNoPlaceholders', () => {
        it('should pass a fully resolved manifest', () => {
            expect(() =>
                assertNoPlaceholders(
                    { version: '20.2.0', requiredAngularVersion: '', peerDependencies: { '@angular/core': '^20.0.0' } },
                    'dist/components/package.json'
                )
            ).not.toThrow();
        });

        it.each([
            ['version', { version: VERSION, requiredAngularVersion: '' }],
            ['peerDependencies', { version: '20.2.0', requiredAngularVersion: '', peerDependencies: { a: VERSION } }],
            ['dependencies', { version: '20.2.0', requiredAngularVersion: '', dependencies: { a: `^${VERSION}` } }]
        ])('should fail on a placeholder left in %s', (_field, manifest: IPackageJson) => {
            expect(() => assertNoPlaceholders(manifest, 'dist/components/package.json')).toThrow(
                /Unresolved version placeholders/
            );
        });
    });
});
