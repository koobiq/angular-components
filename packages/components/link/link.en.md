A link connects web pages or acts as a lighter alternative to a button.

### When to use

- For navigating between pages
- When you need to embed a button in text. In this case, use a [pseudo-link](/en/components/link/overview#pseudo-link)

#### When not to use links

- For the primary action in a modal dialog — use a [button](/en/components/button)
- For interactivity outside of text — use a [ghost button](/en/components/button)

### Component structure

- Text
- Underline (for regular links)
- Icon (optional)

#### Variations

##### Normal size

Used by default.

<!-- example(link-general) -->

##### Small size

Used where a small-sized link is needed (for example, in a field caption).

<!-- example(link-caption) -->

### How it works

#### Link types by destination page

##### Page within the product

For main navigation.

<!-- example(link-general) -->

##### Page within the product in a new tab

When it is important to keep the parent page. Use links that open in a new tab as rarely as possible.

<!-- example(link-target-blank) -->

##### External page

For navigating to external pages. External pages are all pages outside the product's scope (other company products are also external). The distinction is indicated by an icon.

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Note</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

To denote external links, use the `kbq-north-east_16` icon.
This icon has specially adjusted spacing, so for correct display add the `.kbq-link_external` class to the link element.

</div>
</div>

<!-- example(link-external) -->

##### External application

For opening in other applications. It is advisable to write the application name directly in the link. For better clarity, the icon can be replaced with the product logo.

<!-- example(link-application) -->

It is useful to detect whether a desktop application is installed on the user's device. If the application is not installed, the link is replaced with plain text.

| <img src="./assets/images/link/desktop-link-active.jpg" width="500"> |
| :------------------------------------------------------------------: |
|    AI on Windows. Project links are active and open in AI Desktop    |

| <img src="./assets/images/link/desktop-link-disabled.jpg" width="500"> |
| :--------------------------------------------------------------------: |
|         AI on macOS. Project links are displayed as plain text         |

Sometimes specifying the product and adding a logo may be excessive. If you are confident that the context makes the link's purpose clear, these elements can be omitted.

##### Pseudo-link

An analog of a button. Does not reload the page, does not open in a new tab or by link.

<!-- example(link-pseudo) -->

A link should not lead to the same page it is on. Such links are useless and only confuse the user: you click, the page loads, and you end up where you started. The exception is interfaces with refreshable content, where a link duplicates a page refresh.

Use a pseudo-link when you need to embed an action in text. For all other cases, use a ghost button.

#### Links when printing pages

When printing a page, the link text may change to the full link address. This can be useful if using a printed version of the page is an expected use case. For example, links to CVE databases can be preserved in a vulnerability scan report. The link should be clean: "http://www" can be omitted.

In the printed page:

CVE-2019-1020010:
cvedetails.com/cve/CVE-2019-1020010/

<!-- example(link-print) -->

#### Browser behavior

It is important that a link not only looks like a link but also works like one. Characteristics of a proper link:

- You can copy the link address
- You can open the link in a new tab via the context menu or Ctrl+click
- The markup uses the `<a>` tag

| <img src="./assets/images/link/proper-link.jpg" width="500" alt="Proper link. You can copy the address, you can open in a new tab"> |
| :---------------------------------------------------------------------------------------------------------------------------------: |
|                                **Proper link.** You can copy the address, you can open in a new tab                                 |

| <img src="./assets/images/link/improper-link.jpg" width="500" alt="Improper link. The browser did not identify the element as a link"> |
| :------------------------------------------------------------------------------------------------------------------------------------: |
|                                 **Improper link.** The browser did not identify the element as a link                                  |

#### Focus and keyboard navigation

| <div style="min-width: 110px;">Key</div>                                                      | Action                        |
| --------------------------------------------------------------------------------------------- | ----------------------------- |
| <span class="docs-hot-key-button">Space</span> \ <span class="docs-hot-key-button">⏎</span>   | Follow the link               |
| <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">F10</span> | Open context menu (for links) |
|                                                                                               | (Applicable on Windows only.) |

#### Design and animation

##### Multiline links

In multiline links, each line is underlined:

<!-- example(link-multi-line) -->

It is important that in multiline links the hover zone covers the line spacing.

##### Syntax

**Links:** what? where?
**Pseudo-links:** button syntax.

Related prepositions are included in the link:

<!-- example(link-prepositions) -->

##### Icons

By default — on the left. Exception — the external navigation icon.

The icon is within the click area but is not underlined.

<!-- example(link-icons) -->

##### Visited

By default, visited links are not styled differently. This tradition dates back to the early internet, when hyperlinks were the primary means of navigating between pages.

Marking visited links is useful on collection pages — article roundups, reading lists: color highlighting marks reading progress.

<!-- example(link-visited) -->

##### Disabled

<!-- example(link-disabled) -->
