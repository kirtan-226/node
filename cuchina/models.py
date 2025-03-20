from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    preferences = db.Column(db.JSON, nullable=True)  # JSON for dietary preferences
    location = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)

class Dish(db.Model):
    __tablename__ = 'dishes'
    dish_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))
    base_price = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.Text)
    allergens = db.Column(db.JSON, nullable=True)
    is_available = db.Column(db.Boolean, default=True)
    popularity_score = db.Column(db.Float, default=0.0)

class Recommendation(db.Model):
    __tablename__ = 'recommendations'
    recommendation_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    dish_id = db.Column(db.Integer, db.ForeignKey('dishes.dish_id'))
    reason = db.Column(db.Text)
    context = db.Column(db.JSON)

# Orders, Customizations, and Feedback tables follow similar patterns
