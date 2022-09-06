import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { seatReservation, listFreeTables, readReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function SeatForm() {
  const [reservation, setReservation] = useState({});
  const [reservationError, setReservationError] = useState(null);

  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);

  const [seatError, setSeatError] = useState(null);
  const [table_id, setTable_id] = useState("");
  const [tableList, setTableList] = useState(null);
  const [subtitle, setSubtitle] = useState([]);

  const history = useHistory();
  const reservation_id = useParams().reservation_id;

  function loadReservation() {
    const abortController = new AbortController();
    setReservationError(null);
    readReservation(reservation_id, abortController.signal)
      .then(setReservation)
      .catch(setReservationError);
    return () => abortController.abort();
  }

  function loadTables() {
    if (reservation.reservation_id) {
      const abortController = new AbortController();
      setTablesError(null);
      listFreeTables({ capacity: reservation.people }, abortController.signal)
        .then(setTables)
        .catch(setTablesError);
      return () => abortController.abort();
    }
  }

  useEffect(loadReservation, [reservation_id]);
  useEffect(loadTables, [reservation]);

  useEffect(() => {
    if (reservation.reservation_id) {
      setSubtitle(
        <h3>{`${reservation.first_name} ${reservation.last_name}, Party of ${reservation.people}`}</h3>
      );
    }
  }, [reservation]);

  useEffect(() => {
    setTableList(
      tables.map((table, index) => {
        return (
          <option key={index} value={table.table_id}>
            {table.table_name} - {table.capacity}
          </option>
        );
      })
    );
  }, [tables]);

  const submitHandler = (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    setSeatError(null);
    seatReservation(reservation_id, table_id, abortController.signal)
      .then(() => {
        history.push(`/dashboard`);
      })
      .catch(setSeatError);
    return () => abortController.abort();
  };

  return (
    <>
      <h1> {`Seat Reservation`}</h1>
      {subtitle}
      <ErrorAlert error={reservationError} />
      <ErrorAlert error={tablesError} />
      <ErrorAlert error={seatError} />

      <form onSubmit={submitHandler}>
        <div className="input-group mb-3">
          <select
            className="custom-select"
            name="table_id"
            id="table_id"
            type="text"
            style={{ maxWidth: "200px" }}
            onChange={(event) => {
              setTable_id(event.target.value);
            }}
            value={table_id}
            required
          >
            <option value="">-----------</option>
            {tableList}
          </select>

          <div className="input-group-append">
            <button
              className="btn btn-secondary mb-3 ml-3"
              to="/"
              onClick={() => history.goBack()}
            >
              Cancel
            </button>
            <button className="btn btn-primary mb-3 ml-3" type="submit">
              Submit
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default SeatForm;
