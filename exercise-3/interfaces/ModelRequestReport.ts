// exercise-3/interfaces/ModelRequestReport.ts

export interface ModelRequestReport {
  id: string;
  modelType: string;
  status: string;
  createdAt: Date;
  processedAt?: Date;
  metadata?: Record<string, any>;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
