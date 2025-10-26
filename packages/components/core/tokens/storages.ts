import { ClassProvider, FactoryProvider, InjectionToken } from '@angular/core';

/**
 * An abstraction over the `localStorage` object.
 */
export const KBQ_LOCAL_STORAGE = new InjectionToken<Storage>('[KBQ_LOCAL_STORAGE]');

class KbqStorageMock implements Storage {
    private store = {};

    get length(): number {
        return Object.keys(this.store).length;
    }

    setItem(key: string, item: string) {
        this.store[key] = item;
    }

    getItem(key: string) {
        return this.store[key] ?? null;
    }

    removeItem(key: string) {
        delete this.store[key];
    }

    clear() {
        this.store = {};
    }

    key() {
        return null;
    }
}

/**
 * KBQ_LOCAL_STORAGE provider for browser.
 */
export const kbqLocalStorageBrowserProvider: FactoryProvider = {
    provide: KBQ_LOCAL_STORAGE,
    // eslint-disable-next-line no-restricted-globals
    useFactory: () => localStorage
};

/**
 * KBQ_LOCAL_STORAGE provider for server.
 */
export const kbqLocalStorageServerProvider: ClassProvider = {
    provide: KBQ_LOCAL_STORAGE,
    useClass: KbqStorageMock
};
