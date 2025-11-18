import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  lastLoginAt: Date;

  @Prop({ default: 0 })
  apiCallsCount: number;

  @Prop({ type: [String], default: [] })
  customModelIds: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
