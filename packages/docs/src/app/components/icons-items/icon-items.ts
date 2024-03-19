/* tslint:disable:naming-convention */
import { Injectable } from '@angular/core';


export interface IconItem {
    id: string;
    name: string;
    cssClass: string;
    code: string;
    description: string;
    size: number;
    tags: string[];
}

@Injectable()
export class IconItems {
    allIcons: IconItem[] = [];
    sizes: Set<number> = new Set();

    constructor(ICONS) {
        this.allIcons = Object
            .keys(ICONS)
            .map((id) => {
                const { code, tags, description } = ICONS[id];

                const size = parseInt(id.split('_')[1]);
                this.sizes.add(size);

                const cssClass = 'mc-'.concat(id);

                let name = id
                    .replace(/_\d+/, '')
                    .replace(/-/g, ' ');

                name = name.charAt(0).toUpperCase() + name.slice(1);

                // tslint:disable-next-line:no-object-literal-type-assertion
                return { id, name, cssClass, code, size, tags, description } as IconItem;
            });
    }

    getItems(): IconItem[] {
        return [...this.allIcons];
    }

    getItemById(id: string): IconItem | undefined {
        return this.allIcons.find((item) => item.id === id);
    }
}
