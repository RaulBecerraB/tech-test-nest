// exercise-4/email.service.ts

import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { escape as escapeHTML } from 'lodash';

export type EmailTemplateType =
  | 'approved'
  | 'rejected'
  | 'processing';

interface EmailContext {
  userEmail: string;
  modelType: string;
  modelName: string;
  reason?: string;
  estimatedTime?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    // Load vars
    const apiKey = configService.get<string>('SENDGRID_API_KEY');
    this.fromEmail = configService.get<string>('FROM_EMAIL');

    // Validate
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not set in environment variables');
    }
    if (!this.fromEmail) {
      throw new Error('FROM_EMAIL is not set in environment variables');
    }

    sgMail.setApiKey(apiKey);
  }

  // ---- Public API ----

  async sendModelApprovedEmail(userEmail: string, modelType: string, modelName: string) {
    return this.sendEmail('approved', { userEmail, modelType, modelName });
  }

  async sendModelRejectedEmail(userEmail: string, modelType: string, modelName: string, reason: string) {
    return this.sendEmail('rejected', { userEmail, modelType, modelName, reason });
  }

  async sendModelProcessingEmail(
    userEmail: string,
    modelType: string,
    modelName: string,
    estimatedTime: string,
  ) {
    return this.sendEmail('processing', { userEmail, modelType, modelName, estimatedTime });
  }

  // ---- Template builder ----

  private buildTemplate(type: EmailTemplateType, ctx: EmailContext) {
    // sanitize dynamic fields
    const modelType = escapeHTML(ctx.modelType);
    const modelName = escapeHTML(ctx.modelName);
    const reason = ctx.reason ? escapeHTML(ctx.reason) : undefined;
    const estimatedTime = ctx.estimatedTime ? escapeHTML(ctx.estimatedTime) : undefined;

    switch (type) {
      case 'approved':
        return {
          subject: 'Your Custom Model Has Been Approved',
          html: `
            <html>
              <body style="font-family: Arial, sans-serif;">
                <h2 style="color: #4CAF50;">Model Approved!</h2>
                <p>Hello,</p>
                <p>Your ${modelType} model "${modelName}" has been approved.</p>
                <p><strong>Model Type:</strong> ${modelType}</p>
                <p><strong>Model Name:</strong> ${modelName}</p>
                <p>Best regards,<br>The Team</p>
              </body>
            </html>
          `,
          text: `Model Approved!\n\nYour ${modelType} model "${modelName}" has been approved.\n\nBest regards,\nThe Team`,
        };

      case 'rejected':
        return {
          subject: 'Your Custom Model Request Has Been Rejected',
          html: `
            <html>
              <body style="font-family: Arial, sans-serif;">
                <h2 style="color: #F44336;">Model Rejected</h2>
                <p>Hello,</p>
                <p>Your ${modelType} model "${modelName}" has been rejected.</p>
                <p><strong>Reason:</strong> ${reason ?? 'Not specified'}</p>
                <p>Best regards,<br>The Team</p>
              </body>
            </html>
          `,
          text: `Model Rejected\n\nYour ${modelType} model "${modelName}" was rejected.\nReason: ${reason ?? 'Not specified'}\n\nBest regards,\nThe Team`,
        };

      case 'processing':
        return {
          subject: 'Your Custom Model Is Being Processed',
          html: `
            <html>
              <body style="font-family: Arial, sans-serif;">
                <h2 style="color: #2196F3;">Model Processing</h2>
                <p>Hello,</p>
                <p>Your ${modelType} model "${modelName}" is being processed.</p>
                <p><strong>Estimated Time:</strong> ${estimatedTime ?? 'N/A'}</p>
                <p>Best regards,<br>The Team</p>
              </body>
            </html>
          `,
          text: `Model Processing\n\nYour ${modelType} model "${modelName}" is being processed.\nEstimated Time: ${estimatedTime ?? 'N/A'}\n\nBest regards,\nThe Team`,
        };
    }
  }

  // ---- Generic sender ----

  private async sendEmail(type: EmailTemplateType, ctx: EmailContext) {
    if (!ctx.userEmail) {
      throw new InternalServerErrorException('Invalid recipient email');
    }

    const { subject, html, text } = this.buildTemplate(type, ctx);

    try {
      await sgMail.send({
        to: ctx.userEmail,
        from: this.fromEmail,
        subject,
        html,
        text,
      });

      this.logger.log(`${type} email successfully sent to ${ctx.userEmail}`);
    } catch (err: any) {
      this.logger.error(
        `Failed to send ${type} email to ${ctx.userEmail}: ${err?.message}`,
        err?.stack,
      );
      throw new InternalServerErrorException('Email sending failed');
    }
  }
}
