const User = use("App/Models/User");
const { PubSub } = require("apollo-server");

const pubsub = new PubSub();

const EVENTS = {
  USER: {
    ADDED: "USER_ADDED"
  }
};

module.exports = {
  Query: {
    users: async (parent, { after, first }) => {
      if (first < 0) {
        throw new Error("First must be positive");
      }

      const data = await User.all();
      const dataJSON = data.toJSON();

      const totalCount = dataJSON.length;
      let users = [];
      let start = 0;
      if (after !== undefined) {
        const buff = new Buffer(after, "base64");
        const id = buff.toString("ascii");
        const index = dataJSON.findIndex(user => user.id === id);
        if (index === -1) {
          throw new Error("After does not exist");
        }
        start = index + 1;
      }
      users =
        first === undefined ? dataJSON : dataJSON.slice(start, start + first);

      let endCursor;
      const edges = users.map(user => {
        const buffer = new Buffer(user._id);
        endCursor = buffer.toString("base64");
        return {
          cursor: endCursor,
          node: user
        };
      });
      const hasNextPage = start + first < totalCount;
      const pageInfo =
        endCursor !== undefined
          ? {
              endCursor,
              hasNextPage
            }
          : {
              hasNextPage
            };
      const result = {
        edges,
        pageInfo,
        totalCount
      };
      return result;
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
