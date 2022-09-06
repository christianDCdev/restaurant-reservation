import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory } from "react-router-dom";
import useQuery from "../utils/useQuery";
import { showDisplayDate, previous, next } from "../utils/date-time";
import ReservationCard from "../reservations/ReservationCard";
import TableCard from "../tables/TableCard";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);

  const [displayReservations, setDisplayReservations] = useState([]);
  const [displayTables, setDisplayTables] = useState([]);

  const history = useHistory();

  let query = useQuery();
  date = query.get("date") || date;
  const displayDate = showDisplayDate(date); //displays date in correct format - Tuesday, Aug 16 2022

  function loadReservations() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  function loadTables() {
    const abortController = new AbortController();
    setTablesError(null);
    listTables(abortController.signal).then(setTables).catch(setTablesError);
    return () => abortController.abort();
  }

  useEffect(loadReservations, [date]);
  useEffect(loadTables, [reservations]);

  // display list of reservations
  useEffect(() => {
    if(reservations.length) {
      setDisplayReservations(
        reservations.map((reservation, index) => {
          return (
            <div key={index}>
              <ReservationCard reservation={reservation} loadReservations={loadReservations} />
            </div>
          );
        })
      );
    } else{
      setDisplayReservations(`No Reservations on ${displayDate.display}`);
    }
    // line below fixes react hook useEffect has missing dependency warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservations]);

  //display list of tables
  useEffect(() => {
    if(tables.length) {
      setDisplayTables(
        tables.map((table, index) => {
          return (
            <div key={index}>
              <TableCard table={table} loadTables={loadTables} />
            </div>
          );
        })
      );
    } else{
      setDisplayTables(`No Tables Created`);
    }
    // line below fixes react hook useEffect has missing dependency warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables]);

  return (
    <>
      <h1>Dashboard</h1>
      <h3 className="mb-3">{displayDate.display}</h3>

      {/* Date buttons */}
      <div className="input-group input-group-sm">
          <button
            className="btn btn-secondary btn-sm mb-3"
            onClick={() => history.push(`/dashboard?date=${previous(date)}`)}
          >
            Previous
          </button>
          <button
            className="btn btn-primary btn-sm ml-2 mb-3"
            onClick={() => history.push(`/dashboard`)}
          >
            Today
          </button>
          <button
            className="btn btn-secondary btn-sm ml-2 mb-3"
            onClick={() => history.push(`/dashboard?date=${next(date)}`)}
          >
            Next
          </button>
        <input
          type="date"
          className="form-control ml-2"
          style={{ maxWidth: "120px" }}
          onChange={(event) =>
            history.push(`/dashboard?date=${event.target.value}`)
          }
          value={date}
        />
      </div>

      {/* Reservations */}
      <h4>Reservations</h4>
      <ErrorAlert error={reservationsError} />
      <div>{displayReservations}</div>

      {/* Tables*/}
      <h4 className="mt-2">Tables</h4>
      <ErrorAlert error={tablesError} />
      <div>{displayTables}</div>
    </>
  );
}

export default Dashboard;
