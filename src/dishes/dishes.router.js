const router = require("express").Router();
const controller = require("./dishes.controller")

// TODO: Implement the /dishes routes needed to make the tests pass

router
  .route("/")
  .get(controller.list)

module.exports = router;
