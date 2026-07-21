from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import all models here so Alembic can discover them
from app.models.user import User  # noqa
from app.models.oauth_token import OAuthToken  # noqa
from app.models.preference import Preference  # noqa
