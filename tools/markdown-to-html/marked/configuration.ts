import { Marked, Renderer } from 'marked';

/** Globally configures marked for rendering JsDoc content to HTML. */
export function configureMarkedGlobally(customRenderer?: Renderer): Marked {
    const marked = new Marked();

    return marked.options({
        // Custom markdown renderer for transforming markdown files for the docs.
        renderer: customRenderer || null
    });
}
