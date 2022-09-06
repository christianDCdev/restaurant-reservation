import React, { useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";

function TableNew() {
  const history = useHistory();
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    table_name: "",
    capacity: "",
  });

  const changeHandler = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setError(false);
    const abortController = new AbortController();
    formData.capacity = Number(formData.capacity);
    try {
      await createTable(formData, abortController.signal);
      history.push("/dashboard");
    } catch (error) {
      if (error.name !== "AbortError") {
        setError(error);
      }
    }
    return () => {
      abortController.abort();
    };
  };

  return (
    <>
      <h1> New Table</h1>
      <ErrorAlert error={error} />
      <form onSubmit={submitHandler}>
        <div className="input-group mb-3">
          <span className="input-group-text">Table Name</span>
          <input
            className="form-control"
            name="table_name"
            id="table_name"
            type="text"
            onChange={changeHandler}
            value={formData.table_Name}
            required
          />
        </div>

        <div className="input-group mb-3">
          <span className="input-group-text">Capacity</span>
          <input
            className="form-control"
            name="capacity"
            id="capacity"
            type="number"
            onChange={changeHandler}
            value={formData.capacity}
            min="1"
            required
          />
        </div>

        <button
          className="btn btn-secondary mb-3"
          to="/"
          onClick={() => history.goBack()}
        >
          Cancel
        </button>
        <button className="btn btn-primary ml-2 mb-3" type="submit">
          Submit
        </button>
      </form>
    </>
  );
}

export default TableNew;
