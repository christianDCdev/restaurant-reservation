const service = require("./tables.service");
const reservationService = require("../reservations/reservations.service");
const hasProperties = require("../errors/hasProperties");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const VALID_PROPERTIES = ["table_name", "capacity", "reservation_id"];
const REQUIRED_PROPERTIES = ["table_name", "capacity"];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;
  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

const hasRequiredProperties = hasProperties(...REQUIRED_PROPERTIES);

//TABLE VALIDATION
async function tableExists(req, res, next) {
  const tableId = req.params.table_id;
  const table = await service.read(tableId);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `Table ${tableId} does not exist.`,
  });
}

function tableIsOccupied(req, res, next) {
  const { reservation_id } = res.locals.table;
  if (reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `This table is not occupied.`,
  });
}

function tableIsFree(req, res, next) {
  const { reservation_id } = res.locals.table;
  if (!reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `This table is occupied.`,
  });
}

// table name must be at least 2 characters long
function tableNameIsValid(req, res, next) {
  const { table_name } = req.body.data;
  const length = table_name.length;
  if (length >= 2) {
    return next();
  }
  return next({
    status: 400,
    message: `table_name must be at least 2 characters long`,
  });
}

//CAPACITY VALIDATION
function capacityIsNumber(req, res, next) {
  let { capacity } = req.body.data;
  if (Number.isInteger(capacity) && capacity > 0) {
    return next();
  }
  return next({
    status: 400,
    message: `capacity must be a number greater than 0`,
  });
}

//see if table can seat party size
function hasEnoughCapacity(req, res, next) {
  const { capacity } = res.locals.table;
  const { people } = res.locals.reservation;

  if (capacity >= people) {
    return next();
  }
  next({
    status: 400,
    message: `Table does not have capacity to seat ${people}.`,
  });
}

//RESERVATION VALIDATION
async function reservationIdExists(req, res, next) {
  const { reservation_id } = req.body.data;
  const reservation = await reservationService.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ${reservation_id} does not exist`,
  });
}

function hasReservationId(req, res, next) {
  const { data = {} } = req.body;
  if (data.reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `reservation_id is required`,
  });
}

async function findReservation(req, res, next) {
  const { reservation_id } = res.locals.table;
  const reservation = await reservationService.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ${reservation_id} cannot be found.`,
  });
}

function reservationIsBooked(req, res, next) {
  const { status } = res.locals.reservation;
  if (status === "booked") {
    return next();
  }
  next({
    status: 400,
    message: `Reservation status ${status} is not valid`,
  });
}

//CRUDL
async function list(req, res) {
  const data = await service.list();
  res.json({ data });
}

async function listAvailable(req, res) {
  const data = await service.listAvailable();
  res.json({ data });
}

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

//updates table and reservation at the same time.
//table is assigned a reservation_id
//reservation is given a status of "seated"
async function assignSeat(req, res, next) {
  const updatedTable = {
    ...res.locals.table,
    ...req.body.data,
  };
  const updatedReservation = {
    ...res.locals.reservation,
    status: "seated",
  };
  const data = await service.update(updatedTable, updatedReservation);
  res.json({ data });
}

async function unassignSeat(req, res, next) {
  const { table } = res.locals;
  const updatedTable = {
    ...table,
    reservation_id: null,
  };
  const updatedReservation = {
    ...res.locals.reservation,
    status: "finished",
  };
  const data = await service.update(updatedTable, updatedReservation);
  res.json({ data });
}

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    tableNameIsValid,
    capacityIsNumber,
    asyncErrorBoundary(create),
  ],
  listAvailable: [asyncErrorBoundary(listAvailable)],
  assignSeat: [ 
    hasReservationId,
    asyncErrorBoundary(reservationIdExists),
    reservationIsBooked,
    asyncErrorBoundary(tableExists),
    hasEnoughCapacity,
    tableIsFree,
    asyncErrorBoundary(assignSeat),
  ],
  unassignSeat: [
    asyncErrorBoundary(tableExists),
    tableIsOccupied,
    asyncErrorBoundary(findReservation),
    asyncErrorBoundary(unassignSeat),
  ],
};
