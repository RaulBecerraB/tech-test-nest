import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Error as MongooseError } from 'mongoose';
import { User } from './user.schema';

// Response interface
export interface UserStatistics {
  totalApiCalls: number;
  customModelsCount: number;
  lastLoginAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async getUserStatistics(userId: string): Promise<UserStatistics> {
    try {
      const user = await this.userModel.findById(userId).exec();

      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      return {
        totalApiCalls: user.apiCallsCount ?? 0,
        customModelsCount: user.customModelIds?.length ?? 0,
        lastLoginAt: user.lastLoginAt ?? null,
        createdAt: user.createdAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof MongooseError) {
        this.logger.error(
          `MongoDB error while retrieving statistics for ${userId}: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Unexpected error while retrieving statistics for ${userId}: ${
            (error as Error).message
          }`,
          (error as Error).stack,
        );
      }

      throw new InternalServerErrorException(
        'Failed to retrieve user statistics',
      );
    }
  }
}
