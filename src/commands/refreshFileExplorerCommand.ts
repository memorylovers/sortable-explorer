import * as vscode from "vscode";
import { FileExplorerProvider } from "../fileExplorer/fileExplorerProvider";

// ファイルエクスプローラー更新コマンド
export function refreshFileExplorerCommand(
  fileExplorerProvider: FileExplorerProvider
) {
  return () => {
    fileExplorerProvider.refresh();
  };
}