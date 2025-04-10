import { BookmarkManager } from "../bookmark/BookmarkManager"; // BookmarkManagerをインポート
import { ViewMode } from "../configuration/configurationConstants";
import { ConfigurationManager } from "../configuration/configurationManager";
import { FileItem } from "./FileItem";
import { FileSystemStrategy } from "./strategies/fileSystemStrategy";
import { FlatFileSystemStrategy } from "./strategies/flatFileSystemStrategy";
import { TreeFileSystemStrategy } from "./strategies/treeFileSystemStrategy";

export class FileSystemHelper {
  private strategies: Map<string, FileSystemStrategy>;
  private currentStrategy: FileSystemStrategy;

  constructor() {
    // 利用可能な戦略を登録
    this.strategies = new Map<string, FileSystemStrategy>();
    this.strategies.set(ViewMode.FLAT, new FlatFileSystemStrategy());
    this.strategies.set(ViewMode.TREE, new TreeFileSystemStrategy());

    // デフォルト戦略を設定
    const viewMode = ConfigurationManager.getViewMode();
    this.currentStrategy =
      this.strategies.get(viewMode) || this.strategies.get(ViewMode.FLAT)!;
  }

  /**
   * 指定されたディレクトリ内のすべてのファイルを取得
   * 現在の表示モードに応じた戦略を使用
   *
   * @param workspacePath 検索するディレクトリのパス
   * @param includes 表示するファイル/フォルダのパターン配列
   * @param excludes 表示から除外するファイル/フォルダのパターン配列
   * @returns FileItemオブジェクトの配列
   */
  public async getFiles(
    workspacePath: string,
    includes: string[],
    excludes: string[],
    bookmarkManager?: BookmarkManager // BookmarkManagerをオプションで受け取る
  ): Promise<FileItem[]> {
    // 表示モードを取得して適切な戦略を設定
    const viewMode = ConfigurationManager.getViewMode();
    this.currentStrategy =
      this.strategies.get(viewMode) || this.currentStrategy;

    // 選択された戦略を使用してファイルを取得 (BookmarkManagerを渡す)
    return this.currentStrategy.getFiles(
      workspacePath,
      includes,
      excludes,
      bookmarkManager
    );
  }

  /**
   * 指定されたディレクトリの子要素を取得
   */
  public async getChildren(
    directoryPath: string,
    includes: string[],
    excludes: string[],
    bookmarkManager?: BookmarkManager // BookmarkManagerをオプションで受け取る
  ): Promise<FileItem[]> {
    // 選択された戦略を使用して子要素を取得 (BookmarkManagerを渡す)
    // Tree戦略のみがgetChildrenを実装している想定だが、念のため渡す
    return this.currentStrategy.getChildren(
      directoryPath,
      includes,
      excludes,
      bookmarkManager
    );
  }

  /**
   * 新しいノートファイルを作成する
   *
   * @param targetDirectory 作成先のディレクトリパス
   * @param title ノートのタイトル
   * @returns 作成されたファイルのパス
   */
  public async createNewNote(
    targetDirectory: string,
    title: string
  ): Promise<string> {
    return this.currentStrategy.createNewNote(targetDirectory, title);
  }

  /**
   * 戦略を直接設定するメソッド（テストなどで使用）
   */
  public setStrategy(strategy: FileSystemStrategy): void {
    this.currentStrategy = strategy;
  }

  /**
   * 新しい戦略を登録するメソッド（拡張性のため）
   */
  public registerStrategy(
    viewMode: string,
    strategy: FileSystemStrategy
  ): void {
    this.strategies.set(viewMode, strategy);
  }
}
