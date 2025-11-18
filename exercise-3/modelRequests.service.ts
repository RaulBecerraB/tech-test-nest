// exercise-3/modelRequests.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelRequest } from './schemas/model-request.schema.js';
import type { ModelRequestReport } from './interfaces/ModelRequestReport.js';
import type { ReportFilters } from './interfaces/ReportFilters.js';

export type { ModelRequestReport, ReportFilters };

@Injectable()
export class ModelRequestsService {
  constructor(
    @InjectModel(ModelRequest.name)
    private readonly modelReqModel: Model<ModelRequest>,
  ) {}

  async getModelRequestsReport(filters: ReportFilters) {
    const {
      startDate,
      endDate,
      status,
      modelType,
      page = 1,
      limit = 20,
    } = filters;

    const match: any = {};

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = startDate;
      if (endDate) match.createdAt.$lte = endDate;
    }

    if (status) {
      match.status = status;
    }

    if (modelType) {
      match.modelType = modelType;
    }

    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: match },

      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },

      { $unwind: '$user' },

      { $sort: { createdAt: -1 } },

      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],

          totalCount: [{ $count: 'count' }],

          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ];

    const [result] = await this.modelReqModel.aggregate(pipeline).exec();

    const total: number = result?.totalCount?.[0]?.count ?? 0;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    const data: ModelRequestReport[] = (result.data ?? []).map((doc: any) => ({
      id: doc._id.toString(),
      modelType: doc.modelType,
      status: doc.status,
      createdAt: doc.createdAt,
      processedAt: doc.processedAt,
      metadata: doc.metadata,
      user: {
        id: doc.user._id.toString(),
        name: doc.user.name,
        email: doc.user.email,
      },
    }));

    const statusCounts: Record<string, number> = {};
    for (const item of result.statusCounts ?? []) {
      statusCounts[item._id] = item.count;
    }

    return {
      data,
      total,
      page,
      totalPages,
      statusCounts,
      appliedFilters: match,
    };
  }
}
