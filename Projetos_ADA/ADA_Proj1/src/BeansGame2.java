	import java.util.Optional;

	public class BeansGame2 {

	    private final int npiles;
	    private final int gamedepth;
	    private final int[] piles;
	    private final boolean firstJaba;

	    private final int[][] beans;
	    private final int[][] pietonMoves;

	    private final int[][] jabaScore;

	    public BeansGame2(int npiles, int gamedepth, int[] piles, boolean firstJaba) {
	        this.npiles = npiles;
	        this.gamedepth = gamedepth;
	        this.piles = piles;
	        this.firstJaba = firstJaba;

	        this.beans = new int[npiles][npiles];
	        this.pietonMoves = new int[npiles][npiles];

	        this.jabaScore = new int[npiles][npiles];
	    }

	    public int solve() {
	        computeBeanPilesSums();
	        if(gamedepth > 1) computePietonMoves();

	        for (int i=0; i<npiles; i++)
	            jabaScore[i][i] =  piles[i];

	        for(int i=npiles-2; i>=0; i--)
	            for(int j=i+1; j<npiles; j++)
	                jabaScore[i][j] = computeJabaScore(i,j);

	        if(firstJaba)
	            return getJabaScore(0, npiles - 1);
	        else
	            return getJabaScoreAfterPietonTurn(0, npiles - 1);
	    }

	    private int computeJabaScore(final int str, final int end) {
	        int depth = Math.min(gamedepth-1, end-str);

	        Integer jabaScore = null;
	        for(int i = 0; i<=depth; i++) {
	            int leftJabaScore = getBeans(str,str+i) + getJabaScoreAfterPietonTurn(str+i+1, end);
	            int rightJabaScore = getBeans(end-i,end) + getJabaScoreAfterPietonTurn(str, end-i-1);

	            int maxScore = Math.max(leftJabaScore,rightJabaScore);

	            if(jabaScore == null || maxScore > jabaScore) {
	                jabaScore = maxScore;
	            }
	        }

	        return Optional.ofNullable(jabaScore).orElse(0);
	    }

	    private int getJabaScoreAfterPietonTurn(final int str, final int end) {
	        if(str>=end) return 0;

	        final int pietonMoveLeftSide = pietonMoves[str][end];
	        final int pietonMoveRightSide = pietonMoves[end][str];

	        final int beansTakenLeftSide = getBeans(str,str+pietonMoveLeftSide);
	        final int beansTakenRightSide = getBeans(end-pietonMoveRightSide, end);

	        if(beansTakenLeftSide >= beansTakenRightSide)
	            return getJabaScore(str + (pietonMoveLeftSide + 1), end);
	        else
	            return getJabaScore(str, end - (pietonMoveRightSide + 1));
	    }

	    private int getJabaScore(int str, int end) {
	        if(str>end || end>(npiles-1) || str<0)
	            return 0;
	        else
	            return jabaScore[str][end];
	    }

	    private void computeBeanPilesSums() {
	        for(int i=0; i<npiles; i++) {
	            for(int j=i; j<npiles; j++) {
	                if(i==j)
	                    beans[i][j] = piles[i];
	                else
	                    beans[i][j] = beans[i][j-1] + piles[j];
	            }
	        }
	    }

	    private int getBeans(int str, int end) {
	        if(str>end || end>(npiles-1) || str<0) return 0;
	        return beans[str][end];
	    }

	    private void computePietonMoves() {
	        for (int i = npiles-2; i>=0; i--) {
	            for (int j=i+1; j<npiles; j++) {
	                final int depth = Math.min(gamedepth-1, j-i);

	                int beansInAllLeftSidePiles = getBeans(i,i+depth);
	                int beansInAllRightSidePiles = getBeans(j-depth, j);

	                int leftSideMoveOnLowerDepth = pietonMoves[i][i+(depth-1)];
	                int leftSideMaxBeansOnLowerDepth = getBeans(i, i + leftSideMoveOnLowerDepth);

	                if(leftSideMaxBeansOnLowerDepth >= beansInAllLeftSidePiles)
	                    pietonMoves[i][j] = leftSideMoveOnLowerDepth;
	                else
	                    pietonMoves[i][j] = depth;

	                int rightSideMoveOnLowerDepth = pietonMoves[j][j-(depth-1)];
	                int rightSideMaxBeansOnLowerDepth = getBeans(j - rightSideMoveOnLowerDepth, j);

	                if(rightSideMaxBeansOnLowerDepth >= beansInAllRightSidePiles)
	                    pietonMoves[j][i] = rightSideMoveOnLowerDepth;
	                else
	                    pietonMoves[j][i] = depth;
	            }
	        }
	    }
	}
