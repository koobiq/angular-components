import { BehaviorSubject } from 'rxjs';


export interface NavbarPropertyParameters {
    // name of local storage property
    property: string;
    // data array for dropdown
    data: any[];

    updateTemplate: boolean;
    updateSelected: boolean;
}

export interface NavbarPropertyChange {
    name: string;
    value: any;
}

export class NavbarProperty {
    data: any[];
    currentValue: any;

    changes = new BehaviorSubject<NavbarPropertyChange>(undefined);

    private readonly property: string;

    private readonly updateTemplate: boolean;
    private readonly updateSelected: boolean;

    constructor(parameters: NavbarPropertyParameters) {
        this.data = parameters.data;
        this.currentValue = this.data[0];
        this.property = parameters.property;

        this.updateTemplate = parameters.updateTemplate;
        this.updateSelected = parameters.updateSelected;

        this.init();
    }

    setValue(i: number) {
        this.currentValue = this.data[i];
        localStorage.setItem(this.property, `${i}`);

        this.changes.next({ name: 'setValue', value: this.currentValue });

        if (this.updateTemplate) {
            this.updateTemplateValues();
        }

        if (this.updateSelected) {
            this.updateSelectedValues(i);
        }
    }

    init() {
        const currentValue = parseInt(localStorage.getItem(this.property) as string) || 0;

        if (Number.isInteger(currentValue)) {
            this.setValue(currentValue);
        } else {
            localStorage.setItem(this.property, '0');

            this.changes.next({ name: 'init', value: currentValue });
        }
    }

    private updateTemplateValues() {
        if (!this.currentValue) { return; }

        for (const color of this.data) {
            document.body.classList.remove(color.className);
        }

        document.body.classList.add(this.currentValue.className);

        this.changes.next({ name: 'updateTemplateValues', value: this.currentValue });
    }

    private updateSelectedValues(i: number) {
        if (this.data[i]) {
            this.data.forEach((color) => color.selected = false);
            this.data[i].selected = true;

            this.changes.next({ name: 'updateSelectedValues', value: this.currentValue });
        }
    }
}
