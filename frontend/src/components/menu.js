// Menu.js
import React, { useState } from "react";
import { menuConfig } from "./menuConfig";

const Menu = ({ addToOrder }) => {
    const [selectedItem, setSelectedItem] = useState('');
    const [customizations, setCustomizations] = useState({});
    const [addons, setAddons] = useState({});

    const handleCustomization = (e) => {
        setCustomizations({ ...customizations, [e.target.name]: e.target.value });
    };

    const handleAddons = (e) => {
        setAddons({ ...addons, [e.target.name]: e.target.value });
    };

    const addItem = () => {
        const orderItem = {
            item: selectedItem,
            customizations,
            addons,
        };
        addToOrder(orderItem);
        setSelectedItem('');
        setCustomizations({});
        setAddons({});
    };

    const renderOptions = (options) =>
        options.map((option) => (
            <option key={option} value={option}>
                {option}
            </option>
        ));

    return (
        <div className="menu">
            <h2>Menu</h2>

            {/* Menu Buttons */}
            {Object.keys(menuConfig).map((key) => (
                <button key={key} onClick={() => setSelectedItem(key)}>
                    {menuConfig[key].label}
                </button>
            ))}

            {/* Customizations Section */}
            {selectedItem && (
                <div className="customizations">
                    <h3>Customize {menuConfig[selectedItem].label}</h3>

                    {/* Render Customizations */}
                    {menuConfig[selectedItem].customizations.map((custom) => (
                        <label key={custom.name}>
                            {custom.label}
                            <select
                                name={custom.name}
                                onChange={handleCustomization}
                                value={customizations[custom.name] || ''}
                            >
                                <option value="">Select</option>
                                {renderOptions(custom.options)}
                            </select>
                        </label>
                    ))}

                    {/* Render Add-ons */}
                    {menuConfig[selectedItem].addons.map((addon) => (
                        <label key={addon.name}>
                            {addon.label}
                            <select
                                name={addon.name}
                                onChange={handleAddons}
                                value={addons[addon.name] || ''}
                            >
                                <option value="">Select</option>
                                {renderOptions(addon.options)}
                            </select>
                        </label>
                    ))}

                    <button onClick={addItem}>Add to Plate</button>
                </div>
            )}
        </div>
    );
};

export default Menu;
