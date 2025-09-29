"""Background worker for device token cleanup"""
from app.services.device_token_service import DeviceTokenService
from app.logging_setup import setup_logger

logger = setup_logger()

def cleanup_stale_device_tokens():
    """Remove device tokens not used in 30 days"""
    try:
        removed_count = DeviceTokenService.cleanup_stale_tokens(days=30)
        logger.info(f"Cleaned up {removed_count} stale device tokens")
        return removed_count
    except Exception as e:
        logger.error(f"Device token cleanup failed: {e}")
        return 0

if __name__ == "__main__":
    cleanup_stale_device_tokens()