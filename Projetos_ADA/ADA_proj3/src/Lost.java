import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Lost {

    char[][] island;
    int[][] wheels;
    int johnLine;
    int johnColumn;
    int kateLine;
    int kateColumn;

    int nLines;
    int nColumns;

    public Lost(char[][] island, int[][] wheels, int johnLine, int johnColumn, int kateLine, int kateColumn) {
        this.island = island;
        this.wheels = wheels;
        this.johnLine = johnLine;
        this.johnColumn = johnColumn;
        this.kateLine = kateLine;
        this.kateColumn = kateColumn;
        this.nLines = island.length;
        this.nColumns = island[0].length;
    }

    private Integer getNeighbourPosition(int vertexPosition, int direction) {
        int line = vertexPosition / nColumns;
        int column = vertexPosition - line * nColumns;
        switch (direction) {
            case 0: { //North
                if (line == 0) return null;
                line--;
                break;
            }
            case 1: { //West
                if (column == 0) return null;
                column--;
                break;
            }
            default: throw new RuntimeException("Invalid Direction: " + direction);
        }

        return column + line * nColumns;
    }

    public static class PositionData {
        public enum Type {
            WATER, GRASS, EXIT, OBSTACLE, WHEEL
        }

        Integer weight;
        Type type;

        public PositionData(Type type) {
            this.type = type;
            switch (type) {
                case GRASS:
                case WHEEL:
                    weight = 1;
                    break;
                case WATER:
                    weight = 2;
                    break;
                case EXIT:
                case OBSTACLE:
                    weight = null;
                    break;
            }
        }

        public static PositionData of(char type) {
            switch (type) {
                case 'O':
                    return new PositionData(Type.OBSTACLE);
                case 'W':
                    return new PositionData(Type.WATER);
                case 'X':
                    return new PositionData(Type.EXIT);
                case 'G':
                    return new PositionData(Type.GRASS);
                default:
                    return new PositionData(Type.WHEEL);
            }
        }
    }

    private PositionData getPosData(int vertexPosition) {
        int line = vertexPosition / nColumns;
        int column = vertexPosition - line * nColumns;
        return PositionData.of(island[line][column]);
    }

    public static class Problem {
        public final List<Edge> edges;
        public final int nVertices;
        public final Integer start;
        public final Integer exit;

        public Problem(List<Edge> edges, int nVertices, Integer start, Integer exit) {
            this.edges = edges;
            this.nVertices = nVertices;
            this.start = start;
            this.exit = exit;
        }
    }

    private Problem parseJohnProblem() {

        Map<Integer,Integer> vertexPositionToId = new HashMap<>(nLines*nColumns);
        List<Edge> edges = new ArrayList<>();
        int vertexCounter = 0;
        Integer exit = null;

        List<Integer[]> wheelIndexAndPosition = new ArrayList<>(wheels.length);

        for(int l=0; l<nLines; l++) {
            for(int c=0; c<nColumns; c++) {
                int currentPosition = c + nColumns*l;
                PositionData dataCurrent = getPosData(currentPosition);

                switch(dataCurrent.type) {
                    case WATER:
                    case OBSTACLE:
                        continue;
                    case EXIT:
                        exit = vertexCounter;
                }

                int indexCurrent = vertexCounter++;
                vertexPositionToId.put(currentPosition, indexCurrent);

                for(int i=0; i<2; i++){
                    Integer neighbourPosition = getNeighbourPosition(currentPosition, i);
                    if (neighbourPosition!=null) {
                        PositionData dataNeighbour = getPosData(neighbourPosition);

                        switch (dataNeighbour.type) {
                            case OBSTACLE:
                            case WATER:
                                continue;
                        }

                        int indexNeighbour = vertexPositionToId.get(neighbourPosition);

                        if(dataCurrent.type != PositionData.Type.EXIT)
                            edges.add(new Edge(indexCurrent, indexNeighbour, dataCurrent.weight));

                        if(dataNeighbour.type != PositionData.Type.EXIT)
                            edges.add(new Edge(indexNeighbour, indexCurrent, dataNeighbour.weight));
                    }
                }

                if(dataCurrent.type == PositionData.Type.WHEEL) {
                    int wheelIndex = -1 + Integer.parseInt(String.valueOf(island[l][c]));
                    wheelIndexAndPosition.add(new Integer[]{wheelIndex,currentPosition});
                }
            }
        }

        for (Integer[] w : wheelIndexAndPosition) {
            int[] wheelLineColumnWeight = wheels[w[0]];
            int v0 = vertexPositionToId.get(w[1]);
            int v1 = vertexPositionToId.get(wheelLineColumnWeight[1] + nColumns*wheelLineColumnWeight[0]);
            edges.add(new Edge(v0, v1, wheelLineColumnWeight[2]));
        }

        int startPosition = johnColumn + nColumns*johnLine;
        Integer start = vertexPositionToId.get(startPosition);

        return new Problem(edges, vertexCounter, start, exit);
    }

    private Problem parseKateProblem() {

        Map<Integer,Integer> vertexPositionToId = new HashMap<>(nLines*nColumns);
        List<Edge> edges = new ArrayList<>();
        int vertexCounter = 0;
        Integer exit = null;

        for(int l=0; l<nLines; l++) {
            for(int c=0; c<nColumns; c++) {
                int currentPosition = c + nColumns*l;
                PositionData dataCurrent = getPosData(currentPosition);

                switch(dataCurrent.type) {
                    case OBSTACLE:
                        continue;
                    case EXIT:
                        exit = vertexCounter;
                }

                int indexCurrent = vertexCounter++;
                vertexPositionToId.put(currentPosition, indexCurrent);

                for(int i=0; i<2; i++){
                    Integer neighbourPosition = getNeighbourPosition(currentPosition, i);
                    if (neighbourPosition!=null) {
                        PositionData dataNeighbour = getPosData(neighbourPosition);

                        if (dataNeighbour.type == PositionData.Type.OBSTACLE) {
                            continue;
                        }

                        int indexNeighbour = vertexPositionToId.get(neighbourPosition);

                        if(dataCurrent.type != PositionData.Type.EXIT)
                            edges.add(new Edge(indexCurrent, indexNeighbour, dataCurrent.weight));

                        if(dataNeighbour.type != PositionData.Type.EXIT)
                            edges.add(new Edge(indexNeighbour, indexCurrent, dataNeighbour.weight));
                    }
                }
            }
        }

        int startPosition = kateColumn + nColumns*kateLine;
        Integer start = vertexPositionToId.get(startPosition);

        return new Problem(edges, vertexCounter, start, exit);
    }

    public String[] solve() {
        Problem problem = parseJohnProblem();
        BellmanFord solver = new BellmanFord(problem.edges, problem.nVertices);
        String johnScore = solver.findShortestDistancesFrom(problem.start, problem.exit);

        problem = parseKateProblem();
        solver = new BellmanFord(problem.edges, problem.nVertices);
        String kateScore = solver.findShortestDistancesFrom(problem.start, problem.exit);

        return new String[]{johnScore,kateScore};
    }
}