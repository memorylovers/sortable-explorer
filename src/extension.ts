// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
// Bookmark関連のクラスをインポート
import { BookmarkExplorerProvider } from "./bookmark/BookmarkExplorerProvider";
import { BookmarkManager } from "./bookmark/BookmarkManager";
// 既存のコマンドとクラス
import { AddBookmarkCommand } from "./bookmark/command/addBookmarkCommand";
import { RemoveBookmarkCommand } from "./bookmark/command/removeBookmarkCommand";
import {
  BOOKMARK_EXPLORER_VIEW_ID,
  COMMANDS,
  EXTENSION_NAME,
  FILE_EXPLORER_VIEW_ID, // 定数名を変更 (例)
} from "./configuration/configurationConstants";
import { addToExcludePatternsCommand } from "./explorer/command/addToExcludePatternsCommand";
import { copyFileCommand } from "./explorer/command/copyFileCommand";
import { createNewNoteCommand } from "./explorer/command/createNewNoteCommand";
import { deleteFileCommand } from "./explorer/command/deleteFileCommand";
import { moveFileCommand } from "./explorer/command/moveFileCommand";
import { openSettingsCommand } from "./explorer/command/openSettingsCommand";
import { refreshFileExplorerCommand } from "./explorer/command/refreshFileExplorerCommand";
import { renameFileCommand } from "./explorer/command/renameFileCommand";
import { selectSortByCommand } from "./explorer/command/selectSortByCommand";
import { toggleSortDirectionCommand } from "./explorer/command/toggleSortDirectionCommand";
import { toggleViewModeCommand } from "./explorer/command/toggleViewModeCommand";
import { FileSystemHelper } from "./explorer/FileSystemHelper";
import { SortableExplorerProvider } from "./explorer/SortableExplorerProvider";

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
  const sortableExplorerProvider = new SortableExplorerProvider(
    bookmarkManager
  );
  const fileSystemHelper = new FileSystemHelper(); // FileSystemHelperはBookmarkManagerを直接は使わない

  // BookmarkExplorerProviderのインスタンスを作成 (BookmarkManagerを渡す)
  const bookmarkExplorerProvider = new BookmarkExplorerProvider(
    bookmarkManager
  );

  // 既存のファイルエクスプローラービューの登録
  vscode.window.registerTreeDataProvider(
    FILE_EXPLORER_VIEW_ID, // 更新された定数を使用
    sortableExplorerProvider
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
      refreshFileExplorerCommand(sortableExplorerProvider)
    )
  );

  // 新規ノート作成コマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.CREATE_NEW_NOTE,
      createNewNoteCommand(sortableExplorerProvider, fileSystemHelper)
    )
  );

  // ソート方法選択コマンド
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.SELECT_SORT_BY,
      selectSortByCommand(sortableExplorerProvider)
    )
  );

  // フラット表示アイコン用コマンド
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${COMMANDS.TOGGLE_VIEW_MODE}.flat`,
      toggleViewModeCommand(sortableExplorerProvider)
    )
  );

  // ツリー表示アイコン用コマンド（同じ処理を実行）
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${COMMANDS.TOGGLE_VIEW_MODE}.tree`,
      toggleViewModeCommand(sortableExplorerProvider)
    )
  );

  // 昇順アイコン用コマンド（同じ処理を実行）
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${COMMANDS.TOGGLE_SORT_DIRECTION}.asc`,
      toggleSortDirectionCommand(sortableExplorerProvider)
    )
  );

  // 降順アイコン用コマンド（同じ処理を実行）
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${COMMANDS.TOGGLE_SORT_DIRECTION}.desc`,
      toggleSortDirectionCommand(sortableExplorerProvider)
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
      deleteFileCommand(sortableExplorerProvider)
    )
  );

  // ファイルコピーコマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.COPY_FILE,
      copyFileCommand(sortableExplorerProvider)
    )
  );

  // excludePatternsに追加するコマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.ADD_TO_EXCLUDE_PATTERNS,
      addToExcludePatternsCommand(sortableExplorerProvider)
    )
  );

  // ファイル名変更コマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.RENAME_FILE,
      renameFileCommand(sortableExplorerProvider)
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
