"""
Hangman Worlds - Console Game
Task 1 - Python Programming Internship

Run:
    python hangman.py

Optional:
    Keep google-10000-english-no-swears.txt in the same folder.
"""

import random
import re
from pathlib import Path

MAX_ATTEMPTS = 6
WORD_LIST_FILE = Path(__file__).with_name("google-10000-english-no-swears.txt")

HANGMAN_STAGES = [
    r"""
     +---+
     |   |
         |
         |
         |
         |
    =========
""",
    r"""
     +---+
     |   |
     O   |
         |
         |
         |
    =========
""",
    r"""
     +---+
     |   |
     O   |
     |   |
         |
         |
    =========
""",
    r"""
     +---+
     |   |
     O   |
    /|   |
         |
         |
    =========
""",
    r"""
     +---+
     |   |
     O   |
    /|\  |
         |
         |
    =========
""",
    r"""
     +---+
     |   |
     O   |
    /|\  |
    /    |
         |
    =========
""",
    r"""
     +---+
     |   |
     O   |
    /|\  |
    / \  |
         |
    =========
""",
]

# Each word has a clue and a hint. The hint reveals a letter when requested.
WORD_BANK = {
    "adventure": ("An exciting or unusual experience.", "It often involves exploring or taking a risk."),
    "beautiful": ("A word used to describe something pleasing to the eyes.", "It is the opposite of ugly."),
    "butterfly": ("A colourful insect with large wings.", "It begins as a caterpillar."),
    "computer": ("An electronic machine used to process data.", "You may use it for coding and browsing."),
    "creative": ("Having the ability to make new or original things.", "Artists and inventors often show this quality."),
    "dinosaur": ("An ancient animal that lived millions of years ago.", "A T-rex is one example."),
    "elephant": ("A very large animal with a trunk.", "It is known for its excellent memory."),
    "fantasy": ("A genre with magic and imaginary worlds.", "Dragons and wizards often appear in it."),
    "festival": ("A special event or celebration.", "Diwali is one example."),
    "football": ("A popular team sport played with a ball.", "Players often score goals."),
    "friendship": ("A close and caring relationship between people.", "It grows through trust and support."),
    "galaxy": ("A huge collection of stars, gas, and dust.", "The Milky Way is one."),
    "giraffe": ("A tall animal with a very long neck.", "It often eats leaves from tall trees."),
    "happiness": ("The feeling of joy or contentment.", "It is the opposite of sadness."),
    "hospital": ("A place where sick or injured people receive care.", "Doctors and nurses work here."),
    "internet": ("A worldwide network connecting computers.", "You use it to visit websites."),
    "jungle": ("A dense area of tropical trees and plants.", "Many wild animals live here."),
    "keyboard": ("A device with keys used to type.", "It is connected to a computer."),
    "language": ("A system of words used to communicate.", "English and Hindi are examples."),
    "mountain": ("A very high natural area of land.", "People climb it for adventure."),
    "notebook": ("A book of blank or lined pages for writing.", "Students often carry one to class."),
    "ocean": ("A very large body of salt water.", "The Pacific is the largest one."),
    "painting": ("A picture made using colours or paint.", "An artist may create it with a brush."),
    "rainbow": ("A coloured arc sometimes seen after rain.", "It is commonly described as having seven colours."),
    "science": ("The study of the natural and physical world.", "Physics, chemistry, and biology are parts of it."),
    "sunshine": ("Light and warmth that come from the sun.", "It brightens a clear day."),
    "treasure": ("Valuable objects such as gold, jewels, or money.", "Pirate stories often include a hidden one."),
    "umbrella": ("An object used to protect you from rain or sun.", "You open it above your head."),
    "universe": ("Everything that exists, including space and stars.", "It contains galaxies."),
    "waterfall": ("Water flowing over a steep edge in a stream or river.", "You may see one in a scenic natural place."),
    "whisper": ("To speak very softly.", "You might do this in a library."),
    "wonderful": ("Extremely good or enjoyable.", "It is a stronger way to say 'great'."),
    "yesterday": ("The day before today.", "It comes before today on the calendar."),
}


