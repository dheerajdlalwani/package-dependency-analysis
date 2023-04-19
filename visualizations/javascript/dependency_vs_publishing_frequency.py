import matplotlib.pyplot as plt
from datetime import datetime
import json
import csv

with open("../adjacencyList/javaScript/javaScript.csv") as f:
	edges = [r for r in csv.reader(f)]

with open("../data/javaScript/packages-data.json", encoding="utf-8") as f:
	time_data = json.loads(f.read())

data = {}
for package, _ in edges:
	if package not in data:
		data[package] = {"dependencies": 0, "versions": 1}
	data[package]["dependencies"] += 1

for package, package_data in time_data.items():
	versions = {}
	version_dict = dict(package_data["time"])
	version_dict |= package_data.get("unpublished", {})
	for version, timestamp in version_dict.items():
		if version in {"created", "modified", "maintainers", "unpublished"}:
			continue
		timestamp = str(timestamp)[:-2]
		if "." not in timestamp:
			timestamp += ".0"
		versions[version] = datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%S.%f")
	if package not in data:
		data[package] = {"dependencies": 0}
	data[package]["versions"] = len(versions)

data_values = [v for v in data.values() if v["dependencies"] <= 20 and v["versions"] < 250]
plt.scatter(
	[d["dependencies"] for d in data_values],
	[d["versions"] for d in data_values],
	color="grey",
	alpha=0.2,
	s=10
)
plt.xlabel("number of dependencies")
plt.ylabel("number of versions")
plt.show()