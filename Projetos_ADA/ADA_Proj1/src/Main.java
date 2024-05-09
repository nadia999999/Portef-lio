import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Main {

    public static void main(String[] args) throws NumberFormatException, IOException {

        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));

        int ngames = Integer.parseInt(in.readLine());

        BeansGame2[] games = new BeansGame2[ngames];

        for(int i=0; i<ngames; i++) {
            String[] line1 = in.readLine().split(" ");
            int npiles = Integer.parseInt(line1[0]);
            int gamedepth = Integer.parseInt(line1[1]);

            String[] line2 = in.readLine().split(" ");
            int[] piles = new int[npiles];
            for(int j=0; j < npiles; j++) {
                piles[j] = Integer.parseInt(line2[j]);
            }

            boolean firstJaba = in.readLine().equals("Jaba");

            games[i] = new BeansGame2(npiles,gamedepth,piles,firstJaba);
        }

        for (BeansGame2 game : games) {
            System.out.println(game.solve());
        }
    }
}

