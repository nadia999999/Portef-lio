import java.util.*;

public class UniqueQueue<T> extends LinkedList<T> {

    private final Set<T> set;

    public UniqueQueue() {
        super();
        this.set = new HashSet<>();
    }

    @Override
    public boolean add(T t) {
        if (set.add(t))
            super.add(t);
        return true;
    }

    @Override
    public T poll() throws NoSuchElementException {
        T ret = super.poll();
        set.remove(ret);
        return ret;
    }

    @Override public boolean isEmpty() {
        return set.isEmpty();
    }

}

