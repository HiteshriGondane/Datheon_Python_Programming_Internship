# Hangman Worlds — Python Console Game

A terminal-based Hangman game for the Python programming internship task.

## Features
- Random word selection from a built-in word bank.
- A clue is shown for each secret word.
- Type `hint` to receive an extra hint and reveal one hidden letter.
- Using the hint costs one incorrect attempt; one hint is allowed per round.
- ASCII gallows updates after incorrect guesses.
- Tracks guessed letters and does not penalize duplicate guesses.
- Six incorrect attempts, victory/defeat screens, and replay option.
- Optional compatibility with `google-10000-english-no-swears.txt`: only words that also have a clue and hint in the built-in word bank are used.

## Run the game
1. Extract the ZIP file.
2. Open the extracted folder in VS Code or another Python editor.
3. Open a terminal in that folder.
4. Run:

   ```bash
   python hangman.py
   ```

   On some Windows systems, use `py hangman.py`.

## How to play
- Enter one English letter at a time.
- Read the clue shown on the screen.
- Type `hint` once per round to reveal one hidden letter and receive an extra hint. This costs one incorrect attempt.
- Repeated guesses do not cost an attempt.
- Type `quit` to exit the current round.
