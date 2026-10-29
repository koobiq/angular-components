# Spec Delta

<!-- cspell:ignore dragover webkitdirectory -->

## Purpose

Describes what `@koobiq/components/file-upload` guarantees to consumers: how the single and the multiple uploader take files from the system dialog and from drag and drop, how users remove them with a pointer, the keyboard or assistive technology, how the value reaches Angular forms, and how the dropzone overlays and the primitives behave.

## ADDED Requirements

### Requirement: Uploader flavour by selector

`kbq-single-file-upload` and a `kbq-file-upload` without a `multiple` attribute SHALL render the single uploader, whose host has the class `kbq-single-file-upload`. `kbq-multiple-file-upload` and `kbq-file-upload[multiple]` SHALL render the multiple uploader, whose host has the class `kbq-multiple-file-upload`.

#### Scenario: Plain `kbq-file-upload`

- **WHEN** a template renders `<kbq-file-upload [formControl]="control">`
- **THEN** it is a single uploader that holds at most one file

#### Scenario: `kbq-file-upload` with `multiple`

- **WHEN** a template renders `<kbq-file-upload multiple>`
- **THEN** it is a multiple uploader and its host has the class `kbq-multiple-file-upload`

### Requirement: NgModule exports

`KbqFileUploadModule` SHALL export the single uploader, the multiple uploader and `kbqFileDrop`. It MUST NOT export `kbqLocalDropzone`, `kbqFileUploadContext`, `kbqFileLoader` or `kbqFileList`; those are standalone and imported on their own.

#### Scenario: Local dropzone in an NgModule application

- **WHEN** a module imports only `KbqFileUploadModule` and its template uses `kbqLocalDropzone`
- **THEN** the directive is not applied until `KbqLocalDropzone` is imported as well

### Requirement: Adding files through the system dialog

Each uploader SHALL render its browse link as a label around a visually hidden native file input, so activating the link opens the system dialog, and SHALL add the files chosen there. The input of the multiple uploader SHALL be `multiple`. The input's value SHALL be cleared after every selection, so the same file can be chosen again.

#### Scenario: Choosing a file

- **WHEN** the user chooses `report.pdf` in the dialog of an empty multiple uploader
- **THEN** the list holds one item whose `file` is `report.pdf`
- **AND** `filesChange` fires once with that list

#### Scenario: Choosing the same file again

- **WHEN** the user chooses a file in the dialog of a single uploader and then the same file again
- **THEN** the second choice is reported as well, because the native input was cleared after the first

### Requirement: Adding files by dropping them on the uploader

Files dropped on an enabled uploader SHALL be added as if they had been chosen in the dialog. Unless the full-screen dropzone is on, the uploader's drop area SHALL have the class `kbq-file-drop_dragover` while a drag is over it.

#### Scenario: Drop on a multiple uploader

- **WHEN** the user drops `test.file` on an empty multiple uploader
- **THEN** the list holds that file and `filesChange` fires once

### Requirement: Single uploader holds one file

The single uploader SHALL keep only the first file of a selection or a drop and emit the others through `rejected`. Its file input MUST NOT be `multiple`, even when its host carries a `multiple` attribute. A drop while it holds a file SHALL replace that file.

#### Scenario: Two files dropped

- **WHEN** `kept.file` and `dropped.file` are dropped on a single uploader
- **THEN** it holds `kept.file`
- **AND** `rejected` fires once with `[dropped.file]`

#### Scenario: `multiple` on `kbq-single-file-upload`

- **WHEN** a template renders `<kbq-single-file-upload multiple>`
- **THEN** its file input does not allow selecting several files

### Requirement: Selected file of the single uploader

While it holds a file, the single uploader SHALL show a row with the file name and a remove control in place of the dropzone caption and its browse link, and its host SHALL have the class `kbq-single-file-upload_selected`. Without a file it SHALL show the caption and the browse link and MUST NOT have that class.

#### Scenario: File cleared

- **WHEN** the file bound to a single uploader is cleared
- **THEN** the host loses `kbq-single-file-upload_selected` and the caption with the browse link is shown again

### Requirement: File list of the multiple uploader

With at least one file, the multiple uploader SHALL render the files in order in a list with `role="list"`, each row with `role="listitem"` showing the file name and a remove control, followed by a footer with the caption and the browse link. Its drop area SHALL then have the class `kbq-selected`.

#### Scenario: Three files

- **WHEN** a multiple uploader holds `a.file`, `b.file` and `c.file`
- **THEN** three list items with a remove control each are rendered in that order
- **AND** the browse link is in the footer below the list

### Requirement: Empty multiple uploader

