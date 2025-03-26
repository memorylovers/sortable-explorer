// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { addToExcludePatternsCommand } from "./commands/addToExcludePatternsCommand";
import { clearAllBookmarksCommand } from "./commands/clearAllBookmarksCommand";
import { copyFileCommand } from "./commands/copyFileCommand";
import { createNewNoteCommand } from "./commands/createNewNoteCommand";
import { deleteFileCommand } from "./commands/deleteFileCommand";
import { openSettingsCommand } from "./commands/openSettingsCommand";
import { refreshBookmarkExplorerCommand } from "./commands/refreshBookmarkExplorerCommand";
import { refreshFileExplorerCommand } from "./commands/refreshFileExplorerCommand";
import { renameFileCommand } from "./commands/renameFileCommand";
import { selectSortByCommand } from "./commands/selectSortByCommand";
import { showBookmarkViewCommand } from "./commands/showBookmarkViewCommand";
import { toggleBookmarkCommand } from "./commands/toggleBookmarkCommand";
import {
  toggleSortDirectionCommand,
  updateSortDirectionIcon,
} from "./commands/toggleSortDirectionCommand";
import {
  toggleViewModeCommand,
  updateViewModeIcon,
} from "./commands/toggleViewModeCommand";
import {
  COMMANDS,
  EXTENSION_NAME,
  FILE_EXPLORER_ID,
} from "./configuration/configurationConstants";
import { ConfigurationManager } from "./configuration/configurationManager";
import { BookmarkExplorerProvider } from "./fileExplorer/bookmarkExplorerProvider";
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

  // FileExplorerProviderとBookmarkExplorerProviderのインスタンスを作成
  const fileExplorerProvider = new FileExplorerProvider(context);
  const bookmarkExplorerProvider = new BookmarkExplorerProvider(context);
  const fileSystemHelper = new FileSystemHelper();

  // 初期状態の並び順の方向に応じてアイコンを設定
  const initialSortDirection = ConfigurationManager.getSortDirection();
  updateSortDirectionIcon(initialSortDirection);

  // 初期状態の表示モードに応じてアイコンを設定
  const initialViewMode = ConfigurationManager.getViewMode();
  updateViewModeIcon(initialViewMode);

  // 独立したパネルのツリービューの登録
  vscode.window.registerTreeDataProvider(
    FILE_EXPLORER_ID,
    fileExplorerProvider
  );

  // ブックマークビューの登録
  vscode.window.registerTreeDataProvider(
    "sortable-explorer.bookmarks",
    bookmarkExplorerProvider
  );

  // コマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.REFRESH_FILE_EXPLORER,
      refreshFileExplorerCommand(fileExplorerProvider)
    )
  );

  // ブックマークエクスプローラー更新コマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.REFRESH_BOOKMARK_EXPLORER,
      refreshBookmarkExplorerCommand(bookmarkExplorerProvider)
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
      toggleViewModeCommand(fileExplorerProvider, bookmarkExplorerProvider)
    )
  );

  // ツリー表示アイコン用コマンド（同じ処理を実行）
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${COMMANDS.TOGGLE_VIEW_MODE}.tree`,
      toggleViewModeCommand(fileExplorerProvider, bookmarkExplorerProvider)
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

  // ブックマーク切り替えコマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.TOGGLE_BOOKMARK,
      toggleBookmarkCommand(context, fileExplorerProvider, bookmarkExplorerProvider)
    )
  );

  // すべてのブックマーククリアコマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.CLEAR_ALL_BOOKMARKS,
      clearAllBookmarksCommand(context, fileExplorerProvider, bookmarkExplorerProvider)
    )
  );

  // ブックマークビューモード切り替えコマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${COMMANDS.TOGGLE_VIEW_MODE}.bookmarks`,
      toggleViewModeCommand(fileExplorerProvider, bookmarkExplorerProvider)
    )
  );

  // ブックマークビュー表示コマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.SHOW_BOOKMARK_VIEW,
      showBookmarkViewCommand()
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
