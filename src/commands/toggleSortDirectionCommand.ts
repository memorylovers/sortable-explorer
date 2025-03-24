import * as vscode from "vscode";
import {
  CONTEXT_KEYS,
  SortDirection,
  SortDirectionType,
} from "../configuration/configurationConstants";
import { ConfigurationManager } from "../configuration/configurationManager";
import { FileExplorerProvider } from "../fileExplorer/fileExplorerProvider";
import { localize } from "../localization/localization";

/**
 * 並び順の方向（昇順/降順）を切り替えるコマンド
 *
 * @param fileExplorerProvider FileExplorerProviderのインスタンス
 * @returns コマンド実行関数
 */
export function toggleSortDirectionCommand(
  fileExplorerProvider: FileExplorerProvider
) {
  return async () => {
    // 現在の並び順の方向を取得
    const currentSortDirection = ConfigurationManager.getSortDirection();

    // 並び順の方向を切り替え
    const newSortDirection =
      currentSortDirection === SortDirection.ASC
        ? SortDirection.DESC
        : SortDirection.ASC;

    // 設定を更新
    await ConfigurationManager.setSortDirection(newSortDirection);

    // 表示を更新
    fileExplorerProvider.refresh();

    // 通知を表示
    const directionName =
      newSortDirection === SortDirection.ASC
        ? localize("sortDirection.ascending")
        : localize("sortDirection.descending");
    vscode.window.showInformationMessage(
      localize("sortDirection.changed", directionName)
    );

    // アイコンを更新
    updateSortDirectionIcon(newSortDirection);
  };
}

/**
 * 並び順の方向に応じてアイコンを更新する
 *
 * @param sortDirection 並び順の方向
 */
export function updateSortDirectionIcon(sortDirection: SortDirectionType) {
  // コマンドのアイコンを更新
  vscode.commands.executeCommand(
    "setContext",
    CONTEXT_KEYS.SORT_DIRECTION_ICON,
    sortDirection
  );
}
