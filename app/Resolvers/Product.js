const Product = use("App/Models/Product");

module.exports = {
  Query: {
    products: async () => {
      const products = await Product.all();
      return products.toJSON();
    }
  },
  Mutation: {
    addProduct: async (_, { description, price }) => {
      return await Product.create({ id: 1, description, price });
    }
  }
};
