import { Router } from "express";
import {
  compareController,
  companyController,
  ingestSalaryController,
  listSalariesController,
  statsController
} from "../controllers/salary.controller.js";

export const salaryRouter = Router();

salaryRouter.post("/ingest-salary", ingestSalaryController);
salaryRouter.get("/salaries", listSalariesController);
salaryRouter.get("/company/:company", companyController);
salaryRouter.get("/compare", compareController);
salaryRouter.get("/stats", statsController);
