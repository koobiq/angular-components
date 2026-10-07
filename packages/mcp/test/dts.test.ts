import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { loadCatalog } from '../src/catalog.ts';
import { parseDts } from '../src/dts/parse-dts.ts';
import { objectEntries, splitTopLevel } from '../src/dts/syntax.ts';
import { readComponentsApi } from '../src/sources/components.ts';
import { resolveProject } from '../src/sources/project.ts';
import { toolGetComponent } from '../src/tools.ts';
import { CONSUMER } from './project.ts';

/**
 * The reader for the installed package, and the resolution on top of it.
 *
 * `dts-against-tsc.test.ts` already proves the parser agrees with the compiler on what is
 * *declared*. What is asserted here is the part the compiler does not hand over: which inputs a
 * template may actually write, once inheritance and host directives are followed.
 */

const api = readComponentsApi(resolveProject(CONSUMER).packages.get('@koobiq/components'));

test('splitting respects nesting and quotes', () => {
    assert.deepEqual(splitTopLevel('a, b<c, d>, "e, f"'), ['a', 'b<c, d>', '"e, f"']);
    assert.deepEqual(splitTopLevel('x: 1; y: { z: 2 }', ';'), ['x: 1', 'y: { z: 2 }']);
});

test('object entries keep a value that holds colons of its own', () => {
    assert.deepEqual(objectEntries('{ "a": { "alias": "b"; "required": false; }; "c": "d"; }'), [
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

    assert.equal(input?.name, 'connectedTo');
    assert.equal(input?.alias, 'kbqConnectedTo');
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

    assert.deepEqual(symbols.get('X')?.inputs[0], { name: 'a', alias: 'b', required: false, isSignal: false });
    assert.deepEqual(symbols.get('X')?.outputs[0], { name: 'c', alias: 'd' });
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

    assert.equal(members.get('renderer')?.visibility, 'private');
    assert.equal(members.get('styler')?.visibility, 'protected');
    assert.equal(members.get('ngOnDestroy')?.lifecycle, true);
    assert.equal(members.get('focus')?.lifecycle, false);
    assert.equal(members.get('ngAcceptInputType_disabled')?.internal, true);
    assert.equal(members.get('ɵfac')?.internal, true);
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

    assert.equal(member?.kind, 'accessor');
    assert.equal(member?.accepts, 'string | KbqButtonStyles');
});

test('the installed package is readable at all', () => {
    assert.ok(api, `no @koobiq/components under ${CONSUMER}`);
    assert.ok(api.entryPoints.length > 50);
    assert.match(api.version, /^\d+\.\d+\.\d+/);
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

    assert.ok(inherited.length > 50, `only ${inherited.length} inherited inputs resolved`);

    const sample = inherited[0]!;

    assert.notEqual(sample.input.from, sample.entryPoint, 'the origin must be a different entry point');
    assert.ok(sample.input.type, `${sample.symbol}.${sample.input.alias} resolved without a type`);
});

test('inputs exposed by a host directive are kept, with the type they accept', () => {
    const viaHost = allInputs().filter((entry) => entry.input.viaHostDirective);

    assert.ok(viaHost.length > 10, `only ${viaHost.length} host-directive inputs resolved`);

    // A directive from outside the package — `CdkDropList` — cannot be resolved and should not be
    // pretended about. Every Koobiq one must be: those used to come back typeless and labelled
    // `via i1`, because the emitter reaches them through a namespace alias and their map is keyed
    // by the alias rather than by the property.
    const untyped = viaHost.filter((entry) => entry.input.viaHostDirective!.startsWith('Kbq') && !entry.input.type);

    assert.deepEqual(
        untyped.map((entry) => `${entry.symbol}.${entry.input.alias} ← ${entry.input.viaHostDirective}`),
        []
    );
});

test('a signal input reports what may be bound, not the signal wrapper', () => {
    const alert = api?.read('alert')?.find((symbol) => symbol.name === 'KbqAlert');
    const style = alert?.inputs.find((input) => input.alias === 'alertStyle');

    assert.equal(style?.isSignal, true);
    assert.ok(!/InputSignal/.test(style?.type ?? ''), `the wrapper leaked: ${style?.type}`);
});

test('a boolean input transformed by Angular reports boolean, not unknown', () => {
    // `booleanAttribute` is typed `InputSignalWithTransform<boolean, unknown>`; the accepted side
    // is literally `unknown` and says nothing a caller can use.
    const alert = api?.read('alert')?.find((symbol) => symbol.name === 'KbqAlert');

    assert.equal(alert?.inputs.find((input) => input.alias === 'compact')?.type, 'boolean');
});

test('get_component leads with what is bindable and leaves the rest out', () => {
    const catalog = loadCatalog(CONSUMER);
    const output = toolGetComponent(catalog, { id: 'button' });

    assert.match(output, /\[input\]\s+kbqStyle: /);
    assert.match(output, /\[input\]\s+color: /);

    for (const noise of ['ngAcceptInputType', 'ngAfterViewInit', 'haltDisabledEvents', 'parentTextElement']) {
        assert.ok(!output.includes(noise), `${noise} leaked into the default answer`);
    }

    // A directive with nothing to bind is named once rather than given a block of its own.
    assert.match(output, /Applied by selector, nothing to bind: .*KbqButtonCssStyler/);
});

test('methods appear only when asked for, and lifecycle hooks never do', () => {
    const catalog = loadCatalog(CONSUMER);
    const plain = toolGetComponent(catalog, { id: 'button', symbols: ['KbqButton'] });
    const withMethods = toolGetComponent(catalog, { id: 'button', symbols: ['KbqButton'], include: ['methods'] });

    assert.ok(!plain.includes('focusViaKeyboard'));
    assert.match(plain, /\+\d+ methods/, 'the default must say what it is holding back');
    assert.match(withMethods, /\[method\] focusViaKeyboard\(\): void/);
    assert.ok(!withMethods.includes('ngAfterViewInit'), 'a lifecycle hook is not a method a consumer calls');
});

test('the answer names the installed version, never the version this server was built from', () => {
    const catalog = loadCatalog(CONSUMER);
    const output = toolGetComponent(catalog, { id: 'button' });
    const installed = catalog.project.packages.get('@koobiq/components')?.version;

    assert.ok(installed);
    assert.match(
        output,
        new RegExp(`@koobiq/components@${installed.replace(/\./g, '\\.')} \\(resolved in this project\\)`)
    );
});

test('a project without the package is told so instead of being given the index', () => {
    // The bundled index would answer confidently here, and would be describing a different release.
    // The override has to come off for this: it is process-wide, and `project.ts` sets it so that
    // the other tests can read the repository's own build.
    const override = process.env.KOOBIQ_COMPONENTS_ROOT;

    delete process.env.KOOBIQ_COMPONENTS_ROOT;

    try {
        const output = toolGetComponent(loadCatalog(join(import.meta.dirname, '..')), { id: 'button' });

        assert.match(output, /not installed in this project/);
        assert.ok(!/\[input\]/.test(output), 'it answered from the index anyway');
    } finally {
        if (override) process.env.KOOBIQ_COMPONENTS_ROOT = override;
    }
});
