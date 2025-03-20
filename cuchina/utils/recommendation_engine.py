from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from models import User, Dish, Recommendation, db

def build_tfidf_matrix():
    """
    Build the TF-IDF matrix for all dishes based on their descriptions.
    """
    dishes = Dish.query.filter(Dish.is_available == True).all()
    descriptions = [
        f"{dish.name} {dish.category} {dish.description} {' '.join(dish.allergens or [])}"
        for dish in dishes
    ]
    
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(descriptions)
    
    return dishes, tfidf_matrix, vectorizer

def generate_user_query_vector(user, vectorizer):
    """
    Generate a query vector for the user based on their preferences.
    """
    preferences_text = " ".join(user.preferences.get('categories', []))
    return vectorizer.transform([preferences_text])

def tfidf_content_recommendation(user_id):
    """
    Content-based recommendation using TF-IDF and cosine similarity.
    """
    user = User.query.get(user_id)
    if not user:
        return {}

    # Build TF-IDF matrix and user query vector
    dishes, tfidf_matrix, vectorizer = build_tfidf_matrix()
    user_query_vector = generate_user_query_vector(user, vectorizer)
    
    # Compute cosine similarity between user query and all dishes
    similarity_scores = cosine_similarity(user_query_vector, tfidf_matrix).flatten()
    
    # Map scores to dish IDs
    recommendations = {dishes[i].dish_id: similarity_scores[i] for i in range(len(dishes))}
    
    return recommendations

def hybrid_recommendation_with_tfidf(user_id, context_data):
    """
    Enhanced hybrid recommendation engine with TF-IDF-based content recommendations.
    """
    cf_scores = collaborative_filtering(user_id)
    cb_scores = tfidf_content_recommendation(user_id)
    ctx_scores = context_aware_filtering(context_data)

    # Combine scores with weights
    combined_scores = {}
    for dish_id in set(cf_scores.keys()).union(cb_scores.keys(), ctx_scores.keys()):
        combined_scores[dish_id] = (
            cf_scores.get(dish_id, 0) * 0.4 +
            cb_scores.get(dish_id, 0) * 0.4 +
            ctx_scores.get(dish_id, 0) * 0.2
        )

    # Sort by combined score
    sorted_dishes = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_dishes[:5]

def generate_recommendations(user_id, context_data):
    """
    Generate and store recommendations in the database.
    """
    recommendations = hybrid_recommendation_with_tfidf(user_id, context_data)

    # Store recommendations in the database
    for dish_id, score in recommendations:
        reason = (
            f"Score {score:.2f} based on hybrid model combining collaborative filtering, "
            f"content similarity (TF-IDF), and context-aware adjustments."
        )
        recommendation = Recommendation(user_id=user_id, dish_id=dish_id, reason=reason, context=context_data)
        db.session.add(recommendation)
    db.session.commit()

    return recommendations
