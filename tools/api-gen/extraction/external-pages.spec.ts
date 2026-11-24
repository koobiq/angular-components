import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import ts from 'typescript';
import { getExternalApiPages } from './external-pages';

/** The manifest of an installed package, which the version of its documentation is read from. */
const manifest = (name: string, version: string): Record<string, string> => ({
    [`node_modules/${name}/package.json`]: JSON.stringify({ name, version })
});

/** The typings of the libraries, as small as the cases need them, and a source importing them. */
const FILES: Record<string, string> = {
    ...manifest('@angular/core', '21.2.26'),
    'node_modules/@angular/core/index.d.ts': `
        export interface Signal<T> { (): T }
        export declare function signal<T>(value: T): Signal<T>;
        export declare class ɵPrivate {}
        /** @nodoc */
        export declare class Undocumented {}
    `,
    ...manifest('@angular/router', '21.2.26'),
    'node_modules/@angular/router/index.d.ts': 'export interface Event {}\nexport declare class RouterLink {}',
    ...manifest('@angular/cdk', '21.2.14'),
    'node_modules/@angular/cdk/overlay/index.d.ts': `
        export { CdkScrollable } from '../scrolling';
        export declare class OverlayRef {}
        /** @docs-private */
        export declare class OverlayInternals {}
    `,
    'node_modules/@angular/cdk/scrolling/index.d.ts': 'export declare class CdkScrollable {}',
    'node_modules/@angular/cdk/observers/private/index.d.ts': 'export declare class SharedResizeObserver {}',
    ...manifest('@angular/material', '21.2.14'),
    'node_modules/@angular/material/button/index.d.ts': 'export declare class MatButton {}',
    ...manifest('rxjs', '7.8.2'),
    'node_modules/rxjs/index.d.ts': `
        export declare class Observable<T> {}
        export interface Observer<T> {}
        export type ObservableInput<T> = Observable<T>;
        export declare enum NotificationKind { NEXT = 'N' }
        export declare const EMPTY: Observable<never>;
    `,
    'node_modules/luxon/index.d.ts': 'export declare class DateTime {}',
    'src/index.ts': `
        import { Signal } from '@angular/core';
        import { RouterLink } from '@angular/router';
        import { OverlayRef } from '@angular/cdk/overlay';
        import { CdkScrollable } from '@angular/cdk/scrolling';
        import { SharedResizeObserver } from '@angular/cdk/observers/private';
        import { MatButton } from '@angular/material/button';
        export { Observable } from 'rxjs';
        import { DateTime } from 'luxon';
        import { local } from './local';
    `,
    'src/local.ts': 'export const local = 1;'
};

describe(getExternalApiPages.name, () => {
    const roots: string[] = [];

    /** A program of the files written out, as the extraction compiles the sources. */
    const createProgram = (files: Record<string, string>): ts.Program => {
        const root = mkdtempSync(join(tmpdir(), 'external-pages-'));

        roots.push(root);

        for (const [path, content] of Object.entries(files)) {
            mkdirSync(dirname(join(root, path)), { recursive: true });
            writeFileSync(join(root, path), content);
        }

        // The default library of the target declares the DOM, whose `Event` the router's must not take over.
        return ts.createProgram([join(root, 'src/index.ts')], {
            target: ts.ScriptTarget.ES2022,
            moduleResolution: ts.ModuleResolutionKind.Node10,
            types: [],
            noEmit: true
        });
    };

    let program: ts.Program;

    beforeAll(() => {
        program = createProgram(FILES);
    });

    afterAll(() => roots.forEach((root) => rmSync(root, { recursive: true, force: true })));

    it('addresses every export of the modules the sources import in the documentation of its installed version', () => {
        expect(Object.fromEntries(getExternalApiPages(program))).toEqual({
            Signal: { url: 'https://v21.angular.dev/api/core/Signal' },
            signal: { url: 'https://v21.angular.dev/api/core/signal', isValue: true },
            RouterLink: { url: 'https://v21.angular.dev/api/router/RouterLink' },
            OverlayRef: { url: 'https://v21.material.angular.dev/cdk/overlay/api#OverlayRef' },
            Observable: { url: 'https://rxjs.dev/api/index/class/Observable' },
            Observer: { url: 'https://rxjs.dev/api/index/interface/Observer' },
            ObservableInput: { url: 'https://rxjs.dev/api/index/type-alias/ObservableInput' },
            NotificationKind: { url: 'https://rxjs.dev/api/index/NotificationKind' },
            EMPTY: { url: 'https://rxjs.dev/api/index/const/EMPTY', isValue: true }
        });
    });

    // rxjs.dev documents the latest version alone: the links would lead to another one.
    it('fails on a version of RxJS rxjs.dev does not document', () => {
        const otherRxjs = createProgram({ ...FILES, ...manifest('rxjs', '8.0.0') });

        expect(() => getExternalApiPages(otherRxjs)).toThrow('rxjs.dev documents RxJS 7, not 8');
    }, 10_000);
});
