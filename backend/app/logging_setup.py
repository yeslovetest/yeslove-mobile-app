import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log"),  # ✅ Log to a file
        logging.StreamHandler()          # ✅ Print logs to the console
    ],
)

logger = logging.getLogger(__name__)
