
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;

public class Main {

    public static void main(String[] args) throws NumberFormatException, IOException {

        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));

        int ncases = Integer.parseInt(in.readLine());

        String[] johnScores = new String[ncases];
        String[] kateScores = new String[ncases];

        for(int i=0; i<ncases; i++) {
            String[] line = in.readLine().split(" ");
            int lines = Integer.parseInt(line[0]);
            int columns = Integer.parseInt(line[1]);
            int nwheels = Integer.parseInt(line[2]);

            char[][] island = new char[lines][columns];
            for(int l=0; l<lines; l++) {
                String line2 = in.readLine();
                for(int c=0; c<columns; c++) {
                    island[l][c] = line2.charAt(c);
                }
            }

            int[][] wheels = new int[nwheels][3];
            for (int w =0; w<nwheels; w++) {
                line = in.readLine().split(" ");
                wheels[w][0] = Integer.parseInt(line[0]);
                wheels[w][1] = Integer.parseInt(line[1]);
                wheels[w][2] = Integer.parseInt(line[2]);
            }

            line = in.readLine().split(" ");
            int johnPosX = Integer.parseInt(line[0]);
            int johnPosY = Integer.parseInt(line[1]);
            int katePosX = Integer.parseInt(line[2]);
            int katePosY = Integer.parseInt(line[3]);

            Lost problem = new Lost(island, wheels, johnPosX, johnPosY, katePosX, katePosY);
            String[] solution = problem.solve();

            johnScores[i] = solution[0];
            kateScores[i] = solution[1];
        }

        for(int i=0; i<ncases; i++) {
            System.out.println("Case #" + (i+1));
            System.out.println("John " + johnScores[i]);
            System.out.println("Kate " + kateScores[i]);
        }
    }
}

/*
1
3 3 0
XWW
WWW
WWW
0 0 0 0
1
3 4 2
2WW1
GOOO
GGXO
0 0 0
0 3 0
0 3 0 3
4
6 5 1
WWWWW
WGG1W
WGOGW
WGOGW
WGXGW
WWWWW
4 2 -4
1 1 1 2
5 5 0
WWWWW
WGGXW
WGOGW
WGOGW
WWWWW
3 1 3 1
5 5 0
WWWWW
WGOGW
WOOGW
WGGXW
WWWWW
1 1 1 1
5 5 1
WWWWW
W1GGW
WGGGW
WGGXW
WWWWW
1 2 -3
1 2 2 1
 */

