import logging

# Configure logging
def setup_logger():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler("app.log", encoding="utf-8"),  # ✅ Log to a file
            logging.StreamHandler()          # ✅ Print logs to the console
        ],
    )

    return logging.getLogger(__name__)


