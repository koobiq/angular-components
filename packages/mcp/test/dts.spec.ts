import { join } from 'node:path';
import { loadCatalog } from '../src/catalog';
import { parseDts } from '../src/dts/parse-dts';
import { objectEntries, splitTopLevel } from '../src/dts/syntax';
import { readComponentsApi } from '../src/sources/components';
import { resolveProject } from '../src/sources/project';
import { toolGetComponent } from '../src/tools';
import { componentsAvailable, CONSUMER } from './project';

/**
 * The reader for the installed package, and the resolution on top of it.
 *
 * `dts-against-tsc.spec.ts` already proves the parser agrees with the compiler on what is
 * *declared*. What is asserted here is the part the compiler does not hand over: which inputs a
 * template may actually write, once inheritance and host directives are followed.
 */

const api = readComponentsApi(resolveProject(CONSUMER).packages.get('@koobiq/components'));

// `unit:all` sweeps this file in `units.yml` too, which never builds the library — skipped, not
// failed, is the honest report there. `unit:mcp:dts` runs it for real after `build:components`.
describe.skipIf(!componentsAvailable())('the live .d.ts reader, and the resolution on top of it', () => {
    test('splitting respects nesting and quotes', () => {
        expect(splitTopLevel('a, b<c, d>, "e, f"')).toEqual(['a', 'b<c, d>', '"e, f"']);
        expect(splitTopLevel('x: 1; y: { z: 2 }', ';')).toEqual(['x: 1', 'y: { z: 2 }']);
    });

    test('object entries keep a value that holds colons of its own', () => {
        expect(objectEntries('{ "a": { "alias": "b"; "required": false; }; "c": "d"; }')).toEqual([
            ['a', '{ "alias": "b"; "required": false; }'],
            ['c', '"d"']
        ]);
    });

    test('an input is read under the name a template writes, not the property name', () => {
        const { symbols } = parseDts(
            [
                'declare class X {',
                '    connectedTo: Origin;',
                '    static ɵdir: i0.ɵɵDirectiveDeclaration<X, "[x]", never, { "connectedTo": { "alias": "kbqConnectedTo"; "required": false; }; }, {}, never, never, true, never>;',
                '}'
            ].join('\n')
        );

        const input = symbols.get('X')?.inputs[0];

        expect(input?.name).toBe('connectedTo');
        expect(input?.alias).toBe('kbqConnectedTo');
    });

    test('the pre-signal spelling of an input map is read too', () => {
        // Releases before the signal migration emit `{ "prop": "alias" }` with no object around it.
        const { symbols } = parseDts(
            [
                'declare class X {',
                '    static ɵdir: i0.ɵɵDirectiveDeclaration<X, "[x]", never, { "a": "b"; }, { "c": "d"; }, never>;',
                '}'
            ].join('\n')
        );

        expect(symbols.get('X')?.inputs[0]).toEqual({ name: 'a', alias: 'b', required: false, isSignal: false });
        expect(symbols.get('X')?.outputs[0]).toEqual({ name: 'c', alias: 'd' });
    });

    test('compiler plumbing and private state are marked, not dropped', () => {
        const { symbols } = parseDts(
            [
                'declare class X {',
                '    private renderer;',
                '    protected styler: Y;',
                '    focus(): void;',
                '    ngOnDestroy(): void;',
                '    static ɵfac: i0.ɵɵFactoryDeclaration<X, never>;',
                '    static ngAcceptInputType_disabled: unknown;',
                '}'
            ].join('\n')
        );

        const members = new Map(symbols.get('X')?.members.map((member) => [member.name, member]));

        expect(members.get('renderer')?.visibility).toBe('private');
        expect(members.get('styler')?.visibility).toBe('protected');
        expect(members.get('ngOnDestroy')?.lifecycle).toBe(true);
        expect(members.get('focus')?.lifecycle).toBe(false);
        expect(members.get('ngAcceptInputType_disabled')?.internal).toBe(true);
        expect(members.get('ɵfac')?.internal).toBe(true);
    });

    test('an accessor pair keeps both the readable type and the assignable one', () => {
        const { symbols } = parseDts(
            [
                'declare class X {',
                '    get kbqStyle(): string;',
                '    set kbqStyle(value: string | KbqButtonStyles);',
                '}'
            ].join('\n')
        );

        const member = symbols.get('X')?.members.find((entry) => entry.name === 'kbqStyle');

        expect(member?.kind).toBe('accessor');
        expect(member?.accepts).toBe('string | KbqButtonStyles');
    });

    test('the installed package is readable at all', () => {
        expect(api, `no @koobiq/components under ${CONSUMER}`).toBeTruthy();
        expect(api!.entryPoints.length > 50).toBeTruthy();
        expect(api!.version).toMatch(/^\d+\.\d+\.\d+/);
    });

    /** Every input of the installed package, with the symbol it came from. */
    const allInputs = () =>
        (api?.entryPoints ?? []).flatMap((entryPoint) =>
            (api?.read(entryPoint) ?? []).flatMap((symbol) =>
                symbol.inputs.map((input) => ({ entryPoint, symbol: symbol.name, input }))
            )
        );

    test('inputs inherited from a base directive are kept, and labelled with where they came from', () => {
        // An input reaches an element three ways and all three are bindable. Reading only the class's
        // own declaration loses the inherited ones — 236 of them in this build — and an agent then has
        // no way to know they exist. Which symbols inherit changes release to release, so the
        // mechanism is asserted rather than one example of it.
        const inherited = allInputs().filter((entry) => entry.input.from);

        expect(inherited.length > 50, `only ${inherited.length} inherited inputs resolved`).toBeTruthy();

        const sample = inherited[0]!;

        expect(sample.input.from, 'the origin must be a different entry point').not.toBe(sample.entryPoint);
        expect(sample.input.type, `${sample.symbol}.${sample.input.alias} resolved without a type`).toBeTruthy();
    });

    test('a type argument given to a generic base class replaces its parameter in an inherited member', () => {
        // `KbqButton extends KbqColorDirective<KbqButtonColor>` — `color` is declared on
        // `KbqColorDirective<T>` as `InputSignal<T | null | undefined>`. Reading the base's own
        // signature without substituting `T` reports every color input in the library as
        // `T | null | undefined`, true of no component and useless to all of them.
        const button = api?.read('button')?.find((symbol) => symbol.name === 'KbqButton');
        const color = button?.inputs.find((input) => input.alias === 'color');

        expect(color?.type).toBe('KbqButtonColor | null | undefined');
    });

    test('inputs exposed by a host directive are kept, with the type they accept', () => {
        const viaHost = allInputs().filter((entry) => entry.input.viaHostDirective);

        expect(viaHost.length > 10, `only ${viaHost.length} host-directive inputs resolved`).toBeTruthy();

        // A directive from outside the package — `CdkDropList` — cannot be resolved and should not be
        // pretended about. Every Koobiq one must be: those used to come back typeless and labelled
        // `via i1`, because the emitter reaches them through a namespace alias and their map is keyed
        // by the alias rather than by the property.
        const untyped = viaHost.filter((entry) => entry.input.viaHostDirective!.startsWith('Kbq') && !entry.input.type);

        expect(
            untyped.map((entry) => `${entry.symbol}.${entry.input.alias} ← ${entry.input.viaHostDirective}`)
        ).toEqual([]);
    });

    test('a signal input reports what may be bound, not the signal wrapper', () => {
        const alert = api?.read('alert')?.find((symbol) => symbol.name === 'KbqAlert');
        const style = alert?.inputs.find((input) => input.alias === 'alertStyle');

        expect(style?.isSignal).toBe(true);
        expect(!/InputSignal/.test(style?.type ?? ''), `the wrapper leaked: ${style?.type}`).toBeTruthy();
    });

    test('a boolean input transformed by Angular reports boolean, not unknown', () => {
        // `booleanAttribute` is typed `InputSignalWithTransform<boolean, unknown>`; the accepted side
        // is literally `unknown` and says nothing a caller can use.
        const alert = api?.read('alert')?.find((symbol) => symbol.name === 'KbqAlert');

        expect(alert?.inputs.find((input) => input.alias === 'compact')?.type).toBe('boolean');
    });

    test('get_component leads with what is bindable and leaves the rest out', () => {
        const catalog = loadCatalog(CONSUMER);
        const output = toolGetComponent(catalog, { id: 'button' });

        expect(output).toMatch(/\[input\]\s+kbqStyle: /);
        expect(output).toMatch(/\[input\]\s+color: /);

        for (const noise of ['ngAcceptInputType', 'ngAfterViewInit', 'haltDisabledEvents', 'parentTextElement']) {
            expect(!output.includes(noise), `${noise} leaked into the default answer`).toBeTruthy();
        }

        // A directive with nothing to bind is named once rather than given a block of its own.
        expect(output).toMatch(/Applied by selector, nothing to bind: .*KbqButtonCssStyler/);
    });

    test('methods appear only when asked for, and lifecycle hooks never do', () => {
        const catalog = loadCatalog(CONSUMER);
        const plain = toolGetComponent(catalog, { id: 'button', symbols: ['KbqButton'] });
        const withMethods = toolGetComponent(catalog, { id: 'button', symbols: ['KbqButton'], include: ['methods'] });

        expect(!plain.includes('focusViaKeyboard')).toBeTruthy();
        expect(plain, 'the default must say what it is holding back').toMatch(/\+\d+ methods/);
        expect(withMethods).toMatch(/\[method\] focusViaKeyboard\(\): void/);
        expect(
            !withMethods.includes('ngAfterViewInit'),
            'a lifecycle hook is not a method a consumer calls'
        ).toBeTruthy();
    });

    test('the answer names the installed version, never the version this server was built from', () => {
        const catalog = loadCatalog(CONSUMER);
        const output = toolGetComponent(catalog, { id: 'button' });
        const installed = catalog.project.packages.get('@koobiq/components')?.version;

        expect(installed).toBeTruthy();
        expect(output.includes(`@koobiq/components@${installed} (resolved in this project)`)).toBeTruthy();
    });

    test('a project without the package is told so instead of being given the index', () => {
        // The bundled index would answer confidently here, and would be describing a different release.
        // The override has to come off for this: it is process-wide, and `project.ts` sets it so that
        // the other tests can read the repository's own build.
        const override = process.env.KOOBIQ_COMPONENTS_ROOT;

        delete process.env.KOOBIQ_COMPONENTS_ROOT;

        try {
            const output = toolGetComponent(loadCatalog(join(import.meta.dirname, '..')), { id: 'button' });

            expect(output).toMatch(/not installed in this project/);
            expect(!/\[input\]/.test(output), 'it answered from the index anyway').toBeTruthy();
        } finally {
            if (override) process.env.KOOBIQ_COMPONENTS_ROOT = override;
        }
    });
});
