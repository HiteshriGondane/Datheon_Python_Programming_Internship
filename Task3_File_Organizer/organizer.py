import os
import shutil
import logging
from pathlib import Path

logging.basicConfig(
    filename="organizer.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

FILE_CATEGORIES = {
    ".pdf": "Documents", ".doc": "Documents", ".docx": "Documents",
    ".txt": "Documents", ".rtf": "Documents", ".odt": "Documents",
    ".xls": "Documents", ".xlsx": "Documents", ".ppt": "Documents",
    ".pptx": "Documents", ".csv": "Documents",
    ".jpg": "Images", ".jpeg": "Images", ".png": "Images",
    ".gif": "Images", ".bmp": "Images", ".svg": "Images",
    ".webp": "Images", ".tiff": "Images",
    ".mp4": "Videos", ".mkv": "Videos", ".mov": "Videos",
    ".avi": "Videos", ".wmv": "Videos", ".webm": "Videos",
    ".zip": "Archives", ".rar": "Archives", ".7z": "Archives",
    ".tar": "Archives", ".gz": "Archives",
    ".py": "Code", ".java": "Code", ".c": "Code", ".cpp": "Code",
    ".html": "Code", ".css": "Code", ".js": "Code",
    ".json": "Code", ".sql": "Code"
}


def get_unique_path(destination: Path) -> Path:
    """Avoid overwriting an existing file by generating a unique name."""
    if not destination.exists():
        return destination

    counter = 1
    while True:
        candidate = destination.with_name(
            f"{destination.stem}_{counter}{destination.suffix}"
        )
        if not candidate.exists():
            return candidate
        counter += 1


def organize_files(folder_path: str) -> None:
    """Organize supported files directly inside the selected folder."""
    folder = Path(folder_path).expanduser().resolve()

    if not folder.exists() or not folder.is_dir():
        print("Error: The selected directory does not exist.")
        return

    moved = skipped = failed = 0
    print("\n" + "=" * 48)
    print("          AUTOMATED FILE ORGANIZER")
    print("=" * 48)
    print(f"Selected folder: {folder}\n")

    try:
        with os.scandir(folder) as entries:
            for entry in entries:
                # Process files only; existing subfolders are left untouched.
                if not entry.is_file(follow_symlinks=False):
                    continue

                source = Path(entry.path)

                # Do not move this script if it is inside the target folder.
                if source.name.lower() == Path(__file__).name.lower():
                    skipped += 1
                    continue

                category = FILE_CATEGORIES.get(source.suffix.lower())
                if category is None:
                    skipped += 1
                    logging.info("Skipped unsupported file: %s", source)
                    continue

                try:
                    destination_folder = folder / category
                    destination_folder.mkdir(parents=True, exist_ok=True)
                    destination = get_unique_path(destination_folder / source.name)
                    shutil.move(str(source), str(destination))
                    moved += 1
                    logging.info("Moved %s -> %s", source, destination)
                    print(f"[MOVED] {source.name} -> {category}/{destination.name}")

                except PermissionError:
                    failed += 1
                    logging.exception("Permission denied for %s", source)
                    print(f"[ERROR] Permission denied: {source.name}")

                except OSError as error:
                    failed += 1
                    logging.exception("Could not move %s", source)
                    print(f"[ERROR] Could not move {source.name}: {error}")

    except PermissionError:
        logging.exception("Permission denied reading directory: %s", folder)
        print(f"Error: Permission denied while accessing {folder}")
        return
    except OSError as error:
        logging.exception("Could not read directory: %s", folder)
        print(f"Error: Could not read directory: {error}")
        return

    print("\n" + "=" * 48)
    print("               EXECUTION SUMMARY")
    print("=" * 48)
    print(f"Files moved successfully : {moved}")
    print(f"Files skipped            : {skipped}")
    print(f"Files failed             : {failed}")
    print("=" * 48)
    print("Organization completed!")
    print("Check organizer.log for details.")


if __name__ == "__main__":
    print("Automated File Organizer")
    target_folder = input('Enter the folder path to organize: ').strip().strip('"')
    if target_folder:
        organize_files(target_folder)
    else:
        print("Error: Please enter a valid folder path.")
