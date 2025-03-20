from flask import Blueprint, jsonify, request
from utils.recommendation_engine import generate_recommendations

recommendations_bp = Blueprint('recommendations', __name__)

@recommendations_bp.route('/<int:user_id>', methods=['GET'])
def get_recommendations(user_id):
    context_data = request.args.to_dict()
    recommendations = generate_recommendations(user_id, context_data)
    response = [
        {'dish_id': dish_id, 'score': score}
        for dish_id, score in recommendations
    ]
    return jsonify(response)
