import matplotlib.pyplot as plt
import networkx as nx
import csv

with open("../adjacencyList/javaScript/javaScript.csv") as f:
	edges = [r for r in csv.reader(f)]

g = nx.DiGraph()
for a, b in edges:
	g.add_edge(a, b)

for node in g.nodes:
	for _, to in g.edges(node):
		g[node][to]["weight"] = (g.out_degree(node) - g.in_degree(node)) - (g.out_degree(to) - g.in_degree(to))

g = nx.minimum_spanning_tree(g.to_undirected())

# make 25 clusters
for a, b, _ in sorted(g.edges(data=True), key=lambda edge: edge[2]["weight"])[:25]:
	g.remove_edge(a, b)

# pos = nx.spring_layout(g)
# nx.draw_networkx(g, pos, node_size=25, font_size=6)
# nx.draw_networkx_edge_labels(g, pos, font_size=3, edge_labels={(a, b): g[a][b]["weight"] for a, b in g.edges})
# plt.show()

with open("cluster_edges.csv", "w") as f:
	writer = csv.writer(f)
	writer.writerows((a, b) for a, b in g.edges)