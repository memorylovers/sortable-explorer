import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { FileItem } from "../explorer/FileItem";
import { BookmarkManager } from "./BookmarkManager";

export class BookmarkExplorerProvider
  implements vscode.TreeDataProvider<FileItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    FileItem | undefined | null | void
  > = new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    FileItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private bookmarkManager: BookmarkManager) {
    // ブックマークの変更を監視してビューを更新
    this.bookmarkManager.onDidChangeBookmarks(() => {
      this.refresh();
    });
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FileItem): vscode.TreeItem {
    // FileItemはgetChildrenで生成される際にブックマーク状態が考慮されている
    return element;
  }

  async getChildren(element?: FileItem): Promise<FileItem[]> {
    // ブックマークビューはフラットリストなので、ルート要素のみを処理
    if (element) {
      return []; // 子要素は持たない
    }

    const bookmarkedUris = this.bookmarkManager.getBookmarks();
    const fileItems: FileItem[] = [];

    for (const uri of bookmarkedUris) {
      try {
        const filePath = uri.fsPath;
        // ファイルが存在するか確認
        if (!fs.existsSync(filePath)) {
          console.warn(`Bookmarked file not found, removing: ${filePath}`);
          // 見つからないブックマークは自動的に削除する（オプション）
          await this.bookmarkManager.removeBookmark(uri);
          continue; // 次のブックマークへ
        }

        const stats = await fs.promises.stat(filePath);
        const fileName = path.basename(filePath);
        const isDirectory = stats.isDirectory(); // ディレクトリもブックマーク可能とする

        // FileItemを作成 (BookmarkManagerを渡してアイコンとコンテキスト値を正しく設定)
        const item = new FileItem(
          fileName,
          filePath,
          stats.mtime,
          stats.birthtime,
          uri,
          isDirectory,
          undefined, // parent
          this.bookmarkManager // BookmarkManagerを渡す
        );
        // descriptionは表示しない
        item.description = undefined;
        fileItems.push(item);
      } catch (error) {
        console.error(`Error processing bookmarked file ${uri.fsPath}:`, error);
        // エラーが発生したブックマークも削除する（オプション）
        // await this.bookmarkManager.removeBookmark(uri);
      }
    }

    // BookmarkManagerから取得した順序（登録順降順）を維持する
    return fileItems;
  }
}
