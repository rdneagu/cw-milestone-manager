# How to add tables to the database and autopopulate them

### Create a table model in /models/`name`.js

The name of the model file will be the name of the table prefixed by `tbl_`.
Example: If you want the table to be named `tbl_milestones` you should use `milestones.js`

Copy an existing model and modify it
##### Data types: https://sequelize.org/master/manual/model-basics.html#data-types
##### Column options: https://sequelize.org/master/manual/model-basics.html#column-options

#### If you change a model that has already been synchronized with the database
You must set `await models.init(sql, false)` to true in `./db/config.js` on line 53 to force the models to synchronize with the database (it drops all the tables and recreates them)

### Create a seed file in /seeds/`name`.js

Seeds are used to auto-populate the tables on creation mostly

The name of the seed file must have the same name as the name of the model file.
Example: If the table is named `tbl_milestones` you must use `milestones.js`

Copy an existing seed and modify it

#### If you need to add more rows to the seeds just add more items into the row array at the top
```javascript
const rows = [
  { title: 'CW1', module: 'Computing', intended_date: 1578268800000, completion_date: 1583625600000, status: 'In progress' },
  { title: 'CW2', module: 'Math', intended_date: 1578614400000, completion_date: 1585526400000, status: 'In progress' },
  { title: 'CW3', module: 'Physics', intended_date: 1582416000000, completion_date: 1585526400000, status: 'Complete' },
  { title: 'CW4', module: 'Physics', intended_date: 1582416000000, completion_date: 1585526400000, status: 'Complete' },
  { title: 'CW5', module: 'Computing', intended_date: 1582416000000, completion_date: 1585526400000, status: 'Complete' },
  { title: 'CW6', module: 'Web Dev', intended_date: 1582416000000, completion_date: 1585526400000, status: 'Complete' },
];
```

#### How to perform additional operations on rows before inserting
###### Create your function just below the rows declaration:
```javascript
function addToTitle() {
  rows.forEach((value, id) => {
    rows[id].title = `${value.title}-Added`;
  }
}
```
###### Specify your function 1 line above `model.createBulk(rows);`
```javascript
if (process.env.SQL === 'develop') {
  addToTitle();
  await model.bulkCreate(rows);
}
```

### Import the model to your database config

The model loader is automatically adding the models to Sequelize, if a model is wrongly formatted you will notice at runtime since it throws an error.

### How do I add foreign keys and relations

You don't. The model loader is not made yet to support those operations since it will get overly complicated. Instead you can just use queries to simulate relations.

# How to query with Sequelize

### First you have to import the model into the file that will query the database
```javascript
const { Coursework } = require('./db/models.js').models;
```

### How do I know what name to import?
The name of the model is simply the name of the model file capitalized (ex: `/models/coursework.js` is `Coursework`)

### What queries can I run?
Obviously, there are a lot of queries you can run which can be found here:
https://sequelize.org/master/manual/model-querying-basics.html

###### Select
https://sequelize.org/master/manual/model-querying-finders.html
```javascript
const result = await Coursework.findOne({ where: { firstName: "Jane" } }); // Returns the row itself
const resultAll = await Coursework.findAll({ where: { firstName: "Jane" } }); // Returns an array of rows
```
###### Insert one
```javascript
await Coursework.create({ firstName: "Jane", lastName: "Doe" });
```
###### Insert multiple (bulk)
```javascript
const rows = [
  { firstName: "Jane", lastName: "Doe" },
  { firstName: "John", lastName: "Doe" },
]
await Coursework.bulkCreate(rows);
```
###### Update directly
```javascript
await Coursework.update({ firstName: "John" }, { where: { firstName: "Jane" } });
```
###### Update instance
```javascript
const result = await Coursework.findOne({ where: { firstName: "Jane" } });
result.firstName = 'John';
await result.save();
```
###### Delete
```javascript
await Coursework.destroy({ where: { firstName: "Jane" } }); // Delete the row where firstName = Jane
await Coursework.destroy({ where: {} }); // Delete all the rows
```
###### Raw queries
https://sequelize.org/master/manual/raw-queries.html
```javascript
import sql = require('./db/config,js').sql;

await sql.query('YOUR QUERY') 
```
If you want to use raw queries you should make sure SQL injections are not possible either by sanitizing the data or by using the binding features (read more in the link)
