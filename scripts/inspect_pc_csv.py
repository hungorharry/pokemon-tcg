import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/backup/PRICECHARTING_CANDIDATES.csv', 'r', encoding='utf-8-sig') as f:
    for i in range(10):
        line = f.readline()
        if not line: break
        print(line.strip())
