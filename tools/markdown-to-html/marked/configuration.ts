import { Marked, Renderer } from 'marked';
// import { markedHighlight } from 'marked-highlight';

// import { highlightCodeBlock } from '../../highlight-files/highlight-code-block';

/** Globally configures marked for rendering JsDoc content to HTML. */
export function configureMarkedGlobally(customRenderer?: Renderer): Marked {
  const marked = new Marked(
      // TODO: implement when code block component will be used in docs, for now it's not being used
      /*markedHighlight({
          langPrefix: 'hljs hljs-line-numbers language-',
          highlight: highlightCodeBlock
      })*/
  );

  return marked.options({
      // Custom markdown renderer for transforming markdown files for the docs.
      renderer: customRenderer || null,
  });
}
