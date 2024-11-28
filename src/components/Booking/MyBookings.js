
import { onValue, ref, remove } from "firebase/database";
import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import { AiOutlineDelete } from "react-icons/ai";
import { db } from "../../config/firebase-config";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../Context/UserAuthContext";
import styled from "styled-components";

const StatusTD = styled.td`
  font-weight: bold;
  color: ${(props) => (props.type === "Pending" ? "blue" : "")};
  color: ${(props) => (props.type === "Accepted" ? "green" : "")};
  color: ${(props) => (props.type === "Rejected" ? "red" : "")};
`;

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const { user } = useUserAuth();

  useEffect(() => {
    const bookingsRef = ref(db, "/bookings/");
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val();
      const userBookings = [];
      if (data !== null) {
        Object.values(data).forEach((booking) => {
          if (booking.refID === user.email) {
            userBookings.push(booking);
          }
        });
      }
      setBookings(userBookings);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user.email]); // Add user.email to dependency array

  const deleteBooking = async (booking) => {
    try {
      await remove(ref(db, `/bookings/${booking.cnic}`));
    } catch (error) {
      console.error("Error removing booking: ", error);
    }
  };

  return (
    <>
      {bookings.length > 0 ? (
        <Table
          striped
          bordered
          hover
          size="sm"
          style={{ marginTop: "80px", width: "90%", margin: "80px auto" }}
          responsive
        >
          <thead>
            <tr>
              <th>Room type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Capacity</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <>
                  <td>{booking.type}</td>
                  <td>{booking.startDate}</td>
                  <td>{booking.endDate}</td>
                  <td>{booking.capacity}</td>
                  <td>{booking.totalPrice}</td>
                  <StatusTD type={booking.status}>{booking.status}</StatusTD>
                  <td style={{ textAlign: "center" }}>
                    <AiOutlineDelete
                      color="red"
                      style={{ cursor: "pointer", fontSize: "20px" }}
                      onClick={() => deleteBooking(booking)}
                    />
                  </td>
                </>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="container roomerror">
          <div className="row">
            <div className="col-md-6 col-12 mx-auto">
              <div className="card shadow-lg p-4 error">
                <h1 className="text-center display-4">No bookings.</h1>
                <h3 className="text-center p-3">Click below to start Booking!.</h3>
                <Link to="/rooms" className="btn btn-warning mt-4 start-booking-btn">
                  Start Booking.
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyBookings;