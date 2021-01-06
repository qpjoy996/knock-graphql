const { gql } = require('apollo-server-fastify')

const schema = gql`

  type Food {
    id: Int
    name: String
  }

  type Cat {
    color: String
    love: Food
  }

  extend type Query {
    cats: [Cat]
  }
`

module.exports = { schema }