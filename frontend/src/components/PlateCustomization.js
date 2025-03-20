import React, { useState, useEffect } from 'react';
import { menuConfig } from "./menuConfig";
import { useLocation } from 'react-router-dom';

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
    buttonDisabled: {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed'
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
    },
    layerControls: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '1rem'
    },
    layerTabs: {
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '1rem'
    },
    layerTab: {
        padding: '0.5rem 1rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: 'white'
    },
    activeLayerTab: {
        backgroundColor: '#007bff',
        color: 'white',
        border: '1px solid #0056b3'
    },
    deleteLayerButton: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        marginLeft: '0.5rem',
        cursor: 'pointer'
    },
    layerSection: {
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
    }
};

const PlateCustomization = ({ dishes }) => {
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [currentStep, setCurrentStep] = useState("initial");
    const [currentLayer, setCurrentLayer] = useState(0);
    const [layers, setLayers] = useState([{
        id: 0,
        components: []
    }]);
    const [selectionState, setSelectionState] = useState({
        category: null,
        subcategory: null,
        item: null,
        method: null,
        temp: null,
    });
    const location = useLocation();
    const { dish_data } = location.state || {};
    const addLayer = () => {
        if (layers.length < 5) {
            const newLayer = {
                id: layers.length,
                components: [] // New layers start empty
            };
    
            setLayers([...layers, newLayer]);
            setCurrentLayer(newLayer.id); // Set the newly added layer as the current one
        }
    };    

    const deleteLayer = (layerId) => {
        if (layerId === 0) return; // Prevent deletion of the first layer
    
        if (layers.length > 1) {
            const newLayers = layers.filter(layer => layer.id !== layerId);
            const updatedLayers = newLayers.map((layer, index) => ({
                ...layer,
                id: index // Reindex layers to maintain sequential IDs
            }));
            setLayers(updatedLayers);
            setCurrentLayer(Math.min(layerId, updatedLayers.length - 1));
        }
    };       

    const isSquareOccupied = (index) => {
        const currentLayerObj = layers[currentLayer];
    
        if (!currentLayerObj || !currentLayerObj.components) {
            return false; // If the layer or components array doesn't exist, no squares are occupied
        }
    
        return currentLayerObj.components.some(comp => {
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

    const deleteComponent = (layerId, componentIndex) => {
        const updatedLayers = layers.map(layer => {
            if (layer.id === layerId) {
                return {
                    ...layer,
                    components: layer.components.filter((_, i) => i !== componentIndex)
                };
            }
            return layer;
        });
        setLayers(updatedLayers);
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

    const handleItemSelect = (item) => {
        setSelectionState(prev => ({ ...prev, item }));
        setCurrentStep("select-method");
    };

    const addComponent = (method, temp = null) => {
        const spaces =
            selectionState.category === "Protein" &&
            selectionState.subcategory === "Beef"
                ? 4
                : 1;
    
        const newComponent = {
            position: selectedSquare,
            spaces: spaces,
            category: selectionState.category,
            subcategory: selectionState.subcategory,
            item: selectionState.item,
            method: method,
            temp: temp,
            addons: selectionState.addon || null, // Include add-ons
            beverage: selectionState.beverage || null, // Include recommended beverage
        };
    
        const updatedLayers = layers.map(layer => {
            if (layer.id === currentLayer) {
                return {
                    ...layer,
                    components: [...layer.components, newComponent]
                };
            }
            return layer;
        });
    
        setLayers(updatedLayers);
        resetSelections();
    };    

    const handleCategorySelect = (category) => {
        setSelectionState(prev => ({ ...prev, category }));
        setCurrentStep(category === "Protein" ? "select-subcategory" : "select-item");
    };

    const handleSubcategorySelect = (subcategory) => {
        setSelectionState(prev => ({ ...prev, subcategory }));
        setCurrentStep("select-item");
    };

    const handleMethodSelect = (method) => {
        setSelectionState(prev => ({ ...prev, method }));
        // console.log(dish_data,'limbachiya');
        if (selectionState.category === "Protein" && selectionState.subcategory === "Beef") {
            setCurrentStep("select-temp");
        } else{
            addComponent(method);
        }
    };

    const handleAddonSelect = (addon) => {
        const addonComponent = {
            position: selectedSquare || 0, // Default to the first square if no square is selected
            spaces: 1, // Add-ons typically occupy 1 space
            category: "Add-On",
            item: addon,
            method: null, // Add-ons don’t require a cooking method
        };
    
        const updatedLayers = layers.map(layer => {
            if (layer.id === currentLayer) {
                return {
                    ...layer,
                    components: [...layer.components, addonComponent]
                };
            }
            return layer;
        });
    
        setLayers(updatedLayers);
    
        // If beverages are available, move to select-beverage; otherwise, reset or finish
        if (dish_data.recommended_beverage) {
            setCurrentStep("select-beverage");
        } else {
            resetSelections(); // Reset state after handling the add-on
        }
    };    
    
    const handleBeverageSelect = (beverage) => {
        const beverageComponent = {
            position: selectedSquare || 0, // Default to the first square if no square is selected
            spaces: 1, // Beverages typically occupy 1 space
            category: "Beverage",
            item: beverage.name, // Use the beverage name as the item
            method: null, // Beverages don’t require a cooking method
            price: beverage.price, // Optionally include the price
        };
    
        const updatedLayers = layers.map(layer => {
            if (layer.id === currentLayer) {
                return {
                    ...layer,
                    components: [...layer.components, beverageComponent]
                };
            }
            return layer;
        });
    
        setLayers(updatedLayers);
    
        // Reset the selection after adding the beverage
        resetSelections();
    };    

    useEffect(() => {
        console.log(dish_data);
    
        if (dish_data) {
            // Initialize the first layer with dish_data
            setLayers([{
                id: 0,
                components: [{
                    position: 0,
                    spaces: 1,
                    category: dish_data.food_category,
                    item: dish_data.name,
                    method: dish_data.cooking_method,
                }]
            }]);
    
            // Check for add-ons and beverages
            if (dish_data.add_ons) {
                setCurrentStep("select-addons");
            } else if (dish_data.recommended_beverage) {
                setCurrentStep("select-beverage");
            } else {
                setCurrentStep("initial");
            }
        } else {
            // Initialize the first layer as empty
            setLayers([{
                id: 0,
                components: []
            }]);
            setCurrentStep("initial");
        }
    }, [dish_data]);
    

    const sendOrder = async () => {
        const user_id = localStorage.getItem("user_id");
        console.log(layers);
    
        try {
            const dishes = layers.flatMap((layer) =>
                layer.components.map((component) => ({
                    item: component.item,
                    beverages: component.beverage || null,
                    add_ons: component.addons ? component.addons.split(', ') : [],
                    category: component.category,
                    subcategory: component.subcategory || null,
                    method: component.method,
                    temp: component.temp || null,
                }))
            );
    
            const response = await fetch("http://localhost:5000/api/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: user_id,
                    layers: dishes,
                }),
            });
            console.log(response);
            if (response.ok) {
                const data = await response.json();
                // Trigger the review popup
                showReviewPopup();
                console.log("Response data:", data);
            } else {
                console.error("Error submitting order:", response.statusText);
                alert("Failed to submit the order.");
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("An error occurred while submitting the order.");
        }
    };
    
    // Function to display the review popup
    const showReviewPopup = () => {
        const reviewPopup = document.createElement("div");
        reviewPopup.id = "review-popup";
        reviewPopup.style.position = "fixed";
        reviewPopup.style.top = "50%";
        reviewPopup.style.left = "50%";
        reviewPopup.style.transform = "translate(-50%, -50%)";
        reviewPopup.style.padding = "20px";
        reviewPopup.style.backgroundColor = "#fff";
        reviewPopup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        reviewPopup.style.zIndex = "1000";
    
        reviewPopup.innerHTML = `
            <h3>Thank you for your order!</h3>
            <p>We'd love to hear your feedback. Please leave a review below:</p>
            <textarea id="review-text" rows="4" style="width: 100%;"></textarea>
            <div style="margin-top: 10px; text-align: right;">
                <button id="submit-review" style="margin-right: 10px;">Submit</button>
                <button id="close-popup">Close</button>
            </div>
        `;
    
        document.body.appendChild(reviewPopup);
    
        // Event listeners for review submission and popup close
        document.getElementById("submit-review").addEventListener("click", () => {
            const reviewText = document.getElementById("review-text").value;
            if (reviewText.trim()) {
                console.log("Review submitted:", reviewText);
                alert("Thank you for your review!");
                closeReviewPopup();
            } else {
                alert("Please write a review before submitting.");
            }
        });
    
        document.getElementById("close-popup").addEventListener("click", closeReviewPopup);
    };
    
    // Function to close the review popup
    const closeReviewPopup = () => {
        const reviewPopup = document.getElementById("review-popup");
        if (reviewPopup) {
            document.body.removeChild(reviewPopup);
        }
    };  

    const handleTempSelect = (temp) => {
        addComponent(selectionState.method, temp);
    };

    return (
        <div style={styles.container}>
            {/* Menu List - Left Sidebar */}
            <div style={{
                width: '300px',
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                height: 'fit-content',
                overflowY: 'auto'
            }}>
                <h2 style={styles.heading}>Menu</h2>

                {/* Appetizers Section */}
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 pb-2 border-b border-gray-200">
                        Appetizers
                    </h3>
                    <ul className="space-y-2">
                        {dishes.filter(dish => dish.food_category === "Appetizers").map(dish => (
                            <li key={dish.dish_id} className="p-2 hover:bg-gray-50 rounded">
                                <div className="font-medium">{dish.name}</div>
                                <div className="text-sm text-gray-600">
                                    {dish.allergens ? `Allergens: ${dish.allergens}` : 'No Allergens'}
                                </div>
                                <div className="text-sm text-gray-800">${dish.price}</div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Main Courses Section */}
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 pb-2 border-b border-gray-200">
                        Main Courses
                    </h3>
                    <ul className="space-y-2">
                        {dishes.filter(dish => dish.food_category === "Main Courses").map(dish => (
                            <li key={dish.dish_id} className="p-2 hover:bg-gray-50 rounded">
                                <div className="font-medium">{dish.name}</div>
                                <div className="text-sm text-gray-600">
                                    {dish.allergens ? `Allergens: ${dish.allergens}` : 'No Allergens'}
                                </div>
                                <div className="text-sm text-gray-800">${dish.price}</div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Desserts Section */}
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 pb-2 border-b border-gray-200">
                        Desserts
                    </h3>
                    <ul className="space-y-2">
                        {dishes.filter(dish => dish.food_category === "Desserts").map(dish => (
                            <li key={dish.dish_id} className="p-2 hover:bg-gray-50 rounded">
                                <div className="font-medium">{dish.name}</div>
                                <div className="text-sm text-gray-600">
                                    {dish.allergens ? `Allergens: ${dish.allergens}` : 'No Allergens'}
                                </div>
                                <div className="text-sm text-gray-800">${dish.price}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Plate Content - Middle */}
            <div style={styles.mainContent}>
                <h1 style={styles.heading}>Make your plate!</h1>
                
                {/* Layer Controls */}
                <div style={styles.layerControls}>
                    <button 
                        style={{
                            ...styles.buttonPrimary,
                            ...(layers.length >= 5 ? styles.buttonDisabled : {})
                        }}
                        onClick={addLayer}
                        disabled={layers.length >= 5}
                    >
                        Add Layer
                    </button>
                </div>

                {/* Layer Tabs */}
                <div style={styles.layerTabs}>
                    {layers.map(layer => (
                        <div key={layer.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <button
                                style={{
                                    ...styles.layerTab,
                                    ...(currentLayer === layer.id ? styles.activeLayerTab : {})
                                }}
                                onClick={() => setCurrentLayer(layer.id)}
                            >
                                Layer {layer.id + 1}
                            </button>
                            {layers.length > 1 && (
                                <button
                                    style={styles.deleteLayerButton}
                                    onClick={() => deleteLayer(layer.id)}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Plate Container */}
                <div style={styles.plateContainer}>
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                ...styles.square,
                                ...(currentStep === 'select-square' &&
                                    !isSquareOccupied(i) &&
                                    styles.squareHover),
                                ...(selectedSquare === i && styles.squareSelected),
                                ...(isSquareOccupied(i) && styles.squareOccupied),
                            }}
                            onClick={() => handleSquareClick(i)}
                        />
                    ))}

                    {layers[currentLayer].components.map((comp, idx) => (
                        <div
                            key={idx}
                            style={{
                                position: 'absolute',
                                backgroundColor:
                                    comp.category === 'Protein' ? '#FFF8DC' : '#FFFACD',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                padding: '4px',
                                border: '1px solid #DEB887',
                                transition: 'all 300ms',
                                zIndex: currentLayer + 1,
                                ...(comp.spaces === 4
                                    ? {
                                          width: '66.66%',
                                          height: '100%',
                                          left: comp.position === 0 ? '0' : '33.33%',
                                          top: '0',
                                      }
                                    : {
                                          width: '33.33%',
                                          height: '50%',
                                          left: `${(comp.position % 3) * 33.33}%`,
                                          top: `${Math.floor(comp.position / 3) * 50}%`,
                                      }),
                            }}
                        >
                            {comp.item}
                        </div>
                    ))}
                </div>
                
                {currentStep === "select-addons" && dish_data.add_ons &&
                dish_data.add_ons.split(",").map((addon, index) => (
                    <button key={index} onClick={() => handleAddonSelect(addon.trim())}>
                        {addon.trim()}
                    </button>
                ))}

                {currentStep === "select-beverage" && dish_data.recommended_beverage &&
                    dish_data.recommended_beverage.map((beverage) => (
                        <button
                            key={beverage.beverage_id}
                            onClick={() => handleBeverageSelect(beverage)}
                        >
                            {beverage.name} - ${parseFloat(beverage.price).toFixed(2)} ({beverage.category})
                        </button>
                    ))}


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
                            {Object.keys(menuConfig.foodOptions).map(category => (
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
                            {Object.keys(menuConfig.foodOptions.Protein).map(subcat => (
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
                                ? menuConfig.foodOptions.Protein[selectionState.subcategory]
                                : menuConfig.foodOptions[selectionState.category]
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
                                ? menuConfig.cookingMethods[selectionState.subcategory]
                                : menuConfig.cookingMethods[selectionState.category]
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
                            {menuConfig.temperatures.map(temp => (
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
                <div style={styles.selectionContainer}>
                    <button style={styles.buttonPrimary} onClick={sendOrder}>Submit Order</button>
                </div>
            </div>
            {/* Selected Components - Right Sidebar */}
            <div style={styles.sidebar}>
                <h2 style={styles.heading}>Selected Components</h2>
                {layers.map(layer => (
                    <div key={layer.id} style={styles.layerSection}>
                        <h3 style={styles.subHeading}>Layer {layer.id + 1}</h3>
                        {layer.components.map((comp, idx) => (
                            <div key={idx} style={styles.componentCard}>
                                <button
                                    style={styles.deleteButton}
                                    onClick={() => deleteComponent(layer.id, idx)}
                                >
                                    ×
                                </button>
                                <h3 style={styles.subHeading}>Component {idx + 1}:</h3>
                                <p>
                                    {comp.temp && `${comp.temp} `}
                                    {comp.item} ({comp.method})
                                </p>
                                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                    Spaces: {comp.spaces}
                                </p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlateCustomization;