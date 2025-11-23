import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./pageNotFound.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Button } from "react-bootstrap";
import { BsArrowLeft, BsHouse } from "react-icons/bs";
// import { useNavigate } from "react-router-dom";

// const navigate = useNavigate();
function PageNotFound() {
  const handlePrevious = () => {
    // Go back to the previous page with the same ID
    window.history.back();
  };

  const navigate = useNavigate();

  return (
    <div className="notfound">
      <div className="notfound-404">
        <div className="icon-container">
          <i className="icon bi bi-exclamation-triangle"></i>
        </div>
        <h2 className="pgNotFoundHeading">404 - Page not found</h2>
        <h5 className="pgNotFoundText">
          The page you are looking for might have been removed or is temporarily
          unavailable.
        </h5>
        <div className="">
          {/* <div> */}
          <Button className="buttonPP" onClick={handlePrevious}>
            {" "}
            <BsArrowLeft
              style={{ marginBottom: "2px", marginRight: "4px" }}
            />{" "}
            Previous page
          </Button>
          {/* </div> */}
          {/* <div> */}
          <Button className="buttonHP" onClick={() => navigate("/")}>
            <BsHouse style={{ marginBottom: "2px", marginRight: "4px" }} />
            Home page
          </Button>
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}

export default PageNotFound;
