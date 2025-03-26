import * as vscode from "vscode";
import {
  CONTEXT_KEYS,
  ViewMode,
  ViewModeType,
} from "../configuration/configurationConstants";
import { ConfigurationManager } from "../configuration/configurationManager";
import { BookmarkExplorerProvider } from "../fileExplorer/bookmarkExplorerProvider";
import { FileExplorerProvider } from "../fileExplorer/fileExplorerProvider";
import { localize } from "../localization/localization";

/**
 * 表示モード（フラット表示/ツリー表示/ブックマーク）を切り替えるコマンド
 *
 * @param fileExplorerProvider FileExplorerProviderのインスタンス
 * @param bookmarkExplorerProvider BookmarkExplorerProviderのインスタンス
 * @returns コマンド実行関数
 */
export function toggleViewModeCommand(
  fileExplorerProvider: FileExplorerProvider,
  bookmarkExplorerProvider: BookmarkExplorerProvider
) {
  return async () => {
    // 現在の表示モードを取得
    const currentViewMode = ConfigurationManager.getViewMode();

    // 表示モードを切り替え（FLAT -> TREE -> BOOKMARKS -> FLAT の順）
    let newViewMode: ViewModeType;
    if (currentViewMode === ViewMode.FLAT) {
      newViewMode = ViewMode.TREE;
    } else if (currentViewMode === ViewMode.TREE) {
      newViewMode = ViewMode.BOOKMARKS;
    } else {
      newViewMode = ViewMode.FLAT;
    }

    // 設定を更新
    await ConfigurationManager.setViewMode(newViewMode);

    // 表示を更新
    fileExplorerProvider.refresh();
    bookmarkExplorerProvider.refresh();

    // 通知を表示
    let modeName: string;
    if (newViewMode === ViewMode.FLAT) {
      modeName = localize("viewMode.flat");
    } else if (newViewMode === ViewMode.TREE) {
      modeName = localize("viewMode.tree");
    } else {
      modeName = localize("viewMode.bookmarks");
    }
    
    vscode.window.showInformationMessage(
      localize("viewMode.changed", modeName)
    );

    // アイコンを更新
    updateViewModeIcon(newViewMode);
  };
}

/**
 * 表示モードに応じてアイコンを更新する
 *
 * @param viewMode 表示モード
 */
export function updateViewModeIcon(viewMode: ViewModeType) {
  // コマンドのアイコンを更新
  vscode.commands.executeCommand(
    "setContext",
    CONTEXT_KEYS.VIEW_MODE_ICON,
    viewMode
  );
}
