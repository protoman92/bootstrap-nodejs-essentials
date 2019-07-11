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
    async ({ query: { limit: reqLimit, ...reqQuery } }, res) => {
      const query = Object.entries(reqQuery)
        .map(([key, value]) => ({ [key]: { $in: value } }))
        .reduce((acc, val) => ({ ...acc, ...val }), {});

      const collection = mongoModel.find(query);
      const limit = parseInt(reqLimit, undefined);

      const { previous, next, results } = await mongoModel.paginate({
        query,
        limit
      });

      /**
       * @type {number} This is the raw count that ignores pagination, i.e. the
       * number of items that matches the query.
       */
      const count = await collection.estimatedDocumentCount();

      res.status(200).json({
        count,
        // @ts-ignore
        data: results.map(({ _id: id, ...datum }) => ({ id, ...datum })),
        next,
        previous
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
export default function(
  router: Router,
  { mongoModel }: RouterParameters
): Router {
  router.get("", getData(mongoModel));
  router.post("", createData(mongoModel));
  router.get("/:id", findDataByID(mongoModel));
  router.patch("/:id", updateDataByID(mongoModel));
  return router;
}
