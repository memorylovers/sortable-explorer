# Sortable Explorer

Sortable Explorer is a VSCode extension that provides a sortable file explorer.  
You can switch file display modes and sorting methods through settings.

*この文書は[日本語](README.ja.md)でもご覧になれます*

## Motivation

The standard VSCode explorer has limited sorting options (`explorer.sortOrder`).

When using VSCode as a notepad/note-taking app, you may want to sort files flexibly depending on the situation.

- View all files including subfolders in a list, not as a tree
- Sort files in ascending/descending order by name, while keeping folders in ascending order by name
- Display files in descending order by modification date
- etc.

Sortable Explorer is a file explorer that allows multiple display modes and sorting settings.

## Features

- **Two display modes**: "Tree" including folders and "Flat" showing only files
- **Multiple sorting options**: Ascending/descending sort by "File name", "Creation date", and "Modification date"
- **Target file specification**: You can set paths to include and exclude
- **Create a new date-prefixed file**: Enter a "Title" to create `YYYYMMDD_<title>.md`. If a file with the same name already exists, a sequential number will be added, like `YYYYMMDD_<title>_1.md`

Additionally, the following options are available from the context menu (right-click):

- **Create a new note**: You can create a new note in the selected folder
- **Delete files**: You can delete files directly from Sortable Explorer
- **Add to exclude patterns**: You can add folders or files to the exclude patterns directly from Sortable Explorer

## How to Install

1. Open VSCode
2. Open the Extensions view (Ctrl+Shift+X)
3. Search for "Sortable Explorer"
4. Click "Install"

Or visit the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=memorylovers.sortable-explorer)

## Setting Options

The following items can be configured:

- **sortable-explorer.viewMode**: File display mode: `tree` (tree view) or `flat` (flat view)
- **sortable-explorer.sortBy**: Sort order: `name` (by name), `created` (by creation date), `modified` (by modification date)
- **sortable-explorer.sortDirection**: Sort direction: `asc` (ascending), `desc` (descending)
- **sortable-explorer.includePatterns**: Patterns for files/folders to display (if empty, all files are included)
- **sortable-explorer.excludePatterns**: Patterns for files/folders to exclude

For pattern matching in `includePatterns` and `excludePatterns`,  
[glob](https://github.com/isaacs/node-glob) and [micromatch](https://github.com/micromatch/micromatch) are used.

Default values are as follows:

```json
// Sortable Explorer default settings
{
  "sortable-explorer.viewMode": "tree",
  "sortable-explorer.sortBy": "name",
  "sortable-explorer.sortDirection": "desc",
  "sortable-explorer.includePatterns": [
    "**/*.md",
    "**/*.txt"
  ],
  "sortable-explorer.excludePatterns": [
    "**/node_modules/**"
  ],
}
```

## License

[MIT License](LICENSE)

## Author

- [Memory Lovers, LLC](https://memory-lovers.com)
- [GitHub(@memory-lovers)](https://github.com/memory-lovers)
- [Twitter/X(@kira_puka)](https://twitter.com/kira_puka)
- [Blog(くらげになりたい。)](https://memory-lovers.blog/)
