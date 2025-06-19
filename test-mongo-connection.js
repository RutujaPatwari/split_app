const mongoose = require('mongoose');

const uri = "mongodb+srv://rutujapatwari:EjY7PUeGpYw9tyE0@cluster0.yz4c9ln.mongodb.net/splitapp?retryWrites=true&w=majority&appName=Cluster0&authSource=admin";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch(console.dir);