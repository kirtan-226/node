<<<<<<< HEAD
import React from 'react';

const Plate = ({ steak, method, sauce, side }) => {
  return (
    <div>
      <h3>Steak Plate</h3>
      <div className="plate">
        <img src={`/images/${steak.image}`} alt={steak.name} className="steak" />
        <p>Steak: {steak.name}</p>
        <p>Cooking Method: {method}</p>
        <p>Sauce: {sauce}</p>
        <p>Side: {side}</p>
      </div>
    </div>
  );
};

export default Plate;
=======
import React from 'react';

const Plate = ({ steak, method, sauce, side }) => {
  return (
    <div>
      <h3>Steak Plate</h3>
      <div className="plate">
        <img src={`/images/${steak.image}`} alt={steak.name} className="steak" />
        <p>Steak: {steak.name}</p>
        <p>Cooking Method: {method}</p>
        <p>Sauce: {sauce}</p>
        <p>Side: {side}</p>
      </div>
    </div>
  );
};

export default Plate;
>>>>>>> master
