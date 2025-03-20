import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import sys
import os
import json

rating_data_path = os.path.join(os.path.dirname(__file__), 'rating.csv')
dish_data_path = os.path.join(os.path.dirname(__file__), 'dish.csv')

# Load the datasets
dish_df = pd.read_csv(dish_data_path)
rating_df = pd.read_csv(rating_data_path)

# Extract dish IDs and initialize ratings matrix
dishes = list(dish_df['dish_id'])
ratings_matrix = rating_df.pivot(index='User ID', columns='Dish ID', values='Rating')

# Identify unrated dishes and extend the ratings matrix
rated_dishes = list(rating_df['Dish ID'].unique())
unrated_dishes = [dish for dish in dishes if dish not in rated_dishes]
new_columns = pd.DataFrame(np.nan, index=ratings_matrix.index, columns=unrated_dishes)
ratings_matrix = pd.concat([ratings_matrix, new_columns], axis=1)
ratings_matrix = ratings_matrix.fillna(0)

# Transpose the ratings matrix for similarity calculations
dishes_matrix = ratings_matrix.T

# Compute cosine similarity between dishes
cosine_sim = cosine_similarity(dishes_matrix)
cosine_sim_df = pd.DataFrame(cosine_sim, index=dishes_matrix.index, columns=dishes_matrix.index)

# Number of nearest neighbors to consider
N = 3

# Create a matrix to store predicted ratings
predicted_ratings_matrix = ratings_matrix.copy()

# Predict ratings for unrated dishes
for user in ratings_matrix.index:
    for dish in ratings_matrix.columns:
        if ratings_matrix.at[user, dish] == 0:
            similarities = cosine_sim_df[dish].drop(dish)
            rated_dishes = ratings_matrix.loc[user][ratings_matrix.loc[user] > 0]
            similarities_rated_dishes = similarities[rated_dishes.index]
            top_n_similar_dishes = similarities_rated_dishes.nlargest(N)
            numerator = np.sum(top_n_similar_dishes * rated_dishes[top_n_similar_dishes.index])
            denominator = np.sum(np.abs(top_n_similar_dishes))
            predicted_ratings_matrix.at[user, dish] = numerator / denominator if denominator != 0 else 0

# Remove already-rated dishes from predictions
for user in predicted_ratings_matrix.index:
    rated_dishes_by_user = ratings_matrix.loc[user][ratings_matrix.loc[user] > 0].index
    predicted_ratings_matrix.loc[user, rated_dishes_by_user] = np.nan

def get_recommendations(user_id, predicted_ratings_matrix, top_n=3):
    """
    Function to return top N recommended dishes for a given user.

    Parameters:
        user_id (int): The ID of the user to get recommendations for.
        predicted_ratings_matrix (DataFrame): The matrix containing predicted ratings.
        top_n (int): The number of top recommendations to return (default is 3).

    Returns:
        list: A list of top N recommended dishes for the given user.
    """
    if user_id not in predicted_ratings_matrix.index:
        print(f"User {user_id} not found in the ratings matrix.")
        return []

    # Step 1: Filter dishes with predicted ratings > 0 for the user
    filtered_ratings = predicted_ratings_matrix.loc[user_id][predicted_ratings_matrix.loc[user_id] > 0]

    # Step 2: Sort ratings in descending order
    top_rated_items = filtered_ratings.sort_values(ascending=False)

    # Step 3: Select the top N dishes
    top_recommended_dishes = top_rated_items.head(top_n).index.tolist()

    recommended_dishes = dish_df[dish_df['dish_id'].isin(top_recommended_dishes)]
    recommendations = recommended_dishes.head(10).to_dict(orient='records')
    recommendations_json = json.dumps(recommendations, indent=10)
    return recommendations_json

# Main execution block
if __name__ == "__main__":
    # Get user_id from command line arguments
    if len(sys.argv) < 2:
        print("Please provide a user_id as a command-line argument.")
        sys.exit(1)

    user_id = int(sys.argv[1])  # Convert user_id to integer
    top_dishes = get_recommendations(user_id, predicted_ratings_matrix)
    print(top_dishes)
