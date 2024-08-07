import csv
import sys
fname = "asteroids.csv"
rows = []
with open(fname, "r") as f:
    csvreader = csv.reader(f)
    fields = next(csvreader)
    for row in csvreader:
        rows.append(row)

x = []
for row in rows[:2000]:
    x.append(row)

with open("n.txt", "w") as f:
    sys.stdout = f
    print(x)
