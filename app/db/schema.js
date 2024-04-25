const typeDefs = `#graphql

    scalar Date

    type Task {
        id: ID!
        panId: ID!
        status: Int!
        name: String
        descrip: String!
        member: String!
        dat: Date!  
    }
    
     type Panel {
        id: ID!
        name: String!
        dat: Date!
        descrip: String!
        color: String!
        tasks: [Task]
    }

    type Query {
        # Tableros
        panels: [Panel]
        getPanelById(id: ID!): Panel
        # Tareas
        getTasksByPanelId(panId: ID): [Task]
        getTaskById(id: ID!): Task
    }
    
`;
export default typeDefs;

