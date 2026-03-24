import os

def fix_file(path, old, new):
    if not os.path.exists(path):
        print(f"Skipping {path} (not found)")
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = content.replace(old, new)
    if content != new_content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {path}")
    else:
        # print(f"No changes for {path}")
        pass

files = [
    r'd:\Work\innovatebook-backend\commerce_routes.py',
    r'd:\Work\innovatebook-backend\lead_sop_complete.py',
    r'd:\Work\innovatebook-backend\finance_routes.py',
    r'd:\Work\innovatebook-backend\workforce_routes.py',
    r'd:\Work\innovatebook-backend\manufacturing_routes.py',
    r'd:\Work\innovatebook-backend\manufacturing_analytics.py',
    r'd:\Work\innovatebook-backend\manufacturing_routes_phase3.py',
    r'd:\Work\innovatebook-backend\manufacturing_automation_engine.py',
    r'd:\Work\innovatebook-backend\ib_capital_routes.py',
    r'd:\Work\innovatebook-backend\capital_routes.py'
]

for f in files:
    # Standardize decorators if still using old names
    fix_file(f, '@commerce_router.', '@router.')
    fix_file(f, '@lead_router.', '@router.')
    fix_file(f, '@manufacturing_router.', '@router.')
    
    # Fix NameError by replacing db. with get_db().
    # We use " await db." and " await  db." patterns to be safer, 
    # but in these files db is clearly a global and we want get_db().
    fix_file(f, 'await db.', 'await get_db().')
    fix_file(f, 'await  db.', 'await get_db().')
    
    # Also check for non-await usage in properties or models
    # Be careful not to replace local variables named db (rare in these files)
    # Most of these files define _db_instance and get_db() so db is likely the old global.
    fix_file(f, ' db.', ' get_db().')
    fix_file(f, '(db.', '(get_db().')
    fix_file(f, '=db.', '=get_db().')

print("Scan complete.")
