import * as path from "path";
import * as vscode from "vscode";
import { BookmarkManager } from "../bookmark/BookmarkManager"; // BookmarkManagerをインポート
import { ViewMode, ViewModeType } from "../configuration/configurationConstants"; // ViewModeとViewModeTypeをインポート

export class FileItem extends vscode.TreeItem {
  public isBookmarked: boolean = false; // ブックマーク状態を保持

  constructor(
    public readonly name: string,
    public readonly filePath: string,
    public readonly modifiedTime: Date,
    public readonly createdTime: Date,
    public readonly resourceUri: vscode.Uri,
    public readonly isDirectory: boolean = false,
    public readonly parent?: FileItem,
    bookmarkManager?: BookmarkManager, // BookmarkManagerを受け取る (オプション)
    viewMode?: ViewModeType // ViewModeTypeに変更
  ) {
    super(
      resourceUri,
      isDirectory
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );

    // ブックマーク状態を設定
    if (bookmarkManager) {
      this.isBookmarked = bookmarkManager.isBookmarked(this.resourceUri);
    }

    // コンテキスト値を設定 (ブックマーク状態を含む)
    // コンテキスト値を設定 (ブックマーク状態を考慮)
    if (this.isBookmarked) {
      this.contextValue = "bookmarked"; // ブックマーク済みの場合
    } else {
      this.contextValue = "fileItem"; // ブックマークされていない場合
    }

    // descriptionはFlatモードのファイルのみに設定
    if (!isDirectory && viewMode === ViewMode.FLAT) {
      this.description = this.getRelativeFolderPath();
    }

    // commandはファイルの場合に設定 (ViewModeによらず)
    if (!isDirectory) {
      this.command = {
        command: "vscode.open",
        title: "Open File",
        arguments: [resourceUri],
      };
    }

    // アイコンの設定 (ブックマーク状態を考慮)
    if (this.isBookmarked) {
      this.iconPath = new vscode.ThemeIcon("star-full"); // ブックマーク済みは星アイコン
    } else {
      this.iconPath = isDirectory
        ? new vscode.ThemeIcon("folder")
        : new vscode.ThemeIcon("file"); // 通常のアイコン
    }
  }

  private getRelativeFolderPath(): string {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return path.dirname(this.filePath);
    }

    for (const folder of workspaceFolders) {
      const relativePath = path.relative(folder.uri.fsPath, this.filePath);
      if (!relativePath.startsWith("..")) {
        // ファイルパスからディレクトリパスを取得
        const directoryPath = path.dirname(relativePath);
        // 一番親のフォルダを表示しないように修正
        const pathParts = directoryPath.split(path.sep);
        // ルートディレクトリ直下のファイルの場合、ディレクトリパスは '.' になるためそのまま返す
        if (directoryPath === '.') {
            return directoryPath;
        }
        if (pathParts.length <= 1) {
          return directoryPath;
        }

        return path.join(...pathParts.slice(1));
      }
    }

    return path.dirname(this.filePath);
  }
}
