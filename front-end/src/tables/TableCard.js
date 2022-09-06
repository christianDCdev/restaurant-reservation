import React, { useEffect, useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { finishReservation } from "../utils/api";

function TableCard({ table, loadTables }) {
  const [tableStatus, setTableStatus] = useState("");
  const [finishButton, setFinishButton] = useState("");
  const [seatError, setSeatError] = useState(null);

  const { table_id, table_name, capacity, reservation_id } = table;

  const submitHandler = (event) => {
    event.preventDefault();
    if (
      window.confirm(
        `Is this table ready to seat new guests? This cannot be undone.`
      )
    ) {
      const abortController = new AbortController();
      setSeatError(null);
      finishReservation(table_id, abortController.signal)
        .then(() => {
          loadTables();
        })
        .catch(setSeatError);
      return () => abortController.abort();
    }
  };

  const statusBGColor = {
    Occupied: "primary",
    Free: "success",
  };

  useEffect(() => {
    if (reservation_id) {
      setTableStatus("Occupied");
      setFinishButton(
        <button
          className="btn btn-secondary"
          data-table-id-finish={table_id}
          to={`/reservations/`}
          onClick={submitHandler}
        >
          Finish
        </button>
      );
    } else {
      setTableStatus("Free");
      setFinishButton("");
    }
    // line below fixes react hook useEffect has missing dependency warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, reservation_id, table_id]);

  return (
    <>
      <ErrorAlert error={seatError} />
      <div className="row flex-column flex-md-row bg-white border py-3 my-2">
        <div
          className={`col text-md-left align-self-center`}
          style={{ maxWidth: "100px" }}
        >
          <div
            className={`badge text-white bg-${statusBGColor[tableStatus]}`}
            data-table-id-status={table_id}
          >
            {tableStatus}
          </div>
        </div>
        <div className="col align-self-center">
          <h5 className="mb-1">Table Name: {table_name}</h5>
        </div>
        <div className="col align-self-center">
          <p className="mb-0">Capacity: {capacity}</p>
        </div>
        <div className="col align-self-center text-md-right">
          {finishButton}
        </div>
      </div>
    </>
  );
}

export default TableCard;
