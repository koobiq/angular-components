/** required to run tests without using @angular-builders/jest */
if (!('Zone' in global)) {
    require('jest-preset-angular/setup-jest');
}

global['__jest__'] = true;

global.open = jest.fn();

global.URL.createObjectURL = jest.fn();

const RESIZE_EVENT = document.createEvent('Event');
RESIZE_EVENT.initEvent('resize', true, true);
global.window.resizeTo = (width: number, height: number): void => {
    global.window.innerWidth = width || global.window.innerWidth;
    global.window.innerHeight = height || global.window.innerHeight;
    global.window.dispatchEvent(RESIZE_EVENT);
};

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
    items = { length: 0 };
} as typeof DataTransfer;

global.DragEvent = class extends MouseEvent {
    dataTransfer: DataTransfer | null;

    constructor(type: string, eventInitDict: DragEventInit) {
        super(type, eventInitDict);
        this.dataTransfer = eventInitDict.dataTransfer ?? null;
    }
} as typeof DragEvent;
