import  {createServer}  from 'http';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { UserModel } from './model/user';
import { UserController } from './controller/userController';
import { UserRoutes } from './routes/userRoutes';

const dbUrl = 'mongodb+srv://muskaansingh890:XHVGcaRK9fFfNhS7@cluster1.q8sh3pn.mongodb.net/?retryWrites=true&w=majority'; // Change as needed
const dbName = 'test'; 
const port = 3000;

const db = new MongoClient(dbUrl,{
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

db.connect().then(async () => {
  const database = db.db(dbName); // Get the MongoDB database object
  const userModel = new UserModel(database);
  const userController = new UserController(userModel);
  const userRoutes = new UserRoutes(userController);

  const server = createServer((req, res) => {
    userRoutes.handleRequest(req, res);
  });

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
