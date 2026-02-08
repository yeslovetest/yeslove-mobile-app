"""Script to sync approved external sources"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.external_sync_service import ExternalSyncService

# Priority external sources to sync (exact URLs from requirements)
PRIORITY_SOURCES = [
    # Core relationship & wellbeing sources (main priority)
    "https://www.relate.org.uk/get-help/relationship-help/",
    "https://www.brook.org.uk/your-life/relationships/healthy-relationships/",
    "https://www.brook.org.uk/your-life/sex/consent/",
    "https://www.mind.org.uk/information-support/types-of-mental-health-problems/relationships-and-feelings/",
    
    # Abuse support sources
    "https://www.womensaid.org.uk/information-support/what-is-domestic-abuse/",
    "https://www.refuge.org.uk/i-need-help-now/am-i-in-an-abusive-relationship/",
    "https://www.mensadviceline.org.uk/mens-advice-line/",
    "https://galop.org.uk/resources/domestic-abuse/",
    
    # Youth/teen sources
    "https://www.youngminds.org.uk/young-person/relationships/",
    "https://www.childline.org.uk/info-advice/your-feelings/relationships-friends-and-family/",
    "https://www.nspcc.org.uk/advice-for-families/relationships/",
    
    # Context/emotional wellbeing sources (secondary)
    "https://www.nhs.uk/mental-health/",
    "https://www.nice.org.uk/guidance/",
    "https://www.baatn.org.uk/resources/",
    "https://blackmindsmatteruk.com/resources/",
    "https://www.mwnuk.co.uk/resources.php",
    "https://www.southallblacksisters.org.uk/resources/",
    
    # Psychology Today (filtered)
    "https://www.psychologytoday.com/intl/topics/relationships",
    "https://www.psychologytoday.com/intl/topics/love",
    "https://www.psychologytoday.com/intl/topics/attachment"
]

def sync_priority_sources():
    """Sync priority external sources"""
    sync_service = ExternalSyncService()
    
    print("Starting sync of priority external sources...")
    
    for url in PRIORITY_SOURCES:
        print(f"Syncing: {url}")
        result = sync_service.sync_external_url(url)
        
        if 'error' in result:
            print(f"  ❌ Error: {result['error']}")
        else:
            print(f"  ✅ Success: {result['chunks_created']} chunks, category: {result['category']}")
    
    print("Sync completed!")

if __name__ == "__main__":
    sync_priority_sources()