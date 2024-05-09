import java.util.Objects;

public class  Location {
    public int index;
    public int distance;

    public Location(int index, int distance) {
        this.index = index;
        this.distance = distance;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Location location = (Location) o;
        return index == location.index;
    }

    @Override
    public int hashCode() {
        return Objects.hash(index);
    }

    @Override
    public String toString() {
        return "Location{" +
                "index=" + index +
                ", distance=" + distance +
                '}';
    }
}


