const typeDefs = `
  type Todo {
    id: Int!
    text: String!
    completed: Boolean!
  }
  
  type Landing {
    login: String!
  }

  extend type Mutation {
    addTodo(text: String!): Todo
  }

  extend type Query {
    searchUserList: [DisplayUserInfo]
  }
`;

export default typeDefs;
