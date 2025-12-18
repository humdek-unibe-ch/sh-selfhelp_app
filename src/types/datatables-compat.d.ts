import type { Config, ConfigColumns, Api as DataTablesApi } from 'datatables.net';

declare global {
  namespace DataTables {
    export type Settings = Config;
    export type ColumnSettings = ConfigColumns;
    export type Api<T = any> = DataTablesApi<T>;
  }
}
