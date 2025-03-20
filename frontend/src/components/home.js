import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "./dish_cards";

const HomePage = () => {
  const [dishes, setDishes] = useState([]);
  const [recommendedData, setRecommendedData] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const filterData = localStorage.getItem("filter_data");

  // Helper function to generate image URLs
  const getDishImageUrl = (dishName) => {
    if (!dishName) return "https://via.placeholder.com/300x200";
    const fileName = dishName.toLowerCase().replace(/ /g, '_') + '.jpg';
    return `/images/${fileName}`;
  };

  useEffect(() => {
    if (filterData) {
      try {
        const parsedData = JSON.parse(filterData);
        setRecommendedData(parsedData);
      } catch (e) {
        console.error("Error parsing content_based_filter:", e);
      }
    }
  }, [filterData]);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await fetch("http://15.207.254.20:5000/api/dish");
        const data = await response.json();
        
        // Log dish names for reference
        console.log("===== DISH NAMES FOR IMAGES =====");
        data.forEach(dish => {
          const fileName = dish.name.toLowerCase().replace(/ /g, '_') + '.jpg';
          console.log(`${dish.name} -> ${fileName}`);
        });
        console.log("================================");
        
        setDishes(data);
      } catch (error) {
        console.error("Error fetching dishes:", error);
        setError("Failed to load dishes. Please try again later.");
      }
    };

    fetchDishes();
  }, []);

  const handleCardClick = async (dishId) => {
    try {
      const response = await axios.post("http://15.207.254.20:5000/api/dish", {
        dishId,
      });
      if (response.data) {
        navigate("/plate", { state: { dish_data: response.data } });
      }
    } catch (error) {
      console.error("Error processing request:", error);
      setError("An error occurred while processing the request.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Our Menu
        </h1>
		
		 {/*Build Your Own Plate button */}
        <div className="text-center mb-12">
          <button
            onClick={() => navigate('/plate')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-200 hover:scale-105"
          >
            Build Your Own Plate
          </button>
        </div>

        {/* Recommended Dishes Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
            Recommended For You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedData && recommendedData.length > 0 ? (
              recommendedData.map((dish) => (
                <div
                  key={dish.dish_id}
                  className="transform transition duration-300 hover:scale-105"
                >
                  <Card
                    title={dish.name}
                    imageUrl={getDishImageUrl(dish.name)}
                    imageAlt={dish.name}
                    content={`
                      ${dish.food_category || ''}
                      ${dish.allergens ? `• Allergens: ${dish.allergens}` : '• No Allergens'}
                      • ${dish.price ? `$${dish.price}` : 'Price on request'}
                    `}
                    dish_id={dish.dish_id}
                    onCardClick={handleCardClick}
                    className="h-full bg-white rounded-lg shadow-lg overflow-hidden"
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-600 col-span-full text-center py-8">
                Complete the survey to get personalized recommendations!
              </p>
            )}
          </div>
        </section>

        {/* All Dishes Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
            All Dishes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishes && dishes.length > 0 ? (
              dishes.map((dish) => (
                <div
                  key={dish.dish_id}
                  className="transform transition duration-300 hover:scale-105"
                >
                  <Card
                    title={dish.name}
                    imageUrl={getDishImageUrl(dish.name)}
                    imageAlt={dish.name}
                    content={`
                      ${dish.food_category || ''}
                      ${dish.allergens ? `• Allergens: ${dish.allergens}` : '• No Allergens'}
                      • ${dish.price ? `$${dish.price}` : 'Price on request'}
                    `}
                    dish_id={dish.dish_id}
                    onCardClick={handleCardClick}
                    className="h-full bg-white rounded-lg shadow-lg overflow-hidden"
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-600 col-span-full text-center py-8">
                No dishes available at the moment.
              </p>
            )}
          </div>
        </section>

        {/* Error Display */}
        {error && (
          <div className="mt-8 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;