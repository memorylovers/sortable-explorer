import * as vscode from "vscode";
import {
  CONFIG_KEYS,
  DefaultPatterns,
  EXTENSION_NAME,
  SortBy,
  SortByType,
  SortDirection,
  SortDirectionType,
  ViewMode,
  ViewModeType,
} from "./configurationConstants";

export class ConfigurationManager {
  public static getSortBy(): SortByType {
    return vscode.workspace
      .getConfiguration(EXTENSION_NAME)
      .get(CONFIG_KEYS.SORT_BY, SortBy.DATE_MODIFIED);
  }

  public static getSortDirection(): SortDirectionType {
    return vscode.workspace
      .getConfiguration(EXTENSION_NAME)
      .get(CONFIG_KEYS.SORT_DIRECTION, SortDirection.DESC);
  }

  public static getExcludePatterns(): string[] {
    return vscode.workspace
      .getConfiguration(EXTENSION_NAME)
      .get(CONFIG_KEYS.EXCLUDE_PATTERNS, [...DefaultPatterns.EXCLUDE]);
  }

  public static getIncludePatterns(): string[] {
    return vscode.workspace
      .getConfiguration(EXTENSION_NAME)
      .get(CONFIG_KEYS.INCLUDE_PATTERNS, [...DefaultPatterns.INCLUDE]);
  }

  public static async setSortBy(value: SortByType): Promise<void> {
    await vscode.workspace
      .getConfiguration(EXTENSION_NAME)
      .update(CONFIG_KEYS.SORT_BY, value);
  }

  public static async setSortDirection(
    value: SortDirectionType
  ): Promise<void> {
    await vscode.workspace
      .getConfiguration(EXTENSION_NAME)
      .update(CONFIG_KEYS.SORT_DIRECTION, value);
  }

  public static getViewMode(): ViewModeType {
    return vscode.workspace
      .getConfiguration(EXTENSION_NAME)
      .get(CONFIG_KEYS.VIEW_MODE, ViewMode.TREE);
  }

  public static async setViewMode(value: ViewModeType): Promise<void> {
    await vscode.workspace
      .getConfiguration(EXTENSION_NAME)
      .update(CONFIG_KEYS.VIEW_MODE, value);
  }

  public static async setExcludePatterns(patterns: string[]): Promise<void> {
    await vscode.workspace
      .getConfiguration(EXTENSION_NAME)
      .update(CONFIG_KEYS.EXCLUDE_PATTERNS, patterns);
  }
}
