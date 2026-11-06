# Spec Delta

<!-- cspell:ignore webkitdirectory -->

## MODIFIED Requirements

### Requirement: Adding files through the system dialog

Each uploader SHALL render its browse link as a label around a visually hidden native file input, so activating the link opens the system dialog, and SHALL add the files chosen there. The file input of the multiple uploader SHALL be `multiple`; its folder input is not. The input's value SHALL be cleared after every selection, so the same file can be chosen again from an input that stays rendered, such as the footer input of a multiple uploader that lists files.

#### Scenario: Choosing a file

- **WHEN** the user chooses `report.pdf` in the dialog of an empty multiple uploader
- **THEN** the list holds one item whose `file` is `report.pdf`
- **AND** `filesChange` fires once with that list

#### Scenario: Choosing the same file again

- **WHEN** a multiple uploader with the default `addStrategy` lists `b.file` and the user chooses `a.file` in the dialog of its footer browse link, and then `a.file` again in that dialog
- **THEN** the second choice is reported as well, through `rejected` as a duplicate, because the native input was cleared after the first

### Requirement: Allowed item kinds

`allowed` SHALL decide which browse links an uploader renders: `'file'` (the default) a link that chooses files, `'folder'` a link whose file input has `webkitdirectory` and chooses a folder, `'mixed'` both. The file input SHALL carry the uploader's `accept`; the folder input MUST NOT receive it.

#### Scenario: Mixed mode

- **WHEN** an uploader has `allowed="mixed"`
- **THEN** it renders two browse links, one for files and one for a folder

#### Scenario: Folder chosen in a single uploader

- **WHEN** the user chooses a folder of three files in a single uploader with `allowed="folder"`
- **THEN** it holds the first file and emits the other two through `rejected`

### Requirement: Error state of the uploader

With a form directive on it, the uploader SHALL evaluate `errorStateMatcher` on every change detection, by default the injected `ErrorStateMatcher` (invalid and touched, or invalid in a submitted form), and SHALL add `kbq-error` to its drop area while in error. Binding `errorStateMatcher` to `undefined` SHALL restore the default. Without a form directive the matcher is not run: the multiple uploader MUST NOT enter the error state, the single one only through its item's `hasError`.

#### Scenario: Required control touched

- **WHEN** an uploader is bound to a required control with no value and the control is marked touched
- **THEN** the uploader is in the error state

#### Scenario: Matcher binding turns undefined

- **WHEN** a matcher that always reports an error is bound and then the binding becomes `undefined`
- **THEN** `kbq-error` is removed from the drop area of a valid, untouched uploader

#### Scenario: Item in error without a form directive

- **WHEN** an item whose `hasError` is `true` is bound through `[file]` to a single uploader and through `[files]` to a multiple uploader, neither with a form directive
- **THEN** the drop area of the single uploader has `kbq-error` and that of the multiple uploader does not

### Requirement: Dropped folders

A dropped folder SHALL be read recursively, each folder through a single `readEntries()` call, and replaced by the files that call lists, each with `fullPath` set to its path in the drop. Entries the browser hands out only to a further call, as Chromium does for large folders, are not read. The files of one folder SHALL come out in the reverse of the order the browser lists them. Dropped items that are not files SHALL be ignored.

#### Scenario: Folder with two files

- **WHEN** a folder whose entries are listed as `test1`, `test2` is dropped
- **THEN** `filesDropped` emits `test2` and then `test1`, each with its `fullPath`

#### Scenario: Folder listed in two batches

- **WHEN** a folder whose reader lists `test1` on the first `readEntries()` call and `test2` only on a second call is dropped
- **THEN** `filesDropped` emits only `test1`
