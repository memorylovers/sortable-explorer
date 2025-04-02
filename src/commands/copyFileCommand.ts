import * as path from "path";
import * as vscode from "vscode";
import * as fs from "fs";
import { FileExplorerProvider } from "../fileExplorer/fileExplorerProvider";
import { localize } from "../localization/localization";

// Helper function to get today's date in YYYYMMDD format
function getTodayYYYYMMDD(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
// ファイルコピーコマンド
export function copyFileCommand(
  fileExplorerProvider: FileExplorerProvider
) {
  return async (fileItem: any) => {
    try {
      if (!fileItem || !fileItem.resourceUri) {
        vscode.window.showErrorMessage(
          localize('copyFile.noSelection')
        );
        return;
      }

      // ディレクトリの場合は処理しない
      if (fileItem.isDirectory) {
        return;
      }

      const sourceUri = fileItem.resourceUri;
      const sourceFilePath = sourceUri.fsPath;
      const sourceFileName = path.basename(sourceFilePath);
      const sourceDir = path.dirname(sourceFilePath);
      
      // 新しいファイル名を生成（例: file.txt -> file - Copy.txt）
      const fileExt = path.extname(sourceFileName);
      const fileNameWithoutExt = path.basename(sourceFileName, fileExt);

      // ベースファイル名を決定
      let baseFileName: string;
      const datePrefixMatch = fileNameWithoutExt.match(/^(\d{8})(.*)/);

      if (datePrefixMatch) {
        // YYYYMMDD 形式の場合、今日の日付に置き換える
        const todayDate = getTodayYYYYMMDD();
        const restOfName = datePrefixMatch[2]; // YYYYMMDD以降の部分
        baseFileName = `${todayDate}${restOfName}`;
      } else {
        // YYYYMMDD 形式でない場合、元のファイル名（拡張子なし）をベースとする
        baseFileName = fileNameWithoutExt;
      }

      // 新しい重複回避ロジック
      let targetFileName = `${baseFileName}${fileExt}`;
      let targetFilePath = path.join(sourceDir, targetFileName);
      let copyCounter = 1; // Counter for " - Copy (n)" starts from 2 effectively

      // 1. ベースファイル名で存在確認
      if (fs.existsSync(targetFilePath)) {
        // 2. " - Copy" 付きで存在確認
        targetFileName = `${baseFileName} - Copy${fileExt}`;
        targetFilePath = path.join(sourceDir, targetFileName);

        // 3. " - Copy (n)" 付きで存在確認 (ループ)
        while (fs.existsSync(targetFilePath)) {
          copyCounter++; // Starts from 2
          targetFileName = `${baseFileName} - Copy (${copyCounter})${fileExt}`;
          targetFilePath = path.join(sourceDir, targetFileName);
        }
      }
      
      const targetUri = vscode.Uri.file(targetFilePath);

      // ファイルの内容を読み込む
      const fileData = await vscode.workspace.fs.readFile(sourceUri);
      
      // 新しいファイルに書き込む
      await vscode.workspace.fs.writeFile(targetUri, fileData);

      // ファイルエクスプローラーを更新
      fileExplorerProvider.refresh();

      vscode.window.showInformationMessage(
        localize('copyFile.copied', sourceFileName, targetFileName) // Use the final target file name
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        localize('copyFile.error') + `: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };
}