import os
import re

translations = {
    'search_discover': 'Discover Local Experiences',
    'search_subtitle': 'Search and filter experiences by category, date, and language.',
    'search_placeholder': 'Search experiences',
    'search_category': 'Category',
    'search_time': 'Time of Day',
    'search_price': 'Price',
    'search_any_time': 'Any time',
    'search_under_1h': 'Under 1 hour',
    'search_nearby': 'Nearby',
    'search_clear': 'Clear',
    'search_clear_date': 'Clear date',
    'search_show_results': 'Show results',
    'search_location': 'Showing tours in',
    'search_language': 'Language',
    'search_quick_only': 'Quick only',
    'search_sort_by': 'Sort by',
    'search_featured': 'Featured',
    'search_rating': 'Top rated',
    'search_nearest': 'Nearest',
    'search_all_cats': 'All Cats',
    'search_any_date': 'Any date'
}

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return
        
    original = content
    
    for key, value in translations.items():
        if value:
            content = re.sub(
                r'>\s*' + re.escape(value) + r'\s*<', 
                f'>{{t("{key}")}}<', 
                content
            )
            content = re.sub(
                r'="' + re.escape(value) + r'"', 
                f'={{t("{key}")}}', 
                content
            )
            content = re.sub(
                r"='" + re.escape(value) + r"'", 
                f'={{t("{key}")}}', 
                content
            )
            
    if content != original:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Updated {filepath}')
        except Exception as e:
            print(f"Error writing {filepath}: {e}")

for root, _, files in os.walk(r'd:\2026 Projects\localXperiences\client\src'):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            replace_in_file(os.path.join(root, f))
print('Done')
