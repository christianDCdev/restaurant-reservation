const service = require("./reservations.service");
const hasProperties = require("../errors/hasProperties");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "status",
  "people",
  "created_at", //timestamps
  "updated_at", //timestamps
  "reservation_id",
];

const REQUIRED_PROPERTIES = [
  "first_name",
  "last_name",
  "people",
  "reservation_date",
  "reservation_time",
  "mobile_number",
];

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

//TIME VALIDATION
function timeIsValid(req, res, next) {
  const { reservation_time } = req.body.data;
  const regexTime = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  if (!regexTime.test(reservation_time)) {
    return next({
      status: 400,
      message: `reservation_time is not valid`,
    });
  }
  next();
}

function timeIsDuringOpenHours(req, res, next) {
  const { reservation_time } = req.body.data;
  if (reservation_time < "10:30" || reservation_time > "21:30") {
    return next({
      status: 400,
      message: `Reservation time must be between 10:30AM and 9:30PM`,
    });
  }
  next();
}

//DATE VALIDATION
function dateIsValid(req, res, next) {
  const { reservation_date } = req.body.data;
  const regexDate = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  if (regexDate.test(reservation_date)) {
    return next();
  }
  next({
    status: 400,
    message: `reservation_date is not valid`,
  });
}

function dayIsNotTuesday(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;
  const day = new Date(`${reservation_date} ${reservation_time}`);
  if (day.getDay() != "2") {
    return next();
  }
  next({
    status: 400,
    message: `Restaurant is closed on Tuesdays`,
  });
}

function dateIsInFuture(req, res, next) {
  const today = new Date();
  const { reservation_date, reservation_time } = req.body.data;
  const reservation = new Date(`${reservation_date} ${reservation_time}`);
  if (today.getTime() < reservation.getTime()) {
    return next();
  }
  next({
    status: 400,
    message: `Reservation must be in the future`,
  });
}

//STATUS VALIDATION
function statusIsValid(req, res, next) {
  const { status } = req.body.data;
  if (
    status === "booked" ||
    status === "seated" ||
    status === "cancelled" ||
    status === "finished"
  ) {
    return next();
  }
  next({
    status: 400,
    message: `status: '${status}' is not valid`,
  });
}

function statusIsBooked(req, res, next) {
  const { status } = req.body.data;
  if (status === "booked" || !status) {
    return next();
  }
  next({
    status: 400,
    message: `status must be 'booked' when making a reservation, not '${status}'`,
  });
}

function statusIsFinished(req, res, next) {
  const { status } = res.locals.reservation;
  status;
  if (status === "seated" || status === "booked") {
    return next();
  }
  next({
    status: 400,
    message: `'finished' status cannot be updated`,
  });
}

//PEOPLE VALIDATION
function peopleIsNumber(req, res, next) {
  const { people } = req.body.data;
  if (Number.isInteger(people)) {
    return next();
  }
  next({
    status: 400,
    message: `people must be a number`,
  });
}

//RESERVATION VALIDATION
async function reservationExists(req, res, next) {
  const foundReservation = await service.read(req.params.reservation_id);
  if (foundReservation) {
    res.locals.reservation = foundReservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ${req.params.reservation_id} does not exist`,
  });
}

//CRUDL
async function list(req, res) {
  const { date, mobile_number } = req.query;
  if (mobile_number) {
    const data = await service.listMobile(mobile_number);
    res.json({ data });
  } else if (date) {
    const data = await service.list(date);
    res.json({ data });
  }
}

async function create(req, res) {
  const reservation = await service.create(req.body.data);
  res.status(201).json({ data: reservation });
}

async function read(req, res) {
  const { reservation } = res.locals;
  res.json({ data: reservation });
}

async function update(req, res, next) {
  const { reservation } = res.locals;
  const updatedReservation = {
    ...reservation,
    ...req.body.data,
  };
  const data = await service.update(updatedReservation);
  res.status(200).json({ data });
}

async function updateStatus(req, res, next) {
  const { reservation } = res.locals;
  const { status } = req.body.data;
  const updateReservation = {
    ...reservation,
    status: status,
  };
  const data = await service.update(updateReservation);
  res.status(200).json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    timeIsValid,
    timeIsDuringOpenHours,
    dateIsValid,
    dayIsNotTuesday,
    dateIsInFuture,
    statusIsBooked,
    peopleIsNumber,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  update: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    timeIsValid,
    timeIsDuringOpenHours,
    dateIsValid,
    dayIsNotTuesday,
    dateIsInFuture,
    peopleIsNumber,
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    statusIsValid,
    statusIsFinished,
    asyncErrorBoundary(updateStatus),
  ],
};
