import React, { useEffect, useState } from "react";
import formatReservationTime from "../utils/format-reservation-time";
import { showDisplayDate, showDisplayTime } from "../utils/date-time";
import { Link } from "react-router-dom";
import { statusChange } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function ReservationCard({ reservation, loadReservations }) {
  reservation = formatReservationTime(reservation);

  const [buttons, setButtons] = useState("");
  const [cancelError, setCancelError] = useState(null);

  const {
    reservation_id,
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
    status,
  } = reservation;

  //displays date in correct format - Tuesday, Aug 16 2021
  const displayDate = showDisplayDate(reservation_date);
  //displays time in correct format - 8:47 pm
  const displayTime = showDisplayTime(reservation_time);

  const cancelHandler = (event) => {
    event.preventDefault();
    if (
      window.confirm(
        `Do you want to cancel this reservation? This cannot be undone.`
      )
    ) {
      const abortController = new AbortController();
      setCancelError(null);
      statusChange(reservation_id, "cancelled", abortController.signal)
        .then(() => {
          loadReservations();
        })
        .catch(setCancelError);
      return () => abortController.abort();
    }
  };

  // sets bootstrap button color
  const statusBGColor = {
    booked: "success",
    seated: "primary",
    finished: "secondary",
    cancelled: "danger",
  };

  // create buttons for displayed reservations
  useEffect(() => {
    if (status === "booked") {
      setButtons(
        <div>
          <Link
            to={`/reservations/${reservation_id}/seat`}
            className="btn btn-primary"
          >
            Seat
          </Link>
          <Link
            to={`/reservations/${reservation_id}/edit`}
            className="btn btn-secondary"
          >
            Edit
          </Link>
          <Link
            to={`/reservations/${reservation_id}/edit`}
            className="btn btn-danger"
            onClick={cancelHandler}
          >
            Cancel
          </Link>
        </div>
      );
    } else {
      setButtons("");
    }
    // line below fixes react hook useEffect has missing dependency warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <>
      <ErrorAlert error={cancelError} />
      <div
        className={`row flex-column flex-md-row bg-white border mx-1 my-3 py-2`}
      >
        <div
          className={`col text-center align-self-center mr-3`}
          style={{ maxWidth: "100px" }}
        >
          <div
            className={`badge text-white bg-${statusBGColor[status]}`}
            data-reservation-id-status={reservation_id}
          >
            {status}
          </div>
        </div>

        <div className={`col align-self-center`}>
          <h5 className="mb-1">{`${first_name} ${last_name}`}</h5>
          <p className="mb-0">
            {`Party of ${people}`}
            <span className="ml-3">Phone #: {mobile_number}</span>
          </p>
        </div>

        <div className={`col align-self-center`}>
          <p className="mb-0">{displayDate.display}</p>
          <p className="mb-0">{displayTime}</p>
        </div>
        <div className={`col text-center text-md-right align-self-center`}>
          {buttons}
        </div>
      </div>
    </>
  );
}

export default ReservationCard;
