import '@analogjs/vitest-angular/setup-serializers';
import '@analogjs/vitest-angular/setup-zone';
import '@angular/compiler';

import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import { DebugNode, provideZoneChangeDetection } from '@angular/core';
import { toHaveNoViolations } from 'jest-axe';
import { expect, SnapshotSerializer, vi } from 'vitest';
import './fail-on-console';

// Zone-based change detection until the library is zoneless; `fakeAsync` needs zone.js either way.
setupTestBed({ zoneless: false, providers: [provideZoneChangeDetection()] });

// jest-axe has no runtime dependency on Jest: `axe()` wraps axe-core and the matcher only formats.
expect.extend(toHaveNoViolations);

// Prints a `DebugElement` as the plain object it is, as Jest did: the fixture serializer of
// `@analogjs/vitest-angular` claims anything with a `componentInstance` and fails on it.
expect.addSnapshotSerializer({
    test: (value) => value instanceof DebugNode,
    serialize: (value, config, indentation, depth, refs, printer) =>
        printer(
            value,
            { ...config, plugins: config.plugins.filter((plugin) => !plugin.test(value)) },
            indentation,
            depth,
            refs
        )
} satisfies SnapshotSerializer);

globalThis.open = vi.fn();

globalThis.URL.createObjectURL = vi.fn();

globalThis.ResizeObserverEntry = class {} as typeof ResizeObserverEntry;

globalThis.ResizeObserver = class implements ResizeObserver {
    observe(_target: Element, _options?: ResizeObserverOptions): void {}
    unobserve(_target: Element): void {}
    disconnect(): void {}
};

globalThis.DataTransferItem = class {
    webkitGetAsEntry(): FileSystemEntry | null {
        return null;
    }
} as typeof DataTransferItem;

globalThis.DataTransfer = class {
    files: File[] = [];
    items = {
        length: () => {
            return this.files.length;
        },
        add: (data: File) => {
            this.files.push(data);
        }
    };
} as unknown as typeof DataTransfer;

globalThis.DragEvent = class extends MouseEvent {
    dataTransfer: DataTransfer | null;

    constructor(type: string, eventInitDict: DragEventInit) {
        super(type, eventInitDict);
        this.dataTransfer = eventInitDict.dataTransfer ?? null;
    }
} as typeof DragEvent;

globalThis.CSS = {
    supports: vi.fn().mockReturnValue(false) as typeof CSS.supports
} as typeof CSS;

if (!globalThis.structuredClone) {
    globalThis.structuredClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
}

if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
}

// jsdom implements no scrolling at all (https://github.com/jsdom/jsdom/issues/1695), and components
// scroll through `KbqScrollbarViewport`, which reaches `Element.prototype.scrollTo` via
// `CdkScrollable`. A bare `vi.fn()` would make every such call silently do nothing, so this applies
// the offsets the way a browser would — which is what a spec asserting a scroll position needs. No
// clamping: jsdom has no layout to clamp against, so a spec that cares defines its own `scrollLeft`.
if (!Element.prototype.scrollTo) {
    // A spec that pins scroll metrics redefines them as value-only properties; leave those where the
    // spec put them instead of throwing on assignment.
    const applyOffset = (element: Element, property: 'scrollLeft' | 'scrollTop', value: number): void => {
        const descriptor = Object.getOwnPropertyDescriptor(element, property);

        if (descriptor && !descriptor.set && !descriptor.writable) return;

        element[property] = value;
    };

    // Defined rather than assigned: a plain assignment would make it enumerable, so every `for…in` over
    // an element and every serializer that walks own+inherited keys would start seeing it.
    Object.defineProperty(Element.prototype, 'scrollTo', {
        configurable: true,
        writable: true,
        value: function (this: Element, options?: ScrollToOptions | number, y?: number): void {
            if (typeof options === 'number') {
                applyOffset(this, 'scrollLeft', options);

                if (y !== undefined) applyOffset(this, 'scrollTop', y);

                return;
            }

            if (options?.left !== undefined) applyOffset(this, 'scrollLeft', options.left);
            if (options?.top !== undefined) applyOffset(this, 'scrollTop', options.top);
        }
    });
}
