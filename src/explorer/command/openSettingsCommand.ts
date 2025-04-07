import * as vscode from "vscode";
import { EXTENSION_NAME } from "../../configuration/configurationConstants";

// 設定を開くコマンド
export function openSettingsCommand() {
  return () => {
    vscode.commands.executeCommand(
      "workbench.action.openSettings",
      EXTENSION_NAME
    );
  };
}