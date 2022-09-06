import React, { useEffect, useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory, useParams } from "react-router-dom";
import {
  createReservation,
  readReservation,
  updateReservation,
} from "../utils/api";

function ReservationForm({ edit }) {
  const history = useHistory();
  const reservation_id = useParams().reservation_id;

  let initialFormState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  };

  const [reservation, setReservation] = useState(initialFormState);
  const [reservationError, setReservationError] = useState(null);

  const pageHeader = edit ? "Edit Reservation" : "New Reservation";

  useEffect(() => {
    if (edit) {
      loadReservation();
    }
    // line below fixes react hook useEffect has missing dependency warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadReservation() {
    const abortController = new AbortController();
    setReservationError(null);
    readReservation(reservation_id, abortController.signal)
      .then(setReservation)
      .catch(setReservationError);
    return () => abortController.abort();
  }

  const submitHandler = (event) => {
    event.preventDefault();
    if (edit) {
      const updatedReservation = {
        ...reservation,
        people: Number(reservation.people),
        updated_at: new Date(),
      };
      const abortController = new AbortController();
      setReservationError(null);
      updateReservation(
        updatedReservation,
        reservation_id,
        abortController.signal
      )
        .then(() => {
          history.push(`/dashboard?date=${reservation.reservation_date}`);
        })
        .catch(setReservationError);
      return () => abortController.abort();
    } else {
      const newReservation = {
        ...reservation,
        people: Number(reservation.people),
        status: "booked",
      };
      const abortController = new AbortController();
      setReservationError(null);
      createReservation(newReservation, abortController.signal)
        .then(() => {
          history.push(`/dashboard?date=${reservation.reservation_date}`);
        })
        .catch(setReservationError);
      return () => abortController.abort();
    }
  };

  //formats phone number: 555-555-5555
  const formatMobileNumber = (event) => {
    const prevChar = event.target.value[event.target.value.length - 1];
    let input = event.target.value.replace(/\D/g, "");
    if (input.length === 3 && prevChar === "-") {
      input += "-";
    } else if (input.length === 6 && prevChar === "-") {
      input =
        input.slice(0, 3) + "-" + input.slice(3, 6) + "-" + input.slice(7, 11);
    } else {
      if (input.length > 3) {
        input = input.slice(0, 3) + "-" + input.slice(3, 10);
      }
      if (input.length > 7) {
        input = input.slice(0, 7) + "-" + input.slice(7, 11);
      }
    }
    setReservation((curr) => ({ ...curr, mobile_number: input }));
  };

  return (
    <>
      <h1> {pageHeader} </h1>
      <ErrorAlert error={reservationError} />
      <form onSubmit={submitHandler}>
        <div className="input-group mb-3">
          <span className="input-group-text">First Name</span>
          <input
            className="form-control"
            name="first_name"
            id="first_name"
            type="text"
            onChange={(event) => {
              setReservation((current) => ({
                ...current,
                first_name: event.target.value,
              }));
            }}
            value={reservation.first_name}
            placeholder="First"
            required
          />
          <span className="input-group-text">Last Name</span>
          <input
            className="form-control"
            name="last_name"
            id="last_name"
            type="text"
            onChange={(event) => {
              setReservation((current) => ({
                ...current,
                last_name: event.target.value,
              }));
            }}
            value={reservation.last_name}
            placeholder="Last"
            required
          />
        </div>

        <div className="input-group mb-3">
          <span className="input-group-text">Mobile Number</span>
          <input
            className="form-control"
            name="mobile_number"
            id="mobile_number"
            type="tel"
            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            onChange={formatMobileNumber}
            value={reservation.mobile_number}
            placeholder="xxx-xxx-xxxx"
            required
          />
        </div>
        <div className="input-group mb-3">
          <span className="input-group-text" id="basic-addon1">
            Date
          </span>
          <input
            className="form-control"
            name="reservation_date"
            id="reservation_date"
            type="date"
            onChange={(event) => {
              setReservation((current) => ({
                ...current,
                reservation_date: event.target.value,
              }));
            }}
            value={reservation.reservation_date}
            required
          />
        </div>
        <div className="input-group mb-3">
          <span className="input-group-text" id="basic-addon1">
            Time
          </span>
          <input
            className="form-control"
            name="reservation_time"
            id="reservation_time"
            type="time"
            onChange={(event) => {
              setReservation((current) => ({
                ...current,
                reservation_time: event.target.value,
              }));
            }}
            value={reservation.reservation_time}
            required
          />
        </div>
        <div className="input-group mb-3">
          <span className="input-group-text" id="basic-addon1">
            People
          </span>
          <input
            className="form-control"
            name="people"
            id="people"
            type="number"
            onChange={(event) => {
              setReservation((current) => ({
                ...current,
                people: event.target.value,
              }));
            }}
            value={reservation.people}
            min="1"
            required
          />
        </div>
        <button
          className="btn btn-secondary mr-1 mb-3"
          to="/"
          onClick={() => history.goBack()}
        >
          Cancel
        </button>
        <button className="btn btn-primary mx-1 mb-3" type="submit">
          Submit
        </button>
      </form>
    </>
  );
}

export default ReservationForm;
