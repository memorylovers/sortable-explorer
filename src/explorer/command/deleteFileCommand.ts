import * as path from "path";
import * as vscode from "vscode";
import { localize } from "../../localization/localization";
import { SortableExplorerProvider } from "../SortableExplorerProvider";

// ファイル削除コマンド
export function deleteFileCommand(
  fileExplorerProvider: SortableExplorerProvider
) {
  return async (fileItem: any) => {
    try {
      if (!fileItem || !fileItem.resourceUri) {
        vscode.window.showErrorMessage(localize("deleteFile.noSelection"));
        return;
      }

      // 確認ダイアログを表示
      const fileName = path.basename(fileItem.resourceUri.fsPath);
      const result = await vscode.window.showWarningMessage(
        localize("deleteFile.confirm", fileName),
        { modal: true },
        localize("deleteFile.button")
      );

      if (result !== localize("deleteFile.button")) {
        return;
      }

      // ファイルを削除
      await vscode.workspace.fs.delete(fileItem.resourceUri, {
        useTrash: true,
      });

      // ファイルエクスプローラーを更新
      fileExplorerProvider.refresh();

      vscode.window.showInformationMessage(
        localize("deleteFile.deleted", fileName)
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        localize("deleteFile.error") +
          `: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };
}
