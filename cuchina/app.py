from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Configuration and imports
from config import Config
from models import db

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize database and migration tools
db.init_app(app)
migrate = Migrate(app, db)

# Register Blueprints
from routes.users import users_bp
from routes.dishes import dishes_bp
from routes.recommendations import recommendations_bp
from routes.orders import orders_bp

app.register_blueprint(users_bp, url_prefix='/users')
app.register_blueprint(dishes_bp, url_prefix='/dishes')
app.register_blueprint(recommendations_bp, url_prefix='/recommendations')
app.register_blueprint(orders_bp, url_prefix='/orders')

# Run application
if __name__ == '__main__':
    app.run(debug=True)
