import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseApiReport, parseMemberLine, splitTopLevel } from '../src/indexer/parse-api-md.ts';

const report = [
    '## API Report File for "koobiq"',
    '',
    '```ts',
    '',
    "import * as _angular_core from '@angular/core';",
    '',
    '// @public',
    'export class KbqAlert {',
    '    constructor();',
    '    readonly alertColor: _angular_core.InputSignal<"error" | "warning">;',
    '    protected readonly alertColorClass: _angular_core.Signal<string>;',
    '    readonly closed: _angular_core.OutputEmitterRef<void>;',
    '    close(): void;',
    '    // (undocumented)',
    '    static ɵcmp: _angular_core.ɵɵComponentDeclaration<KbqAlert, "kbq-alert", ["kbqAlert"], { "alertColor": { "alias": "alertColor"; "required": false; }; }, { "closed": "closed"; }, ["icon"], ["*"], true, never>;',
    '    // (undocumented)',
    '    static ɵfac: _angular_core.ɵɵFactoryDeclaration<KbqAlert, never>;',
    '}',
    '',
    '// @public',
    'export enum KbqAlertColors {',
    '    // (undocumented)',
    '    Error = "error",',
    '    // (undocumented)',
    '    Info = "info"',
    '}',
    '',
    '// @public',
    'export const KBQ_ALERT_TOKEN: _angular_core.InjectionToken<string>;',
    '',
    '```',
    ''
].join('\r\n');

test('reads the CRLF reports the repository commits', () => {
    assert.equal(parseApiReport(report).length, 3);
});

test('lifts selector, exportAs and input/output aliases out of the Angular declaration', () => {
    const alert = parseApiReport(report).find((symbol) => symbol.name === 'KbqAlert');

    assert.equal(alert?.kind, 'component');
    assert.equal(alert?.selector, 'kbq-alert');
    assert.deepEqual(alert?.exportAs, ['kbqAlert']);
});

test('classifies members and drops what a consumer cannot reach', () => {
    const alert = parseApiReport(report).find((symbol) => symbol.name === 'KbqAlert');
    const byName = new Map(alert!.members.map((member) => [member.name, member.kind]));

    assert.equal(byName.get('alertColor'), 'input');
    assert.equal(byName.get('closed'), 'output');
    assert.equal(byName.get('close'), 'method');
    assert.equal(byName.has('alertColorClass'), false, 'protected members are template-only');
    assert.equal(byName.has('constructor'), false);
    assert.equal(byName.has('ɵcmp'), false);
    assert.equal(byName.has('ɵfac'), false);
});

test('strips the namespace prefix from signatures', () => {
    const alert = parseApiReport(report).find((symbol) => symbol.name === 'KbqAlert');
    const member = alert!.members.find((it) => it.name === 'alertColor');

    assert.equal(member?.signature, 'alertColor: InputSignal<"error" | "warning">');
});

test('reads enums and single-line declarations', () => {
    const symbols = parseApiReport(report);
    const colors = symbols.find((symbol) => symbol.name === 'KbqAlertColors');

    assert.equal(colors?.kind, 'enum');
    assert.deepEqual(
        colors?.members.map((member) => member.name),
        ['Error', 'Info']
    );
    assert.equal(symbols.find((symbol) => symbol.name === 'KBQ_ALERT_TOKEN')?.kind, 'const');
});

test('splitTopLevel ignores separators nested in brackets and strings', () => {
    assert.deepEqual(splitTopLevel('A, "b,c", { "d": 1; }, [1, 2]'), ['A', '"b,c"', '{ "d": 1; }', '[1, 2]']);
});

test('parseMemberLine sees through any number of modifiers', () => {
    assert.deepEqual(parseMemberLine('    static readonly x: number;'), {
        name: 'x',
        modifiers: ['static', 'readonly']
    });
    assert.deepEqual(parseMemberLine('    get value(): string;'), { name: 'value', modifiers: ['get'] });
    assert.equal(parseMemberLine('    // (undocumented)'), null);
    assert.equal(parseMemberLine('  twoSpaces: number;'), null, 'members are indented four spaces');
});
