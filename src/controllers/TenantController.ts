import { NextFunction, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { CreateTenantRequest } from '../types/index';
import createHttpError from 'http-errors';
import { Logger } from 'winston';

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}
  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const { name, address } = req.body;
    this.logger.debug(`Creating tenant ${name} with address ${address}`);
    try {
      const tenant = await this.tenantService.create({ name, address });
      this.logger.info(`Tenant ${name} created successfully`);
      res.status(201).json(tenant);
    } catch (error) {
      const err = createHttpError(500, 'Failed to create tenant');
      next(err);
      return;
    }
  }
}
