import { IUser, UserModel } from '../model/user'; 
export class UserController {
  private userModel: UserModel;

  constructor(userModel: UserModel) {
    this.userModel = userModel;
  }

  public async getAllUsers(): Promise<IUser[]> {
    try {
      const users = await this.userModel.getAllUsers();
      return users;
    } catch (error) {
      throw new Error('Internal server error');
    }
  }

  public async getUserById(userId: number): Promise<IUser | null> {
    try {
      const user = await this.userModel.getUserById(userId);
      return user;
    } catch (error) {
      throw new Error('Internal server error');
    }
  }

  public async createUser(newUser: IUser): Promise<void> {
    try {
        // Check if a user with the same email already exists
        const existingUser = await this.userModel.getUserByEmail(newUser.email);
  
        if (existingUser) {
          throw new Error('User with the same email already exists');
        }
  
        // If no user with the same email exists, insert the new user
        await this.userModel.createUser(newUser);
      } catch (error) {
        throw new Error('user already exists');
      }
    }
  

  public async updateUser(userId: number, updatedUser: IUser): Promise<void> {
    try {
      await this.userModel.updateUser(userId, updatedUser);
    } catch (error) {
      throw new Error('Internal server error');
    }
  }

  public async deleteUser(userId: number): Promise<void> {
    try {
      await this.userModel.deleteUser(userId);
    } catch (error) {
      throw new Error('Internal server error');
    }
  }
  public async deleteAllUsers(): Promise<void> {
    try {
      await this.userModel.deleteAllUsers();
    } catch (error) {
      throw new Error('Internal server error');
    }
  }
  // Add a new method to load users from JSON
  public async loadUsersFromJson(jsonData: IUser[]): Promise<void> {
    try {
      // Loop through the JSON data and insert each user into the database
      for (const user of jsonData) {
        await this.userModel.createUser(user);
      }
    } catch (error) {
      throw new Error('Internal server error');
    }
  }
}
