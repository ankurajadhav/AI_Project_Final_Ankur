/**
 * Structured Taxonomy of Common Student Misconceptions
 * 
 * Formal cognitive error repository cataloging widespread conceptual fallacies,
 * sign inversions, algorithmic boundary mistakes, and misapplied formulas across
 * Mathematics, Computer Science, and AI & Data Science.
 * 
 * Every record provides:
 * - Unique ID & Name
 * - Relevant Subject & Concept Mapping
 * - Clear explanation of the underlying misconception
 * - Representative incorrect answer / reasoning pattern
 * - Correct mathematical / algorithmic explanation
 * - Concrete contrasting example
 * - Appropriate corrective feedback & pedagogical recommendation
 * - Associated question IDs in the question bank
 */

import { MisconceptionItem } from '../types';

export const MISCONCEPTION_TAXONOMY: MisconceptionItem[] = [
  // ==========================================
  // MATHEMATICS MISCONCEPTIONS
  // ==========================================
  {
    id: 'MISC_QUAD_DISCRIMINANT_SIGN',
    name: 'Discriminant Sign Inversion (b² + 4ac)',
    description: 'Student mistakenly writes Δ = b² + 4ac instead of b² - 4ac, which alters the sign of the determinant and leads to false root characterization.',
    subject: 'Mathematics',
    conceptId: 'C1_Quadratic_Equations',
    conceptName: 'Quadratic Equations',
    representativeIncorrectAnswer: 'Δ = b² + 4ac; roots are real because Δ > 0.',
    correctExplanation: 'The discriminant derived from completing the square is strictly Δ = b² - 4ac. When Δ > 0 there are two distinct real roots, when Δ = 0 there is one repeated real root, and when Δ < 0 there are two complex conjugate roots.',
    example: 'For equation x² + 2x + 5 = 0: Correct Δ = 4 - 20 = -16 (two complex conjugate roots). Erroneous calculation Δ = 4 + 20 = 24 (erroneously claims 2 distinct real roots).',
    correctiveFeedback: 'Remember that in completing the square, the term -4ac arises from subtracting c/a. The discriminant formula must always be b² - 4ac.',
    relatedQuestionIds: ['q_quad_02'],
  },
  {
    id: 'MISC_QUAD_COMPLEX_ROOTS_REAL_PLANE',
    name: 'Confusing Complex Roots with Real Axis Intercepts',
    description: 'Belief that quadratic equations with negative discriminants have real roots that "cannot be graphed" or touch the origin.',
    subject: 'Mathematics',
    conceptId: 'C1_Quadratic_Equations',
    conceptName: 'Quadratic Equations',
    representativeIncorrectAnswer: 'The parabola intersects the x-axis at 0 because negative roots evaluate to zero in real numbers.',
    correctExplanation: 'When Δ < 0, the parabola sits entirely above (if a > 0) or below (if a < 0) the horizontal x-axis without ever intersecting it. The equation has no real roots; its roots exist strictly as a complex conjugate pair a ± bi in the complex plane ℂ.',
    example: 'For y = x² + 1, setting y = 0 yields x² = -1. The parabola has its vertex at (0, 1) and never touches the x-axis. Roots are ±i, not real 0.',
    correctiveFeedback: 'Visualize the parabola graph: if Δ < 0, the curve never crosses the horizontal x-axis. Roots are complex conjugate numbers a ± bi.',
    relatedQuestionIds: ['q_quad_02', 'q_quad_04'],
  },
  {
    id: 'MISC_QUAD_ROOT_SIGN_FLIP',
    name: 'Root Factoring Sign Inversion ((x - r) = 0)',
    description: 'Failing to invert the sign when moving from factored form (x - a)(x - b) = 0 to root values, claiming roots are -a and -b.',
    subject: 'Mathematics',
    conceptId: 'C1_Quadratic_Equations',
    conceptName: 'Quadratic Equations',
    representativeIncorrectAnswer: 'Factoring gives (x - 2)(x - 3) = 0, so the roots are x = -2 and x = -3.',
    correctExplanation: 'By the Zero Product Property, if (x - r) = 0, then adding r to both sides gives the root x = +r. The signs inside the parentheses must flip when solving for x.',
    example: 'In x² - 5x + 6 = (x - 2)(x - 3) = 0, setting x - 2 = 0 yields x = +2, and x - 3 = 0 yields x = +3. Claiming x = -2, -3 is a sign slip.',
    correctiveFeedback: 'Always write out the intermediate zero product step: set each factor equal to zero (x - a = 0) and isolate x to get x = +a.',
    relatedQuestionIds: ['q_quad_03'],
  },
  {
    id: 'MISC_MATRIX_MULTIPLICATION_COMMUTATIVITY',
    name: 'Assuming Matrix Multiplication is Commutative (AB = BA)',
    description: 'Treating matrix products as commutative like scalar algebra, assuming that AB = BA for any square matrices A and B.',
    subject: 'Mathematics',
    conceptId: 'C2_Linear_Algebra',
    conceptName: 'Linear Algebra',
    representativeIncorrectAnswer: 'Since AB = C, then BA must also equal C.',
    correctExplanation: 'Matrix multiplication corresponds to functional composition of linear transformations. In general, order of transformation composition matters; AB ≠ BA in almost all cases unless matrices share a common eigenbasis or one is a scalar multiple of I.',
    example: 'For A = [[1, 2], [0, 1]] and B = [[2, 0], [1, 3]], AB = [[4, 6], [1, 3]] whereas BA = [[2, 4], [1, 5]]. Clearly AB ≠ BA.',
    correctiveFeedback: 'Matrix multiplication represents compositions of linear transformations. In general, order of composition matters; AB ≠ BA in almost all cases.',
    relatedQuestionIds: ['q_la_02'],
  },
  {
    id: 'MISC_CALCULUS_CHAIN_RULE_OMISSION',
    name: 'Chain Rule Inner Derivative Omission',
    description: 'Differentiating composite functions f(g(x)) as f\'(g(x)) while forgetting to multiply by the inner derivative g\'(x).',
    subject: 'Mathematics',
    conceptId: 'C3_Calculus_Basics',
    conceptName: 'Calculus Basics',
    representativeIncorrectAnswer: 'd/dx (sin(3x²)) = cos(3x²)',
    correctExplanation: 'The chain rule states d/dx [f(g(x))] = f\'(g(x)) · g\'(x). Differentiating the outer function f with respect to g(x) is only the first step; you must always multiply by the instantaneous rate of change of the inner function g\'(x).',
    example: 'For f(x) = (3x² - 5)⁴, writing 4(3x² - 5)³ omits the inner derivative d/dx(3x² - 5) = 6x. The correct derivative is 24x(3x² - 5)³.',
    correctiveFeedback: 'Always apply the chain rule formula: d/dx [f(g(x))] = f\'(g(x)) · g\'(x). Identify the "inner" function first and compute its derivative before multiplying.',
    relatedQuestionIds: ['q_calc_02'],
  },
  {
    id: 'MISC_PROB_INDEPENDENCE_MUTUALLY_EXCLUSIVE',
    name: 'Confusing Mutually Exclusive with Independent Events',
    description: 'Believing that if two non-empty events cannot happen at the same time (P(A ∩ B) = 0), they are independent.',
    subject: 'Mathematics',
    conceptId: 'C4_Probability_Statistics',
    conceptName: 'Probability & Statistics',
    representativeIncorrectAnswer: 'Events A and B cannot occur together, so knowing A happened gives no information about B; therefore they are independent.',
    correctExplanation: 'Statistical independence requires P(A ∩ B) = P(A) · P(B). If non-empty events are mutually exclusive, P(A ∩ B) = 0. Since P(A) · P(B) > 0 ≠ 0, mutually exclusive events are actually maximally dependent: knowing A occurred guarantees B cannot occur!',
    example: 'If A = rolling a 2 and B = rolling a 3 on a fair die: P(A ∩ B) = 0. But P(A) · P(B) = 1/6 · 1/6 = 1/36 ≠ 0. If you observe A, P(B|A) drops to 0, proving strong dependence.',
    correctiveFeedback: 'Independence requires P(A ∩ B) = P(A) · P(B). If events are mutually exclusive, P(A ∩ B) = 0, which cannot equal P(A)P(B) unless one event has probability zero.',
    relatedQuestionIds: ['q_prob_01'],
  },
  {
    id: 'MISC_DISCRETE_CONTRAPOSITIVE_CONVERSE',
    name: 'Equating the Converse with the Contrapositive (P → Q vs Q → P)',
    description: 'Assuming that an implication P → Q is logically equivalent to its converse Q → P, rather than its contrapositive ¬Q → ¬P.',
    subject: 'Mathematics',
    conceptId: 'C5_Discrete_Math',
    conceptName: 'Discrete Mathematics',
    representativeIncorrectAnswer: 'If n is divisible by 4 then n is even; therefore if n is even then n must be divisible by 4.',
    correctExplanation: 'An implication P → Q is logically equivalent only to its contrapositive (¬Q → ¬P). The converse (Q → P) is a distinct claim and can be false while P → Q is true.',
    example: '6 is an even integer (Q is true), but 6 is not divisible by 4 (P is false). Thus Q → P fails, while the contrapositive "if n is odd, then n is not divisible by 4" is completely valid.',
    correctiveFeedback: 'To form the contrapositive, you must both negate AND swap: P → Q becomes ¬Q → ¬P. Never assume the converse Q → P holds without independent proof.',
    relatedQuestionIds: ['q_disc_01'],
  },

  // ==========================================
  // COMPUTER SCIENCE MISCONCEPTIONS
  // ==========================================
  {
    id: 'MISC_BST_DELETION_LEAF_CONFUSION',
    name: 'Two-Child BST Deletion Child-Swap Error',
    description: 'Attempting to delete a node with two children by directly pulling up its left or right child, which violates the BST ordering invariant.',
    subject: 'Computer Science',
    conceptId: 'C4_Binary_Search_Trees',
    conceptName: 'Binary Search Trees',
    representativeIncorrectAnswer: 'Simply replace the deleted node with its right child and attach the left child somewhere below.',
    correctExplanation: 'To delete a node with two children, you must replace its key with either its in-order successor (the minimum node in its right subtree) or its in-order predecessor (maximum in left subtree), then recursively delete that successor node which has at most one child.',
    example: 'Deleting root 10 with left subtree [5, 7] and right subtree [15, 12]: promoting 15 directly makes 12 an invalid child if not re-linked via the in-order successor 12.',
    correctiveFeedback: 'To delete a node with two children, replace its value with its in-order successor (minimum node in right subtree) or in-order predecessor, then delete that leaf/single-child node.',
    relatedQuestionIds: ['q_bst_03'],
  },
  {
    id: 'MISC_BST_UNBALANCED_SEARCH_TIME',
    name: 'Assuming Unbalanced BST Always Guarantees O(log n) Search',
    description: 'Believing all binary search trees have O(log n) search runtime, overlooking degenerate linear chain trees.',
    subject: 'Computer Science',
    conceptId: 'C4_Binary_Search_Trees',
    conceptName: 'Binary Search Trees',
    representativeIncorrectAnswer: 'BST search is always O(log n) because every comparison divides the tree into half.',
    correctExplanation: 'A standard BST only achieves O(log n) search when balanced. If elements are inserted in ascending or descending sorted order without self-balancing rotations, the tree degenerates into a single linked list of height n, making search O(n). Self-balancing trees (AVL, Red-Black) are required to guarantee O(log n).',
    example: 'Inserting keys [1, 2, 3, 4, 5] into an empty BST creates a right-skewed stick of depth 5. Searching for 5 takes 5 comparisons (O(n)), not 3 (log₂ 5).',
    correctiveFeedback: 'BST search time is proportional to height h. In degenerate trees h = O(n). Use AVL or Red-Black balance invariants to guarantee h = O(log n).',
    relatedQuestionIds: ['q_bst_02'],
  },
  {
    id: 'MISC_GRAPH_DIJKSTRA_NEGATIVE_WEIGHTS',
    name: 'Applying Dijkstra to Negative Edge Weight Graphs',
    description: 'Belief that Dijkstra algorithm finds the shortest path on graphs containing negative edge weights if no negative cycle exists.',
    subject: 'Computer Science',
    conceptId: 'C5_Graph_Algorithms',
    conceptName: 'Graph Algorithms',
    representativeIncorrectAnswer: 'Dijkstra will find the shortest path as long as there are no negative cycles.',
    correctExplanation: 'Dijkstra greedily marks vertices as settled under the assumption that path lengths are monotonically non-decreasing. When negative edges exist, a settled node may later have a cheaper alternative route, causing Dijkstra to produce incorrect distances. The Bellman-Ford algorithm (O(V·E)) must be used instead.',
    example: 'A graph with edge A->B (weight 5), A->C (weight 2), C->B (weight -4). Dijkstra marks B as settled with distance 5 before exploring C, missing the true distance of -2 via A->C->B.',
    correctiveFeedback: 'Dijkstra greedily assumes path costs are monotonically non-decreasing. When negative edges exist, use the Bellman-Ford algorithm (O(V·E)) or SPFA.',
    relatedQuestionIds: ['q_graph_02'],
  },
  {
    id: 'MISC_DP_MEMOIZATION_STATE_OMISSION',
    name: 'DP Incomplete State Key Definition',
    description: 'Memoizing only a subset of variables that dictate the future subproblem choice, returning wrong cached values for distinct execution branches.',
    subject: 'Computer Science',
    conceptId: 'C6_Dynamic_Programming',
    conceptName: 'Dynamic Programming',
    representativeIncorrectAnswer: 'memo[index] = solve(index, remainingWeight); since index uniquely identifies the item.',
    correctExplanation: 'In dynamic programming, the memoization table key must encompass all independent state parameters that affect subsequent recursive transitions. Omitting a constraint variable (like remaining weight or budget) causes subproblems with different resource states to collide and return invalid cached answers.',
    example: 'In 0/1 Knapsack, caching only `memo[i]` ignores `remainingWeight`. If item i is reached with 10kg remaining vs 2kg remaining, using the same cached value produces wrong results.',
    correctiveFeedback: 'Every parameter that influences future choices or constraints must be part of the memoization state key (e.g., `memo[item_idx][remaining_capacity]`).',
    relatedQuestionIds: ['q_dp_01', 'q_dp_02'],
  },
  {
    id: 'MISC_SORT_QUICKSORT_WORST_CASE',
    name: 'Believing QuickSort is Always O(n log n)',
    description: 'Assuming QuickSort has a guaranteed O(n log n) runtime in all scenarios, overlooking degenerate unbalanced partitions.',
    subject: 'Computer Science',
    conceptId: 'C12_Sorting_Searching',
    conceptName: 'Sorting & Searching',
    representativeIncorrectAnswer: 'QuickSort divides the array in half at each step, so its worst-case time is always O(n log n).',
    correctExplanation: 'Standard QuickSort with a fixed first-element or last-element pivot selection degrades to O(n²) when given an already sorted or reverse-sorted array, because partitions split into sizes of 0 and n-1 at every recursive level. Randomized pivots, median-of-three, or IntroSort are required to protect against quadratic degradation.',
    example: 'Sorting [1, 2, 3, 4, 5] with a naive first-element pivot yields n levels of recursion with n, n-1, n-2... comparisons, totaling n(n+1)/2 = O(n²) operations.',
    correctiveFeedback: 'Naive QuickSort degrades to O(n²) in the worst case. Use randomized pivot selection, median-of-three, or IntroSort to guarantee O(n log n).',
    relatedQuestionIds: ['q_sort_01'],
  },
  {
    id: 'MISC_HASH_CONSTANT_TIME_WORST_CASE',
    name: 'Assuming Hash Tables are Strictly O(1) Worst-Case',
    description: 'Assuming hash table lookups are strictly O(1) in the worst case rather than amortized expected time.',
    subject: 'Computer Science',
    conceptId: 'C14_Hash_Tables',
    conceptName: 'Hash Tables & Collision Resolution',
    representativeIncorrectAnswer: 'Hash tables perform all operations in O(1) guaranteed time because keys map directly to memory addresses.',
    correctExplanation: 'Hash tables operate in expected O(1) time under the Simple Uniform Hashing Assumption. However, if multiple keys hash to the same bucket (hash collisions), lookups degrade to O(n) linked list traversals or linear probing steps. Adversarial input targeting hash collisions can force worst-case O(n) operations.',
    example: 'If an adversary inputs keys with the same hash code or if all elements collide into one bucket, operations degrade to O(n) linked list traversal.',
    correctiveFeedback: 'Hash table lookups are O(1) on average under the Simple Uniform Hashing assumption. In the worst case with collisions, lookup is O(n).',
    relatedQuestionIds: ['q_mat_01'],
  },
  {
    id: 'MISC_RECURSION_BASE_CASE_CALL_STACK',
    name: 'Omitting Base Case Termination in Recursion',
    description: 'Believing recursive functions terminate automatically once arguments become small or zero without explicit return checks.',
    subject: 'Computer Science',
    conceptId: 'C15_Recursion_Backtracking',
    conceptName: 'Recursion & Backtracking',
    representativeIncorrectAnswer: 'The function calculates smaller numbers each step, so recursion stops naturally when the calculation completes.',
    correctExplanation: 'Every recursive call pushes an activation record onto the call stack. Without an explicit base case guard returning a value, the function will invoke itself indefinitely with increasingly negative arguments until call stack memory is exhausted, throwing a StackOverflowError.',
    example: 'In factorial f(n) = n * f(n - 1), omitting "if (n <= 1) return 1;" causes calls for n = 0, -1, -2... until memory runs out.',
    correctiveFeedback: 'Always write the base case first at the top of recursive methods. Ensure every execution path reaches a terminating non-recursive condition.',
    relatedQuestionIds: ['q_rec_01'],
  },
  {
    id: 'MISC_OOP_LSP_SQUARE_RECTANGLE',
    name: 'Liskov Substitution Principle (LSP) Geometric Subtyping Fallacy',
    description: 'Assuming that because a Square is mathematically a Rectangle, inheriting Square from Rectangle is valid in object-oriented software design.',
    subject: 'Computer Science',
    conceptId: 'C16_Object_Oriented_Design',
    conceptName: 'Object-Oriented Design',
    representativeIncorrectAnswer: 'Square should inherit from Rectangle because all squares are rectangles in Euclidean geometry.',
    correctExplanation: 'In OOP, subtyping requires behavioral compatibility (Liskov Substitution Principle). A Rectangle allows setting width and height independently; forcing a Square to modify both sides together violates the Rectangle contract and breaks client code expecting independent mutations.',
    example: 'If a client function sets width = 5 and height = 4 on a Rectangle and asserts area == 20, passing a Square subclass instance makes width = height = 4 (area 16), breaking the contract.',
    correctiveFeedback: 'Inheritance models behavioral substitutability ("is-substitutable-for"), not real-world taxonomy. If subclass constraints violate superclass invariants, prefer composition.',
    relatedQuestionIds: ['q_ood_01'],
  },

  // ==========================================
  // AI & DATA SCIENCE MISCONCEPTIONS
  // ==========================================
  {
    id: 'MISC_ACCURACY_PARADOX_IMBALANCED',
    name: 'Accuracy Metric Paradox on Imbalanced Datasets',
    description: 'Evaluating a classifier exclusively by Accuracy on heavily skewed or imbalanced datasets (e.g. 99% negative class).',
    subject: 'AI & Data Science',
    conceptId: 'C21_Evaluation_Metrics',
    conceptName: 'Model Evaluation Metrics',
    representativeIncorrectAnswer: 'Our fraud detector achieved 99.5% accuracy, so the model is working exceptionally well.',
    correctExplanation: 'When target classes are severely imbalanced, a trivial majority-class baseline classifier achieves high raw accuracy while failing to detect any positive instances. Metrics like Precision, Recall, F1-Score, PR-AUC, or balanced accuracy are required to measure true minority detection effectiveness.',
    example: 'If fraud occurs in 0.5% of transactions, a naive model that predicts "Not Fraud" for every single transaction gets 99.5% accuracy while catching 0% of fraud.',
    correctiveFeedback: 'On imbalanced datasets, use Precision, Recall, F1-Score, PR-AUC, or balanced accuracy rather than raw classification accuracy.',
    relatedQuestionIds: ['q_eval_01'],
  },
  {
    id: 'MISC_OVERFITTING_TRAIN_LOSS_DECREASE',
    name: 'Equating Monotonically Decreasing Training Loss with Learning',
    description: 'Assuming that because training loss continues to drop toward zero across epochs, the model is continually improving generalizability.',
    subject: 'AI & Data Science',
    conceptId: 'C20_Overfitting_Regularization',
    conceptName: 'Overfitting & Regularization',
    representativeIncorrectAnswer: 'Training loss reached 0.001 after 200 epochs, proving the model has learned the true underlying distribution.',
    correctExplanation: 'Training loss measures fitting to the training subset only. High-capacity models can memorize noise and individual samples, driving training loss to near zero while validation loss diverges sharply—a definitive sign of overfitting (high variance).',
    example: 'A neural network training loss drops from 0.40 to 0.01 between epoch 20 and 100, while validation loss climbs from 0.42 to 1.85. The model has overfit and memorized training data.',
    correctiveFeedback: 'Always monitor validation/test loss alongside training loss. When validation loss rises while training loss falls, stop training (Early Stopping) or increase regularization.',
    relatedQuestionIds: ['q_rf_01'],
  },
  {
    id: 'MISC_REGULARIZATION_L1_VS_L2_SPARSITY',
    name: 'Confusing L1 (Lasso) and L2 (Ridge) Sparsity Properties',
    description: 'Believing L2 regularization creates sparse weight vectors with exact zeros, or that L1 shrinks all weights uniformly.',
    subject: 'AI & Data Science',
    conceptId: 'C20_Overfitting_Regularization',
    conceptName: 'Overfitting & Regularization',
    representativeIncorrectAnswer: 'L2 Ridge regularization sets unimportant feature weights to exactly zero.',
    correctExplanation: 'L1 regularization (Lasso) adds λ∑|w_i| to the objective. Its constraint region is a diamond with sharp corners on the coordinate axes; loss contours typically intersect these corners, driving coefficients to exact zero (performing feature selection). L2 (Ridge) adds λ∑w_i², creating spherical contours that shrink weights asymptotically close to zero without setting them to exact zero.',
    example: 'In linear regression with 10 features, Lasso zeroes out 6 weights entirely (sparsity), leaving a 4-feature model. Ridge keeps all 10 features with smaller magnitudes.',
    correctiveFeedback: 'L1 (Lasso) penalty produces sparse models by zeroing out non-informative coefficients. L2 (Ridge) penalty shrinks all coefficients proportionally toward zero without setting them to exact zero.',
    relatedQuestionIds: ['q_bst_04'],
  },
  {
    id: 'MISC_GRADIENT_DESCENT_LEARNING_RATE_EXPLOSION',
    name: 'Believing Higher Learning Rates Always Accelerate Convergence',
    description: 'Assuming that setting a large learning rate (e.g. η = 10.0) simply speeds up gradient descent without risk of instability.',
    subject: 'AI & Data Science',
    conceptId: 'C22_Gradient_Descent',
    conceptName: 'Gradient Descent Optimization',
    representativeIncorrectAnswer: 'To train faster, we should set the learning rate as high as possible so steps are bigger.',
    correctExplanation: 'Gradient descent relies on local first-order Taylor approximation. If the learning rate is too large, update steps overshoot the minimum and land on steeper regions of the loss surface, causing the parameter updates to oscillate wildly and diverge to infinity (yielding NaN loss values).',
    example: 'For cost function J(w) = w², the gradient is 2w. If η = 1.5 and initial w = 1, step 1 gives w = 1 - 1.5(2) = -2; step 2 gives w = -2 - 1.5(-4) = +4; step 3 gives w = -8 (exponential divergence).',
    correctiveFeedback: 'Oversized learning rates cause overshoot and numerical divergence. Use learning rate schedules, warm-up, or adaptive optimizers like Adam.',
    relatedQuestionIds: ['q_gd_01'],
  },
  {
    id: 'MISC_PCA_TARGET_LABEL_LEAKAGE',
    name: 'Applying PCA with Target Labels (Confusing Unsupervised with Supervised)',
    description: 'Believing Principal Component Analysis (PCA) uses target labels y to maximize class separation like Linear Discriminant Analysis (LDA).',
    subject: 'AI & Data Science',
    conceptId: 'C24_Dimensionality_Reduction',
    conceptName: 'Dimensionality Reduction (PCA)',
    representativeIncorrectAnswer: 'PCA chooses projection axes that best separate positive and negative classes.',
    correctExplanation: 'PCA is strictly an unsupervised technique that finds axes of maximum variance in the feature matrix X without ever inspecting target labels y. If you want projections that maximize class separation (between-class variance relative to within-class variance), Linear Discriminant Analysis (LDA) is the appropriate supervised technique.',
    example: 'Applying PCA on a dataset with two overlapping clusters finds directions of greatest overall spread, which may merge or blur class boundaries if spread is orthogonal to class separation.',
    correctiveFeedback: 'PCA maximizes variance without ever inspecting class labels. If you need class-separating projections, use Linear Discriminant Analysis (LDA).',
    relatedQuestionIds: ['q_pca_01'],
  },
  {
    id: 'MISC_NLP_TFIDF_HIGH_FREQUENCY_STOPWORDS',
    name: 'Assuming Raw Term Frequency (TF) Distinguishes Topic Significance',
    description: 'Believing raw word count alone indicates document topic distinctiveness without accounting for corpus-wide ubiquity.',
    subject: 'AI & Data Science',
    conceptId: 'C25_NLP_Foundations',
    conceptName: 'NLP & Text Processing',
    representativeIncorrectAnswer: 'The word with the highest frequency in a document is always the most descriptive topic keyword.',
    correctExplanation: 'In natural language corpora, stop-words like "the", "and", and "is" naturally appear with the highest raw term frequency across all documents. Multiplying by Inverse Document Frequency (IDF = log(N/df)) dampens universal words and elevates discriminative terms that appear uniquely in the target document.',
    example: 'In a medical paper, "the" appears 500 times and "cardiovascular" appears 45 times. Raw TF ranks "the" highest. TF-IDF applies an IDF weight of ~0 to "the" and a high weight to "cardiovascular", correctly prioritizing domain keywords.',
    correctiveFeedback: 'Raw TF favors common grammatical words. Always multiply by Inverse Document Frequency (IDF) or apply stop-word filtering to identify distinctive topical vocabulary.',
    relatedQuestionIds: ['q_nlp_01'],
  },
];

export const MISCONCEPTIONS_BY_CONCEPT: Record<string, MisconceptionItem[]> = MISCONCEPTION_TAXONOMY.reduce(
  (acc, m) => {
    if (!acc[m.conceptId]) acc[m.conceptId] = [];
    acc[m.conceptId].push(m);
    return acc;
  },
  {} as Record<string, MisconceptionItem[]>
);

export const MISCONCEPTIONS_BY_SUBJECT: Record<string, MisconceptionItem[]> = MISCONCEPTION_TAXONOMY.reduce(
  (acc, m) => {
    if (!acc[m.subject]) acc[m.subject] = [];
    acc[m.subject].push(m);
    return acc;
  },
  {} as Record<string, MisconceptionItem[]>
);
