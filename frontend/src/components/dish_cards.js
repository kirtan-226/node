import React from "react";

function Card(props) {
  const cardStyle = {
    border: "1px solid #ddd", // Adds a light border
    borderRadius: "8px", // Rounds the corners
    overflow: "hidden", // Ensures content stays within rounded corners
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Adds a subtle shadow
    cursor: "pointer", // Indicates that the card is clickable
    transition: "transform 0.2s ease", // Smooth animation on hover
  };

  const handleClick = () => {
    // Trigger the parent callback with the dish_id
    props.onCardClick(props.dish_id); // Pass the dish_id to the parent component
  };

  return (
    <div
      className="card"
      style={cardStyle}
      onClick={handleClick} // Makes the card clickable
    >
      <img
        src={props.imageUrl}
        className="card-img-top"
        alt={props.imageAlt}
        style={{ height: "150px", objectFit: "cover" }}
      />
      <div className="card-body">
        <h2 className="card-title" style={{ fontSize: "1.5rem" }}>
          {props.title}
        </h2>
        <p className="card-text">{props.content}</p>
      </div>
    </div>
  );
}

export default Card;
