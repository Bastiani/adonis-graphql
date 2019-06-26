const Product = use("App/Models/Product");
const { PubSub } = require("apollo-server");

const pubsub = new PubSub();

const EVENTS = {
  PRODUCT: {
    ADDED: "PRODUCT_ADDED"
  }
};

module.exports = {
  Query: {
    products: async (parent, args, { foo }, info) => {
      // console.log("======== context", parent, foo, args, info);

      const products = await Product.all();
      return products.toJSON();
    }
  },
  Mutation: {
    addProduct: async (_, { id, description, price }) => {
      const product = await Product.create({ id, description, price });
      pubsub.publish(EVENTS.PRODUCT.ADDED, { product });
      return product;
    }
  },
  Subscription: {
    productAdded: {
      // Additional event labels can be passed to asyncIterator creation
      resolve: ({ product }) => product,
      subscribe: () => pubsub.asyncIterator([EVENTS.PRODUCT.ADDED])
    }
  }
};
