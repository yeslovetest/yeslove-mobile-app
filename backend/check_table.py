from sqlalchemy import create_engine, inspect

# Connect to your SQLite database
engine = create_engine('sqlite:///development.db')  # Replace with your actual DB 

# Create an inspector
inspector = inspect(engine)

# Get a list of table names
table_names = inspector.get_table_names()

# Check if 'user' table exists
if 'user' in table_names:
    print("✅ Table 'user' exists.")
else:
    print("❌ Table 'user' does NOT exist.")
