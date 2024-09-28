import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import StarRating from "./StarRating.jsx";

function Test() {
  const [movieRating, setMovieRating] = useState(0);
  return (
    <div>
      <StarRating color="blue" maxRating={10} onSetRating={setMovieRating} />
      <p>this movie was rated {movieRating}</p>
    </div>
  );
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>

  <App />

  /* <StarRating
      maxRating={5}
      message={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
    />
    <StarRating color="slateblue" maxRating={10} size={24} defaultRating={3} />
    <Test /> */
    
  // </React.StrictMode>
);
