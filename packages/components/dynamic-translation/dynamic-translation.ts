import { NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChildren,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    Renderer2,
    Signal,
    TemplateRef,
    viewChildren
} from '@angular/core';

/**
 * @docs-private
 */
type KbqDynamicTranslationParsedSlot = {
    type: 'text' | 'slot';
    template: TemplateRef<unknown> | null;
    context?: { $implicit: unknown };
    text?: string;
};

/**
 * @docs-private
 */
export interface KbqDynamicTranslationHelperSlot {
    name: string;
    tag: string;
    attributes?: { key: string; value: string }[];
    content?: string;
}

/**
 * Directive for defining a dynamic translation slot.
 */
@Directive({
    selector: '[kbqDynamicTranslationSlot]'
})
export class KbqDynamicTranslationSlot {
    /**
     * The name of the dynamic translation slot.
     */
    readonly name = input.required<string>({ alias: 'kbqDynamicTranslationSlot' });

    /**
     * @docs-private
     */
    readonly templateRef = inject(TemplateRef);
}

/**
 * Component for dynamic translation.
 */
@Component({
    selector: 'kbq-dynamic-translation',
    imports: [NgTemplateOutlet],
    template: `
        @for (slot of parsedSlots(); track $index) {
            @switch (slot.type) {
                @case ('slot') {
                    <ng-container *ngTemplateOutlet="slot.template; context: slot.context" />
                }
                @default {
                    <ng-container>{{ slot.text }}</ng-container>
                }
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDynamicTranslation {
    private readonly slots = contentChildren(KbqDynamicTranslationSlot);

    /**
     * The text which will be translated.
     */
    readonly text = input.required<string>();

    /**
     * @docs-private
     */
    protected readonly parsedSlots: Signal<KbqDynamicTranslationParsedSlot[]> = computed(() =>
        this.parseSlots(this.text(), this.slots())
    );

    private parseSlots(
        text: string,
        slots: ReadonlyArray<KbqDynamicTranslationSlot>
    ): KbqDynamicTranslationParsedSlot[] {
        const slotTemplatesByName = slots.reduce<Record<string, TemplateRef<unknown>>>((map, { name, templateRef }) => {
            const slotName = name();

            if (slotName) map[slotName] = templateRef;

            return map;
        }, {});
        const parsedSlots: KbqDynamicTranslationParsedSlot[] = [];
        const slotSelector = new RegExp(`\\[\\[(${Object.keys(slotTemplatesByName).join('|')})(?::(.+?))?\\]\\]`, 'g');
        let match: RegExpExecArray | null;
        let lastIndex = 0;

        while ((match = slotSelector.exec(text)) !== null) {
            const [slotMatch, slotName, slotText] = match;
            const [listMatch, listString] = new RegExp('^\\((.*?)\\)$', 'g').exec(slotText) ?? [];
            const textBeforeSlot = text.substring(lastIndex, +match.index);

            if (textBeforeSlot) {
                parsedSlots.push({ type: 'text', text: textBeforeSlot, template: null });
            }

            parsedSlots.push({
                type: 'slot',
                template: slotTemplatesByName[slotName] || null,
                context: { $implicit: listMatch && listString ? listString.split(',') : slotText }
            });

            lastIndex = match.index + slotMatch.length;
        }

        const textAfterLastSlot = text.substring(lastIndex);

        if (textAfterLastSlot) {
            parsedSlots.push({ type: 'text', text: textAfterLastSlot, template: null });
        }

        return parsedSlots;
    }
}

/**
 * @docs-private
 */
@Component({
    selector: 'kbq-dynamic-translation-with-dynamic-component-creation',
    imports: [KbqDynamicTranslation, KbqDynamicTranslationSlot],
    template: `
        <kbq-dynamic-translation [text]="text()">
            @for (slot of slots(); track $index) {
                <ng-container *kbqDynamicTranslationSlot="slot.name; let content">
                    <span
                        #replaceableSlotContainer
                        [attr.data-slot-name]="slot.name"
                        [attr.data-slot-content]="slot.content || content"
                    ></span>
                </ng-container>
            }
        </kbq-dynamic-translation>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDynamicTranslationHelper {
    private readonly renderer = inject(Renderer2);
    private readonly replaceableSlotContainers = viewChildren<ElementRef<HTMLElement>>('replaceableSlotContainer');
    private readonly slotsByName = new Map<string, KbqDynamicTranslationHelperSlot>();

    readonly text = input.required<string>();

    readonly slots = input.required<KbqDynamicTranslationHelperSlot[]>();

    constructor() {
        effect(() => {
            this.slotsByName.clear();
            this.slots().forEach((slot) => this.slotsByName.set(slot.name, slot));
        });

        afterNextRender(() => {
            this.replaceSlots();
        });
    }

    private replaceSlots(): void {
        this.replaceableSlotContainers().forEach(({ nativeElement }: ElementRef<HTMLElement>) => {
            const slotName = nativeElement.getAttribute('data-slot-name')!;
            const slotContent = nativeElement.getAttribute('data-slot-content')!;
            const { tag, attributes } = this.slotsByName.get(slotName)!;
            const elementToRender = this.renderer.createElement(tag);

            this.renderer.appendChild(elementToRender, this.renderer.createText(slotContent));

            attributes?.forEach(({ key, value }) => this.renderer.setAttribute(elementToRender, key, value));

            nativeElement.replaceWith(elementToRender);
        });
    }
}
