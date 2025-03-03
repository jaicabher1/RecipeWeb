## Mongoose Pagination & Aggregate

**Pagination Plugins:**
- You're utilizing two pagination plugins provided by the `mongoose-pagination-v2` package: `mongoosePlugin` and `mongooseAggregatePlugin`. These plugins enhance your mongoose schema with pagination capabilities for regular queries and aggregate queries respectively.

**Pagination Methods:**
- `getAggregatedPaginatedData`: This method is used to fetch paginated data from the MongoDB collection. It takes an object as an argument with properties like `model` (the mongoose model to query) and `query` (an array of query conditions). It returns paginated data based on the provided query conditions.
- `getPaginatedData`: Though not explicitly used in your code, it's likely a similar method provided by the pagination package for fetching paginated data from regular (non-aggregated) queries.

These methods and plugins streamline pagination handling in your application, making it easier to implement and manage pagination for mongoose queries and aggregations.


```javascript
const mongoose = require('mongoose');
const { mongoosePlugin, mongooseAggregatePlugin, getAggregatedPaginatedData, getPaginatedData } = require('mongoose-pagination-v2');

const express = require('express');
const app = express();

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log('Failed to connect to MongoDB', err));

// any key value allowed
const UserSchema = new mongoose.Schema({}, { strict: false });

UserSchema.plugin(mongoosePlugin);
UserSchema.plugin(mongooseAggregatePlugin);

const UserModel = mongoose.model('User', UserSchema);

app.get('/', async (req, res) => {
    // pagination without aggregate query
    // const data = await getPaginatedData({ model: UserModel, query: {}, page: 1, limit: 10 });

    // pagination with aggregate query
    const data = await getAggregatedPaginatedData({ model: UserModel, query: [], page: 1, limit: 10 });
    res.send(data);
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
