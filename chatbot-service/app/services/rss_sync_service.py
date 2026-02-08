"""RSS/Feed-based content synchronization"""
import feedparser
import requests
from app.services.mcp_sync_service import MCPSyncService

class RSSyncService:
    def __init__(self):
        self.mcp_sync = MCPSyncService()
        
        # RSS feeds from relationship advice sources
        self.feeds = {
            'relate': {
                'url': 'https://www.relate.org.uk/feed/',
                'category': 'relationships.core',
                'source_name': 'Relate'
            },
            'mind': {
                'url': 'https://www.mind.org.uk/feed/',
                'category': 'relationships.core', 
                'source_name': 'Mind'
            }
        }
    
    def sync_all_feeds(self):
        """Sync content from all RSS feeds"""
        results = []
        
        for feed_id, config in self.feeds.items():
            try:
                feed = feedparser.parse(config['url'])
                
                for entry in feed.entries[:5]:  # Latest 5 posts
                    content_data = {
                        'content': f"{entry.title}\n\n{entry.summary}",
                        'source_name': config['source_name'],
                        'category': config['category'],
                        'url': entry.link
                    }
                    
                    result = self.mcp_sync.sync_from_mcp_source(feed_id, content_data)
                    results.append(result)
                    
            except Exception as e:
                results.append({"error": f"Feed {feed_id} failed: {str(e)}"})
        
        return results