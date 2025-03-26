import * as vscode from "vscode";
import { BookmarkExplorerProvider } from "../fileExplorer/bookmarkExplorerProvider";

// ブックマークエクスプローラー更新コマンド
export function refreshBookmarkExplorerCommand(
  bookmarkExplorerProvider: BookmarkExplorerProvider
) {
  return () => {
    bookmarkExplorerProvider.refresh();
  };
}