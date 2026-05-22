import { Router } from "express";

import { companiesListController } from "../controllers/companies.controller.js";

export const companiesRouter = Router();

companiesRouter.get("/companies", companiesListController);

