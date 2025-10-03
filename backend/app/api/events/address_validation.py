"""Address validation utilities for events"""
import re

def validate_uk_postcode(postcode: str) -> bool:
    """Validate UK postcode format"""
    if not postcode:
        return False
    
    # UK postcode regex pattern
    uk_postcode_pattern = r'^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}$'
    return bool(re.match(uk_postcode_pattern, postcode.upper().strip()))

def validate_address_fields(address_data: dict) -> tuple[bool, str]:
    """Validate required address fields"""
    required_fields = ['address_number', 'address_street', 'address_city', 'post_code']
    
    for field in required_fields:
        if not address_data.get(field):
            return False, f"Missing required field: {field}"
    
    # Validate postcode format for UK addresses
    country = address_data.get('address_country', 'UK').upper()
    if country == 'UK':
        postcode = address_data.get('post_code')
        if not validate_uk_postcode(postcode):
            return False, "Invalid UK postcode format"
    
    return True, "Address validation passed"