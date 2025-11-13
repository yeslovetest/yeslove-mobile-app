"""Validate that all required URL patterns are configured"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.sources import ALLOWED_SOURCES
from app.utils.source_validator import is_url_allowed

# Test URLs from requirements
TEST_URLS = [
    # Core relationship & wellbeing sources
    "https://www.relate.org.uk/get-help/relationship-help/",
    "https://www.brook.org.uk/your-life/relationships/healthy-relationships/", 
    "https://www.brook.org.uk/your-life/sex/consent/",
    "https://www.mind.org.uk/information-support/types-of-mental-health-problems/relationships-and-feelings/",
    
    # Abuse support
    "https://www.womensaid.org.uk/information-support/what-is-domestic-abuse/",
    "https://www.refuge.org.uk/i-need-help-now/am-i-in-an-abusive-relationship/",
    "https://www.mensadviceline.org.uk/mens-advice-line/",
    "https://galop.org.uk/resources/domestic-abuse/",
    
    # Youth sources
    "https://www.youngminds.org.uk/young-person/relationships/",
    "https://www.childline.org.uk/info-advice/your-feelings/relationships-friends-and-family/",
    "https://www.nspcc.org.uk/advice-for-families/relationships/",
    
    # Context sources
    "https://www.nhs.uk/mental-health/",
    "https://www.nice.org.uk/guidance/",
    "https://www.baatn.org.uk/resources/",
    "https://blackmindsmatteruk.com/resources/",
    "https://www.mwnuk.co.uk/resources.php",
    "https://www.southallblacksisters.org.uk/resources/",
    
    # Psychology Today
    "https://www.psychologytoday.com/intl/topics/relationships",
    "https://www.psychologytoday.com/intl/topics/love",
    "https://www.psychologytoday.com/intl/topics/attachment",
    "https://www.psychologytoday.com/intl/blog/some-relationship-topic"
]

def validate_all_sources():
    """Validate all required URLs are allowed"""
    print("Validating source configuration...")
    
    allowed_count = 0
    blocked_count = 0
    
    for url in TEST_URLS:
        allowed, category, source_name = is_url_allowed(url)
        
        if allowed:
            print(f"✅ {url}")
            print(f"   Category: {category}, Source: {source_name}")
            allowed_count += 1
        else:
            print(f"❌ {url} - NOT ALLOWED")
            blocked_count += 1
    
    print(f"\nSummary: {allowed_count} allowed, {blocked_count} blocked")
    
    if blocked_count > 0:
        print("⚠️  Some required URLs are blocked - check source configuration")
    else:
        print("✅ All required URLs are properly configured")

if __name__ == "__main__":
    validate_all_sources()