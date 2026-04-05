import os
import re

def extract_translations():
    trans_file = r'd:\2026 Projects\localXperiences\client\src\config\translations.js'
    with open(trans_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the 'en' object
    match = re.search(r'const en = \{(.*?)\};', content, re.DOTALL)
    if not match:
        print("Could not find const en")
        return {}
    
    dict_content = match.group(1)
    
    # Parse keys and values
    translations = {}
    for line in dict_content.split('\n'):
        # match key: "value" or key: 'value'
        m = re.search(r'([a-zA-Z0-9_]+)\s*:\s*["\'](.*?)["\']', line)
        if m:
            key, val = m.groups()
            if len(val.strip()) > 1: # Ignore very short strings like "Su" or "," to prevent accidental replaces
                translations[key] = val
    return translations

translations = extract_translations()
print(f"Extracted {len(translations)} translations from translations.js")
if 'hero_headline_local' in translations:
    # "Local" might be too broad to auto-replace, let's remove some very generic words
    for k in ['cat_explore', 'hero_live', 'search_su', 'search_mo', 'search_tu', 'search_we', 'search_th', 'search_fr', 'search_sa', 'search_left_arrow', 'search_right_arrow']:
        translations.pop(k, None)

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return
        
    original = content
    
    # Sort transitions by length descending so longer phrases get replaced first
    sorted_items = sorted(translations.items(), key=lambda x: len(x[1]), reverse=True)
    
    for key, value in sorted_items:
        # Don't replace if it's already translated like t('key')
        if not value.strip(): continue
            
        # Replace > Text < with >{t('key')}<
        content = re.sub(
            r'>\s*' + re.escape(value) + r'\s*<', 
            f'>{{t("{key}")}}<', 
            content
        )
        
        # Replace ="Text" with ={t("key")} (props)
        content = re.sub(
            r'="' + re.escape(value) + r'"', 
            f'={{t("{key}")}}', 
            content
        )
        
        # Replace ='Text' with ={t("key")} (props)
        content = re.sub(
            r"='" + re.escape(value) + r"'", 
            f'={{t("{key}")}}', 
            content
        )
            
    if content != original:
        # We need to ensure useTranslation is imported and initialized if not already
        if "useTranslation" not in content and '{t(' in content:
            content = "import useTranslation from '../../hooks/useTranslation.js';\n" + content
            # Also we need `const { t } = useTranslation();` inside exactly the default export function
            # This is hard to do with regex for all kinds of components, but we can try basic:
            content = re.sub(
                r'(export default function.*?\{|const [A-Z][a-zA-Z0-9_]* = \([^)]*\)\s*=>\s*\{)',
                r'\1\n  const { t } = useTranslation();\n',
                content,
                count=1
            )
            
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Updated {filepath}')
        except Exception as e:
            print(f"Error writing {filepath}: {e}")

for root, _, files in os.walk(r'd:\2026 Projects\localXperiences\client\src'):
    for f in files:
        if f.endswith('.jsx'):
            if 'translations.js' not in f and 'useTranslation.js' not in f:
                replace_in_file(os.path.join(root, f))
print('Done')
