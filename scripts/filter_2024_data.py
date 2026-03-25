"""
Filter 2024 Data from All Indicator Files
==========================================
Remove any 2024 data from JSON files to ensure data only covers 2000-2023
"""

import json
import os

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'processed_data')

def filter_2024_from_json(file_path):
    """Remove 2024 data from a JSON file."""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)

        # Filter out 2024
        if isinstance(data, list):
            original_count = len(data)
            filtered_data = [record for record in data if record.get('year') != 2024]
            removed_count = original_count - len(filtered_data)

            if removed_count > 0:
                # Save filtered data
                with open(file_path, 'w') as f:
                    json.dump(filtered_data, f, indent=2)
                return removed_count
            return 0
        else:
            print(f"  [SKIP] {file_path} - Not a list format")
            return 0
    except Exception as e:
        print(f"  [ERROR] {file_path}: {e}")
        return 0

def main():
    """Main execution function."""
    print("=" * 60)
    print("Filtering 2024 Data from All Indicator Files")
    print("=" * 60)
    print()

    total_files_processed = 0
    total_records_removed = 0

    # Walk through all subdirectories
    for root, dirs, files in os.walk(DATA_DIR):
        for file in files:
            if file.endswith('.json') and file != 'metadata.json':
                file_path = os.path.join(root, file)
                removed = filter_2024_from_json(file_path)

                if removed > 0:
                    relative_path = os.path.relpath(file_path, DATA_DIR)
                    print(f"[OK] {relative_path}: Removed {removed} records")
                    total_files_processed += 1
                    total_records_removed += removed

    print()
    print("=" * 60)
    print(f"[SUCCESS] Processed {total_files_processed} files")
    print(f"[SUCCESS] Removed {total_records_removed} records with year=2024")
    print("=" * 60)

if __name__ == '__main__':
    main()
