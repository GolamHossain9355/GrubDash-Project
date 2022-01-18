const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// Property validator
function validateOrderProperties(req, res, next) {
  const { orderId } = req.params;
  const { data: { deliverTo, mobileNumber, dishes, id, status } = {} } =
    req.body;
  res.locals.newInputs = { deliverTo, mobileNumber, dishes };

  if (!deliverTo || deliverTo.length === 0) {
    return next({ status: 400, message: "Order must include a deliverTo" });
  }

  if (!mobileNumber || mobileNumber.length === 0) {
    return next({ status: 400, message: "Order must include a mobileNumber" });
  }

  if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
    return next({
      status: 400,
      message: !dishes
        ? "Order must include a dish"
        : "Order must include at least one dish",
    });
  }

  dishes.forEach((dish, index) => {
    if (
      !dish.quantity ||
      dish.quantity <= 0 ||
      !Number.isInteger(dish.quantity)
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });

  if (orderId) {
    if (
      !status ||
      status.length === 0 ||
      status === "delivered" ||
      status === "invalid"
    ) {
      return next({
        status: 400,
        message:
          status === "delivered"
            ? "A delivered order cannot be changed"
            : "Order must have a status of pending, preparing, out-for-delivery, delivered",
      });
    }
    if (id && orderId !== id) {
      return next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
      });
    }
  }
  next();
}

// Order exist handler

function orderExists(req, res, next) {
  const { orderId } = req.params;

  const foundOrder = orders.find((order) => order.id === orderId);
  res.locals.foundOrder = foundOrder;

  if (foundOrder) return next();
  next({
    status: 404,
    message: `Order does not exist ${orderId}`,
  });
}

// controller functions

const list = (_req, res, _next) => {
  res.status(200).json({ data: orders });
};

const create = (_req, res, _next) => {
  const newInputs = res.locals.newInputs;
  const newData = {
    id: nextId(),
    ...newInputs,
  };
  orders.push(newData);
  res.status(201).json({ data: newData });
};

const read = (_req, res, _next) => {
  res.status(200).json({ data: res.locals.foundOrder });
};

const update = (_req, res, _next) => {
  const newInputs = res.locals.newInputs;

  const foundOrder = res.locals.foundOrder;
  foundOrder.deliverTo = newInputs.deliverTo;
  foundOrder.mobileNumber = newInputs.mobileNumber;
  foundOrder.dishes = newInputs.dishes;

  res.status(200).json({ data: foundOrder });
};

const destroy = (req, res, next) => {
  const { orderId } = req.params;
  const foundOrder = res.locals.foundOrder;

  if (foundOrder.status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }

  const foundIndex = orders.findIndex(
    (order) => Number(order.id) === Number(orderId)
  );
  orders.splice(foundIndex, 1);
  res.sendStatus(204);
};

module.exports = {
  list,
  create: [validateOrderProperties, create],
  read: [orderExists, read],
  update: [orderExists, validateOrderProperties, update],
  delete: [orderExists, destroy],
};
