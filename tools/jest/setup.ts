/// <reference types="jest" />

/** required to run tests without using @angular-builders/jest */
if (!('Zone' in global)) {
    require('jest-preset-angular/setup-env/zone').setupZoneTestEnv();
}

import { toHaveNoViolations } from 'jest-axe';
import failOnConsole from 'jest-fail-on-console';

expect.extend(toHaveNoViolations);

failOnConsole({
    silenceMessage: (message) => {
        // https://github.com/thymikee/jest-preset-angular/issues/2194
        return !(message === 'Error: Could not parse CSS stylesheet');
    }
});

Object.defineProperty(global, '__jest__', { value: true });

global.open = jest.fn();

global.URL.createObjectURL = jest.fn();

global.ResizeObserverEntry = class {} as typeof ResizeObserverEntry;

global.ResizeObserver = class implements ResizeObserver {
    observe(_target: Element, _options?: ResizeObserverOptions): void {}
    unobserve(_target: Element): void {}
    disconnect(): void {}
};

global.DataTransferItem = class {
    webkitGetAsEntry(): FileSystemEntry | null {
        return null;
    }
} as typeof DataTransferItem;

global.DataTransfer = class {
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

global.DragEvent = class extends MouseEvent {
    dataTransfer: DataTransfer | null;

    constructor(type: string, eventInitDict: DragEventInit) {
        super(type, eventInitDict);
        this.dataTransfer = eventInitDict.dataTransfer ?? null;
    }
} as typeof DragEvent;

global.CSS = {
    supports: jest.fn().mockReturnValue(false) as typeof CSS.supports
} as typeof CSS;

if (!globalThis.structuredClone) {
    globalThis.structuredClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
}

if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = jest.fn();
}

// jsdom implements no scrolling at all (https://github.com/jsdom/jsdom/issues/1695), and components
// scroll through `KbqScrollbarViewport`, which reaches `Element.prototype.scrollTo` via
// `CdkScrollable`. A bare `jest.fn()` would make every such call silently do nothing, so this applies
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
