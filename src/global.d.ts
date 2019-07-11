import { Collection } from "mongoose";

declare module "mongoose" {
  interface PaginateParameters {
    readonly query: {};
    readonly limit: number;
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
    paginate<T>(parameters: PaginateParameters): Promise<PaginateResult<T>>;
  }
}
