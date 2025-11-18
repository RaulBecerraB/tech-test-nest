import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema()
export class ModelRequest extends Document {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true, enum: ['STT', 'TTS', 'Translator'] })
  modelType: string;

  @Prop({ required: true, enum: ['pending', 'approved', 'rejected'] })
  status: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop()
  processedAt: Date;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const ModelRequestSchema = SchemaFactory.createForClass(ModelRequest);
