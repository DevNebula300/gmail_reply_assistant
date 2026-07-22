from sqlalchemy.orm import declarative_base

Base = declarative_base()
from app.models.user import User  
from app.models.oauth_token import OAuthToken  
from app.models.preference import Preference 
