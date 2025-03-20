import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import sys
import os
import json
import pandas as pd

def flatten_user_data(user_data):
    for key, value in user_data.items():
        if isinstance(value, list):
            user_data[key] = ", ".join(value)  # Convert lists to comma-separated strings
    return user_data

def data_format():
    survey_data_path = os.path.join(os.path.dirname(__file__), '../backend/server/inputData.json')
    dish_data_path = os.path.join(os.path.dirname(__file__), '../backend/server/dishData.json')

    with open(survey_data_path, 'r') as survey_file:
        user_data = json.load(survey_file)
    with open(dish_data_path, 'r') as dish_file:
        dish_data = json.load(dish_file)
    # print(dish_data,user_data)
    # print('user_data',user_data)

    # Flatten user_data
    user_data = pd.DataFrame([flatten_user_data(user_data)])  # Wrap user_data in a list

    # Convert dish_data to DataFrame
    dish_data = pd.DataFrame(dish_data)
    
    dish_data.columns = dish_data.columns.str.strip().str.lower()

    for col in ['spice_level', 'allergens']:
        if col in dish_data.columns:
            dish_data[col] = dish_data[col].fillna('none')

    user_data = user_data.apply(lambda x: x.str.lower() if x.dtype == "object" else x)
    dish_data = dish_data.apply(lambda x: x.str.lower() if x.dtype == "object" else x)
    return user_data, dish_data


def generate_recommendations(user_data, similarities, dish_data): 

    if len(similarities) != len(dish_data):
        raise ValueError("Length of similarities array does not match length of dish data")

    dish_data['similarity'] = similarities
    # if (user_data['allergies'] != 'none').any(): 
    #     filtered_dishes = dish_data[~dish_data['allergens'].str.contains('|'.join(user_data['allergies']))]
    # else:
    #     filtered_dishes = dish_data
    # print('user_data',dish_data['allergens'])
    
    if user_data['allergies'].iloc[0] != 'none':
        x = [allergy.strip() for allergy in user_data['allergies'].iloc[0].split(", ")]
        filtered_dishes = dish_data[~dish_data['allergens'].apply(
            lambda allergens: any(allergy in allergens.split(", ") for allergy in x)
        )]
    else:
        filtered_dishes = dish_data

    dessert_dishes = filtered_dishes[filtered_dishes['food_category'] == 'desserts']

    if user_data['vegetarian_meat'].iloc[0] == 'vegetarian':  
        filtered_dishes = filtered_dishes[filtered_dishes['type'] == 'vegetarian']
    # else:
    #     filtered_dishes = dish_data
    
    if user_data.iloc[0]['healthy_or_calorie_heavy'] == 'healthy':
        filtered_dishes['calories_kcal'] = pd.to_numeric(filtered_dishes['calories_kcal'])
        filtered_dishes = filtered_dishes[filtered_dishes['calories_kcal'] <= 300]
        
    filtered_dishes = filtered_dishes[
        (filtered_dishes['preferred_weather'].str.contains('all seasons') | 
         filtered_dishes['preferred_weather'].str.contains('winter')) & 
        (filtered_dishes['available'].str.contains('all days') | 
         filtered_dishes['available'].str.contains('mon'))
    ]
    if user_data['sweet_tooth'].iloc[0] == 'yes':
        # if user_data['allergies'].iloc[0] != 'none':
        #     x = [allergy.strip() for allergy in user_data['allergies'].iloc[0].split(", ")]
        #     sweet_dishes = dish_data[~dish_data['allergens'].apply(
        #         lambda allergens: any(allergy in allergens.split(", ") for allergy in x)
        #     )]
        # dessert_dishes = sweet_dishes[sweet_dishes['food_category'] == 'desserts']
        filtered_dishes = pd.concat([filtered_dishes, dessert_dishes]).drop_duplicates()
    else:
        filtered_dishes = filtered_dishes[filtered_dishes['food_category'] != 'desserts']

    filtered_dishes = filtered_dishes.sort_values(by=['similarity', 'overall_rating'], ascending=[False, False])    

    recommendations = filtered_dishes.head(10).to_dict(orient='records')

    recommendations_json = json.dumps(recommendations, indent=10)
    # print('recommended_json',recommendations_json)
    return recommendations_json


def main():
    user_data, dish_data = data_format()
    dish_data = pd.DataFrame(dish_data)

    tfidf = TfidfVectorizer(stop_words='english')
    dish_desc = (dish_data['ingredients'].str.lower() + " " + dish_data['spice_level'].str.lower()).fillna('')
    tfidf_matrix = tfidf.fit_transform(dish_desc.fillna(''))

    user_preferences = (
        user_data['preferred_meat'].apply(lambda x: " ".join(x) if isinstance(x, list) else x) + " " +
        user_data['vegetarian_meat'] + " " +
        user_data['spice_level']
    )
    user_preferences_str = " ".join(user_preferences)
    user_vector = tfidf.transform([user_preferences_str])
    similarities = cosine_similarity(user_vector, tfidf_matrix).flatten()

    recommendations = generate_recommendations(user_data, similarities, dish_data)

    print(recommendations)


if __name__ == "__main__":
    main()
