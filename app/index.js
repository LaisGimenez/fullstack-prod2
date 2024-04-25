//Express imports
import express from 'express';
import http from 'http';
import cors from 'cors';
//import bodyParser from 'body-parser';

//Apollo imports
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

//mongoose imports
import 'dotenv/config';



//App imports
import { connDB } from './config/config.js';
import typeDefs from './db/schema.js';
import resolvers from './db/resolvers.js';


//
const PORT = process.env.PORT || 4000;
const app = express();
const httpServer = http.createServer(app);


// ApolloServer constructor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// More required logic for integrating with Express
await server.start();

// Routes
app.use(
    express.static('public')
);

connDB();

// Endpoint
app.use('/app',
    cors(),
    express.json(), // en vez de bodyParser.json(),
    expressMiddleware(server)
);



// Server startup
await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
console.log(`🚀 Server ready at http://localhost:${PORT}`);


/*
/////////Mirar DB en Sandbox GraphQL/////////////
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import typeDefs from './db/schema.js';
import resolvers from './db/resolvers.js';

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
    listen: { port: 4000 },
});
console.log(`🚀  Server ready at ${url}`);
*/