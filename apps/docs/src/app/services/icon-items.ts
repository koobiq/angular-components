import { Injectable } from '@angular/core';

export interface IconItem {
    id: string;
    name: string;
    cssClass: string;
    code: number;
    description: string;
    size: number;
    tags: string | string[];
}

@Injectable({ providedIn: 'root' })
export class IconItems {
    allIcons: IconItem[] = [];
    sizes: Set<number> = new Set();

    // eslint-disable-next-line @typescript-eslint/ban-types
    constructor(ICONS: Object) {
        this.allIcons = Object.keys(ICONS).map((id) => {
            const { codepoint, tags, description } = ICONS[id];

            const size = parseInt(id.split('_')[1]);

            this.sizes.add(size);

            const cssClass = 'kbq-'.concat(id);

            let name = id.replace(/_\d+/, '').replace(/-/g, ' ');

            name = name.charAt(0).toUpperCase() + name.slice(1);

            return { id, name, cssClass, code: parseInt(codepoint), size, tags, description } as IconItem;
        });
    }

    getItems(): IconItem[] {
        return [...this.allIcons];
    }

    getItemById(id: string): IconItem | undefined {
        return this.allIcons.find((item) => item.id === id);
    }
}
