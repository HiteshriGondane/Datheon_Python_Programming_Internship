import re
import json
from pathlib import Path

BOT_NAME = "SupportBot"

DEFAULT_FAQS = {
    "business_hours": {
        "patterns": [r"\b(hours|timing|working hours|business hours|open|close)\b"],
        "response": "Our business hours are Monday to Saturday, 9:00 AM to 6:00 PM. We are closed on Sundays."
    },
    "product_info": {
        "patterns": [r"\b(product|products|features|details|information)\b"],
        "response": "We offer quality products with reliable performance, a warranty and customer support."
    },
    "price": {
        "patterns": [r"\b(price|cost|rate|charges|how much)\b"],
        "response": "Our product prices depend on the selected model. Please contact our sales team for exact pricing."
    },
    "availability": {
        "patterns": [r"\b(available|availability|stock|in stock)\b"],
        "response": "Our products are subject to stock availability. Please contact our sales team for current stock details."
    },
    "return_policy": {
        "patterns": [r"\b(return|refund|exchange|replacement)\b"],
        "response": "Products can be returned within 7 days of delivery if they meet our return conditions. Contact support to initiate a return."
    },
    "contact": {
        "patterns": [r"\b(contact|phone|email|support|customer care)\b"],
        "response": "You can contact our customer support team at support@example.com."
    }
}

GREETINGS = [
    r"\b(hi|hello|hey|good morning|good afternoon|good evening)\b"
]
EXIT_COMMANDS = [r"\b(bye|goodbye|exit|quit)\b"]


class RuleBasedChatbot:
    def __init__(self):
        self.state = "greeting"
        self.faqs = DEFAULT_FAQS.copy()
        self.load_faq_dataset()

    def load_faq_dataset(self):
        file_path = Path(__file__).with_name("faq.json")
        if not file_path.exists():
            print("[INFO] faq.json not found. Using built-in FAQ data.")
            return

        try:
            with file_path.open("r", encoding="utf-8") as file:
                data = json.load(file)

            if not isinstance(data, dict):
                raise ValueError("The FAQ dataset must contain a JSON object.")

            for intent, details in data.items():
                if (
                    isinstance(details, dict)
                    and isinstance(details.get("patterns"), list)
                    and isinstance(details.get("response"), str)
                ):
                    self.faqs[intent] = details
                else:
                    print(f"[WARNING] Skipping invalid FAQ entry: {intent}")

            print("[INFO] FAQ dataset loaded successfully.")
        except (json.JSONDecodeError, OSError, ValueError) as error:
            print(f"[WARNING] Could not load FAQ dataset: {error}")
            print("[INFO] Using built-in FAQ data.")

    @staticmethod
    def normalize_input(user_input):
        return re.sub(r"\s+", " ", user_input.lower().strip())

    @staticmethod
    def matches_pattern(text, patterns):
        return any(
            re.search(pattern, text, re.IGNORECASE)
            for pattern in patterns
        )

    def generate_response(self, user_input):
        text = self.normalize_input(user_input)

        if not text:
            return "Please enter a message so I can help you."

        if self.matches_pattern(text, EXIT_COMMANDS):
            self.state = "exit"
            return "Thank you for chatting with us! Have a great day. Goodbye!"

        responses = []

        if self.matches_pattern(text, GREETINGS):
            responses.append(f"Hello! Welcome to {BOT_NAME}. How can I help you today?")

        detected_intents = []
        for intent, details in self.faqs.items():
            patterns = details.get("patterns", [])
            if self.matches_pattern(text, patterns):
                detected_intents.append(intent)
                response = details.get("response", "Sorry, information is unavailable.")
                if response not in responses:
                    responses.append(response)

        if responses:
            self.state = "resolution"
            return "\n\n".join(responses)

        self.state = "intent_identification"
        return (
            "I'm sorry, I couldn't understand your question.\n"
            "You can ask me about business hours, product information, "
            "prices, availability, returns, refunds or customer support."
        )

    def start_chat(self):
        print("=" * 48)
        print(f"          WELCOME TO {BOT_NAME.upper()}")
        print("=" * 48)
        print("Bot: Hello! How can I help you today?")
        print("Bot: Type 'bye', 'exit' or 'quit' to end the chat.\n")
        self.state = "intent_identification"

        while self.state != "exit":
            try:
                user_input = input("You: ")
                response = self.generate_response(user_input)
                print(f"\nBot: {response}\n")
            except (KeyboardInterrupt, EOFError):
                self.state = "exit"
                print("\nBot: Chat ended. Thank you!")
            except Exception as error:
                print(f"\nBot: Something went wrong: {error}")
                print("Please try again.\n")


if __name__ == "__main__":
    try:
        RuleBasedChatbot().start_chat()
    except Exception as error:
        print(f"Unable to start chatbot: {error}")
