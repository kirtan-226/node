import React, { useState } from "react";

const foodOptions = {
  Protein: {
    Beef: ["Ribeye", "T-Bone", "Sirloin", "Tenderloin", "Flank"],
    Chicken: ["Breast", "Thigh", "Wings"],
    Fish: ["Salmon", "Tuna", "Sea Bass"]
  },
  Starch: ["Mashed Potatoes", "Sweet Potatoes", "French Fries"],
  Grain: ["Rice", "Quinoa", "Couscous"]
};

const cookingMethods = {
  Beef: ["Grilled", "Pan-Seared", "Broiled", "Sous Vide"],
  Chicken: ["Roasted", "Grilled", "Pan-Fried"],
  Fish: ["Grilled", "Pan-Seared", "Baked"],
  Starch: ["Roasted", "Fried", "Mashed"],
  Grain: ["Steamed", "Pilaf", "Boiled"]
};

const temperatures = ["Rare", "Medium Rare", "Medium", "Medium Well", "Well Done"];

const styles = {
  container: {
    width: '100%',
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '1rem',
    display: 'flex',
    gap: '2rem'
  },
  mainContent: {
    flex: 1
  },
  plateContainer: {
    width: '400px',
    height: '300px',
    margin: '0 auto 2rem',
    position: 'relative',
    border: '2px solid #333',
    backgroundColor: 'white',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(2, 1fr)',
    gap: '2px'
  },
  square: {
    border: '1px solid #ccc',
    backgroundColor: '#f0f0f0',
    transition: 'background-color 0.3s'
  },
  squareHover: {
    backgroundColor: '#e0e0e0',
    cursor: 'pointer'
  },
  squareSelected: {
    backgroundColor: '#b3e0ff'
  },
  squareOccupied: {
    backgroundColor: '#d3d3d3'
  },
  button: {
    padding: '0.5rem 1rem',
    margin: '0.25rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  buttonPrimary: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  sidebar: {
    width: '300px'
  },
  componentCard: {
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    position: 'relative'
  },
  deleteButton: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
    color: '#dc3545'
  },
  selectionContainer: {
    textAlign: 'center',
    marginBottom: '1rem'
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    textAlign: 'center'
  },
  subHeading: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  }
};

