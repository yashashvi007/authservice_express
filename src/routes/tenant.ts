import express, { NextFunction, Response } from 'express';
import { CreateTenantRequest } from '../types/index';
import { TenantService } from '../services/TenantService';
import { AppDataSource } from '../data-source';
import { Tenant } from '../entity/Tenant';
import { TenantController } from '../controllers/TenantController';
import logger from '../config/logger';
import authenticate from '../middleware/authenticate';
import { canAccess } from '../middleware/canAccess';
import { ROLES } from '../constants';

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);
router.post(
  '/',
  authenticate,
  canAccess([ROLES.ADMIN]),
  (req: CreateTenantRequest, res: Response, next: NextFunction) => {
    void tenantController.create(req, res, next);
  },
);

export default router;
