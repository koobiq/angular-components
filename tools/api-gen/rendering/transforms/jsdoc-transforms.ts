import { JsDocTagEntry } from '../entities';
import { isDeprecatedEntry } from '../entities/categorization';
import {
    HasDeprecatedFlag,
    HasDescription,
    HasHtmlDescription,
    HasHtmlUsageNotes,
    HasJsDocTags,
    HasRenderableJsDocTags
} from '../entities/traits';
import { exampleAsMarkdown } from './example-markdown';
import { renderJsDocMarkdown } from './render-jsdoc-markdown';

const JS_DOC_USAGE_NOTES_TAG = 'usageNotes';
const JS_DOC_DESCRIPTION_TAG = 'description';
const JS_DOC_EXAMPLE_TAG = 'example';

const asMarkdown = (tag: JsDocTagEntry): string =>
    tag.name === JS_DOC_EXAMPLE_TAG ? exampleAsMarkdown(tag.comment) : tag.comment;

/**
 * Given an entity with a description, gets the entity augmented with an `htmlDescription`.
 *
 * @param context Identifies the entity in a Markdown compile error, e.g. `KbqSelect` or `KbqSelect.multiple`.
 */
export function addHtmlDescription<T extends HasDescription>(entry: T, context: string): T & HasHtmlDescription {
    const described = (entry as Partial<HasJsDocTags>).jsdocTags?.find(({ name }) => name === JS_DOC_DESCRIPTION_TAG);

    return { ...entry, htmlDescription: renderJsDocMarkdown(entry.description || described?.comment || '', context) };
}

/**
 * Given an entity with JsDoc tags, gets the entity with JsDocTagRenderable entries that
 * have been augmented with an `htmlComment`.
 */
export function addHtmlJsDocTagComments<T extends HasJsDocTags>(entry: T, context: string): T & HasRenderableJsDocTags {
    return {
        ...entry,
        jsdocTags: entry.jsdocTags.map((tag) => ({
            ...tag,
            htmlComment: renderJsDocMarkdown(asMarkdown(tag), `${context} @${tag.name}`)
        }))
    };
}

export function addHtmlUsageNotes<T extends HasJsDocTags>(entry: T, context: string): T & HasHtmlUsageNotes {
    const usageNotesTag = entry.jsdocTags.find((tag) => tag.name === JS_DOC_USAGE_NOTES_TAG);

    return {
        ...entry,
        htmlUsageNotes: usageNotesTag ? renderJsDocMarkdown(usageNotesTag.comment, `${context} @usageNotes`) : ''
    };
}

export function setEntryFlags<T extends HasJsDocTags>(entry: T): T & HasDeprecatedFlag {
    return { ...entry, isDeprecated: isDeprecatedEntry(entry) };
}
