export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  brewLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}
