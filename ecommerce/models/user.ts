import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';
import { v1 as uuidv1 } from 'uuid';

// Define the User interface
export interface IUser extends Document {
  name: string;
  email: string;
  hashed_password: string;
  about?: string;
  salt: string;
  role: number;
  history: any[];
  password?: string; // Virtual field
  _password?: string; // Internal field for virtual password
  authenticate(plainText: string): boolean;
  encryptPassword(password: string): string;
}

// User Schema
const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    hashed_password: {
      type: String,
      required: true
    },
    about: {
      type: String,
      trim: true
    },
    salt: {
      type: String
    },
    role: {
      type: Number,
      default: 0 // 0 for regular user, 1 for admin
    },
    history: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Virtual field for password
userSchema
  .virtual('password')
  .set(function(this: IUser, password: string) {
    this._password = password;
    this.salt = uuidv1();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function(this: IUser) {
    return this._password;
  });

// Methods
userSchema.methods = {
  authenticate: function(this: IUser, plainText: string): boolean {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword: function(this: IUser, password: string): string {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  }
};

// Define and export the User model
export const User: Model<IUser> = mongoose.model<IUser>(
  'User',
  userSchema
);