const App = () => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [components, setComponents] = useState([]);
  const [currentStep, setCurrentStep] = useState("initial");
  const [selectionState, setSelectionState] = useState({
    category: null,
    subcategory: null,
    item: null,
    method: null,
    temp: null,
  });

  const isSquareOccupied = (index) => {
    return components.some(comp => {
      if (comp.spaces === 4) {
        const occupiedSquares = comp.position === 0 
          ? [0, 1, 3, 4] 
          : [1, 2, 4, 5];
        return occupiedSquares.includes(index);
      } else {
        return comp.position === index;
      }
    });
  };

  const handleSquareClick = (index) => {
    if (currentStep !== "select-square" || isSquareOccupied(index)) return;
    
    setSelectedSquare(index);
    setCurrentStep("select-category");
  };

  const handleCategorySelect = (category) => {
    setSelectionState(prev => ({ ...prev, category }));
    setCurrentStep(category === "Protein" ? "select-subcategory" : "select-item");
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectionState(prev => ({ ...prev, subcategory }));
    setCurrentStep("select-item");
  };

  const handleItemSelect = (item) => {
    setSelectionState(prev => ({ ...prev, item }));
    setCurrentStep("select-method");
  };

  const handleMethodSelect = (method) => {
    setSelectionState(prev => ({ ...prev, method }));
    if (selectionState.category === "Protein" && selectionState.subcategory === "Beef") {
      setCurrentStep("select-temp");
    } else {
      addComponent(method);
    }
  };

  const handleTempSelect = (temp) => {
    addComponent(selectionState.method, temp);
  };

  const addComponent = (method, temp = null) => {
    const spaces = selectionState.category === "Protein" && 
                  selectionState.subcategory === "Beef" ? 4 : 1;

    const newComponent = {
      position: selectedSquare,
      spaces: spaces,
      category: selectionState.category,
      subcategory: selectionState.subcategory,
      item: selectionState.item,
      method: method,
      temp: temp,
    };

    setComponents([...components, newComponent]);
    resetSelections();
  };

  const deleteComponent = (index) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const resetSelections = () => {
    setSelectedSquare(null);
    setSelectionState({
      category: null,
      subcategory: null,
      item: null,
      method: null,
      temp: null,
    });
    setCurrentStep("initial");
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <h1 style={styles.heading}>Make your plate!</h1>

        {/* Plate Visualization */}
        <div style={styles.plateContainer}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.square,
                ...(currentStep === 'select-square' && !isSquareOccupied(i) && styles.squareHover),
                ...(selectedSquare === i && styles.squareSelected),
                ...(isSquareOccupied(i) && styles.squareOccupied)
              }}
              onClick={() => handleSquareClick(i)}
            />
          ))}
          
          {/* Render components */}
          {components.map((comp, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                backgroundColor: comp.category === 'Protein' ? '#FFF8DC' : '#FFFACD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '4px',
                border: '1px solid #DEB887',
                transition: 'all 300ms',
                ...(comp.spaces === 4 ? {
                  width: '66.66%',
                  height: '100%',
                  left: comp.position === 0 ? '0' : '33.33%',
                  top: '0'
                } : {
                  width: '33.33%',
                  height: '50%',
                  left: `${(comp.position % 3) * 33.33}%`,
                  top: `${Math.floor(comp.position / 3) * 50}%`
                })
              }}
            >
              {comp.item}
            </div>
          ))}
        </div>

        {/* Selection Controls */}
        {currentStep === "initial" && (
          <div style={styles.selectionContainer}>
            <button
              style={styles.buttonPrimary}
              onClick={() => setCurrentStep("select-square")}
            >
              Add Component
            </button>
          </div>
        )}

        {currentStep === "select-square" && (
          <div style={styles.selectionContainer}>
            <h2 style={styles.subHeading}>Select a position on the plate</h2>
          </div>
        )}

        {currentStep === "select-category" && (
          <div style={styles.selectionContainer}>
            <h2 style={styles.subHeading}>Select Category</h2>
            <div>
              {Object.keys(foodOptions).map(category => (
                <button
                  key={category}
                  style={styles.button}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === "select-subcategory" && (
          <div style={styles.selectionContainer}>
            <h2 style={styles.subHeading}>Select Type</h2>
            <div>
              {Object.keys(foodOptions.Protein).map(subcat => (
                <button
                  key={subcat}
                  style={styles.button}
                  onClick={() => handleSubcategorySelect(subcat)}
                >
                  {subcat}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === "select-item" && (
          <div style={styles.selectionContainer}>
            <h2 style={styles.subHeading}>Select Item</h2>
            <div>
              {(selectionState.category === "Protein" 
                ? foodOptions.Protein[selectionState.subcategory]
                : foodOptions[selectionState.category]
              ).map(item => (
                <button
                  key={item}
                  style={styles.button}
                  onClick={() => handleItemSelect(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === "select-method" && (
          <div style={styles.selectionContainer}>
            <h2 style={styles.subHeading}>Select Cooking Method</h2>
            <div>
              {(selectionState.category === "Protein" 
                ? cookingMethods[selectionState.subcategory]
                : cookingMethods[selectionState.category]
              ).map(method => (
                <button
                  key={method}
                  style={styles.button}
                  onClick={() => handleMethodSelect(method)}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === "select-temp" && (
          <div style={styles.selectionContainer}>
            <h2 style={styles.subHeading}>Select Temperature</h2>
            <div>
              {temperatures.map(temp => (
                <button
                  key={temp}
                  style={styles.button}
                  onClick={() => handleTempSelect(temp)}
                >
                  {temp}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Components Display */}
      <div style={styles.sidebar}>
        <h2 style={styles.heading}>Selected Components</h2>
        {components.map((comp, idx) => (
          <div key={idx} style={styles.componentCard}>
            <button
              style={styles.deleteButton}
              onClick={() => deleteComponent(idx)}
            >
              ×
            </button>
            <h3 style={styles.subHeading}>Component {idx + 1}:</h3>
            <p>
              {comp.temp && `${comp.temp} `}
              {comp.item} ({comp.method})
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Spaces: {comp.spaces}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;