// exercise-3/interfaces/ReportFilters.ts

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  modelType?: string;
  page?: number;
  limit?: number;
}
