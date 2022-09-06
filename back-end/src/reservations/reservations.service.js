const knex = require("../db/connection");

function list(reservation_date) {
  return knex("reservations")
    .select("*")
    .whereNot({ status: "finished" })
    .where({ reservation_date })
    .orderBy("reservation_time");
}

function create(reservation) {
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((records) => records[0]);
}

function read(reservation_id) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id })
    .first();
}

function update(update) {
  return knex("reservations")
    .where({ reservation_id: update.reservation_id })
    .update(update, "*")
    .then((records) => records[0]);
}

function listMobile(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

module.exports = {
  list,
  create,
  read,
  update,
  listMobile,
};
