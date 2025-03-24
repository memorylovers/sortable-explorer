import * as vscode from "vscode";
import {
  CONTEXT_KEYS,
  ViewMode,
  ViewModeType,
} from "../configuration/configurationConstants";
import { ConfigurationManager } from "../configuration/configurationManager";
import { FileExplorerProvider } from "../fileExplorer/fileExplorerProvider";
import { localize } from "../localization/localization";

/**
 * 表示モード（フラット表示/ツリー表示）を切り替えるコマンド
 *
 * @param fileExplorerProvider FileExplorerProviderのインスタンス
 * @returns コマンド実行関数
 */
export function toggleViewModeCommand(
  fileExplorerProvider: FileExplorerProvider
) {
  return async () => {
    // 現在の表示モードを取得
    const currentViewMode = ConfigurationManager.getViewMode();

    // 表示モードを切り替え
    const newViewMode =
      currentViewMode === ViewMode.FLAT ? ViewMode.TREE : ViewMode.FLAT;

    // 設定を更新
    await ConfigurationManager.setViewMode(newViewMode);

    // 表示を更新
    fileExplorerProvider.refresh();

    // 通知を表示
    const modeName =
      newViewMode === ViewMode.FLAT
        ? localize("viewMode.flat")
        : localize("viewMode.tree");
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
