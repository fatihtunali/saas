import os
import re

BASE = r'C:\Users\fatih\Desktop\CRM\frontend\src\app\(dashboard)\dashboard\services'

# Modules to fix
modules = [
    'entrance-fees',
    'extras',
    'guides',
    'restaurants',
    'suppliers',
    'tour-companies',
    'transfer-routes',
    'vehicle-companies',
    'vehicle-rentals',
    'vehicle-types',
]

for module in modules:
    page_path = os.path.join(BASE, module, 'page.tsx')
    
    if os.path.exists(page_path):
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove ConfirmDialog import
        content = re.sub(r',\s*ConfirmDialog\s*', '', content)
        content = re.sub(r'ConfirmDialog,\s*', '', content)
        
        # Replace ConfirmDialog usage with simple Button
        content = re.sub(
            r'<ConfirmDialog[^>]*trigger=\{[^}]*\}[^/]*/>', 
            '<Button variant="ghost" size="sm" onClick={() => { if (confirm("Are you sure?")) deleteItem(row.original.id); }} disabled={isDeleting}><Trash2 className="h-4 w-4 text-red-600" /></Button>',
            content,
            flags=re.DOTALL
        )
        
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'[OK] Fixed {module}/page.tsx')

print('[DONE] All pages fixed!')
