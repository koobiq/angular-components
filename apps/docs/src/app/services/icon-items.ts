import type { KbqIconsMetadata } from '@koobiq/icons/types/icons';

/** Icons whose accent element is colored via the `--icon-accent-color` CSS variable are named `xxx-dot(-o)_size`. */
const ACCENT_COLOR_ICON_PATTERN = /-dot(-|_)/;

export interface DocsIconItem {
    id: string;
    name: string;
    cssClass: string;
    code: number;
    description: string;
    size: number;
    tags: string[];
    hasAccentColor: boolean;
}

export class DocsIconItems {
    allIcons: DocsIconItem[] = [];
    sizes: Set<number> = new Set();

    constructor(ICONS: KbqIconsMetadata) {
        this.allIcons = Object.keys(ICONS).map((id) => {
            const { codepoint, tags, description } = ICONS[id];

            const size = parseInt(id.split('_')[1]);

            this.sizes.add(size);

            const cssClass = 'kbq-'.concat(id);

            let name = id.replace(/_\d+/, '').replace(/-/g, ' ');

            name = name.charAt(0).toUpperCase() + name.slice(1);

            const hasAccentColor = ACCENT_COLOR_ICON_PATTERN.test(id);

            return {
                id,
                name,
                cssClass,
                code: parseInt(codepoint),
                size,
                tags,
                description,
                hasAccentColor
            } as DocsIconItem;
        });
    }

    getItems(): DocsIconItem[] {
        return [...this.allIcons];
    }

    getItemById(id: string): DocsIconItem | undefined {
        return this.allIcons.find((item) => item.id === id);
    }
}
