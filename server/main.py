import csv
import json

with open('phas.csv') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

with open('phas.json', 'w') as f:
    json.dump(rows, f)