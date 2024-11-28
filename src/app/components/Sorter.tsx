export enum SortDirection {
    Ascending,
    Descending
  }
  
  export default function sortingObj<T>(
    data: T[],
    sortKey: keyof T,
    direction: SortDirection
  ): T[] {
    const d = data.sort((a: T, b: T) => {
      if (direction === SortDirection.Ascending) {
        return a[sortKey] < b[sortKey] ? -1 : 1;
      }
      if (direction === SortDirection.Descending) {
        return a[sortKey] > b[sortKey] ? -1 : 1;
      }
      return 0;
    });
    return d;
  }
  