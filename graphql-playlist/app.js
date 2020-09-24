const express = require('express');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const schema = require('./schema/schema');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb+srv://qpjoy:fuckudz1@knock-graphql.7wy9q.gcp.mongodb.net/knock-graphql?retryWrites=true&w=majority');
mongoose.connection.once('open', () => {
    console.log('connected to database');
});

app.use('/graphql', (req, res) => {
    graphqlHTTP({
        schema,
        graphiql: true
    })(req,res)
});

app.listen(4001, () => {
    console.log('listening for requests on port 4000');
});