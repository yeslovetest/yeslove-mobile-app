"""Automated content synchronization service"""
import asyncio
import schedule
import time
from threading import Thread
from app.services.external_sync_service import ExternalSyncService
from app.services.sync_service import SyncService
from config.sources import ALLOWED_SOURCES

class AutoSyncService:
    def __init__(self):
        self.sync_service = ExternalSyncService()
        self.content_sync_service = SyncService()
        self.running = False
        
    def start_scheduler(self):
        """Start background sync scheduler"""
        if self.running:
            return
            
        self.running = True
        
        # Schedule daily sync at 2 AM
        schedule.every().day.at("02:00").do(self.sync_all_sources)
        
        # Schedule weekly full refresh on Sundays
        schedule.every().sunday.at("03:00").do(self.full_refresh)
        
        # Run scheduler in background thread
        Thread(target=self._run_scheduler, daemon=True).start()
    
    def _run_scheduler(self):
        """Background scheduler loop"""
        while self.running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def sync_all_sources(self):
        """Sync all configured external sources"""
        try:
            self.content_sync_service.sync_wordpress_blog_posts(page=1, per_page=25)
        except Exception as e:
            print(f"WordPress blog sync failed: {e}")

        priority_urls = [
            # Core relationship sources
            "https://www.relate.org.uk/get-help/relationship-help/",
            "https://www.brook.org.uk/your-life/relationships/healthy-relationships/",
            "https://www.brook.org.uk/your-life/sex/consent/",
            "https://www.mind.org.uk/information-support/types-of-mental-health-problems/relationships-and-feelings/",
            
            # Abuse support
            "https://www.womensaid.org.uk/information-support/what-is-domestic-abuse/",
            "https://www.refuge.org.uk/i-need-help-now/am-i-in-an-abusive-relationship/",
            "https://www.mensadviceline.org.uk/mens-advice-line/",
            "https://galop.org.uk/resources/",
            
            # Youth sources
            "https://www.youngminds.org.uk/young-person/relationships/",
            "https://www.childline.org.uk/info-advice/your-feelings/relationships-friends-and-family/",
            "https://www.nspcc.org.uk/advice-for-families/relationships/",
            
            # Context sources
            "https://www.nhs.uk/mental-health/",
            "https://www.nice.org.uk/guidance/",
            "https://www.baatn.org.uk/resources/",
            "https://blackmindsmatteruk.com/resources/",
            
            # Psychology Today (filtered)
            "https://www.psychologytoday.com/intl/topics/relationships",
            "https://www.psychologytoday.com/intl/topics/love"
        ]
        
        for url in priority_urls:
            try:
                self.sync_service.sync_external_url(url)
            except Exception as e:
                print(f"Sync failed for {url}: {e}")
    
    def full_refresh(self):
        """Full content refresh - removes old, adds new"""
        # Implementation for complete refresh
        pass
    
    def stop(self):
        """Stop the scheduler"""
        self.running = False
