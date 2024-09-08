const express = require('express');
const { ApolloServer } = require('@apollo/server');
const cors = require('cors');
const { expressMiddleware } = require('@apollo/server/express4');
const { default: axios } = require('axios');

async function startServer() {
    const app = express();
    const server = new ApolloServer({
        typeDefs: `
            type User {
                id: ID!,
                name: String!,
                username: String!,
                email: String!,
                phone: String!,
                website: String!
            }

            type ToDo {
                id: ID!,
                title: String!,
                completed: Boolean!,
                user: User
            }

            type Query {
                todos: [ToDo],
                users: [User],
                getUser(id: ID!): User
            }
        `,
        resolvers: {
            ToDo: {
                user: async (todo) => (await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.userId}`)).data
            },
            Query: {
                todos: async () => (await axios.get(`https://jsonplaceholder.typicode.com/todos`)).data,
                users: async () => (await axios.get(`https://jsonplaceholder.typicode.com/users`)).data,
                getUser: async (parent, { id }) => (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)).data
            }
        }
    });

    app.use(cors());
    app.use(express.json());

    await server.start();
    app.use('/graphql', expressMiddleware(server));

    app.listen(4000, () => {
        console.log('Server is running on port 4000');
    });
}

startServer();
