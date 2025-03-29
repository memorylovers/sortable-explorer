# Sortable Explorer

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/memorylovers.sortable-explorer?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=memorylovers.sortable-explorer)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/memorylovers.sortable-explorer?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=memorylovers.sortable-explorer)

Sortable Explorerは、並び替えができるエクスプローラーのVSCode拡張機能です。
ファイルの表示方法やソート方法を設定で切り替えることができます。

*Read this in [English](README.md)*

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
- **日付付き新規ファイルの作成**: 「タイトル」を入力すると、`YYYYMMDD_<title>.md`を作成できます。同名のファイルが既に存在する場合は、`YYYYMMDD_<title>_1.md`のように連番が付与されます
- **ファイルのブックマーク**: よく使うファイルをブックマークリストに追加して、素早くアクセスできます。

**コンテキストメニュー (右クリック)**

右クリックメニューから以下の操作が可能です:

- **新規ノートの作成**: 選択したフォルダ内、またはワークスペースのルートに新規ノートを作成します。
- **ファイルのコピー**: 選択したファイルをコピーします。
- **ファイル名の変更**: 選択したファイルの名前を変更します。
- **ファイルの削除**: 選択したファイルまたはフォルダを削除します。
- **除外対象への追加**: 選択したファイルまたはフォルダを設定の除外リストに追加します。
- **ブックマークに追加**: 選択したファイルをブックマークリストに追加します。
- **ブックマークから削除**: 選択したファイルをブックマークリストから削除します。

**ビュータイトルバー**

ビューのタイトルバーにあるアイコンから、以下のクイック操作が可能です:

- **新規ノート**: 新しいノートを作成します。
- **ソート方法の選択**: ソート基準（名前、作成日時、更新日時）を選択します。
- **ソート方向の切り替え**: 昇順と降順を切り替えます。
- **表示モードの切り替え**: ツリー表示とフラット表示を切り替えます。
- **設定を開く**: 拡張機能の設定を開きます。
- **更新**: ファイルエクスプローラーの表示を更新します。
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
  "sortable-explorer.sortBy": "modified", // デフォルトは更新日時順
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
