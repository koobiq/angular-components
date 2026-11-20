import type { Params } from '@angular/router';

// A link to lines of the source of an example names them with the parameters below: the page opens the source of the
// example, marks the lines and scrolls to them.

/** The query parameter of a link to lines of a source that names the example, by its id. */
export const DOCS_CODE_EXAMPLE_PARAM = 'example';

/** The query parameter of a link to lines of a source that names the file of the example, by its extension. */
export const DOCS_CODE_FILE_PARAM = 'file';

/** The query parameter of a link to lines of a source that names the lines, as `12` or `12-14`. */
export const DOCS_CODE_LINES_PARAM = 'lines';

/**
 * The query of a link to another place on the page, merged into the current one: the lines a reader has selected are
 * left behind, or a reload of the page would go back to them rather than to where the link led.
 */
export const DOCS_WITHOUT_CODE_LINES: Readonly<Params> = Object.freeze({
    [DOCS_CODE_EXAMPLE_PARAM]: null,
    [DOCS_CODE_FILE_PARAM]: null,
    [DOCS_CODE_LINES_PARAM]: null
});
