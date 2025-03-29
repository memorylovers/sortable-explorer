import * as fg from "fast-glob";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { FileItem } from "../fileItem";
import { FileSystemStrategyBase } from "./fileSystemStrategyBase";
import { BookmarkManager } from "../../bookmark/BookmarkManager"; // BookmarkManagerをインポート

export class FlatFileSystemStrategy extends FileSystemStrategyBase {
  /**
   * フラット表示モード用のファイル取得メソッド
   * すべてのファイルをフラットに表示する
   */
  public async getFiles(
    workspacePath: string,
    includes: string[],
    excludes: string[],
    bookmarkManager?: BookmarkManager // BookmarkManagerをオプション引数として追加
  ): Promise<FileItem[]> {
    // fast-globのパターンを準備: からの場合はすべてを対象とする
    const patterns: string[] = includes.length > 0 ? includes : ["**/*"];

    // 除外パターンを準備
    const ignores: string[] = excludes.length > 0 ? excludes : [];

    // ファイルを検索
    const filePaths = await fg.async(patterns, {
      cwd: workspacePath, // 検索の基準ディレクトリ
      absolute: true, // 絶対パスで結果を返す
      onlyFiles: true, // ファイルのみを返す（ディレクトリは含まない）
      ignore: ignores, // 除外パターン
      dot: false, // ドットファイル（.gitignoreなど）も含めない
    });
    console.log(
      `Reading files (flat): ws=${workspacePath}, patterns=${patterns}, ignores=${ignores}`
    );

    // FileItemオブジェクトに変換
    const files: FileItem[] = [];
    for (const filePath of filePaths) {
      // ファイルの情報を取得
      const stats = await fs.promises.stat(filePath);
      const fileName = path.basename(filePath);

      files.push(
        new FileItem(
          fileName,
          filePath,
          stats.mtime,
          stats.birthtime,
          vscode.Uri.file(filePath),
          false, // isDirectory は false
          undefined, // parent は undefined
          bookmarkManager // BookmarkManagerを渡す
        )
      );
    }

    return files;
  }
}