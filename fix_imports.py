import os
import re

for root, _, files in os.walk(r'd:\2026 Projects\localXperiences\client\src'):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            filepath = os.path.join(root, f)
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                    content = file.read()
            except Exception as e:
                continue
                
            # If the file imports useTranslation from the wrong path, fix it
            rel_path = os.path.relpath(root, r'd:\2026 Projects\localXperiences\client\src')
            if rel_path == '.':
                correct_import_path = './hooks/useTranslation.js'
            else:
                depth = len(rel_path.split(os.sep))
                correct_import_path = '../' * depth + 'hooks/useTranslation.js'
                
            original = content
            content = re.sub(
                r"import useTranslation from ['\"][\.\/]*hooks/useTranslation(?:\.js)?['\"];?",
                f"import useTranslation from '{correct_import_path}';",
                content
            )
            
            if content != original:
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Fixed import in {rel_path}\\{f}")
print("Import fix done.")
