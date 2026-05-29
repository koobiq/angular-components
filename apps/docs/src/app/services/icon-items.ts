export interface DocsIconItem {
    id: string;
    name: string;
    cssClass: string;
    code: number;
    description: string;
    size: number;
    tags: string[];
}

export class DocsIconItems {
    allIcons: DocsIconItem[] = [];
    sizes: Set<number> = new Set();

    constructor(ICONS: Record<string, { codepoint: string; tags: string[]; description: string }>) {
        this.allIcons = Object.keys(ICONS).map((id) => {
            const { codepoint, tags, description } = ICONS[id];

            const size = parseInt(id.split('_')[1]);

            this.sizes.add(size);

            const cssClass = 'kbq-'.concat(id);

            let name = id.replace(/_\d+/, '').replace(/-/g, ' ');

            name = name.charAt(0).toUpperCase() + name.slice(1);

            return { id, name, cssClass, code: parseInt(codepoint), size, tags, description } as DocsIconItem;
        });
    }

    getItems(): DocsIconItem[] {
        return [...this.allIcons];
    }

    getItemById(id: string): DocsIconItem | undefined {
        return this.allIcons.find((item) => item.id === id);
    }
}
