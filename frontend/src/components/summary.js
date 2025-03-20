import React from "react";

const summary = ({ components, deleteComponent }) => {
  return (
    <div>
      <h2>Order Summary</h2>
      {components.map((comp, idx) => (
        <div key={idx}>
          <p>
            {comp.temp && `${comp.temp} `} {comp.item} ({comp.method})
          </p>
          <button onClick={() => deleteComponent(idx)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default summary;
