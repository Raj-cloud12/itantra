import sys

with open('d:/itantra/frontend/src/pages/FieldUserDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

bad = """                      )}
                      </div>
                    </div>
                  );"""

good = """                      )}
                    </div>
                  );"""

if bad in content:
    with open('d:/itantra/frontend/src/pages/FieldUserDashboard.tsx', 'w', encoding='utf-8') as f:
        f.write(content.replace(bad, good))
    print("Fixed extra div")
else:
    print("Not found")
