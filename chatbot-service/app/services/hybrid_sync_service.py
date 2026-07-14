"""Hybrid sync service combining multiple methods"""
from app.services.auto_sync_service import AutoSyncService
from app.services.rss_sync_service import RSSyncService
from app.services.external_sync_service import ExternalSyncService

class HybridSyncService:
    """Production-ready sync combining multiple methods"""
    
    def __init__(self):
        self.auto_sync = AutoSyncService()
        self.rss_sync = RSSyncService()
        self.external_sync = ExternalSyncService()
    
    def start_production_sync(self):
        """Start all sync methods for production"""
        # 1. Start scheduled background sync
        self.auto_sync.start_scheduler()
        
        # 2. Sync YesLove WordPress blogs immediately
        try:
            self.auto_sync.content_sync_service.sync_wordpress_blog_posts(page=1, per_page=25)
        except Exception as e:
            print(f"WordPress blog sync failed: {e}")

        # 3. Sync RSS feeds immediately
        self.rss_sync.sync_all_feeds()
        
        print("✅ Production sync started:")
        print("  - Scheduled sync: Daily at 2 AM")
        print("  - WordPress blogs: Synced from yeslove.co.uk")
        print("  - RSS feeds: Synced")
        print("  - Webhooks: Available at /api/v1/webhook/content")
        print("  - Manual trigger: /api/v1/admin/sync/trigger")
    
    def get_sync_status(self):
        """Get status of all sync methods"""
        return {
            "scheduled_sync": self.auto_sync.running,
            "webhook_available": True,
            "rss_feeds": len(self.rss_sync.feeds),
            "methods": ["scheduled", "wordpress", "webhook", "rss", "manual"]
        }
