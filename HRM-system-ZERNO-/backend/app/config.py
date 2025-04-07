import os
import dotenv
dotenv.load_dotenv()

connection_string = os.getenv("CONNECTION_STRING")
telegram_token = os.getenv("TELEGRAM_TOKEN")
chat_id = os.getenv("CHAT_ID")
secret_key = os.getenv("SECRET_KEY")
algorithm = os.getenv("ALGORITHM")
access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))


# Email configuration
email_host = os.environ.get("EMAIL_HOST", "smtp.gmail.com")
email_port = int(os.environ.get("EMAIL_PORT", 587))
email_user = os.environ.get("EMAIL_USER", "han_ai@auca.kg")
email_password = os.environ.get("EMAIL_PASSWORD", "oalo cxay tmku mybx")
app_url = os.environ.get("APP_URL", "http://localhost:3000")