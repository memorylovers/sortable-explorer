import * as vscode from "vscode";
import { COMMANDS } from "../configuration/configurationConstants";
import { BookmarkExplorerProvider } from "../fileExplorer/bookmarkExplorerProvider";
import { FileExplorerProvider } from "../fileExplorer/fileExplorerProvider";
import { localize } from "../localization/localization";

export function clearAllBookmarksCommand(
  context: vscode.ExtensionContext,
  fileExplorerProvider: FileExplorerProvider,
  bookmarkExplorerProvider: BookmarkExplorerProvider
) {
  return async () => {
    try {
      // 確認ダイアログを表示
      const answer = await vscode.window.showWarningMessage(
        localize("bookmark.clearConfirm"),
        { modal: true },
        localize("yes"),
        localize("no")
      );
      
      if (answer !== localize("yes")) {
        return;
      }
      
      // すべてのブックマークをクリア
      await context.workspaceState.update("sortable-explorer.bookmarks", []);
      
      // ファイルエクスプローラーとブックマークエクスプローラーを更新
      fileExplorerProvider.refresh();
      bookmarkExplorerProvider.refresh();
      
      // ブックマークビューを表示
      await vscode.commands.executeCommand(COMMANDS.SHOW_BOOKMARK_VIEW);
      
      vscode.window.showInformationMessage(localize("bookmark.cleared"));
    } catch (error) {
      vscode.window.showErrorMessage(
        localize("bookmark.clearError") + `: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };
}