Without files, a multiple uploader with `size` `'default'` (the default) SHALL show an empty state with an upload icon, the `multiple.title` label and the caption. With `size` `'compact'` it SHALL show only an icon and a one-line caption. The drop area SHALL have the class `kbq-file-upload_default` or `kbq-file-upload_compact` to match.

#### Scenario: Compact variant

- **WHEN** an empty multiple uploader has `size="compact"`
- **THEN** it shows a one-line caption without the title
- **AND** its drop area has `kbq-file-upload_compact`

### Requirement: File size

The single uploader SHALL show the size of its file, formatted by the `kbqDataSize` pipe, unless `showFileSize` is `false`; `showFileSize` defaults to `true`. The multiple uploader SHALL always show the size of every file.

#### Scenario: Size hidden on the single uploader

- **WHEN** a single uploader holding a file has `[showFileSize]="false"`
- **THEN** only the file name and the remove control are shown in its row

### Requirement: Icon of a selected file

The single uploader SHALL show the projected `[kbq-icon]` element in front of the file name. The multiple uploader SHALL render the `#kbqFileIcon` template in front of each file name, with the file item as the implicit context. The single uploader MUST NOT render a `#kbqFileIcon` template.

#### Scenario: Icon depending on the item

- **WHEN** a multiple uploader has `<ng-template #kbqFileIcon let-file>` that picks an icon from `file.hasError`
- **THEN** each row shows the icon chosen for its own item

#### Scenario: Template given to the single uploader

- **WHEN** a single uploader holding a file contains only `<ng-template #kbqFileIcon>`
- **THEN** no icon is shown in front of the file name

### Requirement: Long file names

A file name that does not fit its row SHALL be cut in the middle so that its end, with the extension, stays visible, without scrolling the row horizontally. Hovering a cut name SHALL show the full name in a tooltip, also while the uploader is disabled.

#### Scenario: Long name in a narrow uploader

- **WHEN** a 320 px wide uploader holds a file with a long `.pdf` name
- **THEN** the name ends with `.pdf` and the row does not scroll horizontally

#### Scenario: Tooltip while disabled

- **WHEN** a disabled multiple uploader shows a cut file name and the user hovers it
- **THEN** a tooltip with the full name appears

### Requirement: Allowed item kinds

`allowed` SHALL decide which browse links an uploader renders: `'file'` (the default) a link that chooses files, `'folder'` a link whose file input has `webkitdirectory` and chooses a folder, `'mixed'` both. The file input SHALL carry `accept`; the folder input MUST NOT.

#### Scenario: Mixed mode

- **WHEN** an uploader has `allowed="mixed"`
- **THEN** it renders two browse links, one for files and one for a folder

#### Scenario: Folder chosen in a single uploader

- **WHEN** the user chooses a folder of three files in a single uploader with `allowed="folder"`
- **THEN** it holds the first file and emits the other two through `rejected`

### Requirement: Caption of the single uploader

In `'file'` mode the single uploader SHALL render the text of `single.captionTextWithFolder` before `{{ browseLink }}` and the `single.browseLink` link; in `'folder'` mode the text of `single.captionTextOnlyFolder` before its placeholder and the `single.browseLinkFolder` link; in `'mixed'` mode `single.captionTextWithFolder` with both placeholders replaced by links. `single.captionText` MUST NOT be rendered.

#### Scenario: File mode in `en-US`

- **WHEN** an empty single uploader with the default `allowed` is shown in `en-US`
- **THEN** it reads "Drag here or choose file", with "choose file" as the link

#### Scenario: Mixed mode in `en-US`

- **WHEN** an empty single uploader with `allowed="mixed"` is shown in `en-US`
- **THEN** it reads "Drag here or choose file or folder", with "choose file" and "folder" as links

### Requirement: Caption of the multiple uploader

The multiple uploader SHALL render the text of `multiple.captionText`, or of `multiple.captionTextForCompactSize` when compact, before `{{ browseLink }}`, followed by the `multiple.browseLink` link. `'folder'` and `'mixed'` modes SHALL use `captionTextOnlyFolder` and `captionTextWithFolder` like the single uploader. Once files are listed, the leading text SHALL be that of `multiple.captionTextWhenSelected`. Text after the last placeholder MUST NOT be rendered.

#### Scenario: Empty default uploader in `en-US`

- **WHEN** an empty multiple uploader is shown in `en-US`
- **THEN** it shows the title "Drag here" and the caption "or choose files", with "choose files" as the link

#### Scenario: Files listed in `en-US`

- **WHEN** a multiple uploader in `en-US` holds a file
- **THEN** its footer reads "Drag more or choose files"

### Requirement: Disabled state

