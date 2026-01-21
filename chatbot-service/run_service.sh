#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
export OPENAI_API_KEY="your_key_here"
export VECTOR_DATABASE_URL="sqlite:///chatbot.db"
python3 main.py