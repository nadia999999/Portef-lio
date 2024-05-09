import java.util.*;

public class Legionellosis {

    final Set<Integer>[] adjacencies;
    final Location[] sick;
    final int nsick;
    final int nlocations;

    public Legionellosis(Set<Integer>[] adjacencies, Location[] sick, int nlocations) {
        this.adjacencies = adjacencies;
        this.sick = sick;
        this.nsick = sick.length;
        this.nlocations = nlocations;
    }

    Set<Integer> solve() {
        int[] sickCounter = new int[nlocations];
        SortedSet<Integer> perilousLocations = new TreeSet<>();

        for(Location location: sick){
            UniqueQueue<Location> frontier = new UniqueQueue<>();
            Set<Integer> explored = new HashSet<>();

            int home = location.index;
            int maxDistance = location.distance;

            frontier.add(new Location(home,0));

            while (!frontier.isEmpty()) {
                Location currentLocation = frontier.poll();
                explored.add(currentLocation.index);

                sickCounter[currentLocation.index] += 1;

                if (sickCounter[currentLocation.index]==nsick)
                    perilousLocations.add(currentLocation.index);

                if(adjacencies[currentLocation.index]!=null)
                    for (Integer adj : adjacencies[currentLocation.index]) {
                        int newDistance = currentLocation.distance+1;
                        if(newDistance <= maxDistance && !explored.contains(adj)) {
                            frontier.add(new Location(adj, newDistance));
                        }
                    }
            }
        }

        return perilousLocations;
    }

}
