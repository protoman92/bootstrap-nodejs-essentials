import { Router } from "express";
import { Document, Model } from "mongoose";
import { handleError } from "./util";

type MongoModel = Model<Document, {}>;

interface RouterParameters {
  readonly mongoModel: MongoModel;
}

function createData(mongoModel: MongoModel) {
  return handleError(async ({ body }, res) => {
    const [{ _id: id }] = await mongoModel.create([body]);
    res.status(200).json({ id, ...body });
  });
}

function getData(mongoModel: MongoModel) {
  return handleError(
    async (
      {
        query: {
          limit: reqLimit,
          order,
          previous: prevKey,
          next: nextKey,
          ...reqQuery
        }
      },
      res
    ) => {
      const query = Object.entries(reqQuery)
        .map(([key, value]) => ({ [key]: { $in: value } }))
        .reduce((acc, val) => ({ ...acc, ...val }), {});

      const limit = parseInt(reqLimit, undefined);
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
        sortAscending,
        next: nextKey,
        previous: prevKey
      });

      res.status(200).json({
        results: results.map(({ _id: id, ...datum }) => ({ id, ...datum })),
        next,
        hasNext,
        previous,
        hasPrevious
      });
    }
  );
}

function findDataByID(mongoModel: MongoModel) {
  return handleError(async ({ params: { id } }, res) => {
    const { _id, ...data } = await mongoModel.findById(id).lean();
    res.status(200).json({ id, ...data });
  });
}

function updateDataByID(mongoModel: MongoModel) {
  return handleError(async ({ body, params: { id } }, res) => {
    await mongoModel.updateOne({ _id: id }, body).lean();
    res.status(200).json(body);
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
