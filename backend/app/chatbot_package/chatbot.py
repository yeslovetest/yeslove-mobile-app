import os
from dotenv import load_dotenv
from openai import OpenAI


class Chatbot:
    """
    YesLove chatbot: answers company, relationship, and mental health questions
    using provided context, and refers to website if unsure.
    """

    def __init__(self, context_path=None, model="gpt-4o-mini", top_k=5):
        # Load environment variables for API access
        load_dotenv(override=True)

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("Missing OPENAI_API_KEY in environment")
        os.environ["OPENAI_API_KEY"] = api_key

        #Initialise opneAI client
        self.openai = OpenAI(api_key=api_key)
        self.model = model
        self.top_k = top_k
        self.system_message = (
            "You are a knowledgeable assistant for YesLove, specializing in providing accurate information "
            "about the company. You also support users with relationship and mental health inquiries, drawing "
            "answers from relevant knowledge-base excerpts. Always cite the context you use. "
            "If you are unsure, direct the user to YesLove official website at www.yeslove.co.uk. "
            "Never hallucinate or provide unsupported information."
        )

    def _retrieve_context(self, user_message: str) -> str:
        from app.chatbot_package.vectorstore.client import query_rag
        # Fetch top_k relevant chunks from vector DB
        chunks = query_rag(user_message, top_k=self.top_k)
        return "\n\n---\n\n".join(chunks)

    def _add_context(self, user_message: str) -> str:
        context = self._retrieve_context(user_message)
        return (
            f"{user_message}\n\n"
            "Use ONLY the following excerpts to answer (do not hallucinate):\n\n"
            f"{context}"
        )

    def chat(self, message, history=None):
        """
        Sends a message (with retrieved context) to the OpenAI API, including prior chat history.
        """
        if history is None:
            history = []
        messages = [{"role": "system", "content": self.system_message}] + history
        user_message = self._add_context(message)
        messages.append({"role": "user", "content": user_message})

        response = self.openai.chat.completions .create(
            model=self.model,
            messages=messages
        )
        return response.choices[0].message.content


