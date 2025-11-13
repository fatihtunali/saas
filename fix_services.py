import re
import os

# Define all service modules to fix
modules = [
    'entrance-fees', 'extras', 'guides', 'hotels', 'restaurants', 'suppliers',
    'tour-companies', 'transfer-routes', 'vehicle-companies', 'vehicle-rentals', 'vehicle-types'
]

base_path = 'frontend/src/app/(dashboard)/dashboard/services'

# Property mapping
PROPERTY_MAP = {
    'site_name': 'siteName', 'supplier_id': 'supplierId', 'city_id': 'cityId',
    'adult_price': 'adultPrice', 'child_price': 'childPrice', 'student_price': 'studentPrice',
    'senior_price': 'seniorPrice', 'opening_hours': 'openingHours', 'best_visit_time': 'bestVisitTime',
    'picture_url': 'pictureUrl', 'is_active': 'isActive', 'guide_name': 'guideName',
    'phone_number': 'phoneNumber', 'daily_rate': 'dailyRate', 'hotel_name': 'hotelName',
    'star_rating': 'starRating', 'contact_person': 'contactPerson', 'contact_email': 'contactEmail',
    'contact_phone': 'contactPhone', 'restaurant_name': 'restaurantName', 'cuisine_type': 'cuisineType',
    'supplier_name': 'supplierName', 'supplier_type': 'supplierType', 'company_name': 'companyName',
    'tax_number': 'taxNumber', 'tax_office': 'taxOffice', 'from_city_id': 'fromCityId',
    'to_city_id': 'toCityId', 'base_price': 'basePrice', 'vehicle_type': 'vehicleType',
    'rental_company_id': 'rentalCompanyId', 'model_name': 'modelName', 'type_name': 'typeName',
    'max_capacity': 'maxCapacity', 'extra_name': 'extraName', 'extra_type': 'extraType',
    'unit_price': 'unitPrice', 'description': 'description', 'email': 'email', 'address': 'address',
    'website': 'website', 'notes': 'notes', 'currency': 'currency'
}

def fix_view_page(filepath):
    if not os.path.exists(filepath):
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    var_match = re.search(r'const \{ data: (\w+), isLoading \} = use\w+\(', content)
    if not var_match:
        return False
    
    var_name = var_match.group(1)
    
    for snake, camel in PROPERTY_MAP.items():
        content = re.sub(rf'{var_name}\.{snake}', f'{var_name}.data.{camel}', content)
    
    content = re.sub(rf'{var_name}\.city\.city_name', f'{var_name}.data.city?.cityName', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed VIEW: {filepath}")
        return True
    return False

def fix_edit_page(filepath):
    if not os.path.exists(filepath):
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    var_match = re.search(r'const \{ data: (\w+), isLoading \} = use\w+\(', content)
    if not var_match:
        return False
    
    var_name = var_match.group(1)
    
    content = re.sub(
        rf'if \({var_name}\) \{{\s*const formData = \{{',
        f'if ({var_name}?.data) {{\n      const itemData = {var_name}.data;\n      const formData = {{',
        content
    )
    
    for snake, camel in PROPERTY_MAP.items():
        content = re.sub(rf'itemData\.{snake}', f'itemData.{camel}', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed EDIT: {filepath}")
        return True
    return False

def fix_list_page(filepath):
    if not os.path.exists(filepath):
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    for snake, camel in PROPERTY_MAP.items():
        content = re.sub(rf"accessorKey: '{snake}'", f"accessorKey: '{camel}'", content)
        content = re.sub(rf'row\.original\.{snake}', f'row.original.{camel}', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed LIST: {filepath}")
        return True
    return False

print("Fixing service modules...")
for module in modules:
    print(f"\n{module}:")
    module_path = os.path.join(base_path, module)
    fix_list_page(os.path.join(module_path, 'page.tsx'))
    fix_edit_page(os.path.join(module_path, '[id]', 'edit', 'page.tsx'))
    fix_view_page(os.path.join(module_path, '[id]', 'page.tsx'))

print("\nDone!")
