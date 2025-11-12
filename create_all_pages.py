import os

BASE = r'C:\Users\fatih\Desktop\CRM\frontend\src\app\(dashboard)\dashboard\services'

MODULES = {
    'guides': 'Guide',
    'restaurants': 'Restaurant',
    'entrance-fees': 'EntranceFee',
    'extras': 'ExtraExpense',
    'vehicle-companies': 'VehicleCompany',
    'vehicle-types': 'VehicleType',
    'vehicle-rentals': 'VehicleRental',
    'transfer-routes': 'TransferRoute',
    'tour-companies': 'TourCompany',
    'suppliers': 'Supplier',
}

# Create placeholder pages for create/edit/details
for mod_key, type_name in MODULES.items():
    # Create page
    create_path = os.path.join(BASE, mod_key, 'create', 'page.tsx')
    os.makedirs(os.path.dirname(create_path), exist_ok=True)
    with open(create_path, 'w') as f:
        f.write(f"""'use client';

export default function Create{type_name.replace(' ', '')}Page() {{
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create {type_name}</h1>
      <p className="text-gray-600">Implementation in progress...</p>
    </div>
  );
}}
""")
    
    # Edit page  
    edit_path = os.path.join(BASE, mod_key, '[id]', 'edit', 'page.tsx')
    os.makedirs(os.path.dirname(edit_path), exist_ok=True)
    with open(edit_path, 'w') as f:
        f.write(f"""'use client';

export default function Edit{type_name.replace(' ', '')}Page() {{
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit {type_name}</h1>
      <p className="text-gray-600">Implementation in progress...</p>
    </div>
  );
}}
""")

    # Details page
    details_path = os.path.join(BASE, mod_key, '[id]', 'page.tsx')
    with open(details_path, 'w') as f:
        f.write(f"""'use client';

export default function {type_name.replace(' ', '')}DetailsPage() {{
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{type_name} Details</h1>
      <p className="text-gray-600">Implementation in progress...</p>
    </div>
  );
}}
""")
    
    print(f'[OK] Created pages for {mod_key}')

print('[DONE] All placeholder pages created!')