While disabled through the `disabled` input or its form control, the uploader SHALL add `kbq-disabled` to its drop area and to every list row, disable its native file inputs, browse links and remove controls, and ignore files that are chosen, dropped or removed. Disabling or enabling the form control SHALL disable or enable the uploader.

#### Scenario: Drop on a disabled uploader

- **WHEN** files are dropped on a disabled uploader
- **THEN** no file is added and no output fires

#### Scenario: Form control disabled

- **WHEN** the bound form control is disabled and then enabled again
- **THEN** the uploader is disabled, its file input included, and then enabled again

### Requirement: Error state of the uploader

With a form directive on it, the uploader SHALL evaluate `errorStateMatcher` on every change detection, by default the injected `ErrorStateMatcher` (invalid and touched, or invalid in a submitted form), and SHALL add `kbq-error` to its drop area while in error. Binding `errorStateMatcher` to `undefined` SHALL restore the default. Without a form directive the uploader MUST NOT enter the error state.

#### Scenario: Required control touched

- **WHEN** an uploader is bound to a required control with no value and the control is marked touched
- **THEN** the uploader is in the error state

#### Scenario: Matcher binding turns undefined

- **WHEN** a matcher that always reports an error is bound and then the binding becomes `undefined`
- **THEN** `kbq-error` is removed from the drop area of a valid, untouched uploader

### Requirement: Error state of the single file

The single uploader SHALL also be in the error state while its item has `hasError`. With a form control, it SHALL set `hasError` of the item it holds whenever the control status changes, to `true` for `INVALID` and `false` otherwise, mutating the item object.

#### Scenario: Asynchronous validator rejects the file

- **WHEN** a single uploader's control has an asynchronous validator and the validator resolves with an error for the chosen file
- **THEN** the item's `hasError` becomes `true` and the uploader shows the error state

### Requirement: Errors of individual files

In the multiple uploader, an item with `hasError` SHALL mark only its own row: the row SHALL have `aria-invalid="true"` and its content the class `kbq-error`, and its remove control SHALL use the error color. The uploader itself MUST NOT enter the error state because of an item, and it MUST NOT set `hasError` itself.

#### Scenario: File without an error

- **WHEN** the bound list holds one item without `hasError`
- **THEN** its row has no `aria-invalid` attribute

#### Scenario: File in error

- **WHEN** the bound list is replaced with one whose only item has `hasError: true`
- **THEN** its row has `aria-invalid="true"`

### Requirement: Height of the file list

The file list of the multiple uploader SHALL grow with its files while `--kbq-file-upload-size-multiple-max-height` is unset. With that property set on the uploader, the list SHALL stop growing at that height and scroll.

#### Scenario: Height cap

- **WHEN** a multiple uploader with `--kbq-file-upload-size-multiple-max-height: 120px` holds 12 files
- **THEN** the list stops growing at that height and scrolls

### Requirement: Scroll indicator of the file list

When the file list appears or gains files and overflows its height, the multiple uploader SHALL briefly reveal its scrollbar without the pointer going near it. A list that fits MUST NOT reveal one, and removing files or rewriting the same number of files MUST NOT reveal it again.

#### Scenario: Overflowing list rendered

- **WHEN** a height-capped multiple uploader renders more files than fit
- **THEN** its scrollbar track is revealed without any pointer interaction

#### Scenario: List that fits

- **WHEN** a height-capped multiple uploader renders one file
- **THEN** no scrollbar is revealed

### Requirement: Full-screen dropzone input

`fullScreenDropZone` set to `true` or to a `KbqDropzoneData` object SHALL make the uploader take files dropped anywhere on the page, `true` meaning an empty configuration, and SHALL turn off its own drop area. `false` or `undefined` SHALL stop listening. A new configuration SHALL replace the listeners, so one drop adds files once, and destroying the uploader SHALL stop them.

#### Scenario: Drop anywhere on the page

- **WHEN** an uploader has `[fullScreenDropZone]="true"` and a file is dropped on the page
- **THEN** the uploader adds the file

#### Scenario: Configuration changed

- **WHEN** `fullScreenDropZone` changes from `{ title: 'FIRST' }` to `{ title: 'SECOND' }` and a file is dropped
- **THEN** the file is handled once

#### Scenario: Uploader destroyed

- **WHEN** an uploader with a full-screen dropzone is destroyed and a drag enters the page
- **THEN** no overlay opens

### Requirement: Full-screen dropzone overlay

While the full-screen dropzone listens, a drag entering the page SHALL open one overlay covering the viewport, without a backdrop, with the classes `kbq-dropzone-overlay` and `kbq-fullscreen-dropzone`. A drop SHALL emit the files and close the overlay, and the drag leaving the page SHALL close it. A drag that moves between elements of the page MUST NOT close it.

