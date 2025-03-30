// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
// Bookmark関連のクラスをインポート
import { BookmarkManager } from "./bookmark/BookmarkManager";
import { BookmarkExplorerProvider } from "./bookmark/BookmarkExplorerProvider";
import { AddBookmarkCommand } from "./commands/addBookmarkCommand";
import { RemoveBookmarkCommand } from "./commands/removeBookmarkCommand";
// 既存のコマンドとクラス
import { addToExcludePatternsCommand } from "./commands/addToExcludePatternsCommand";
import { copyFileCommand } from "./commands/copyFileCommand";
import { createNewNoteCommand } from "./commands/createNewNoteCommand";
import { deleteFileCommand } from "./commands/deleteFileCommand";
import { moveFileCommand } from "./commands/moveFileCommand";
import { openSettingsCommand } from "./commands/openSettingsCommand";
import { refreshFileExplorerCommand } from "./commands/refreshFileExplorerCommand";
import { renameFileCommand } from "./commands/renameFileCommand";
import { selectSortByCommand } from "./commands/selectSortByCommand";
import { toggleSortDirectionCommand } from "./commands/toggleSortDirectionCommand";
import { toggleViewModeCommand } from "./commands/toggleViewModeCommand";
import {
  COMMANDS,
  EXTENSION_NAME,
  FILE_EXPLORER_VIEW_ID, // 定数名を変更 (例)
  BOOKMARK_EXPLORER_VIEW_ID, // 新しい定数を追加 (例)
} from "./configuration/configurationConstants";
import { ConfigurationManager } from "./configuration/configurationManager";
import { FileExplorerProvider } from "./fileExplorer/fileExplorerProvider";
import { FileSystemHelper } from "./fileExplorer/fileSystemHelper";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    `Congratulations, your extension "${EXTENSION_NAME}" is now active!`
  );

  // BookmarkManagerの初期化
  const bookmarkManager = new BookmarkManager(context.workspaceState);
  bookmarkManager.initialize(); // ブックマークを読み込む

  // FileExplorerProviderのインスタンスを作成 (BookmarkManagerを渡す)
  const fileExplorerProvider = new FileExplorerProvider(bookmarkManager);
  const fileSystemHelper = new FileSystemHelper(); // FileSystemHelperはBookmarkManagerを直接は使わない

  // BookmarkExplorerProviderのインスタンスを作成 (BookmarkManagerを渡す)
  const bookmarkExplorerProvider = new BookmarkExplorerProvider(bookmarkManager);

  // 既存のファイルエクスプローラービューの登録
  vscode.window.registerTreeDataProvider(
    FILE_EXPLORER_VIEW_ID, // 更新された定数を使用
    fileExplorerProvider
  );

  // 新しいブックマークビューの登録
  vscode.window.registerTreeDataProvider(
    BOOKMARK_EXPLORER_VIEW_ID, // 新しい定数を使用
    bookmarkExplorerProvider
  );

  // コマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.REFRESH_FILE_EXPLORER,
      refreshFileExplorerCommand(fileExplorerProvider)
    )
  );

  // 新規ノート作成コマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.CREATE_NEW_NOTE,
      createNewNoteCommand(fileExplorerProvider, fileSystemHelper)
    )
  );

  // ソート方法選択コマンド
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.SELECT_SORT_BY,
      selectSortByCommand(fileExplorerProvider)
    )
  );

  // フラット表示アイコン用コマンド
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${COMMANDS.TOGGLE_VIEW_MODE}.flat`,
      toggleViewModeCommand(fileExplorerProvider)
    )
  );

  // ツリー表示アイコン用コマンド（同じ処理を実行）
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${COMMANDS.TOGGLE_VIEW_MODE}.tree`,
      toggleViewModeCommand(fileExplorerProvider)
    )
  );

  // 昇順アイコン用コマンド（同じ処理を実行）
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${COMMANDS.TOGGLE_SORT_DIRECTION}.asc`,
      toggleSortDirectionCommand(fileExplorerProvider)
    )
  );

  // 降順アイコン用コマンド（同じ処理を実行）
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${COMMANDS.TOGGLE_SORT_DIRECTION}.desc`,
      toggleSortDirectionCommand(fileExplorerProvider)
    )
  );

  // 設定を開くコマンド
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.OPEN_SETTINGS,
      openSettingsCommand()
    )
  );

  // ファイル操作コマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.DELETE_FILE,
      deleteFileCommand(fileExplorerProvider)
    )
  );

  // ファイルコピーコマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.COPY_FILE,
      copyFileCommand(fileExplorerProvider)
    )
  );

  // excludePatternsに追加するコマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.ADD_TO_EXCLUDE_PATTERNS,
      addToExcludePatternsCommand(fileExplorerProvider)
    )
  );

  // ファイル名変更コマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.RENAME_FILE,
      renameFileCommand(fileExplorerProvider)
    )
  );

  // ファイル移動コマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.MOVE_FILE, moveFileCommand)
  );

  // ブックマーク追加コマンドの登録
  const addBookmarkCommand = new AddBookmarkCommand(bookmarkManager);
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.ADD_BOOKMARK,
      addBookmarkCommand.execute,
      addBookmarkCommand // this コンテキストをバインド
    )
  );

  // ブックマーク削除コマンドの登録
  const removeBookmarkCommand = new RemoveBookmarkCommand(bookmarkManager);
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.REMOVE_BOOKMARK,
      removeBookmarkCommand.execute,
      removeBookmarkCommand // this コンテキストをバインド
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
