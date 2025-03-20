import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import openpyxl
import numpy as np


# Function to generate content-based and context-aware recommendations
def generate_recommendations(user_id,tfidf_matrix):
    # Get user preferences
    user_profile = user_data[user_data['user_id'] == user_id].iloc[0]
    
    # Create a "user profile" text based on preferences
    user_preferences = (user_profile['preferred_meat'] + " " + user_profile['vegetarian/meat'] + " " + user_profile['spice_level'])
    user_vector = tfidf.transform([user_preferences])



    similarities = cosine_similarity(user_vector, tfidf_matrix).flatten()
    dish_data['similarity'] = similarities


    # Apply allergies filter ----- Filter 1
    if user_profile['allergies'] != 'none':
        filtered_dishes = dish_data[~dish_data['allergens'].str.contains(user_profile['allergies'])]
    else:
        filtered_dishes=dish_data


    # Apply Veg filter------ Filter 2
    if user_profile['vegetarian/meat'] == 'vegetarian':
        filtered_dishes = filtered_dishes[filtered_dishes['vegetarian/meat'] == 'vegetarian']
    else:
        filtered_dishes=dish_data

    
    # Apply filter for user's preferred calorie level------ Filter 3
    if user_profile['healthy_or_calorie_heavy'] == 'healthy':
        filtered_dishes = filtered_dishes[filtered_dishes['calories_kcal'] <= 300]
    


    # Context Aware Filtering: Weather and Availability------- Filter 4
    filtered_dishes = filtered_dishes[
        (filtered_dishes['preferred_weather'].str.contains('all seasons') | 
         filtered_dishes['preferred_weather'].str.contains('winter')) &
        (filtered_dishes['availability'].str.contains('all days') | 
         filtered_dishes['availability'].str.contains('mon'))
    ]
    
    # content filtering on user preference of desserts
    if user_profile['sweet_tooth'] == 'yes':
        dessert_dishes = dish_data[dish_data['food_category'] == 'desserts']
        filtered_dishes = pd.concat([filtered_dishes, dessert_dishes]).drop_duplicates()
    else:
        filtered_dishes = filtered_dishes[filtered_dishes['food_category'] != 'desserts']
    


    # Sort by similarity and popularity
    filtered_dishes = filtered_dishes.sort_values(by=['similarity', 'popularity'], ascending=[False, False])

    # Select top N recommendations
    recommendations = filtered_dishes.head(5).to_dict(orient='records')

    # Convert to JSON
    recommendations_json = json.dumps(recommendations, indent=4)
    return recommendations_json




# Load the dish sheet
user_data = pd.read_excel('data.xlsx', sheet_name="user")
dish_data = pd.read_excel('data.xlsx', sheet_name="dish")



# # Replace NaN with "none" in specific columns
dish_data['spice_level'] = dish_data['spice_level'].fillna('None')
dish_data['allergens'] = dish_data['allergens'].fillna('None')

# Convert only string columns to lowercase
user_data = user_data.apply(lambda x: x.astype(str).str.lower() if x.dtype == "object" else x)
dish_data = dish_data.apply(lambda x: x.astype(str).str.lower() if x.dtype == "object" else x)
# Vectorize the dish column for content similarity
tfidf = TfidfVectorizer(stop_words='english')
dish_desc = dish_data['ingredients'].str.lower() + " " + dish_data['vegetarian/meat'] + " " + dish_data['spice_level']
tfidf_matrix = tfidf.fit_transform(dish_desc.fillna(''))



# # print("Recommendations for User 1:")
# print(generate_recommendations(1,tfidf_matrix))

# # print("\nRecommendations for User 2:")
# print(generate_recommendations(2,tfidf_matrix))

# # print("\nRecommendations for User 3:")
# print(generate_recommendations(3,tfidf_matrix))

# # print("\nRecommendations for User 4:")
# print(generate_recommendations(4,tfidf_matrix))

# # print("\nRecommendations for User 5:")
print(generate_recommendations(5,tfidf_matrix))