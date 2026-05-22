import type { RequestHandler } from "express";
import {
  compareSalaries,
  getCompanyInsights,
  getStats,
  ingestSalary,
  listSalaries
} from "../services/salary.service.js";
import { compareQuerySchema, salaryInputSchema, salaryQuerySchema } from "../validation/salary.validation.js";

export const ingestSalaryController: RequestHandler = async (req, res, next) => {
  try {
    const payload = salaryInputSchema.parse(req.body);
    const salary = await ingestSalary(payload);
    res.status(201).json({ success: true, data: salary });
  } catch (error) {
    next(error);
  }
};

export const listSalariesController: RequestHandler = async (req, res, next) => {
  try {
    const query = salaryQuerySchema.parse(req.query);
    const result = await listSalaries(query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const companyController: RequestHandler = async (req, res, next) => {
  try {
    const company = Array.isArray(req.params.company) ? req.params.company[0] : req.params.company;
    const result = await getCompanyInsights(company);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const compareController: RequestHandler = async (req, res, next) => {
  try {
    const query = compareQuerySchema.parse(req.query);
    const result = await compareSalaries(query.id1, query.id2);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const statsController: RequestHandler = async (_req, res, next) => {
  try {
    const result = await getStats();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