#### Scenario: Drag leaves the window

- **WHEN** the overlay is open and the drag leaves the page
- **THEN** the overlay closes

#### Scenario: Drag moves inside the page

- **WHEN** the overlay is open and the drag moves onto a child element of the page
- **THEN** the overlay stays open

### Requirement: Full-screen dropzone service

`KbqFullScreenDropzoneService` SHALL be injectable from the root injector. `init(config)` SHALL start listening on the document body, replacing earlier listeners; `stop()` SHALL stop them; `open(config)` and `close()` SHALL show and dispose the overlay, `close()` being safe without one; `disabled` SHALL make it ignore every drag event; `filesDropped` SHALL emit the dropped files.

#### Scenario: Service used without an uploader

- **WHEN** an application calls `init({ title: 'Drop files here' })` on the root service and a file is dropped on the page
- **THEN** `filesDropped` emits that file

#### Scenario: Stopped service

- **WHEN** `stop()` has been called and a drag enters the page
- **THEN** no overlay opens

### Requirement: Dropzone overlay content

The overlay of either dropzone SHALL show an empty state whose title is the configuration's `title` or, without one, the active locale's `multiple.title`; whose caption is the configuration's `caption` or nothing; and whose size is the configuration's `size` or `'normal'`. Unless `autoCapture` is `false`, it SHALL move focus into the overlay when it opens and give it back when it closes.

#### Scenario: Default title

- **WHEN** an uploader with `[fullScreenDropZone]="true"` shows its overlay in `en-US`
- **THEN** the overlay's title reads "Drag here" and it has no caption

#### Scenario: Configured title and caption

- **WHEN** the overlay is opened with `{ title: 'Full-screen dropzone', caption: 'caption' }`
- **THEN** it shows that title and that caption

### Requirement: Dropzone overlay animation

The overlay of either dropzone SHALL receive the class `kbq-dropzone-overlay__attached` after a zero-delay timer once it opens, which fades it in, and SHALL have the class `kbq-animations-disabled` when animations are disabled.

#### Scenario: Animations disabled

- **WHEN** `KBQ_ANIMATIONS_CONFIG` disables animations and a dropzone overlay opens
- **THEN** the overlay has `kbq-animations-disabled` and, after a zero-delay timer, `kbq-dropzone-overlay__attached`

### Requirement: Local dropzone overlay

`kbqLocalDropzone` SHALL add the class `kbq-local-dropzone__trigger` to its host and, when a drag enters the host, open one overlay of the host's size over the host's top-left corner, with the classes `kbq-dropzone-overlay` and `kbq-local-dropzone`. A drop on the overlay SHALL emit `filesDropped` and close it; the drag leaving the overlay SHALL close it; destroying the directive SHALL close it.

#### Scenario: Drag enters the area

- **WHEN** a drag enters an element with `kbqLocalDropzone`
- **THEN** an overlay with the element's width and height opens over it

#### Scenario: Drop on the overlay

- **WHEN** files are dropped on the open overlay
- **THEN** `filesDropped` emits them and the overlay closes

### Requirement: Local dropzone connection

`kbqConnectedTo` SHALL hand the files dropped on a local dropzone to the given single or multiple uploader, which SHALL add them as if they had been dropped on it. Without `kbqConnectedTo` the files SHALL only be emitted through `filesDropped`.

#### Scenario: Sidebar connected to an uploader

- **WHEN** a sidebar has `kbqLocalDropzone [kbqConnectedTo]="upload"` and a file is dropped on it
- **THEN** the uploader `upload` adds the file

### Requirement: Concat add strategy

With `addStrategy` `'concat'`, the default, the multiple uploader SHALL append new files and skip each one whose name, size, last-modified time and type equal those of a file already listed, emitting the skipped files through `rejected`. When every file is skipped it SHALL still emit `filesAdded` with an empty array and `filesChange`, and write the unchanged list to the form control.

#### Scenario: Duplicate chosen again

- **WHEN** the user chooses the same file twice in a row
- **THEN** the list holds it once
- **AND** `rejected` fires once with that file and `filesAdded` fires the second time with `[]`

#### Scenario: Different file

- **WHEN** the user chooses one file and then another with a different name
- **THEN** the list holds both

#### Scenario: Equal files in one selection

- **WHEN** a single drop carries two files that are equal to each other but to no listed file
- **THEN** both are added

### Requirement: Replace add strategy

With `addStrategy` `'replace'`, a selection or a drop SHALL replace the whole list and MUST NOT emit `rejected`. Under either strategy, a drop that carries no files, such as an empty folder, SHALL leave the list unchanged, emit no output and only mark the control touched.

