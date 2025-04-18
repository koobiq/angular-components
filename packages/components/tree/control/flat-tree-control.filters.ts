import { FlatTreeControl } from './flat-tree-control';

export interface FlatTreeControlFilter<T> {
    result: T[];

    handle(value: string | null, prevFilter?: FlatTreeControlFilter<T> | null): T[];
}

export class FilterByViewValue<T> implements FlatTreeControlFilter<T> {
    result: T[];

    constructor(private control: FlatTreeControl<T>) {}

    handle(value: string | null): T[] {
        const viewValue = value || null;

        this.result = this.control.dataNodes.filter((node) =>
            this.control.compareViewValues(this.control.getViewValue(node), viewValue)
        );

        return this.result;
    }
}

export class FilterParentsForNodes<T> implements FlatTreeControlFilter<T> {
    result: T[];

    constructor(private control: FlatTreeControl<T>) {}

    handle(_, prevFilter: FlatTreeControlFilter<T>): T[] {
        const result: Set<T> = new Set();

        this.control.dataNodes
            .filter((node) => prevFilter?.result.includes(node))
            .forEach((node) => {
                this.control.getParents(node, []).forEach((parent) => result.add(parent));

                result.add(node);
            });

        this.result = Array.from(result);

        return this.result;
    }
}

export class FilterByValues<T> implements FlatTreeControlFilter<T> {
    result: T[];

    private values: string[] = [];

    constructor(private control: FlatTreeControl<T>) {}

    handle(_, prevFilter?: FlatTreeControlFilter<T>): T[] {
        const found = this.control.dataNodes.filter((node) => this.values.includes(this.control.getValue(node)));

        this.result = Array.from(new Set([...(prevFilter?.result || []), ...found]));

        return this.result;
    }

    setValues = (values: string[]) => {
        this.values = values;
    };

    getValues(): string[] {
        return this.values;
    }
}
