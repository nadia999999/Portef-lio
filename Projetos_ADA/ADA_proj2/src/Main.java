import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;

public class Main {

    public static void main(String[] args) throws NumberFormatException, IOException {

        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String[] line;

        line = in.readLine().split(" ");
        int nlocations = Integer.parseInt(line[0]);
        int nconnections = Integer.parseInt(line[1]);

        @SuppressWarnings("unchecked")
        Set<Integer>[] adjacencies = new Set[nlocations];

        if(nconnections==0) {
            adjacencies[0] = new HashSet<>();
        }

        for(int i=0; i<nconnections; i++) {
            line = in.readLine().split(" ");
            int location0 = Integer.parseInt(line[0])-1;
            int location1 = Integer.parseInt(line[1])-1;

            if(adjacencies[location0] == null)
                adjacencies[location0] = new HashSet<>();

            if(adjacencies[location1] == null)
                adjacencies[location1] = new HashSet<>();

            adjacencies[location0].add(location1);
            adjacencies[location1].add(location0);
        }

        final int nsick = Integer.parseInt(in.readLine());

       Location[] sick = new Location[nsick];

        for (int i=0; i<nsick; i++) {
            line = in.readLine().split(" ");
            int home = Integer.parseInt(line[0])-1;
            int distance = Integer.parseInt(line[1]);
            sick[i] = new Location(home,distance);
        }

        Set<Integer> perilousLocations = new Legionellosis(adjacencies,sick,nlocations).solve();

        if(perilousLocations.isEmpty())
            System.out.println(0);
        else {
            StringJoiner joiner = new StringJoiner(" ");
            for (Integer location : perilousLocations) {
                location++;
                joiner.add(location.toString());
            }
            System.out.println(joiner);
        }
    }
}

/*

16 18
6 8
7 3
16 15
12 14
13 12
2 1
13 15
11 12
6 2
10 11
4 7
5 6
1 5
3 4
3 2
9 10
9 8
8 7
3
3 3
6 2
11 3

16 20
6 8
8 6
7 3
16 15
12 14
13 12
2 1
13 15
11 12
6 2
2 6
10 11
4 7
5 6
1 5
3 4
3 2
9 10
9 8
8 7
3
3 3
6 2
11 3

16 18
15 16
2 6
5 1
3 7
12 13
3 2
4 3
10 9
12 11
8 6
7 8
13 15
9 8
14 12
4 7
6 5
2 1
10 11
3
6 2
11 1
3 3

3 2
1 2
2 3
3
1 10
1 2
1 5

2 1
1 2
2
1 1
2 1

3 2
1 2
2 3
3
1 10
1 2
1 5

1 3
1 1
1 1
1 1
1
1 1

3 2
3 2
2 3
3
1 1
1 1
1 1

3 2
2 3
3 2
1
1 1

5 2
1 4
5 4
2
1 5
5 10

5 4
5 4
4 3
3 2
2 1
3
5 10
3 10
1 10

 */