#### Scenario: New selection

- **WHEN** a list holds one file and the user chooses another
- **THEN** the list holds only the new file

#### Scenario: Empty folder dropped

- **WHEN** a list holds one file and a drop hands over no files
- **THEN** the list still holds that file and `filesChange` does not fire

### Requirement: Accepted file types

`accept` SHALL be joined with commas into the `accept` attribute of the uploader's file input, or `*/*` when it is unset or empty. It SHALL only filter what the system dialog offers: dropped files MUST NOT be checked against it, and the uploader MUST NOT reject a file for its type.

#### Scenario: Two types

- **WHEN** `accept` is `['.pdf', '.png']`
- **THEN** the file input has `accept=".pdf,.png"`

#### Scenario: Dropped file of another type

- **WHEN** `accept` is `['.pdf']` and `test.test` is dropped on a single uploader
- **THEN** the uploader holds `test.test`

### Requirement: Removing the single file

Activating the remove control of the single uploader by a click, Enter, Space, Backspace or Delete SHALL clear the file, write `null` to the form control, emit `fileChange` with `null` and mark the control touched. Space MUST NOT scroll the page.

#### Scenario: Delete key on the remove control

- **WHEN** the remove control of a single uploader holding a file has focus and the user presses Delete
- **THEN** `fileChange` fires once with `null` and the uploader holds no file

### Requirement: Removing a file from the list

Activating a row's remove control by a click, Enter or Space, or pressing Backspace or Delete while focus is in the row, SHALL remove that file, emit `itemRemoved` and `fileRemoved` with the item and its index, then `filesChange` with the remaining files, write them to the form control and mark it touched.

#### Scenario: Delete key in a row

- **WHEN** the remove control of the only row has focus and the user presses Delete
- **THEN** `filesChange` fires once with an empty list

#### Scenario: Click on a remove control

- **WHEN** the user clicks the remove control of the second of three rows
- **THEN** `fileRemoved` fires with that item and index 1

### Requirement: Removing files from code

`deleteItem()` on the single uploader and `deleteFile(index)` on the multiple uploader SHALL behave as the remove control does, outputs, form value and focus included, and SHALL do nothing while disabled. `deleteFile()` with an index outside the list SHALL do nothing. `deleteItem()` without a file SHALL still emit `fileChange` with `null` and write `null` to the form control.

#### Scenario: Index outside the list

- **WHEN** `deleteFile(5)` is called on a multiple uploader holding two files
- **THEN** the list is unchanged and no output fires

### Requirement: Focus after removal

After a removal, focus SHALL move to the remove control that took the removed row's place, or to the last remove control when the last row was removed, or to the file input of the browse link when no file remains. Backspace and Delete SHALL move it with the keyboard focus origin, a click, Enter or Space with the program origin.

#### Scenario: Middle row removed

- **WHEN** the user removes `b.file` from `a.file`, `b.file`, `c.file` with the keyboard
- **THEN** focus is on the remove control of `c.file`, now the second row

#### Scenario: Last file removed

- **WHEN** the user removes the only remaining file
- **THEN** focus is on the file input of the browse link

### Requirement: Remove control semantics

Every remove control SHALL have `role="button"` and be in the tab order. Its accessible name SHALL be the localized `a11y.remove` label in the single uploader, and that label followed by the file name in the multiple uploader. While disabled it SHALL have `aria-disabled="true"` and leave the tab order.

#### Scenario: Name in the multiple uploader

- **WHEN** a multiple uploader lists `test.file`
- **THEN** the row's remove control has an `aria-label` that contains `test.file`

### Requirement: Tab order

The tab stop of a browse link SHALL be its visually hidden file input; the visible link MUST NOT be a tab stop. A single uploader holding a file SHALL offer only its remove control. In a multiple uploader with files, the remove controls SHALL come first, in list order, and the browse link of the footer last.

#### Scenario: Tabbing through a filled multiple uploader

- **WHEN** a multiple uploader lists two files and the user tabs into it
- **THEN** focus visits the two remove controls and then the file input of the browse link

### Requirement: Keyboard focus of the browse link

When the file input of a browse link receives keyboard focus, its label SHALL get the class `cdk-keyboard-focused` and the link SHALL show the keyboard focus outline. The class SHALL be removed when the input loses focus.

#### Scenario: Tab onto the browse link

- **WHEN** the user tabs onto the file input of an empty uploader
- **THEN** its label has `cdk-keyboard-focused`, and loses it once focus moves on

### Requirement: Hints

Projected `kbq-hint` elements SHALL be rendered below the uploader, and their ids SHALL be written, space-separated, to the `aria-describedby` of every file input of the uploader. Without hints the inputs MUST NOT have `aria-describedby`.

