import type { RequestHandler } from "express";

import { listCompanies } from "../services/companies.service.js";

export const companiesListController: RequestHandler = async (_req, res, next) => {
  try {
    const result = await listCompanies();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};


