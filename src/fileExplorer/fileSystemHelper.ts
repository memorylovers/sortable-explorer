import * as vscode from "vscode";
import { FileItem } from "./fileItem";
import { ConfigurationManager } from "../configuration/configurationManager";
import { ViewMode, ViewModeType } from "../configuration/configurationConstants";
import { FileSystemStrategy } from "./strategies/fileSystemStrategy";
import { FlatFileSystemStrategy } from "./strategies/flatFileSystemStrategy";
import { TreeFileSystemStrategy } from "./strategies/treeFileSystemStrategy";
import { BookmarkManager } from "../bookmark/BookmarkManager"; // BookmarkManagerをインポート

export class FileSystemHelper {
  private strategies: Map<string, FileSystemStrategy>;
  private currentStrategy: FileSystemStrategy; // createNewNote など、viewModeに依存しない操作で使用

  constructor() {
    // 利用可能な戦略を登録
    this.strategies = new Map<string, FileSystemStrategy>();
    this.strategies.set(ViewMode.FLAT, new FlatFileSystemStrategy());
    this.strategies.set(ViewMode.TREE, new TreeFileSystemStrategy());

    // デフォルト戦略を設定 (主にcreateNewNote用)
    const initialViewMode = ConfigurationManager.getViewMode();
    this.currentStrategy = this.strategies.get(initialViewMode) || this.strategies.get(ViewMode.FLAT)!;
  }

  /**
   * 指定されたディレクトリ内のすべてのファイルを取得
   * 指定された表示モードに応じた戦略を使用
   *
   * @param workspacePath 検索するディレクトリのパス
   * @param includes 表示するファイル/フォルダのパターン配列
   * @param excludes 表示から除外するファイル/フォルダのパターン配列
   * @param viewMode 表示モード
   * @param bookmarkManager ブックマークマネージャー
   * @returns FileItemオブジェクトの配列
   */
  public async getFiles(
    workspacePath: string,
    includes: string[],
    excludes: string[],
    viewMode: ViewModeType, // ViewModeを追加
    bookmarkManager?: BookmarkManager // BookmarkManagerをオプションで受け取る
  ): Promise<FileItem[]> {
    // パラメータで渡されたviewModeに基づいて戦略を選択
    const strategy = this.strategies.get(viewMode) || this.strategies.get(ViewMode.FLAT)!;

    // 選択された戦略を使用してファイルを取得 (BookmarkManagerとViewModeを渡す)
    return strategy.getFiles(workspacePath, includes, excludes, viewMode, bookmarkManager);
  }

  /**
   * 指定されたディレクトリの子要素を取得
   * 指定された表示モードに応じた戦略を使用
   */
  public async getChildren(
    directoryPath: string,
    includes: string[],
    excludes: string[],
    viewMode: ViewModeType, // ViewModeTypeに変更
    bookmarkManager?: BookmarkManager // BookmarkManagerをオプションで受け取る
  ): Promise<FileItem[]> {
    // パラメータで渡されたviewModeに基づいて戦略を選択
    // Treeモード以外は空配列を返す想定だが念のため
    const strategy = this.strategies.get(viewMode) || this.strategies.get(ViewMode.TREE)!; // getChildrenはTree戦略が主

    // 選択された戦略を使用して子要素を取得 (BookmarkManagerとViewModeを渡す)
    // Tree戦略のみがgetChildrenを実装している想定だが、念のため渡す
    return strategy.getChildren(directoryPath, includes, excludes, viewMode, bookmarkManager);
  }

  /**
   * 新しいノートファイルを作成する
   *
   * @param targetDirectory 作成先のディレクトリパス
   * @param title ノートのタイトル
   * @returns 作成されたファイルのパス
   */
  public async createNewNote(targetDirectory: string, title: string): Promise<string> {
    // createNewNoteはViewModeに依存しないため、コンストラクタで設定したcurrentStrategyを使用
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
  public registerStrategy(viewMode: string, strategy: FileSystemStrategy): void {
    this.strategies.set(viewMode, strategy);
  }
}
