import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

export const scalarResolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value: any) {
      return new Date(value);
    },
    serialize(value: any) {
      return value instanceof Date ? value.toISOString() : null;
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value);
      }
      return null;
    },
  }),
};