#### Scenario: One hint

- **WHEN** an uploader contains `<kbq-hint>Up to 5 MB</kbq-hint>`
- **THEN** its file input has an `aria-describedby` equal to the hint's id

### Requirement: Invalid file input

While the uploader is in the error state, and for the single uploader also while its item has `hasError`, every file input of the uploader SHALL have `aria-invalid="true"`. Otherwise the attribute MUST NOT be present.

#### Scenario: Required control touched

- **WHEN** an uploader is bound to a required, empty control
- **THEN** its file input has no `aria-invalid` until the control is marked touched, and `aria-invalid="true"` afterwards

### Requirement: Announcements

Each uploader SHALL render a visually hidden live region with `role="status"`, `aria-live="polite"` and `aria-atomic="true"`. After files are added it SHALL put `a11y.fileAdded` there for each added file, and after a removal `a11y.fileRemoved`, with `{{ fileName }}` replaced by the file name, joined by ". " and followed by `a11y.filesNotAdded` when part of the selection was discarded.

#### Scenario: File added

- **WHEN** `test.file` is added to an uploader in `ru-RU`
- **THEN** the live region reads "test.file добавлен"

#### Scenario: Only duplicates chosen

- **WHEN** every file of a selection is skipped as a duplicate
- **THEN** the live region reads only the `a11y.filesNotAdded` text

### Requirement: Accessibility checks

The single and the multiple uploader SHALL pass axe-core checks when empty, when holding files and in the error state.

#### Scenario: Uploader in error

- **WHEN** axe-core runs on an uploader bound to a touched, required, empty control with a hint
- **THEN** it reports no violations

### Requirement: Localized labels

The captions, the browse links, the multiple uploader's title and the announcements SHALL come from the `fileUpload` locale section and follow the active locale, `ru-RU` by default; the names of the remove controls SHALL come from the `a11y` section. `KBQ_SINGLE_FILE_UPLOAD_DEFAULT_CONFIGURATION` and `KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION` SHALL hold the `ru-RU` labels.

#### Scenario: Switching the locale

- **WHEN** the application switches the locale from `ru-RU` to `en-US`
- **THEN** the single uploader's browse link changes from "выберите файл" to "choose file"

### Requirement: Locale overrides

`kbqFileUploadLocaleConfigurationProvider()` SHALL override only the labels it is given, the rest following the active locale. `[localeOverrides]`, keyed by section (`fileUpload.single`, `fileUpload.multiple`, `fileUpload.a11y`), SHALL override labels for that one uploader and SHALL win over the provider.

#### Scenario: Provider across a locale switch

- **WHEN** the provider sets `single.browseLink` to "Pick one" and the locale switches to `en-US`
- **THEN** the browse link stays "Pick one" while the other single labels follow `en-US`

#### Scenario: Binding over the provider

- **WHEN** the provider sets `single.browseLink` to "Provided" and the uploader binds `[localeOverrides]` with `fileUpload.single.browseLink` "Bound"
- **THEN** the browse link reads "Bound"

### Requirement: Upload progress

While an item's `loading` subject last emitted `true`, the uploader SHALL show a progress spinner in place of the item's icon, in `progressMode` (`'determinate'` by default) and with the value the item's `progress` subject last emitted, or 0 before it emits. An item without subjects SHALL be shown as not loading.

#### Scenario: Second of two files loading

- **WHEN** the second of two listed items emits `loading` `true` and `progress` 40
- **THEN** one spinner with the value 40 is shown, in that item's row

#### Scenario: Loading finished

- **WHEN** the item then emits `loading` `false`
- **THEN** the spinner is replaced by the icon again

### Requirement: Progress subscriptions

The uploader SHALL subscribe to the `loading` and `progress` subjects of each listed item once, SHALL follow the new subjects when an item that stays listed has them replaced and the list is written again, and SHALL unsubscribe when the item leaves the list or the uploader is destroyed.

#### Scenario: Item removed from the value

- **WHEN** the form value changes from `[item]` to `[]`
- **THEN** the item's `loading` and `progress` subjects have no observers left

#### Scenario: Item kept while another is added

- **WHEN** the value changes from `[kept]` to `[kept, added]`
- **THEN** `kept.loading` has been subscribed to only once

### Requirement: Two-way binding of the files

`[(file)]` on the single uploader and `[(files)]` on the multiple uploader SHALL show the bound value and SHALL update the bound variable through `fileChange` and `filesChange` when the user adds or removes files.

#### Scenario: File removed

- **WHEN** a single uploader with `[(file)]` holds a file and the user removes it
- **THEN** the bound variable becomes `null`

