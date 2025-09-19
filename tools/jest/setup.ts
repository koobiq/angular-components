/** required to run tests without using @angular-builders/jest */
if (!('Zone' in global)) {
    require('jest-preset-angular/setup-env/zone').setupZoneTestEnv();
}

global['__jest__'] = true;

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
    supports: (..._args: any[]) => false
} as typeof CSS;
