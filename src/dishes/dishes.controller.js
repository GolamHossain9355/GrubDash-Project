const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// Property validator

function propertyValidation(req, res, next) {
  const { dishId } = req.params;
  const { data: { name, description, price, image_url, id } = {} } = req.body;
  res.locals.newInputs = { name, description, price, image_url };

  if (!name || name.length === 0) {
    return next({ status: 400, message: "Dish must include a name" });
  }

  if (!description || description.length === 0) {
    return next({ status: 400, message: "Dish must include a description" });
  }

  if (!image_url || image_url.length === 0) {
    return next({ status: 400, message: "Dish must include a image_url" });
  }

  if (price === undefined || price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message:
        price === undefined
          ? "Dish must include a price"
          : "Dish must have a price that is an integer greater than 0",
    });
  }

  if (dishId && id && dishId !== id) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  next();
}

// Dish exists handler 

function dishExists(req, res, next) {
  const { dishId } = req.params;

  const foundDish = dishes.find((dish) => dish.id === dishId);
  res.locals.foundDish = foundDish;

  if (foundDish) return next();
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}

const list = (_req, res, _next) => {
  res.status(200).json({ data: dishes });
};

const create = (_req, res, _next) => {
  const newInputs = res.locals.newInputs;
  const newData = {
    id: nextId(),
    ...newInputs,
  };
  dishes.push(newData);
  res.status(201).json({ data: newData });
};

const read = (_req, res, _next) => {
  res.status(200).json({ data: res.locals.foundDish });
};

const update = (_req, res, _next) => {
  const newInputs = res.locals.newInputs;

  const dishFound = res.locals.foundDish;
  dishFound.name = newInputs.name;
  dishFound.description = newInputs.description;
  dishFound.price = newInputs.price;
  dishFound.image_url = newInputs.image_url;

  res.status(200).json({ data: dishFound });
};

module.exports = {
  list,
  create: [propertyValidation, create],
  read: [dishExists, read],
  update: [dishExists, propertyValidation, update],
};
