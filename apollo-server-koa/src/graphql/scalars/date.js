const moment = require('moment')
const { Kind } = require('graphql/language')
const { GraphQLScalarType } = require('graphql')

const customScalarDate = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  parseValue: value => moment(value).valueOf(),
  serialize: value => moment(value).format('YYYY-MM-DD HH:mm:ss:SSS'),
  parseLiteral: ast => (ast.kind === Kind.INT)
    ? parseInt(ast.value, 10)
    : null
})

module.exports = { Date: customScalarDate }