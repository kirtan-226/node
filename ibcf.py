import pandas as pd
import numpy as np


def cosine_similarity_with_nan(matrix):
    matrix = np.array(matrix)
    num_dishes = matrix.shape[0]
    similarity_matrix = np.zeros((num_dishes, num_dishes))

    for i in range(num_dishes):
        for j in range(num_dishes):
            dish_i = matrix[i]
            dish_j = matrix[j]
            valid_idx = ~np.isnan(dish_i) & ~np.isnan(dish_j)
            if np.any(valid_idx):

                dot_product = np.dot(dish_i[valid_idx], dish_j[valid_idx])
                norm_i = np.linalg.norm(dish_i[valid_idx])
                norm_j = np.linalg.norm(dish_j[valid_idx])

                if norm_i > 0 and norm_j > 0:
                    similarity_matrix[i, j] = dot_product / (norm_i * norm_j)
                else:
                    similarity_matrix[i, j] = 0
            else:
                similarity_matrix[i, j] = 0

    return similarity_matrix

dish_df = pd.read_csv('./data/HCAT Data Set - Sheet2.csv')
rating_df = pd.read_csv('./data/HCAT Data Set - Rating 2.csv')
dishes = list(dish_df['dish_id'])
ratings_matrix = rating_df.pivot(index='User ID', columns='Dish ID', values='Rating')
rated_dishes = list(rating_df['Dish ID'].unique())
unrated_dishes = [dish for dish in dishes if dish not in rated_dishes]
new_columns = pd.DataFrame(np.nan, index=ratings_matrix.index, columns=unrated_dishes)
ratings_matrix = pd.concat([ratings_matrix, new_columns], axis=1)
dishes_matrix = ratings_matrix.T
dishes_matrix = dishes_matrix.sort_index(axis=0, ascending=True, inplace=False)
dishes_matrix = dishes_matrix.to_numpy()
cosine_sim_df = cosine_similarity_with_nan(dishes_matrix)
cosine_sim_df = pd.DataFrame(cosine_sim_df)
cosine_sim_df.index = cosine_sim_df.index + 1
cosine_sim_df.columns = range(1, len(cosine_sim_df.columns) + 1)

N = 3

predicted_ratings_matrix = ratings_matrix.copy()


for user in ratings_matrix.index:
    for dish in ratings_matrix.columns:
        if pd.isna(ratings_matrix.at[user, dish]):
            similarities = cosine_sim_df[dish].drop(dish)
            rated_dishes = ratings_matrix.loc[user][ratings_matrix.loc[user] > 0]
            similarities_rated_dishes = similarities[rated_dishes.index]
            top_n_similar_dishes = similarities_rated_dishes.nlargest(N)
            numerator = np.sum(top_n_similar_dishes * rated_dishes[top_n_similar_dishes.index])
            denominator = np.sum(np.abs(top_n_similar_dishes))
            if denominator != 0:
                predicted_ratings_matrix.at[user, dish] = numerator / denominator
            else:
                predicted_ratings_matrix.at[
                    user, dish] = 0

for user in predicted_ratings_matrix.index:
    rated_dishes_by_user = ratings_matrix.loc[user][ratings_matrix.loc[user] > 0].index
    predicted_ratings_matrix.loc[user, rated_dishes_by_user] = np.nan

specific_user = 3
recommendations = {}
filtered_ratings = predicted_ratings_matrix.loc[specific_user][predicted_ratings_matrix.loc[specific_user] > 0]
top_rated_items = filtered_ratings.sort_values(ascending=False)
top_5_items = top_rated_items.head(5).index.tolist()
recommendations[specific_user] = top_5_items
print(f"User {specific_user}: Top 5 Recommended Dishes -> {recommendations[specific_user]}")
