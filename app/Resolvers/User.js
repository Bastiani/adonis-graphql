const User = use("App/Models/User");
const { PubSub } = require("apollo-server");
const cursor = use("App/GraphQL/Cursor");

const pubsub = new PubSub();

const EVENTS = {
  USER: {
    ADDED: "USER_ADDED"
  }
};

module.exports = {
  Query: {
    users: async (parent, { after, first }) => {
      const data = await User.all();
      const dataJSON = data.toJSON();
      return cursor(dataJSON, after, first);
    }
  },
  Mutation: {
    addUser: async (_, { name, email, password }) => {
      const user = await User.create({ name, email, password });
      pubsub.publish(EVENTS.USER.ADDED, { user });
      return user;
    }
  },
  Subscription: {
    userAdded: {
      // Additional event labels can be passed to asyncIterator creation
      resolve: ({ user }) => user,
      subscribe: () => pubsub.asyncIterator([EVENTS.USER.ADDED])
    }
  }
};
