import { Observable, ReplaySubject } from 'rxjs';

export interface NavbarPropertyParameters {
    // name of local storage property
    property: string;
    // data array for dropdown
    data: any[];

    updateSelected?: boolean;
}

export interface NavbarPropertyChange {
    name: string;
    value: any;
}

export class NavbarProperty {
    get data(): any[] {
        return this._data;
    }

    private _data: any[];

    get currentValue(): any {
        return this._currentValue;
    }

    private _currentValue!: any;

    get changes(): Observable<NavbarPropertyChange> {
        return this._changes;
    }

    private _changes = new ReplaySubject<NavbarPropertyChange>(1);

    constructor(readonly parameters: NavbarPropertyParameters) {
        this._data = parameters.data;

        const index =
            parseInt(localStorage.getItem(this.parameters.property) || '') ||
            this.data.findIndex((item) => item.selected);
        this.setValue(index >= 0 ? index : 0);
    }

    setValue(index: number): void {
        if (this.currentValue === this.data[index]) {
            return;
        }

        this._currentValue = this.data[index];
        localStorage.setItem(this.parameters.property, index.toString());

        this._changes.next({ name: 'setValue', value: this.currentValue });

        if (this.parameters.updateSelected) {
            this.updateSelectedValues(index);
        }
    }

    private updateSelectedValues(index: number): void {
        if (this.data[index]) {
            this.data.forEach((item) => (item.selected = false));
            this.data[index].selected = true;

            this._changes.next({ name: 'updateSelectedValues', value: this.currentValue });
        }
    }
}
