import React, { useState } from "react";

const Plate = ({
  selectedSquare,
  setSelectedSquare,
  selectedLayer,
  setSelectedLayer,
  components,
  setComponents,
  currentStep,
  setCurrentStep,
}) => {
  const [maxLayers] = useState(5); 
  const [layerCount, setLayerCount] = useState(1); // Start with 1 layer
  dish_data = localStorage.getItem("dish_data");
  const styles = {
    plateContainer: {
      width: "400px",
      height: "300px",
      position: "relative",
      border: "2px solid #333",
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gridTemplateRows: "repeat(2, 1fr)",
      gap: "2px",
    },
    square: {
      border: "1px solid #ccc",
      backgroundColor: "#f0f0f0",
      transition: "background-color 0.3s",
    },
    squareSelected: { backgroundColor: "#b3e0ff" },
    squareOccupied: { backgroundColor: "#d3d3d3" },
    layerSelector: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "1rem",
    },
    layerButton: (layer) => ({
      padding: "0.5rem 1rem",
      margin: "0 0.25rem",
      border: "1px solid #ccc",
      borderRadius: "4px",
      backgroundColor: layer === selectedLayer ? "#007bff" : "white",
      color: layer === selectedLayer ? "white" : "inherit",
      cursor: "pointer",
    }),
    addLayerButton: {
      padding: "0.5rem 1rem",
      margin: "1rem 0",
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    deleteLayerButton: {
      padding: "0.5rem 1rem",
      margin: "1rem 0",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
  };

  const isSquareOccupied = (index) =>
    components.some(
      (comp) =>
        (comp.spaces === 4 &&
          (comp.position === 0 ? [0, 1, 3, 4] : [1, 2, 4, 5]).includes(index) &&
          comp.layer === selectedLayer) ||
        (comp.position === index && comp.layer === selectedLayer)
    );

  const handleSquareClick = (index) => {
    if (currentStep !== "select-square" || isSquareOccupied(index)) return;
    setSelectedSquare(index);
    setCurrentStep("select-category");
  };

  const handleLayerSelect = (layer) => {
    setSelectedLayer(layer);
  };

  const handleAddLayer = () => {
    if (layerCount < maxLayers) {
      setLayerCount((prev) => prev + 1);
    } else {
      alert("Maximum number of layers reached!");
    }
  };

  const handleDeleteLayer = () => {
    if (layerCount > 1) {
      // Remove components from the deleted layer and reduce the count
      setComponents((prev) => prev.filter((comp) => comp.layer !== layerCount));
      setLayerCount((prev) => prev - 1);
      if (selectedLayer === layerCount) {
        setSelectedLayer(layerCount - 1); // Adjust selection if deleting current layer
      }
    } else {
      alert("You must have at least one layer.");
    }
  };

  return (
    <div>
      <h2>Plate</h2>
      <div style={styles.layerSelector}>
        {[...Array(layerCount)].map((_, i) => (
          <button
            key={i}
            style={styles.layerButton(i + 1)}
            onClick={() => handleLayerSelect(i + 1)}
          >
            Layer {i + 1}
          </button>
        ))}
      </div>
      <button style={styles.addLayerButton} onClick={handleAddLayer}>
        Add Layer
      </button>
      <button style={styles.deleteLayerButton} onClick={handleDeleteLayer}>
        Delete Layer
      </button>
      <div style={styles.plateContainer}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.square,
              ...(selectedSquare === i && styles.squareSelected),
              ...(isSquareOccupied(i) && styles.squareOccupied),
            }}
            onClick={() => handleSquareClick(i)}
          />
        ))}
        {components.map((comp, idx) => (
          <div
            key={idx}
            style={{
              position: "absolute",
              backgroundColor: comp.category === "Protein" ? "#FFF8DC" : "#FFFACD",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              border: "1px solid #DEB887",
              ...(comp.spaces === 4
                ? { width: "66.66%", height: "100%", left: "0", top: "0" }
                : {
                    width: "33.33%",
                    height: "50%",
                    left: `${(comp.position % 3) * 33.33}%`,
                    top: `${Math.floor(comp.position / 3) * 50}%`,
                  }),
              ...(comp.layer === selectedLayer && { zIndex: comp.layer }),
            }}
          >
            {comp.item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plate;
