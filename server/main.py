import csv
import json

with open('asteroids.csv') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

with open('asteroids.json', 'w') as f:
    json.dump(rows, f)