### Requirement: Programmatic values

A value written by the form (`setValue`, `reset`), through the `[file]` or `[files]` binding or through the `file` or `files` property SHALL be shown without marking the control dirty, without an extra `valueChanges` and without `fileChange` or `filesChange`. A value written through the binding or the property MUST NOT reach the form control.

#### Scenario: `setValue` on the control

- **WHEN** the control's `setValue` is called with a list of one item
- **THEN** the control stays pristine, `valueChanges` fires once and `filesChange` does not fire

#### Scenario: Property written by code

- **WHEN** code sets `files` on a multiple uploader bound to a control
- **THEN** the uploader shows the file, while the control stays pristine with the value `null`

### Requirement: Form value of a user change

A file the user adds or removes SHALL be written to the form control at once, as a `KbqFileItem` or `null` for the single uploader and as the whole `KbqFileItem[]` for the multiple, marking it dirty and running its validators, asynchronous ones included. An item the uploader creates SHALL carry `loading` and `progress` subjects that start at `false` and 0.

#### Scenario: Asynchronous validator

- **WHEN** the control has an asynchronous validator and the user chooses a file
- **THEN** the control status is `PENDING` at once and `VALID` or `INVALID` once the validator resolves

#### Scenario: Reset after a user change

- **WHEN** the user has chosen a file and the control is then reset
- **THEN** the control is pristine again

### Requirement: Values written by a form

The single uploader SHALL accept a form value that is a `KbqFileItem`, a `File`, which it wraps in a new item, or `null`. The multiple uploader SHALL accept a `KbqFileItem[]`, a `FileList`, whose files it wraps in new items, or `null`, which empties it.

#### Scenario: `File` written to the single uploader

- **WHEN** the control of a single uploader is set to a `File`
- **THEN** the uploader holds an item for that file

#### Scenario: `FileList` written to the multiple uploader

- **WHEN** the control of a multiple uploader is set to a `FileList` of one file
- **THEN** the uploader lists one item

### Requirement: Touched state

The uploader SHALL mark its control touched when the user adds files through the dialog or by a drop, even when no file is kept, when a file is removed, and when focus leaves the uploader. Moving focus between the uploader's own controls MUST NOT mark it touched.

#### Scenario: Tabbing through without a file

- **WHEN** focus leaves an empty uploader for an element outside it
- **THEN** its control is touched

#### Scenario: Focus moves inside the uploader

- **WHEN** focus moves from the file input to another element of the same uploader
- **THEN** its control stays untouched

### Requirement: Bindings that turn undefined

Binding `[file]` or `[files]` to `undefined` SHALL empty the uploader. An input that is not bound SHALL leave what code wrote to the property in place.

#### Scenario: Bound files become undefined

- **WHEN** `[files]` changes from a list of one item to `undefined`
- **THEN** the uploader lists no file and renders no row

### Requirement: Calls from an effect

Calling `deleteItem()`, `deleteFile()`, or `remove()` or `removeAt()` of a `kbqFileList` inside an `effect()` MUST NOT make that effect depend on the file list or on the disabled state, so the effect does not run again when files change.

#### Scenario: Effect removes the first file

- **WHEN** an effect calls `deleteFile(0)` on a multiple uploader holding three files, and the user then adds a file
- **THEN** the effect has run once and the list holds the two remaining files and the new one

### Requirement: Server rendering

On the server, the single uploader SHALL show a form value only when it is a `KbqFileItem`, and the multiple uploader only when it is an array of items; any other value SHALL be shown as empty.

#### Scenario: Pre-populated form on the server

- **WHEN** a form whose value is a `KbqFileItem` renders a single uploader on the server
- **THEN** the rendered uploader shows that file

### Requirement: File input id

The file input of the file browse link SHALL take its id from the uploader's `id` input, or else from `inputId`, which defaults to a unique `kbq-single-file-upload-<n>` or `kbq-multiple-file-upload-<n>`.

#### Scenario: Default id

- **WHEN** an uploader is rendered without `id` and `inputId`
- **THEN** its file input has an id that starts with `kbq-single-file-upload-` or `kbq-multiple-file-upload-`

### Requirement: Upload context

`kbqFileUploadContext` SHALL provide `id`, `disabled`, `multiple`, `accept` and `onlyDirectory` to the `kbqFileLoader` elements inside it. All of them SHALL default to `null`; `multiple` SHALL be coerced with `booleanAttribute`, and `disabled` SHALL be a two-way model.

#### Scenario: Values set

- **WHEN** the context binds `id` to `'test-id'` and `accept` to `'.pdf,.doc'`
- **THEN** it reports those values

### Requirement: File loader

