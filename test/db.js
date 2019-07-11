const mongoose = require("mongoose");
const { mongoosePlugin } = require("mongo-cursor-pagination");

const userSchemaDefinition = {
  firstName: { type: String, required: true, unique: false },
  lastName: { type: String, required: true, unique: false },
  username: { type: String, required: true, unique: true }
};

const userSchema = new mongoose.Schema(userSchemaDefinition, {
  strict: "throw",
  validateBeforeSave: true
});

userSchema.plugin(mongoosePlugin);
exports.UserModel = mongoose.model("user", userSchema);

exports.initializeDB = async function() {
  let uri = "mongodb://localhost:27017/test";
  await mongoose.connect(uri, { useNewUrlParser: true });
};
