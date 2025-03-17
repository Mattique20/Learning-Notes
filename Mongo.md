
## 3. MongoDB Basics (mongodb.md)

### Introduction

MongoDB is a NoSQL database. It stores data in flexible, JSON-like documents.  This makes it great for web applications.

### Installation and Setup

1.  **Download MongoDB Community Server:**  From the official MongoDB website ([https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)).  Follow the installation instructions for your operating system.
2.  **Start MongoDB:**  The exact command depends on your OS, but it's usually something like `mongod` (the MongoDB daemon). You might need to specify a data directory (`--dbpath`).
3.  **MongoDB Shell:** Open a new terminal and type `mongo` (or `mongosh` for the newer shell). This connects you to the running MongoDB instance.

### Basic Concepts

*   **Databases:**  Containers for collections.
*   **Collections:**  Groups of related documents (like tables in SQL, but schema-less).
*   **Documents:**  JSON-like objects.  The basic unit of data.

```json
{
    "name": "John Doe",
    "age": 30,
    "city": "New York",
    "hobbies": ["reading", "hiking"]
}
```

###  MongoDB Shell (Basic CRUD)

*   **Show Databases:**
    ```bash
    show dbs
    ```

*   **Use a Database:**
    ```bash
    use mydatabase  # Switches to 'mydatabase'. Creates it if it doesn't exist.
    ```

*   **Show Collections:**
    ```bash
    show collections
    ```

*   **Create (Insert):**
    ```javascript
    // Insert one document
    db.users.insertOne({ name: "Alice", age: 25 });

    // Insert multiple documents
    db.users.insertMany([
        { name: "Bob", age: 30 },
        { name: "Charlie", age: 35 }
    ]);
    ```

*   **Read (Find):**
    ```javascript
    // Find all documents in the 'users' collection
    db.users.find();

    // Find documents with a specific condition
    db.users.find({ age: 30 }); // Find users with age 30
    db.users.find({ age: { $gt: 25 } });  // Find users with age greater than 25 ($gt = greater than)
    db.users.findOne({ name: "Alice" }); // Find the first document where name is "Alice"
    ```

*   **Update:**
    ```javascript
    // Update one document
    db.users.updateOne(
        { name: "Alice" }, // Filter: Find the document to update
        { $set: { age: 26 } }  // Update: Set the 'age' field to 26
    );
     // Update Many documents
     db.users.updateMany(
        { age: {$lt : 30} }, // Filter: Find the document to update
        { $set: { status: "young" } }  // Update: Set the 'age' field to 26
    );
    // Replace one
    db.users.replaceOne(
        { name: "Bob" }, // Find document with name equal "Bob"
        { name: "Robert", age: 31, city: "Los Angeles"} //New Document
    )
    ```

*   **Delete:**
    ```javascript
    // Delete one document
    db.users.deleteOne({ name: "Charlie" });
    // Delete many
    db.users.deleteMany({ status: "young" });
    ```

###  Query Operators

MongoDB has many operators for powerful queries.

*   **Comparison:** `$eq`, `$ne`, `$gt`, `$lt`, `$gte`, `$lte`, `$in`, `$nin`.
*   **Logical:** `$and`, `$or`, `$not`, `$nor`.
*   **Element:**  `$exists`, `$type`
*   **Array:** `$all`, `$elemMatch`, `$size`.

**Examples:**

```javascript
// Find users whose age is greater than or equal to 30 AND less than 40
db.users.find({ age: { $gte: 30, $lt: 40 } });

// Find users whose name is either "Alice" or "Bob"
db.users.find({ $or: [{ name: "Alice" }, { name: "Bob" }] });

// Find users who have a 'hobbies' array that contains both "reading" and "hiking"
db.users.find({ hobbies: { $all: ["reading", "hiking"] } });

// Find documents where the 'address' field exists
db.users.find({ address: { $exists: true } });
```

### Indexes

Indexes speed up queries.

```javascript
// Create an ascending index on the 'age' field
db.users.createIndex({ age: 1 });

// Create a descending index on the 'name' field
db.users.createIndex({ name: -1 });
```
Create indexes on fields that you frequently use in your queries.

### Mongoose (Node.js)

Mongoose is an Object Data Modeling (ODM) library for Node.js and MongoDB.  It makes working with MongoDB much easier.

1.  **Install:** `npm install mongoose`

