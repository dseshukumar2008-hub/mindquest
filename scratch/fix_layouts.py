import os
import re

components_dir = r"e:\mind quest\src\components"
css_files = [
    "VisualTrapMemory.css",
    "MindMaze.css",
    "MemoryMatrix.css",
    "OneWrongTile.css",
    "PerfectTiming.css",
    "ReflexRush.css"
]

jsx_files = [
    "VisualTrapMemory.jsx",
    "MindMaze.jsx",
    "MemoryMatrix.jsx",
    "OneWrongTile.jsx",
    "PerfectTiming.jsx",
    "ReflexRush.jsx"
]

def fix_css(filename):
    path = os.path.join(components_dir, filename)
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remove position: fixed; inset: 0; from the main screen class
    # The main screen class usually ends with -screen
    content = re.sub(r'position:\s*fixed;\s*inset:\s*0;', '', content)
    content = re.sub(r'position:\s*fixed;\s*top:\s*0;\s*left:\s*0;\s*width:\s*100vw;\s*height:\s*100vh;', '', content)
    
    # Add padding-top to the main screen class
    # We'll look for the first class that has display: flex and flex-direction: column
    # Usually it's the first class in the file
    lines = content.split('\n')
    new_lines = []
    in_main_class = False
    for line in lines:
        if '-screen {' in line or '-container {' in line: # simplistic heuristic
            in_main_class = True
        if in_main_class and 'padding:' in line:
            # Replace existing padding with navbar padding
            line = re.sub(r'padding:.*?;', 'padding: 100px 24px 40px;', line)
            in_main_class = False # Only do it once for the main container
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    
    # Ensure min-height: 100vh and width: 100%
    # We'll just inject them into the first class if they are missing
    # But for now, let's be more specific with the ones we know
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def fix_jsx(filename):
    path = os.path.join(components_dir, filename)
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remove inline styles from HUDs
    content = re.sub(r'style=\{\{\s*background:\s*\'rgba\(255,255,255,0\.1\)\',\s*borderBottom:\s*\'2px solid rgba\(255,255,255,0\.2\)\',\s*padding:\s*\'20px 40px\'\s*\}\}', '', content)
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

for f in css_files:
    fix_css(f)

for f in jsx_files:
    fix_jsx(f)

print("Layout fixes applied to all games.")
