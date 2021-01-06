import {merge} from 'lodash';
import typeDefs from "./typeDefs";

import landing from "./resolvers/landing";
import friends from './resolvers/friends';
import user from './resolvers/user';

const graph = {
  ...merge(landing, friends, user),
  typeDefs
};

export default graph;
