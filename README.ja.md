# Sortable Explorer

Sortable Explorerは、並び替えができるエクスプローラーのVSCode拡張機能です。  
ファイルの表示方法やソート方法を設定で切り替えることができます。

*Read this in [English](README.en.md)*

## Motivation

VSCode標準のエクスプローラーでは、並び替えオプション(`explorer.sortOrder`)は限られています。

VSCodeをメモ帳/ノートアプリとして利用する際、時々に応じて、柔軟に並び替えたくなります。

- ツリーではなく、サブフォルダを含めたファイルをすべて一覧で見たい
- ファイル名の昇順/降順で並べ替えたが、フォルダは名前の昇順のままがいい
- ファイルの更新日の降順で表示したい
- etc.

Sortable Explorerでは、複数の表示モードや並び替え設定ができるエクスプローラーです。

## Features

- **2つの表示モード**: フォルダを含めた「ツリー」とファイルだけの「フラット」
- **複数のソート**: 「ファイル名」、「作成日時」、「更新日時」それぞれで昇順/降順のソート
- **対象ファイルの指定**: 対象にするパスと除外するパスを設定できます
- **日付付き新規ファイルの作成**: 「タイトル」を入力すると、`YYYYMMDD_<title>.md`を作成できます

また、右クリックで表示するコンテキストメニューからは、以下も可能です

- **ファイルの削除**: Sortable Explorerからでもファイルの削除ができます
- **除外対象への追加**: Sortable Explorerからフォルダやファイルを除外対象に追加できます

## How to Install

1. VSCodeを開きます
2. 拡張機能ビュー（Ctrl+Shift+X）を開きます
3. 「Sortable Explorer」を検索します
4. 「インストール」をクリックします

もしくは、[Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=memorylovers.sortable-explorer)にアクセスしてくさい

## Setting Options

以下の項目を設定できます

- **sortable-explorer.viewMode**: ファイルの表示モード: `tree`(ツリー表示) or `flat`(フラット表示)
- **sortable-explorer.sortBy**: 並び順: `name`(名前順)、`created`(作成日時)、`modified`(更新日時順)
- **sortable-explorer.sortDirection**: 並び順の方向: `asc`(昇順)、 `desc`(降順)
- **sortable-explorer.includePatterns**: 表示対象のファイル/フォルダのパターン(空の場合はすべてのファイルが対象)
- **sortable-explorer.excludePatterns**: 除外対象のファイル/フォルダのパターン

`includePatterns`と`excludePatterns`の判定には、  
[glob](https://github.com/isaacs/node-glob)や[micromatch](https://github.com/micromatch/micromatch)を利用しています

デフォルト値は、以下のとおりです。

```json
// Sortable Explorer デフォルト設定
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
