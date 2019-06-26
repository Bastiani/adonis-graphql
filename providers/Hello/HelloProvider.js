const { ServiceProvider } = require("@adonisjs/fold");

class HelloProvider extends ServiceProvider {
  register() {
    // register bindings
  }

  boot() {
    // optionally do some initial setup
    this.app.singleton("HelloProvider", () => {
      console.log("hello from my provider");
    });
  }
}

module.exports = HelloProvider;