`kbqFileLoader` (class `kbq-file-loader`) SHALL render its content followed by a visually hidden `input type="file"` with `tabindex="0"`, map `disabled`, `multiple`, `accept`, `for` (the id), `onlyDirectory` (`webkitdirectory`), `describedBy` (`aria-describedby`) and `invalid` (`aria-invalid`) onto it, and emit its `change` event through `fileChange`. A falsy `multiple`, `onlyDirectory` or `invalid` and a `null` `describedBy` SHALL leave their attribute out.

#### Scenario: Attributes from inputs

- **WHEN** a loader binds `multiple` and `onlyDirectory` to `true` and `for` to `'test-id'`
- **THEN** its input has the `multiple` and `webkitdirectory` attributes and the id `test-id`

#### Scenario: Defaults

- **WHEN** a loader binds no inputs
- **THEN** its input is enabled and has no `multiple`, `webkitdirectory`, `aria-describedby` or `aria-invalid` attribute

### Requirement: File loader follows the context

Inside a `kbqFileUploadContext`, every context value that is not `null` SHALL win over the loader's own input, and a `null` one SHALL fall back to it. A context `multiple` bound to `null` becomes `false` and therefore still wins.

#### Scenario: Context accept

- **WHEN** the context has `accept` `'.pdf'` and the loader `'.txt'`
- **THEN** the input has `accept=".pdf"`

#### Scenario: Context values null

- **WHEN** every context value is bound to `null` and the loader sets `disabled`, `multiple`, `accept`, `for` and `onlyDirectory`
- **THEN** the input takes the loader's values, except that it is not `multiple`

### Requirement: File list additions

`kbqFileList` (host class `kbq-file-list`) SHALL hold its items in the `list` model. `add()` and `addArray()` SHALL append to it and `replace()` SHALL replace it, each emitting `itemsAdded` with the items it was given, an empty array included. Adding an item that is already listed SHALL add it again.

#### Scenario: Append

- **WHEN** `add(file1)` is followed by `addArray([file2, file3])`
- **THEN** `list()` is `[file1, file2, file3]` and `itemsAdded` last emitted `[file2, file3]`

### Requirement: File list removals

`remove(item)` SHALL remove the first occurrence of the item and `removeAt(index)` the item at that index; both SHALL return the removed item in an array, write a new array and emit `itemRemoved` with the item and its index. An item not in the list, or an index outside it, SHALL remove nothing, emit nothing, return `[]` and keep the same array.

#### Scenario: Remove by index

- **WHEN** `removeAt(1)` is called on `[file1, file2, file3]`
- **THEN** it returns `[file2]`, `list()` is `[file1, file3]` and `itemRemoved` emits `[file2, 1]`

#### Scenario: Index past the end

- **WHEN** `removeAt(7)` is called on a list of three items
- **THEN** it returns `[]`, the list is the same array and `itemRemoved` does not fire

### Requirement: File drop directive

`kbqFileDrop` SHALL add `kbq-file-drop` to its host, and `kbq-file-drop_dragover` from a drag entering it until the drag leaves it or drops; moving onto a child MUST NOT count as leaving. It SHALL prevent the browser's default handling of these events and emit `filesDropped` with the dropped files. A drop without items MUST NOT emit. While `disabled`, it SHALL ignore every drag event.

#### Scenario: Drag in and out

- **WHEN** a drag enters the host and then leaves it
- **THEN** `kbq-file-drop_dragover` is added and then removed

#### Scenario: Drop with a file

- **WHEN** a file is dropped on the host
- **THEN** `filesDropped` emits it and `kbq-file-drop_dragover` is removed

### Requirement: Dropped folders

A dropped folder SHALL be read recursively and replaced by the files it contains, each with `fullPath` set to its path in the drop. The files of one folder SHALL come out in the reverse of the order the browser lists them. Dropped items that are not files SHALL be ignored.

#### Scenario: Folder with two files

- **WHEN** a folder whose entries are listed as `test1`, `test2` is dropped
- **THEN** `filesDropped` emits `test2` and then `test1`, each with its `fullPath`

### Requirement: Empty state for uploads

`kbq-file-upload-empty-state` SHALL show an upload icon, `title` when it is set and `caption` as text or as a template, and SHALL default to the `'big'` size, which a bound `size` overrides. The multiple uploader SHALL render it at the `'normal'` size.

#### Scenario: Default size

- **WHEN** `kbq-file-upload-empty-state` is rendered without `size`
- **THEN** it has the class `kbq-empty-state_big`

#### Scenario: Bound size

- **WHEN** it is rendered with `size` `'compact'`
- **THEN** it has `kbq-empty-state_compact` and not `kbq-empty-state_big`
