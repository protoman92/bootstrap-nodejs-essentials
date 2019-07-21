import { AxiosRequestConfig } from "axios";
import "./mongoPagination";

declare module "mongoose" {
  interface PaginateParameters<T> {
    readonly query: {};
    readonly limit: number;
    readonly paginatedField?: Extract<keyof T, string>;
    readonly sortAscending: boolean;
    readonly next?: string;
    readonly previous?: string;
    readonly after?: string;
    readonly before?: string;
  }

  interface PaginateResult<T> {
    readonly results: readonly T[];
    readonly next: string;
    readonly previous: string;
    readonly hasNext: boolean;
    readonly hasPrevious: boolean;
  }

  interface Model<T extends Document, QueryHelpers = {}> {
    /** Paginate using mongodb cursor paginator. */
    paginate<T>(parameters: PaginateParameters<T>): Promise<PaginateResult<T>>;
  }
}

declare global {
  type OmitKeys<T, K extends keyof T> = import("ts-essentials").Omit<T, K>;

  namespace HTTPClient {
    type Config = OmitKeys<AxiosRequestConfig, "baseURL">;
  }

  /** Standard HTTP client that can perform API requests. */
  interface HTTPClient {
    get<T>(url: string, c?: HTTPClient.Config): Promise<T>;
    post<T>(url: string, body: unknown, c?: HTTPClient.Config): Promise<T>;
    patch<T>(url: string, body: unknown, c?: HTTPClient.Config): Promise<T>;
    delete<T>(url: string, body: unknown, c?: HTTPClient.Config): Promise<T>;
    head<T>(url: string, c?: HTTPClient.Config): Promise<T>;
  }
}
