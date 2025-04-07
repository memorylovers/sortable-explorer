import { SortBy, SortByType } from "../configuration/configurationConstants";
import { FileItem } from "./FileItem";

export interface SortingStrategy {
  sort(files: FileItem[]): FileItem[];
}

export class NameSortingStrategy implements SortingStrategy {
  constructor(private ascending: boolean = true) {}

  sort(files: FileItem[]): FileItem[] {
    return [...files].sort((a, b) => {
      const result = a.name.localeCompare(b.name);
      return this.ascending ? result : -result;
    });
  }
}

export class CreatedSortingStrategy implements SortingStrategy {
  constructor(private ascending: boolean = true) {}

  sort(files: FileItem[]): FileItem[] {
    return [...files].sort((a, b) => {
      const result = a.createdTime.getTime() - b.createdTime.getTime();
      return this.ascending ? result : -result;
    });
  }
}

export class ModifiedSortingStrategy implements SortingStrategy {
  constructor(private ascending: boolean = true) {}

  sort(files: FileItem[]): FileItem[] {
    return [...files].sort((a, b) => {
      const result = a.modifiedTime.getTime() - b.modifiedTime.getTime();
      return this.ascending ? result : -result;
    });
  }
}

export class SortingStrategyFactory {
  static createStrategy(
    sortBy: SortByType,
    ascending: boolean
  ): SortingStrategy {
    switch (sortBy) {
      case SortBy.NAME:
        return new NameSortingStrategy(ascending);
      case SortBy.DATE_CREATED:
        return new CreatedSortingStrategy(ascending);
      case SortBy.DATE_MODIFIED:
      default:
        return new ModifiedSortingStrategy(ascending);
    }
  }
}
