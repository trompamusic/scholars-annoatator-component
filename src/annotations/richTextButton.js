/* simple checkbox component */
import React from "react";

const Checkbox = ({ data, onClick }) => (
  <span>
    <button
      name={data.name}
      onClick={onClick}
      value={data.value}
      className="EditingButton"
    >
      {data.buttonContent}{" "}
    </button>
  </span>
);

export default Checkbox;