2.  **Connect:**
    ```javascript
    const mongoose = require('mongoose');

    async function connect() {
        try {
            await mongoose.connect('mongodb://localhost:27017/mydatabase', {
              useNewUrlParser: true,
              useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }
    }
    connect()
    ```

3.  **Schema and Model:**
    ```javascript
    // Define a schema
    const userSchema = new mongoose.Schema({
        name: { type: String, required: true }, // Name is a required string
        age: { type: Number, min: 18 },       // Age must be a number >= 18
        email: String,
        createdAt: { type: Date, default: Date.now } // Default value for createdAt
    });

    // Create a model
    const User = mongoose.model('User', userSchema); // 'User' is the name of the model (creates a 'users' collection)
    ```

4.  **CRUD with Mongoose:**
    ```javascript
    // Create a new user
    async function createUser() {
        const newUser = new User({
            name: "David",
            age: 40,
            email: "david@example.com"
        });

        try {
            const savedUser = await newUser.save(); // Save the user to the database
            console.log("User saved:", savedUser);
        } catch (error) {
            console.error("Error saving user:", error); // Handle validation errors, etc.
        }
    }
    createUser();

    // Find users
    async function findUsers() {
      try{
        const users = await User.find({ age: { $gt: 25 } }); // Find users older than 25
        console.log("Users:", users);

        const alice = await User.findOne({ name: "Alice" });
        console.log("Alice:", alice);
      } catch (error){
          console.log(error)
      }
    }
    findUsers();

    // Update a user
    async function updateUser() {
       try{
          const updatedUser = await User.findOneAndUpdate(
              { name: "David" },
              { $set: { email: "david.new@example.com" } },
              { new: true } // Return the updated document
          );
          console.log("Updated user:", updatedUser);
       } catch (error) {
          console.log(error)
       }
    }
    updateUser();

    // Delete a user
    async function deleteUser(){
        try {
            const deletedUser = await User.findOneAndDelete({ name: "David" });
            console.log("Deleted user:", deletedUser);
        } catch(error){
          console.log(error)
        }
    }
    deleteUser();
    ```
MongoDB is a popular NoSQL database that's a good choice for a variety of use cases, particularly when you need flexibility, scalability, and high performance.  Here's a breakdown of when to use MongoDB, contrasted with when *not* to use it:

**When to Use MongoDB:**

1.  **Flexible Schema/Schema-less Data:**

    *   **Evolving Data Models:** If your data structure is likely to change frequently (e.g., adding new fields, changing data types), MongoDB's document-oriented model is very advantageous.  You don't need to pre-define a rigid schema, making development faster and more agile. This is common in early-stage startups and projects where requirements are not fully defined.
    *   **Heterogeneous Data:**  If you have data from multiple sources with varying structures, MongoDB can handle it easily. Each document can have a different set of fields. Think of user profiles where some users have social media links, others have addresses, and some have both.
    *   **Unstructured or Semi-structured Data:** MongoDB excels at storing data that doesn't fit neatly into rows and columns, like JSON documents, logs, sensor data, etc.

2.  **High Scalability and Availability:**

    *   **Horizontal Scalability:** MongoDB is designed to scale horizontally, meaning you can add more machines (nodes) to your cluster to handle increased load. This is crucial for applications that expect significant growth in data volume or user traffic.  Sharding (distributing data across multiple servers) is a core feature.
    *   **High Availability:**  MongoDB supports replica sets, which provide automatic failover.  If one server goes down, another replica can take over, ensuring your application remains available.
    *   **Geographic Distribution:** You can distribute your data across multiple data centers for disaster recovery and to serve users from the closest location, reducing latency.

3.  **High Write Performance:**

    *   **Fast Writes:** MongoDB is optimized for write-heavy workloads.  This makes it suitable for applications that generate a lot of data, such as logging, analytics, IoT devices, and content management systems.
    *   **Real-time Data Ingestion:** MongoDB can handle high volumes of data being ingested in real-time, making it suitable for applications like social media feeds, real-time analytics dashboards, and gaming.

4.  **Cloud-Native and Microservices:**

    *   **Cloud Compatibility:** MongoDB Atlas, the official managed MongoDB service, works well with major cloud providers (AWS, Azure, GCP).  This simplifies deployment and management.
    *   **Microservices Architecture:**  MongoDB's document model aligns well with the concept of bounded contexts in microservices. Each microservice can have its own MongoDB database tailored to its specific data needs.

