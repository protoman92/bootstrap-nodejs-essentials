import { Router } from "express";
import { Document, Model } from "mongoose";
import { handleError } from "./util";

type MongoModel = Model<Document, {}>;

interface RouterParameters {
  readonly mongoModel: MongoModel;
}

function createData(mongoModel: MongoModel) {
  return handleError(async ({ body }, res) => {
    const [{ _id }] = await mongoModel.create([body]);
    res.status(200).json({ ..._id, body });
  });
}

function getData(mongoModel: MongoModel) {
  return handleError(
    async (
      {
        query: {
          limit: reqLimit,
          order,
          sortField,
          previous: prevKey,
          next: nextKey,
          ...restQuery
        }
      },
      res
    ) => {
      const query = Object.entries(restQuery)
        .map(([key, value]) => ({
          [key]: { $in: Array.isArray(value) ? value : [value] }
        }))
        .reduce((acc, val) => ({ ...acc, ...val }), {});

      const limit = parseInt(reqLimit, undefined) || 10;
      const sortAscending = `${order}`.toLowerCase().startsWith("asc");

      const {
        previous,
        next,
        hasNext,
        results,
        hasPrevious
      } = await mongoModel.paginate<any>({
        query,
        limit,
        paginatedField: sortField,
        sortAscending,
        next: nextKey,
        previous: prevKey
      });

      res.status(200).json({
        results,
        limit,
        order,
        sortField,
        next,
        hasNext,
        previous,
        hasPrevious
      });
    }
  );
}

function findDataByID(mongoModel: MongoModel) {
  return handleError(async ({ params: { id: _id } }, res) => {
    const data = await mongoModel.findById(_id).lean();
    res.status(200).json({ _id, ...data });
  });
}

function updateDataByID(mongoModel: MongoModel) {
  return handleError(async ({ body, params: { id: _id } }, res) => {
    await mongoModel.updateOne({ _id }, body).lean();
    res.status(200).json({ _id, ...body });
  });
}

/** Create a standard router that supports HTTP verbs using a mongodb model. */
export function createStandardMongoDBRouter(
  router: Router,
  { mongoModel }: RouterParameters
): Router {
  router.get("", getData(mongoModel));
  router.post("", createData(mongoModel));
  router.get("/:id", findDataByID(mongoModel));
  router.patch("/:id", updateDataByID(mongoModel));
  return router;
}
