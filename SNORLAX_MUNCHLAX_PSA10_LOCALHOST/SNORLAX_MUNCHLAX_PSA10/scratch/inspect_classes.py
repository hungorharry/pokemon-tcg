import re

with open('SNORLAX_MUNCHLAX_PSA10_LOCALHOST/SNORLAX_MUNCHLAX_PSA10/index.html', encoding='utf-8') as f:
    html = f.read()

# Only search outside <style>
s_idx = html.find('</style>')
body_html = html[s_idx:]

classes = set(re.findall(r'class=["\']([^"\']+)["\']', body_html))
all_classes = set()
for c in classes:
    for item in c.split():
        all_classes.add(item)

print("Found classes in HTML body & JS:")
for c in sorted(all_classes):
    print(c)
