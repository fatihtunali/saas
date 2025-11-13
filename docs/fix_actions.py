import os
import re

BASE = r'C:\Users\fatih\Desktop\CRM\frontend\src\app\(dashboard)\dashboard\services'
modules = ['guides', 'restaurants', 'suppliers', 'tour-companies', 'transfer-routes', 'vehicle-companies', 'vehicle-rentals', 'vehicle-types']

for module in modules:
    file_path = os.path.join(BASE, module, 'page.tsx')
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and replace the malformed actions column
    pattern = r'(\{[\s\S]*?id:\s*[\'"]actions[\'"][\s\S]*?cell:\s*\(\{\s*row\s*\}\)\s*=>\s*\([\s\S]*?<div className="flex items-center gap-2">[\s\S]*?<Button[\s\S]*?<Eye[\s\S]*?<\/Button>[\s\S]*?<Button[\s\S]*?<Pencil[\s\S]*?<\/Button>)[\s\S]*?(\<\/div>[\s\S]*?\)[\s\S]*?\})'
    
    # Simpler: Just find the broken part and replace it
    if 'title="Delete' in content and 'trigger={' in content:
        # Find the start of actions column
        actions_start = content.find("id: 'actions'")
        if actions_start == -1:
            actions_start = content.find('id: "actions"')
        
        if actions_start != -1:
            # Find the end of this column definition
            brace_count = 0
            in_column = False
            column_start = content.rfind('{', 0, actions_start)
            
            for i in range(column_start, len(content)):
                if content[i] == '{':
                    brace_count += 1
                    in_column = True
                elif content[i] == '}':
                    brace_count -= 1
                    if in_column and brace_count == 0:
                        column_end = i + 1
                        break
            
            # Extract and fix
            old_column = content[column_start:column_end]
            
            # Build new column
            new_column = old_column
            # Remove the broken ConfirmDialog part
            # Find the broken part: from "title=" to the end of trigger block
            if 'title="Delete' in new_column:
                broken_start = new_column.find('title="Delete')
                if broken_start != -1:
                    # Find the end: the /> after the trigger Button
                    broken_end = new_column.find('/>', broken_start) + 2
                    
                    # Replace with proper button
                    delete_button = '''<Button
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            onClick={() => {
              if (confirm('Are you sure?')) deleteItem(row.original.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>'''
                    
                    new_column = new_column[:broken_start] + delete_button + new_column[broken_end:]
            
            content = content[:column_start] + new_column + content[column_end:]
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f'[OK] Fixed {module}')
        else:
            print(f'[SKIP] No actions column found in {module}')
    else:
        print(f'[SKIP] {module} already fixed')

print('[DONE]')
