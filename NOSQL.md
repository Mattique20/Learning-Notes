

**Exam Notes: Distributed Data Engineering (NoSQL, DHTs, DynamoDB)**

**Part 1: Foundational Concepts (CAP & BASE)**

1.  **Context:**
    *   **Relational Databases (RDBMS):** Traditionally prioritize **Consistency** (ACID transactions ensure all users see the same data, updates are reliable).
    *   **Distributed Systems:** Often prioritize **Availability** (service remains operational despite failures) and **Partition Tolerance** (system functions even if network splits occur). May need to relax immediate consistency.

2.  **CAP Theorem (Brewer's Theorem):**
    *   A distributed system can simultaneously provide **at most two** out of the following three guarantees:
        *   **C - Consistency:** *Strict/Linearizable Consistency*. All nodes see the same data at the same time. Every read receives the most recent write or an error. (Think RDBMS).
        *   **A - Availability:** Every non-failing node remains operational and responds to requests (possibly with stale data). No request is simply dropped or ignored due to the state of other parts of the system.
        *   **P - Partition Tolerance:** The system continues to operate despite network partitions (messages being lost or delayed between nodes). *In modern distributed systems, P is generally considered mandatory.*
    *   **Trade-offs (Choose 2):**
        *   **CP (Consistency + Partition Tolerance):** Sacrifices Availability. If a partition occurs, the system might become unavailable to guarantee all nodes have the consistent view before accepting writes/reads. (e.g., BigTable, HBase, MongoDB, Redis in certain modes).
        *   **AP (Availability + Partition Tolerance):** Sacrifices Strict Consistency. During a partition, nodes might respond with potentially stale data to remain available. Consistency is achieved later ("eventually"). (e.g., DynamoDB, Cassandra, CouchDB, Voldemort).
        *   **CA (Consistency + Availability):** Sacrifices Partition Tolerance. Not practical for most modern distributed systems where network failures *must* be tolerated. Often associated with single-site databases or clusters within a single datacenter using specialized hardware/networks.

3.  **BASE Properties (Alternative to ACID for AP Systems):**
    *   Often employed by systems choosing Availability and Partition Tolerance (AP).
    *   **B**asically **A**vailable: The system guarantees availability (per the CAP theorem). Achieved by spreading/replicating data across nodes.
    *   **S**oft **S**tate: The state of the system may change over time, even without direct user input, due to the eventual consistency model. Data might be inconsistent across replicas temporarily.
        *   ***Key Point (Relates to original query):*** This directly implies that stores **don't need immediate write consistency** (a write might not be visible everywhere instantly) and **different replicas don't need to be mutually consistent all the time**. The system is designed to tolerate this temporary divergence. State is "soft" because it's not guaranteed to be perfectly up-to-date until consistency mechanisms catch up.
    *   **E**ventually **C**onsistent: If no new updates are made, eventually all replicas will converge to the same consistent state. Consistency is achieved "lazily," often at read time or through background processes.

**Part 2: NoSQL Database Categories**

1.  **Key-Value Store:**
    *   **Model:** Simplest form. Data stored as `(key, value)` pairs. Key is unique. Value can be anything (text, binary, JSON, etc.).
    *   **Operations:** `Put(key, value)`, `Get(key)`, sometimes `Delete(key)`, `GetRange(start_key, end_key)`.
    *   **Examples:** Amazon DynamoDB, Redis, Riak.
2.  **Document Store:**
    *   **Model:** Stores documents (often JSON or XML). Documents have internal structure. Can be seen as advanced Key-Value stores where the value has structure.
    *   **Features:** Can query based on document structure/fields. Hierarchical data. Schema can be flexible.
    *   **Examples:** MongoDB, Couchbase.
3.  **Wide Column Store:**
    *   **Model:** Combines aspects of relational tables and key-value stores. Uses concepts like keyspaces (like schemas), column families (like tables), rows (identified by a key), and columns.
    *   **Features:** Columns are grouped into families. Rows can have *different* columns within the same family (schema-less within rows/columns). Columns are not necessarily atomic; can contain multiple key-value pairs or nested structures. Optimized for queries across rows for specific columns.
    *   **Examples:** Apache Cassandra, Google BigTable, HBase.
4.  **Graph-Based Store:**
    *   **Model:** Stores data as nodes (vertices) and relationships (edges).
    *   **Features:** Optimized for traversing relationships (e.g., social networks, recommendation engines). Queries often involve finding paths or connections.
    *   **Examples:** Neo4j, Amazon Neptune.

**Part 3: Distributed Hash Tables (DHTs) & Chord**

1.  **DHT - Basic Idea:**
    *   **Goal:** Provide a decentralized way to map keys to nodes responsible for storing the corresponding values, even as nodes join and leave.
    *   **Mechanism:**
        *   Use a **consistent hash function** to map both keys and node identifiers (e.g., IP addresses) to a large **identifier space**.
        *   Nodes become responsible for specific **ranges** of this identifier space.
        *   **Join:** A new node takes over a portion of an existing node's range.
        *   **Leave:** A leaving node merges its range with a neighbor.

2.  **Chord DHT:**
    *   **Identifier Space:** An m-bit circular space (0 to 2^m - 1). (m often 128 or 160).
    *   **Hashing:** Nodes (`H(NodeAddress) -> NodeId`) and Keys (`H(key) -> EntityId`) are hashed onto the ring.
    *   **Successor Rule:** A key/entity `e` is stored on the first node `p` encountered clockwise on the ring whose `NodeId >= EntityId`. This node `p` is `succ(e)`.
    *   **Challenge:** Finding `succ(e)` efficiently without asking every node (`O(N)` linear search is too slow).
    *   **Solution: Finger Tables (`FT_p`)**
        *   Each node `p` maintains a routing table (`FT_p`) with up to `m` entries.
        *   `FT_p[i] = successor( (p + 2^(i-1)) mod 2^m )` for `i = 1..m`.
        *   Entry `i` points to the successor of the ID that's `2^(i-1)` distance away. Distances increase exponentially.
        *   These act as **shortcuts** across the ring.
    *   **Lookup Algorithm (`find_successor(e)` on node `n`):**
        1.  Check if `e` belongs to the immediate successor: Is `e` in the interval `(n, FT_n[1]]` (using ring arithmetic)? If yes, return `FT_n[1]`.
        2.  If not, find the **closest preceding finger**: Search `FT_n` (from `m` down to 1) for the finger `FT_n[j]` that is closest to `e` but *strictly precedes* it on the ring (i.e., `FT_n[j]` is in the interval `(n, e)`).
        3.  Forward the `find_successor(e)` request to that finger node (`FT_n[j]`).
        4.  This process repeats, halving the distance roughly each time, resulting in **`O(log N)`** lookup complexity.
        5.  **Avoiding Overshooting:** Forwarding to the closest *preceding* finger (`FT_n[j]`) instead of one potentially after `e` (`FT_n[j+1]`) prevents jumping past the target node, ensuring consistent clockwise progress.
    *   **Node Join (Node `p`):**
        1.  `p` contacts any node, performs `lookup(succ(p+1))` to find its successor `y`.
        2.  `p` learns `y`'s predecessor `x`.
        3.  Pointers updated: `p.successor = y`, `p.predecessor = x`, `x.successor = p`, `y.predecessor = p`.
        4.  `p` initializes its own finger table by performing lookups for each `p + 2^(i-1)`.
        5.  `p` takes ownership of keys in the range `(x, p]` from `y`.
    *   **Consistency / Stabilization (Runs Periodically):**
        *   **`stabilize()`:** Each node `n` asks its successor `s` for `s`'s predecessor `x`. If `x` is between `n` and `s`, `n` updates its successor to `x` (correcting for a new node join) and notifies `x`. This fixes successor pointers.
        *   **`fix_fingers()`:** Each node periodically re-calculates one of its finger table entries by performing a lookup. This ensures fingers eventually point to the correct nodes even after joins/leaves.
        *   **`check_predecessor()`:** Nodes periodically check if their predecessor is still alive. If not, they clear their predecessor pointer.
    *   **Chord Discussion:**
        *   Pros: Highly scalable (`O(log N)` state/lookup), Self-organizing, Uniform load distribution (on average).
        *   Replication: Can store key `e` on `r` successors of `succ(e)` or use multiple hashes `H(key||c1)...`.
        *   Con: Basic Chord ignores network topology/latency; requests might travel far physically.

**Part 4: Amazon DynamoDB (Practical Example)**

1.  **Overview:**
    *   Managed NoSQL Key-Value and Document database service on AWS.
    *   Highly available, scalable, uses consistent hashing internally.

2.  **Internals & Concepts:**
    *   **Consistent Hashing & Virtual Nodes:** Uses a hash ring like Chord. To handle uneven data distribution or powerful nodes, one physical node can manage multiple **virtual nodes** scattered across the ring.
    *   **Coordinator Node:** For a given key, one node (typically the first one encountered on the ring for that key's hash) acts as the coordinator, handling requests and managing replication.
    *   **Replication (`N`) & Preference List:**
        *   Each item is replicated `N` times (usually N=3).
        *   The **Preference List** for a key is the set of `N` (virtual, mapping to physical) nodes responsible for storing it. This typically includes the coordinator and the next `N-1` nodes clockwise on the ring (skipping virtual nodes that map to the same physical node already in the list).
        *   Writes usually require a quorum (`W < N`) of replicas to acknowledge; reads require a quorum (`R < N`). `W+R > N` ensures strong consistency is possible. Default is eventual consistency (`R=1`, `W=1` maybe, or asynchronous).
    *   **Data Versioning & Conflicts:** Concurrent writes or failures can lead to different versions of an item on different replicas.
    *   **Vector Clocks (DynamoDB's Solution):** Used to track causality and detect/resolve conflicts (explained in next section).
    *   **Replica Synchronization & Merkle Trees:**
        *   To efficiently compare replicas and find differences without transferring all data.
        *   Each replica builds a **Merkle Tree** (hash tree) over its keys/values.
        *   Compare root hashes. If different, recursively compare child hashes to pinpoint the exact keys that differ. Only transfer data for the inconsistent keys.

3.  **DynamoDB Data Model:**
    *   **Tables:** Collections of items.
    *   **Items:** Collections of attributes (Key-Value pairs). Analogous to rows. Heterogeneous items allowed (different attributes per item).
    *   **Attributes:** Name-value pairs. Fundamental data element. Analogous to columns but not predefined in a table schema. Self-describing.
    *   **Schema:** Generally schemaless, *except* for the Primary Key which must be defined per table.
    *   **Primary Key:** Uniquely identifies each item. Must be scalar (String, Number, Binary).
        *   **Partition Key (Hash Key):** Single attribute. Hash determines the partition (physical storage node). Uniquely identifies item.
        *   **Partition Key + Sort Key (Composite Key / Range Key):** Two attributes. Hash of partition key determines storage. Items with the same partition key are stored together, ordered by the sort key. Allows efficient range queries on the sort key within a partition.
    *   **Secondary Indexes:** Allow querying by attributes other than the primary key.
        *   **Global Secondary Index (GSI):** Can have different Partition/Sort keys than the base table. Index data stored separately, scales independently. Spans all partitions. Eventual consistency usually.
        *   **Local Secondary Index (LSI):** Must use the *same* Partition Key as the base table, but a *different* Sort Key. Index data stored within the same partition as base data. Strong consistency possible. Limited size per partition.
    *   **Data Types:**
        *   Scalar: String, Number, Binary, Boolean, Null.
        *   Set: String Set, Number Set, Binary Set (collections of unique scalar values).
        *   Document: List (ordered, like JSON array), Map (unordered key-value, like JSON object). Allows nested structures.

4.  **DynamoDB API:**
    *   **Control Plane:** Manage tables (CreateTable, DescribeTable, ListTables, UpdateTable, DeleteTable).
    *   **Data Plane:** Manage items (CRUD).
        *   Classic API: `PutItem`, `GetItem`, `UpdateItem`, `DeleteItem`, `Query` (uses primary key, efficient), `Scan` (reads entire table, less efficient), `BatchGetItem`, `BatchWriteItem`.
        *   PartiQL: SQL-compatible query language (`SELECT...FROM...WHERE...`).
    *   **SDKs:** Available for many languages (Java, NodeJS, Python, etc.).

**Part 5: Logical and Vector Clocks (Underlying Theory)**

1.  **Need for Logical Clocks:** Physical clocks drift and are unreliable for ordering events accurately in a distributed system. Logical clocks provide a way to capture **causal order**.

2.  **Causality & Happens-Before (`->`) (Lamport):**
    *   An event `a` **happens-before** `b` (`a -> b`) if:
        *   `a` and `b` are in the same process, and `a` occurs before `b`.
        *   `a` is the sending of a message, and `b` is the reception of that message.
        *   Transitivity: If `a -> b` and `b -> c`, then `a -> c`.
    *   **Concurrency (`||`):** `a || b` if neither `a -> b` nor `b -> a`. These events are causally unrelated.
    *   `->` defines a **strict partial order**.

3.  **Scalar (Lamport) Clocks:**
    *   **Goal:** Assign a timestamp `C(a)` such that `a -> b => C(a) < C(b)`.
    *   **Algorithm:**
        *   Each process `p` has a counter `C(p)`, initialized to 0.
        *   On a local event or send event: Increment `C(p)`.
        *   On sending message `m`: Timestamp `m` with `C(p)`.
        *   On receiving message `m` with timestamp `C(m)`: Update local clock `C(p) := max(C(p), C(m)) + 1`.
    *   **Property:** Satisfies the goal (`a -> b => C(a) < C(b)`).
    *   **Limitation:** The converse is *not* true. `C(a) < C(b)` does **not** imply `a -> b` (they could be concurrent). Cannot distinguish concurrency from causality just by comparing timestamps.
    *   **Total Order:** Can create an arbitrary total order using Lamport timestamps + process IDs as tie-breakers. Useful for things like distributed mutex or replicated state machine inputs.

4.  **Vector Clocks:**
    *   **Goal:** Assign a timestamp `VC(a)` such that `a -> b <=> VC(a) < VC(b)`. (If and only if - captures causality precisely).
    *   **Structure:** Each process `p` maintains a vector `VC(p)` of size `n` (number of processes), initialized to all zeros. `VC(p)[i]` represents the number of events process `p` knows about from process `i`.
    *   **Algorithm:**
        *   On a local event: Increment own component `VC(p)[p]`.
        *   On sending message `m`: Increment `VC(p)[p]`, timestamp `m` with the entire vector `VC(p)`.
        *   On receiving message `m` with vector timestamp `VC(m)`:
            1.  Update local vector: `VC(p)[k] := max(VC(p)[k], VC(m)[k])` for all `k` from 1 to `n`. (Merge knowledge).
            2.  Increment own component: `VC(p)[p]`.
    *   **Comparison:**
        *   `VC1 <= VC2` if `VC1[k] <= VC2[k]` for all `k`.
        *   `VC1 < VC2` if `VC1 <= VC2` and `VC1 != VC2`.
        *   `VC1 || VC2` (concurrent) if neither `VC1 <= VC2` nor `VC2 <= VC1`.
    *   **Property:** `a -> b <=> VC(a) < VC(b)`. Also, `a || b <=> VC(a) || VC(b)`. Vector clocks accurately capture both causality and concurrency.
    *   **Use in DynamoDB:** When a client writes, it gets a vector clock. When it reads, it might get multiple concurrent versions (with incomparable vector clocks). If it writes again, it provides the clock it read (or reconciled), allowing DynamoDB to establish causality for the new write. If DynamoDB receives concurrent writes, it stores both and might return both to a client on read, potentially requiring client-side reconciliation based on the vector clocks. If `VC(a) < VC(b)`, version `b` is newer and causally depends on `a`, so `a` can be discarded.

**Summary:**

*   Distributed systems often trade strong consistency for availability (CAP).
*   BASE properties (Basically Available, Soft State, Eventually Consistent) describe many NoSQL systems.
*   NoSQL offers various data models (KV, Document, Column, Graph).
*   DHTs like Chord provide scalable, decentralized key lookup using consistent hashing and finger tables (`O(log N)`).
*   DynamoDB uses these concepts (consistent hashing, virtual nodes, replication, eventual/strong consistency options).
*   Logical/Vector clocks are crucial for managing event ordering and data versioning/conflicts in distributed systems. Vector clocks accurately capture causality. DynamoDB uses them for versioning.
*   Merkle trees help synchronize replicas efficiently.

---

**Exam Questions:**

**Theoretical Questions:**

1.  Explain the CAP theorem and its three components. Why is Partition Tolerance often considered non-negotiable in modern distributed systems?
2.  Describe the trade-offs involved when choosing between a CP system and an AP system according to CAP. Give an example database type for each.
3.  Explain the BASE properties. How does "Soft State" relate to the concept of eventual consistency?
4.  Compare and contrast the four main categories of NoSQL databases (Key-Value, Document, Wide Column, Graph) in terms of their data model and typical use cases.
5.  What is the core problem that Distributed Hash Tables (DHTs) aim to solve?
6.  Explain the concept of consistent hashing as used in DHTs like Chord.
7.  What is the role of the `successor` node in Chord? How is it determined?
8.  What is a finger table in Chord? Explain its structure and how it helps achieve `O(log N)` lookups. What is the formula for `FT_p[i]`?
9.  Describe the Chord lookup algorithm. Why is it important to avoid "overshooting"?
10. Outline the main steps a new node takes when joining a Chord ring.
11. Explain the purpose of Chord's `stabilize` and `fix_fingers` background processes.
12. How do virtual nodes in systems like DynamoDB help address potential load balancing issues with basic consistent hashing?
13. What is a "preference list" in DynamoDB's replication strategy?
14. Explain the difference between Lamport (Scalar) Clocks and Vector Clocks in terms of what relationships between events they can capture.
15. Describe the algorithm for updating Lamport clocks during local, send, and receive events.
16. Describe the algorithm for updating Vector Clocks during local, send, and receive events. What does `VC(a)[k]` represent?
17. How can Vector Clocks be used to detect conflicts between different versions of a data item in DynamoDB? When might client-side reconciliation be necessary?
18. What is a Merkle Tree and how does DynamoDB use it for replica synchronization? Why is this more efficient than comparing all data?
19. Explain the difference between a Partition Key and a Composite Primary Key (Partition + Sort Key) in DynamoDB. How do they affect data storage and querying capabilities?
20. Compare and contrast Global Secondary Indexes (GSIs) and Local Secondary Indexes (LSIs) in DynamoDB regarding their keys, storage, scaling, and consistency.

**Practical Questions:**

1.  Given the Chord ring example on slide 13, calculate the finger table entry `FT_4[3]`. Show your steps.
2.  Using the Chord ring and finger tables from slide 13, trace the path of a `lookup(e=22)` starting from node `p=9`. List the nodes contacted in sequence until the successor is found.
3.  A system uses Lamport clocks. Process P1 sends message M1 to P2. P2 then sends message M2 to P3. Draw a space-time diagram and assign Lamport timestamps to all events, assuming clocks start at 0 and increment by 1 for each step.
4.  Repeat question 3, but assign Vector Clocks instead (assume 3 processes, P1, P2, P3).
5.  You have two versions of a data item from DynamoDB with vector clocks V1 = `[(N1, 3), (N2, 5), (N3, 1)]` and V2 = `[(N1, 3), (N2, 4), (N3, 2)]`. Are these versions concurrent, or did one happen before the other? Justify your answer based on vector clock comparison.
6.  Consider another version V3 with clock `[(N1, 4), (N2, 5), (N3, 1)]`. What is the relationship between V1 and V3? What about V2 and V3?
7.  You need to design a DynamoDB table for storing user session data. Each session has a unique `session_id`, a `user_id`, a `creation_timestamp`, and various other session attributes (e.g., `ip_address`, `user_agent`, `last_access_time`). You frequently need to query for all sessions belonging to a specific `user_id`, sorted by `creation_timestamp`. What would be an appropriate Primary Key design? Would you use a simple or composite key?
8.  Based on your design in question 7, you *also* need to be able to quickly look up a session by its `session_id` alone. How would you enable this functionality efficiently?
9.  Imagine a replica synchronization process using Merkle Trees. Two replicas have different root hashes. They compare the left children's hashes, which match. They then compare the right children's hashes, which differ. What does this tell you about where the data inconsistency lies? What are the next steps?
10. Look at the DynamoDB `CreateTable` API example (slide 84). Identify the Partition Key and the Sort Key. What type of primary key is this? What do `AttributeType=S` and `KeyType=HASH/RANGE` mean?


