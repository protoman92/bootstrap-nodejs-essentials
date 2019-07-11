declare module "mongo-cursor-pagination" {
  import { Schema } from "mongoose";
  export const mongoosePlugin: (schema: Schema) => void;
}
