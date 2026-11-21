# Rule-Based Interactive Terminal Assistant / Chatbot

A Python terminal-based customer support chatbot that uses regular expressions and predefined rules to recognize user intents and return contextual responses. It supports multiple intents in one message, a JSON FAQ dataset, fallback replies, and graceful exit commands.

## Features
- Greeting recognition
- Business hours and product FAQ responses
- Multiple-intent matching in a single message
- Regex-based keyword and phrase matching
- Optional external FAQ dataset (`faq.json`)
- Fallback response for unknown queries
- Exit commands: `bye`, `goodbye`, `exit`, and `quit`
- Input validation and exception handling

## Folder structure
```text
Task_4_Chatbot/
├── chatbot.py
├── faq.json
└── README.md
```

## Requirements
- Python 3.8 or later
- No third-party packages required (`re`, `json`, and `pathlib` are part of Python's standard library)

## Run the chatbot
Open a terminal in this folder and run:

```bash
python chatbot.py
```

On some systems, use:

```bash
python3 chatbot.py
```

## Example inputs
- `Hello`
- `What are your business hours?`
- `Tell me product details and price`
- `Is delivery available?`
- `What is your return policy?`
- `bye`

## Customize FAQs
Edit `faq.json` to add or update intents. Each entry must contain:
- `patterns`: a list of regular-expression patterns
- `response`: the response shown when a pattern matches

Example:

```json
{
  "delivery": {
    "patterns": ["\\b(delivery|shipping)\\b"],
    "response": "Delivery usually takes 3 to 5 business days."
  }
}
```

The built-in FAQ entries remain available. Entries in `faq.json` add new intents or override built-in intents with the same key.

## Notes
- The business details and policies in this sample are demonstration content. Replace them with verified details before using the chatbot for a real business.
- Matching is rule-based; it does not use machine learning or a large language model.
