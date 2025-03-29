import * as vscode from "vscode";
import * as path from "path";
import { FileItem } from "../fileExplorer/fileItem";
import { COMMANDS } from "../configuration/configurationConstants";
import { localize } from "../localization/localization";

/**
 * ファイルを移動するコマンド
 * @param item 右クリックされたファイルアイテム
 */
export async function moveFileCommand(item?: FileItem): Promise<void> {
  if (!item || !item.resourceUri || item.isDirectory) {
    vscode.window.showErrorMessage(
      localize(
        item?.isDirectory
          ? "moveFile.error.cannotMoveFolder"
          : "moveFile.error.noFileSelected",
      ),
    );
    return;
  }

  const sourceUri = item.resourceUri;
  const sourceFileName = path.basename(sourceUri.fsPath);

  // 移動先フォルダを選択
  const destinationFolderUris = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: localize("moveFile.selectDestinationFolder.buttonLabel"),
    title: localize("moveFile.selectDestinationFolder.title"),
  });

  if (!destinationFolderUris || destinationFolderUris.length === 0) {
    return; // キャンセルされた場合
  }

  const destinationFolderUri = destinationFolderUris[0];
  const destinationUri = vscode.Uri.joinPath(
    destinationFolderUri,
    sourceFileName,
  );

  try {
    // 移動先に同名ファイルが存在するか確認
    try {
      await vscode.workspace.fs.stat(destinationUri);
      // ファイルが存在する場合、上書き確認
      const overwriteConfirmation = await vscode.window.showWarningMessage(
        localize("moveFile.confirmOverwrite"),
        { modal: true },
        localize("common.yes"),
        localize("common.no"),
      );

      if (overwriteConfirmation !== localize("common.yes")) {
        return; // 上書きしない場合はキャンセル
      }
    } catch (error: any) {
      // stat でファイルが存在しない場合はエラーになるので、ここでは無視して続行
      if (error.code !== "FileNotFound") {
        throw error; // その他のエラーは再スロー
      }
    }

    // ファイルを移動 (rename を使用)
    await vscode.workspace.fs.rename(sourceUri, destinationUri, {
      overwrite: true,
    }); // 上書き確認済みなので overwrite: true

    // エクスプローラーを更新
    await vscode.commands.executeCommand(COMMANDS.REFRESH_FILE_EXPLORER);
  } catch (error: any) {
    vscode.window.showErrorMessage(
      localize("moveFile.error.moveFailed", error.message),
    );
    console.error("Error moving file:", error);
  }
}
