import * as vscode from "vscode";
import { BookmarkManager } from "../bookmark/BookmarkManager"; // BookmarkManagerをインポート
import {
  EXTENSION_NAME,
  SortDirection,
  ViewMode,
} from "../configuration/configurationConstants";
import { ConfigurationManager } from "../configuration/configurationManager";
import { FileItem } from "./fileItem";
import { FileSystemHelper } from "./fileSystemHelper";
import { SortingStrategyFactory } from "./sortingStrategy";

export class FileExplorerProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    FileItem | undefined | null | void
  > = new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    FileItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private fileSystemHelper: FileSystemHelper;

  // BookmarkManagerを保持
  constructor(private bookmarkManager: BookmarkManager) {
    this.fileSystemHelper = new FileSystemHelper();

    // 設定変更を監視
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(EXTENSION_NAME)) {
        this.refresh();
      }
    });

    // ファイルシステムの変更を監視
    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher("**/*");
    fileSystemWatcher.onDidCreate(() => this.refresh());
    fileSystemWatcher.onDidChange(() => this.refresh());
    fileSystemWatcher.onDidDelete(() => this.refresh());

    // ブックマークの変更を監視
    this.bookmarkManager.onDidChangeBookmarks(() => {
      this.refresh();
    });
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FileItem): vscode.TreeItem {
    // 表示モードを取得
    const viewMode = ConfigurationManager.getViewMode();

    // treeモードの場合は、descriptionを表示しない
    if (viewMode === "tree") {
      element.description = undefined;
    }
    return element;
  }

  async getChildren(element?: FileItem): Promise<FileItem[]> {
    // 表示モードを取得
    const viewMode = ConfigurationManager.getViewMode();

    // ツリー表示モードで、要素が指定されている場合（ディレクトリの展開）
    if (viewMode === ViewMode.TREE && element && element.isDirectory) {
      // FileSystemHelperにBookmarkManagerを渡してFileItemを生成させる
      const children = await this.fileSystemHelper.getChildren(
        element.filePath,
        ConfigurationManager.getIncludePatterns(),
        ConfigurationManager.getExcludePatterns(),
        this.bookmarkManager // BookmarkManagerを渡す
      );

      // ディレクトリとファイルを分離
      const directories = children.filter((item) => item.isDirectory);
      const files = children.filter((item) => !item.isDirectory);

      // 設定に基づいてファイルのみを並び替え
      const sortBy = ConfigurationManager.getSortBy();
      const ascending =
        ConfigurationManager.getSortDirection() === SortDirection.ASC;
      const sortingStrategy = SortingStrategyFactory.createStrategy(
        sortBy,
        ascending
      );

      const sortedFiles = sortingStrategy.sort(files);

      // ディレクトリを先に表示し、その後にソートされたファイルを表示
      return [...directories, ...sortedFiles];
    }

    // ルート要素の場合
    if (!element) {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        return [];
      }

      // すべてのワークスペースフォルダからファイルを取得
      let allFiles: FileItem[] = [];
      for (const folder of workspaceFolders) {
        console.log(`Reading workspace from ${folder.uri.fsPath}`);

        // FileSystemHelperにBookmarkManagerを渡してFileItemを生成させる
        const files = await this.fileSystemHelper.getFiles(
          folder.uri.fsPath,
          ConfigurationManager.getIncludePatterns(),
          ConfigurationManager.getExcludePatterns(),
          this.bookmarkManager // BookmarkManagerを渡す
        );
        allFiles = allFiles.concat(files);
      }

      // 表示モードに応じて並び替え方法を変更
      const viewMode = ConfigurationManager.getViewMode();
      const sortBy = ConfigurationManager.getSortBy();
      const ascending =
        ConfigurationManager.getSortDirection() === SortDirection.ASC;
      const sortingStrategy = SortingStrategyFactory.createStrategy(
        sortBy,
        ascending
      );

      if (viewMode === ViewMode.FLAT) {
        // フラットモードでは全てのアイテムを並び替え
        return sortingStrategy.sort(allFiles);
      } else {
        // ツリーモードではディレクトリとファイルを分離して、ファイルのみ並び替え
        const directories = allFiles.filter((item) => item.isDirectory);
        const files = allFiles.filter((item) => !item.isDirectory);

        const sortedFiles = sortingStrategy.sort(files);

        // ディレクトリを先に表示し、その後にソートされたファイルを表示
        return [...directories, ...sortedFiles];
      }
    }

    // その他の場合（通常はここには来ない）
    return [];
  }
}
