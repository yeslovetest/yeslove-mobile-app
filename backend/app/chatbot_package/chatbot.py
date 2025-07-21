import os
from dotenv import load_dotenv
from openai import OpenAI

class Chatbot:
    """
    YesLove chatbot: answers company, relationship, and mental health questions
    using provided context, and refers to website if unsure.
    """

    def __init__(self, context_path=None, model="gpt-4o-mini"):
        # Load environment variables for API access
        load_dotenv(override=True)
        os.environ['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY', 'your-key-if-not-using-env')
        self.openai = OpenAI()
        
        base_dir = os.path.dirname(__file__)
        # Use provided context_path or the default one
        if context_path is None:
            context_path = os.path.join(base_dir, "knowledge_base", "knowledge_base.md")

        # Load contextual information
        with open(context_path, "r", encoding="utf-8") as f:
            self.context = f.read()
        
        self.model = model
        self.system_message = (
            "You are a knowledgeable assistant for YesLove, specializing in providing accurate information "
            "about the company. You also support users with relationship and mental health inquiries, drawing "
            "answers from content supplied by the YesLove blog. Please keep your responses brief and precise. "
            "Provide answers only from the provided context. If you are unsure, direct the user to YesLove "
            "official website at www.yeslove.co.uk. Do not speculate or provide "
            "information that is not supported "
            "by the context you have received."
        )

    def _add_context(self, user_message):
        """
        Appends the context to the user's message.
        """
        appended = (
            f"{user_message}\n\n"
            "The following additional context may be relevant in answering this question:\n\n"
            f"{self.context}\n"
        )
        return appended

    def chat(self, message, history=None):
        """
        Sends a message (with appended context) to the OpenAI API, including prior chat history.
        """
        if history is None:
            history = []
        messages = [{"role": "system", "content": self.system_message}] + history
        user_message = self._add_context(message)
        messages.append({"role": "user", "content": user_message})

        response = self.openai.chat.completions.create(
            model=self.model,
            messages=messages
        )
        return response.choices[0].message.content


