import React, { useEffect, useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationCard from "./ReservationCard";
import { listReservations } from "../utils/api";

function Search() {
  const [searchInput, setSearchInput] = useState("");
  const [searchError, setSearchError] = useState(null);
  const [reservations, setReservations] = useState("");
  const [displayReservations, setDisplayReservations] = useState("");

  function loadReservations() {
    const abortController = new AbortController();
    setSearchError(null);
    listReservations({ mobile_number: searchInput }, abortController.signal)
      .then(setReservations)
      .catch(setSearchError);
    return () => abortController.abort();
  }

  useEffect(() => {
    if (reservations.length) {
      setDisplayReservations(
        reservations.map((reservation) => {
          return (
            <ReservationCard
              reservation={reservation}
              loadReservations={loadReservations}
            />
          );
        })
      );
    } else if (reservations !== "") {
      setDisplayReservations(<div>No reservations found</div>);
    }
    // line below fixes react hook useEffect has missing dependency warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservations]);

  const submitHandler = (event) => {
    event.preventDefault();
    loadReservations();
  };

  //remove non numeric digits
  const onlyAllowNumbers = (event) => {
    let input = event.target.value.replace(/\D/g, "");
    setSearchInput(input.slice(0, 10));
  };

  return (
    <>
      <h1>Search</h1>
      <form onSubmit={submitHandler}>
        <div className="input-group mb-3">
          <input
            className="form-control"
            style={{ maxWidth: "280px" }}
            id="searchInput"
            type="text"
            name="mobile_number"
            onChange={onlyAllowNumbers}
            placeholder="Enter a customer's phone number"
            value={searchInput}
            required
          />
          <button className="btn btn-primary ml-3 mb-3" type="submit">
            Find
          </button>
        </div>
      </form>
      <div>
        <ErrorAlert error={searchError} />
        {displayReservations}
      </div>
    </>
  );
}

export default Search;
