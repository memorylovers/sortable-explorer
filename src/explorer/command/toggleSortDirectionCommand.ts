import * as vscode from "vscode";
import {
  CONTEXT_KEYS,
  SortDirection,
  SortDirectionType,
} from "../../configuration/configurationConstants";
import { ConfigurationManager } from "../../configuration/configurationManager";
import { localize } from "../../localization/localization";
import { SortableExplorerProvider } from "../SortableExplorerProvider";

/**
 * 並び順の方向（昇順/降順）を切り替えるコマンド
 *
 * @param fileExplorerProvider FileExplorerProviderのインスタンス
 * @returns コマンド実行関数
 */
export function toggleSortDirectionCommand(
  fileExplorerProvider: SortableExplorerProvider
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
  };
}
