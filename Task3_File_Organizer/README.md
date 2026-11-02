# 📁 Automated File Organizer and Cleanup Utility

A Python utility that organizes files in a selected directory into category folders based on file extensions.

## Features
- Sorts files into Documents, Images, Videos, Archives, and Code.
- Creates category folders automatically.
- Avoids overwriting duplicate filenames by adding a numeric suffix.
- Handles permission and filesystem errors.
- Logs operations to `organizer.log`.
- Prints a summary of moved, skipped, and failed files.
- Uses Python's standard library; no extra packages are required.

## Requirements
- Python 3.8 or newer

## Run the project
1. Open this folder in VS Code.
2. Open **Terminal → New Terminal**.
3. Run:

   ```bash
   python organizer.py
   ```

   On some Windows systems, use `py organizer.py`.
4. Enter the path of a **test folder** when prompted.

## Categories

| Category | Example extensions |
|---|---|
| Documents | `.pdf`, `.docx`, `.txt`, `.xlsx`, `.csv` |
| Images | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` |
| Videos | `.mp4`, `.mkv`, `.mov`, `.avi` |
| Archives | `.zip`, `.rar`, `.7z`, `.tar`, `.gz` |
| Code | `.py`, `.java`, `.c`, `.cpp`, `.html`, `.css`, `.js` |

## Safety notes
- **Test with a sample directory first.** This utility moves files and changes their locations.
- It does not delete files.
- It organizes files directly inside the selected directory; it does not recursively scan subfolders.
- Unsupported extensions are skipped.
- Duplicate destination names receive a suffix, such as `photo_1.jpg`.
- `organizer.log` records operations and errors in the current working directory.

## Technologies
Python, `os.scandir()`, `shutil.move()`, `pathlib`, `logging`, and exception handling.

## Author
Hiteshri Gondane

Datheon Python Programming Internship — Task 3
