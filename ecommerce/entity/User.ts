import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { createHmac } from 'crypto';
import { v1 as uuidv1 } from 'uuid';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 32 })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  about: string;

  @Column({ type: 'varchar' })
  hashedPassword: string;

  @Column({ type: 'varchar' })
  salt: string;

  @Column({ type: 'int', default: 0 })
  role: number;

  @Column({ type: 'json', nullable: true })
  history: any[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt: Date;

  private _password: string;

  set password(password: string) {
    this._password = password;
    this.salt = uuidv1();
    this.hashedPassword = this.encryptPassword(password);
  }

  get password(): string {
    return this._password;
  }

  authenticate(plainText: string): boolean {
    return this.encryptPassword(plainText) === this.hashedPassword;
  }

  encryptPassword(password: string): string {
    if (!password) return '';
    try {
      return createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  trimFields() {
    this.name = this.name.trim();
    this.email = this.email.trim();
    if (this.about) {
      this.about = this.about.trim();
    }
  }
}