def load_words():
    """Use words with built-in clues; optionally intersect with the provided word list."""
    clue_words = set(WORD_BANK)

    if WORD_LIST_FILE.exists():
        try:
            with WORD_LIST_FILE.open("r", encoding="utf-8", errors="ignore") as file:
                supplied_words = {
                    line.strip().lower()
                    for line in file
                    if re.fullmatch(r"[a-z]{3,15}", line.strip().lower())
                }
            matching_words = sorted(clue_words.intersection(supplied_words))
            if matching_words:
                print(f"Word list loaded: {WORD_LIST_FILE.name}")
                print("Using words that have a matching clue and hint.")
                return matching_words
            print("The supplied word list has no matching clue words; using the built-in clue word bank.")
        except OSError:
            print("Could not read the supplied word list; using the built-in clue word bank.")
    else:
        print("Using the built-in word bank with clues and hints.")
    return sorted(clue_words)


def display_game(secret_word, guessed_letters, wrong_guesses, hint_used):
    """Display the gallows, masked word, clue, and guessed letters."""
    print(HANGMAN_STAGES[wrong_guesses])
    masked_word = " ".join(
        letter.upper() if letter in guessed_letters else "_"
        for letter in secret_word
    )
    print(f"Word: {masked_word}")
    print(f"Clue: {WORD_BANK[secret_word][0]}")
    print(f"Incorrect attempts remaining: {MAX_ATTEMPTS - wrong_guesses}")
    print(f"Hint used: {'Yes' if hint_used else 'No'}")

    if guessed_letters:
        print("Guessed letters: " + " ".join(sorted(letter.upper() for letter in guessed_letters)))
    else:
        print("Guessed letters: None")


def reveal_hint(secret_word, guessed_letters):
    """Reveal one not-yet-guessed letter from the secret word."""
    hidden_letters = [letter for letter in secret_word if letter not in guessed_letters]
    if not hidden_letters:
        return None
    return random.choice(hidden_letters)


def play_game(words):
    secret_word = random.choice(words)
    guessed_letters = set()
    wrong_guesses = 0
    hint_used = False

    print("\n" + "=" * 46)
    print("          H A N G M A N   W O R L D S")
    print("=" * 46)
    print("Guess the hidden word one letter at a time.")
    print("You have 6 incorrect attempts.")
    print("Type 'hint' to reveal a helpful clue about a letter.")
    print("Using a hint costs 1 incorrect attempt. Type 'quit' to exit.\n")

    while wrong_guesses < MAX_ATTEMPTS:
        display_game(secret_word, guessed_letters, wrong_guesses, hint_used)

        if all(letter in guessed_letters for letter in secret_word):
            print("\n" + "=" * 46)
            print("          YOU WIN! AMAZING! 🎊")
            print(f"          The word was: {secret_word.upper()}")
            print("=" * 46)
            return

        guess = input("\nEnter a letter, 'hint', or 'quit': ").strip().lower()

        if guess == "quit":
            print(f"\nGame exited. The secret word was: {secret_word.upper()}")
            return

        if guess == "hint":
            if hint_used:
                print("You have already used your hint in this round.")
                continue
            hint_used = True
            print(f"Hint: {WORD_BANK[secret_word][1]}")
            letter = reveal_hint(secret_word, guessed_letters)
            if letter:
                guessed_letters.add(letter)
                print(f"Letter revealed: {letter.upper()}")
            wrong_guesses += 1
            print("Hint used: 1 incorrect attempt has been deducted.")
            continue

        if len(guess) != 1 or not guess.isalpha() or not guess.isascii():
            print("Please enter exactly one English letter (A-Z), or type 'hint'.")
            continue

        if guess in guessed_letters:
            print(f"You already guessed or revealed '{guess.upper()}'. No attempt was deducted.")
            continue

        guessed_letters.add(guess)

        if guess in secret_word:
            print(f"Correct! '{guess.upper()}' is in the word. 🎉")
        else:
            wrong_guesses += 1
            print(f"Sorry, '{guess.upper()}' is not in the word.")

    display_game(secret_word, guessed_letters, wrong_guesses, hint_used)
    print("\n" + "=" * 46)
    print("          GAME OVER!")
    print(f"          The word was: {secret_word.upper()}")
    print("          Better luck next time!")
    print("=" * 46)


def main():
    words = load_words()
    while True:
        play_game(words)
        again = input("\nWould you like to play again? (y/n): ").strip().lower()
        if again not in {"y", "yes"}:
            print("\nThanks for playing Hangman Worlds. Goodbye! 👋")
            break


if __name__ == "__main__":
    main()
