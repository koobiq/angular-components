import type { Params } from '@angular/router';

/** The query parameter a link to a member of an API tab sets: the page scrolls to the member it names and highlights it. */
export const DOCS_API_MEMBER_PARAM = 'member';

/**
 * The query of a link to another place on the page, merged into the current one: the member a link selected is left
 * behind, or a reload of the page would go back to it rather than to where the link led.
 */
export const DOCS_API_WITHOUT_MEMBER: Readonly<Params> = Object.freeze({ [DOCS_API_MEMBER_PARAM]: null });
