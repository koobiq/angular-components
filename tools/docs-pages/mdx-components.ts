/**
 * Components and HTML elements the MDX pages of the documentation site use without importing them. The types serve
 * only the editor (the MDX extension reads `MDXProvidedComponents` and `JSX.IntrinsicElements`); `compile-page.ts`
 * turns each tag into Angular markup.
 * Not a `.d.ts`: the configurations that take every declaration file would type-check the example catalogue.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the {@link} target the editor opens from the hover
import type { DocsLiveExampleViewerComponent } from '../../apps/docs/src/app/components/live-example-viewer/docs-live-example-viewer';
import type { LiveExampleId } from '../../packages/docs-examples/example-module';
import type { HTML_ELEMENTS } from './compile-page';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace -- TypeScript looks the types of HTML elements up in `JSX`
    namespace JSX {
        /**
         * The HTML elements the compiler accepts, with plain string attributes or none, as in `<details open>`. No
         * JSX library in the repository declares them, and an element outside the list fails the build anyway.
         */
        type IntrinsicElements = Record<(typeof HTML_ELEMENTS)[number], Record<string, string | true>>;
    }

    type MDXProvidedComponents = {
        /**
         * Live example with its source code, rendered by {@link DocsLiveExampleViewerComponent}.
         *
         * @example <Example id="alert-overview" />
         */
        Example: (props: {
            /** Key of the example in `packages/docs-examples/example-module.ts`. */
            id: LiveExampleId;
        }) => null;
    };
}
