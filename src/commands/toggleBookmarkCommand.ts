import * as vscode from "vscode";
import { COMMANDS } from "../configuration/configurationConstants";
import { BookmarkExplorerProvider } from "../fileExplorer/bookmarkExplorerProvider";
import { FileExplorerProvider } from "../fileExplorer/fileExplorerProvider";
import { localize } from "../localization/localization";

// ブックマーク情報の型定義
export interface BookmarkInfo {
  filePath: string;
  timestamp: number;
}

export function toggleBookmarkCommand(
  context: vscode.ExtensionContext,
  fileExplorerProvider: FileExplorerProvider,
  bookmarkExplorerProvider: BookmarkExplorerProvider
) {
  return async (fileItem: any) => {
    try {
      if (!fileItem || !fileItem.resourceUri) {
        vscode.window.showErrorMessage(localize("bookmark.noSelection"));
        return;
      }

      const filePath = fileItem.resourceUri.fsPath;
      
      // 現在のブックマーク一覧を取得
      const bookmarks: BookmarkInfo[] = context.workspaceState.get("sortable-explorer.bookmarks", []);
      
      // ブックマークの切り替え
      const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.filePath === filePath);
      const isBookmarked = bookmarkIndex !== -1;
      
      if (isBookmarked) {
        // ブックマークから削除
        bookmarks.splice(bookmarkIndex, 1);
        await context.workspaceState.update("sortable-explorer.bookmarks", bookmarks);
        vscode.window.showInformationMessage(localize("bookmark.removed"));
      } else {
        // ブックマークに追加（現在のタイムスタンプを記録）
        bookmarks.push({
          filePath,
          timestamp: Date.now()
        });
        await context.workspaceState.update("sortable-explorer.bookmarks", bookmarks);
        vscode.window.showInformationMessage(localize("bookmark.added"));
      }
      
      // ファイルエクスプローラーとブックマークエクスプローラーを更新
      fileExplorerProvider.refresh();
      bookmarkExplorerProvider.refresh();
      
      // ブックマークビューを表示
      await vscode.commands.executeCommand(COMMANDS.SHOW_BOOKMARK_VIEW);
    } catch (error) {
      vscode.window.showErrorMessage(
        localize("bookmark.error") + `: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };
}