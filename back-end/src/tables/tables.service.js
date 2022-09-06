const knex = require("../db/connection");

async function list() {
  return knex("tables").select("*").orderBy("table_name");
}

async function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

async function read(table_id) {
  return knex("tables").select("*").where({ table_id }).first();
}

//use knex.transaction() to keep tables and reservations in sync
async function update(updatedTable, updatedReservation) {
  const transaction = await knex.transaction();
  return transaction("tables")
    .select("*")
    .where({ table_id: updatedTable.table_id })
    .update(updatedTable, "*")
    .then(function () {
      return transaction("reservations")
        .select("*")
        .where({ reservation_id: updatedReservation.reservation_id })
        .update(updatedReservation, "*");
    })
    .then(transaction.commit)
    .catch(transaction.rollback);
}

async function listAvailable() {
  return knex("tables")
    .select("*")
    .where({ reservation_id: null })
    .orderBy("table_name");
}

module.exports = {
  list,
  create,
  read,
  update,
  listAvailable,
};
