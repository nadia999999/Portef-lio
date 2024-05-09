import java.util.List;

public class BellmanFord {

    public int nVertices, nEdges;
    public List<Edge> edges;

    public BellmanFord(List<Edge> edges, int nVertices)
    {
        this.nVertices = nVertices;
        this.nEdges = edges.size();
        this.edges = edges;
    }

    public String findShortestDistancesFrom(Integer source, Integer destination)
    {
        if(source == null || destination == null)
            return "Unreachable";

        int[] distances = new int[nVertices];

        for (int i = 0; i < nVertices; i++)
            distances[i] = Integer.MAX_VALUE;
        distances[source] = 0;

        for (int i = 1; i < nVertices; i++) {
            boolean noChanges = true;
            for (int j = 0; j < nEdges; j++) {
                Edge edge = edges.get(j);
                if (distances[edge.src] != Integer.MAX_VALUE && distances[edge.src] + edge.weight < distances[edge.dest]) {
                    noChanges = false;
                    distances[edge.dest] = distances[edge.src] + edge.weight;
                }
            }
            if(noChanges) break;
        }

        for (int j = 0; j < nEdges; ++j) {
            Edge edge = edges.get(j);
            if (distances[edge.src] != Integer.MAX_VALUE && distances[edge.src] + edge.weight < distances[edge.dest]) {
                return "Lost in Time";
            }
        }

        if(distances[destination]==Integer.MAX_VALUE)
            return "Unreachable";

        return String.valueOf(distances[destination]);
    }
}


