import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import ReservationForm from "../reservations/ReservationForm";
import SeatForm from "../reservations/SeatForm";
import TableForm from "../tables/TableForm";
import Search from "../reservations/Search";

/**
 * Defines all the routes for the application.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  return (
    <Switch>

      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>

      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>

      <Route path="/dashboard">
        <Dashboard date={today()} />
      </Route>

      <Route exact={true} path="/reservations/new">
        <ReservationForm edit={false} />
      </Route>

      <Route exact={true} path="/reservations/:reservation_id/seat">
        <SeatForm />
      </Route>

      <Route exact={true} path="/tables/new">
        <TableForm />
      </Route>

      <Route exact={true} path="/search">
        <Search />
      </Route>

      <Route exact={true} path="/reservations/:reservation_id/edit">
        <ReservationForm edit={true} />
      </Route>

      <Route>
        <NotFound />
      </Route>
      
    </Switch>
  );
}

export default Routes;