5.  **Content Management and Cataloging:**

    *   **Content Management Systems (CMS):**  The flexible schema is ideal for storing diverse content types (articles, blog posts, product pages, etc.), each with potentially different attributes.
    *   **Product Catalogs:**  MongoDB can handle products with varying attributes (e.g., clothing with sizes and colors, electronics with technical specifications).
    *   **User Profiles:**  Store user information, preferences, activity logs, etc., easily adapting to new features and user data.

6.  **Mobile and IoT Applications:**

    *   **Offline Data Sync:** MongoDB Realm (a mobile database and synchronization platform) allows you to store data locally on mobile devices and synchronize it with a cloud-based MongoDB instance when connectivity is available.
    *   **IoT Data Storage:**  Handle the large volumes of data generated by IoT devices and sensors.  MongoDB's time-series collections (introduced in version 5.0) are specifically designed for this purpose.

7.  **Operational Intelligence and Analytics:**

    *   **Real-time Analytics:** MongoDB's aggregation framework allows you to perform complex data analysis and reporting in real-time.
    *   **Log Analysis:**  Store and analyze log data from various sources to identify trends, monitor performance, and troubleshoot issues.
    * **Single View Applications**: Combining operational and analytical data in one location.

8. **Prototyping and Rapid Development:**
    * Because there's no need for upfront schema definition, it's very fast to get started with MongoDB. You can quickly build prototypes and iterate on your application's data model without worrying about database migrations.

**When *NOT* to Use MongoDB:**

1.  **Strong Relational Data and ACID Transactions (Across Multiple Documents):**

    *   **Complex Joins:** While MongoDB supports some limited join-like operations (using `$lookup`), it's not optimized for complex joins across multiple collections like relational databases (e.g., MySQL, PostgreSQL) are. If your application heavily relies on joining data from many different tables, a relational database is generally a better choice.
    *   **Strict ACID Compliance (Multiple Document Transactions):** MongoDB provides ACID guarantees within a single document. While it *does* support multi-document transactions (starting with version 4.0), they come with performance considerations and are not as robust or performant as transactions in a traditional relational database *when dealing with many documents in a single transaction*.  If you need absolute consistency across multiple documents in every transaction (e.g., financial transactions that must update multiple accounts simultaneously and guarantee all or nothing), a relational database is usually preferred.  *Single-document* ACID transactions are fine in MongoDB.
    * **Referential Integrity**: If you absolutely require enforced foreign key constraints, MongoDB will not be a good fit.

2.  **Highly Structured Data with Known Schema:**

    *   **Data Consistency is Paramount:** If your data has a very well-defined and unchanging schema, and data consistency is *the* most critical requirement, a relational database might be a better fit. The strict schema enforcement of relational databases helps prevent data inconsistencies.
    * **BI Tools that require a Relational Schema**: Many older Business Intelligence tools work best with a SQL-based, relational database. While connectors exist, they may not offer the same performance or flexibility as native SQL queries.

3.  **Small Datasets with Simple Relationships:**

    *   **Overkill:** For very small datasets with simple relationships, the overhead of setting up and managing a MongoDB database might be unnecessary. A simpler solution like SQLite or even a basic file-based storage might suffice.

4. **Existing SQL Expertise and Infrastructure:**

    *   **Learning Curve:** If your team already has strong SQL expertise and you have existing infrastructure built around relational databases, switching to MongoDB might involve a significant learning curve and migration effort.
    *   **Compatibility:** You may have other systems or tools that are tightly integrated with your existing SQL databases.*   **Compatibility:** You may have other systems or tools that are tightly integrated with your existing SQL databases.*   **Compatibility:** You may have other systems or tools that are tightly integrated with your existing SQL databases.*   **Compatibility:** You may have other systems or tools that are tightly integrated with your existing SQL databases.

**Key Takeaways and Summary:**

*   **Flexibility vs. Structure:** MongoDB offers flexibility and scalability, while relational databases provide strong structure and consistency guarantees.
*   **Scalability:** MongoDB excels at horizontal scalability, while relational databases typically scale vertically (adding more resources to a single server).
*   **Transactions:**  MongoDB's single-document transactions are robust, but multi-document transactions have performance considerations. Relational databases excel at complex, multi-table transactions.
*   **Data Model:** Choose the database that best fits your data model and how it will evolve.

The best choice depends on the specific requirements of your application. Carefully consider your data model, scalability needs, consistency requirements, and team expertise before making a decision. It's also important to remember that it's not always an "either/or" choice. You might use a combination of databases (e.g., MongoDB for some data, PostgreSQL for others) in a polyglot persistence approach.
