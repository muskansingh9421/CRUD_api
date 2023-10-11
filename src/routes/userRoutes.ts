import { IncomingMessage, ServerResponse } from 'http';
import { UserController } from '../controller/userController'; 
import https from 'https';
export class UserRoutes {
  private userController: UserController;

  constructor(userController: UserController) {
    this.userController = userController;
  }

  public handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const { method, url } = req;

    if (method === 'GET' && url === '/api/users') {
      this.getAllUsers(req, res);
    } else if (method === 'GET' && url?.startsWith('/api/users/')) {
      const userId = parseInt(url.split('/').pop() || '', 10);
      this.getUserById(req, res, userId);
    } else if (method === 'POST' && url === '/api/users') {
      this.createUser(req, res);
    } else if (method === 'PUT' && url?.startsWith('/api/users/')) {
      const userId = parseInt(url.split('/').pop() || '', 10);
      this.updateUser(req, res, userId);
    } else if (method === 'DELETE' && url?.startsWith('/api/users/')) {
      const userId = parseInt(url.split('/').pop() || '', 10);
      this.deleteUser(req, res, userId);
    }else if (method === 'DELETE' && url === '/api/users') {
        this.deleteAllUsers(req, res); // Handle the DELETE /api/users route
    } else if (method === 'GET' && url === '/api/load') {
        this.loadUsersFromJsonPlaceholder(req, res);
    } else {
      this.notFound(res);
    }
  }

  private async getAllUsers(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const users = await this.userController.getAllUsers();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(users));
    } catch (error) {
      this.internalServerError(res);
    }
  }

  private async getUserById(req: IncomingMessage, res: ServerResponse, userId: number): Promise<void> {
    try {
      const user = await this.userController.getUserById(userId);
      if (!user) {
        this.notFound(res);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      }
    } catch (error) {
      this.internalServerError(res);
    }
  }

  private async createUser(req: IncomingMessage, res: ServerResponse): Promise<void> {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', async () => {
      try {
        const newUser = JSON.parse(data);
        await this.userController.createUser(newUser);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newUser));
      } catch (error) {
        res.end(JSON.stringify('user already exist'));
        // this.internalServerError(res);
      }
    });
  }

  private async updateUser(req: IncomingMessage, res: ServerResponse, userId: number): Promise<void> {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', async () => {
      try {
        const updatedUser = JSON.parse(data);
        await this.userController.updateUser(userId, updatedUser);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User updated successfully' }));
      } catch (error) {
        this.internalServerError(res);
      }
    });
  }

  private async deleteUser(req: IncomingMessage, res: ServerResponse, userId: number): Promise<void> {
    try {
      await this.userController.deleteUser(userId);
      res.writeHead(204);
      res.end(JSON.stringify({ message: 'Users Deleted successfully' }));
    } catch (error) {
      this.internalServerError(res);
    }
  }

  private async deleteAllUsers(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      // Call the UserController method to delete all users
      await this.userController.deleteAllUsers();

      res.writeHead(204); // No content response
      res.end();
    } catch (error) {
      this.internalServerError(res);
    }
  }

  private async loadUsersFromJsonPlaceholder(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      // Make an HTTPS GET request to JSON Placeholder
      https.get('https://jsonplaceholder.typicode.com/users', (response) => {
        let jsonData = '';

        // Collect the response data
        response.on('data', (chunk) => {
          jsonData += chunk;
        });
        
        // Process the response when it's complete
        response.on('end', async () => {
          if (response.statusCode === 200) {
            // Parse the JSON data
            const usersData = JSON.parse(jsonData);

            // Insert the users into the database
            await this.userController.loadUsersFromJson(usersData);

            res.writeHead(200);
            res.end(JSON.stringify({ message: 'Users imported successfully' }));
          } else {
            this.internalServerError(res);
          }
        });
      }).on('error', (error) => {
        this.internalServerError(res);
      });
    } catch (error) {
      this.internalServerError(res);
    }
  }


  private notFound(res: ServerResponse): void {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }

  private internalServerError(res: ServerResponse): void {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
}
