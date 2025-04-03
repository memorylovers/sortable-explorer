import * as fg from "fast-glob";
import * as fs from "fs";
import * as micromatch from "micromatch";
import * as path from "path";
import * as vscode from "vscode";
import { FileItem } from "../fileItem";
import { FileSystemStrategy } from "./fileSystemStrategy";

export abstract class FileSystemStrategyBase implements FileSystemStrategy {
  /**
   * 指定されたディレクトリ内のファイルを取得（抽象メソッド）
   * 各戦略クラスで実装する必要がある
   */
  abstract getFiles(
    workspacePath: string,
    includes: string[],
    excludes: string[]
  ): Promise<FileItem[]>;

  /**
   * 指定されたディレクトリの子要素を取得する（共通実装）
   */
  public async getChildren(
    directoryPath: string,
    includes: string[],
    excludes: string[]
  ): Promise<FileItem[]> {
    try {
      const result: FileItem[] = [];

      // 1. ディレクトリを取得
      const dirOptions = {
        cwd: directoryPath, // 検索の基準ディレクトリ
        absolute: true, // 絶対パスで結果を返す
        onlyDirectories: true, // ディレクトリのみを取得
        deep: 1, // 検索の深さを1に制限（直下のみ）
        dot: false, // ドットディレクトリも含めない
        ignore: excludes, // 除外パターン
      };

      // ディレクトリを取得
      const directories = await fg.async("*", dirOptions);

      // ディレクトリをFileItemに変換
      for (const dirPath of directories) {
        try {
          const stats = await fs.promises.stat(dirPath);
          const dirName = path.basename(dirPath);

          result.push(
            new FileItem(
              dirName,
              dirPath,
              stats.mtime,
              stats.birthtime,
              vscode.Uri.file(dirPath),
              true // isDirectory = true
            )
          );
        } catch (error) {
          console.error(`Error getting stats for ${dirPath}:`, error);
        }
      }

      // 2. ファイルを取得
      const fileOptions = {
        cwd: directoryPath, // 検索の基準ディレクトリ
        absolute: true, // 絶対パスで結果を返す
        onlyFiles: true, // ファイルのみを取得
        deep: 1, // 検索の深さを1に制限（直下のみ）
        dot: false, // ドットファイルも含めない
        ignore: excludes, // 除外パターン
      };

      // includesパターンが指定されている場合はそれを使用し、そうでなければすべてのファイルを対象とする
      const patterns = includes.length > 0 ? includes : ["*"];

      // ファイルを取得（includesパターンをfast-globに直接渡す）
      const files = await fg.async(patterns, fileOptions);

      // ファイルをFileItemに変換
      for (const filePath of files) {
        try {
          const stats = await fs.promises.stat(filePath);
          const fileName = path.basename(filePath);

          result.push(
            new FileItem(
              fileName,
              filePath,
              stats.mtime,
              stats.birthtime,
              vscode.Uri.file(filePath),
              false // isDirectory = false
            )
          );
        } catch (error) {
          console.error(`Error getting stats for ${filePath}:`, error);
        }
      }

      return result;
    } catch (error) {
      console.error(`Error reading directory ${directoryPath}:`, error);
      return [];
    }
  }

  /**
   * 新しいノートファイルを作成する（共通実装）
   * 同名のファイルが存在する場合は連番を付けて新しいファイルを作成する
   */
  public async createNewNote(
    targetDirectory: string,
    title: string
  ): Promise<string> {
    // 現在の日時を取得してファイル名の一部として使用
    const now = new Date();
    const dateStr =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0");

    // ベースとなるファイル名を生成
    const baseFileName = `${dateStr}_${title}`;
    let fileName = `${baseFileName}.md`;
    let filePath = path.join(targetDirectory, fileName);

    // ファイルが存在するかチェックし、存在する場合は連番を付ける
    let counter = 1;
    while (true) {
      try {
        // ファイルが存在するかチェック
        await fs.promises.access(filePath, fs.constants.F_OK);
        // ファイルが存在する場合、連番を付けたファイル名を生成
        fileName = `${baseFileName}_${counter}.md`;
        filePath = path.join(targetDirectory, fileName);
        counter++;
      } catch (error) {
        // ファイルが存在しない場合、ループを抜ける
        break;
      }
    }

    // ファイルの内容を作成
    const content = `# ${title}`;

    // ファイルを書き込む
    await fs.promises.writeFile(filePath, content, "utf8");

    return filePath;
  }

  /**
   * 指定されたパスが除外パターンに一致するかチェック
   */
  public isExcluded(
    filePath: string,
    excludes: string[],
    basePath: string
  ): boolean {
    if (excludes.length === 0) {
      return false;
    }

    const relativePath = path.relative(basePath, filePath);

    // micromatchを使用してパターンマッチングを行う
    return micromatch.isMatch(relativePath, excludes);
  }

  /**
   * 指定されたパスがincludeパターンに一致するかチェック
   */
  public matchesIncludePatterns(
    relativePath: string,
    includes: string[]
  ): boolean {
    // micromatchを使用してパターンマッチングを行う
    return micromatch.isMatch(relativePath, includes);
  }
}
