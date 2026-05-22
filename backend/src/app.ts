import express from "express";
import morgan from "morgan";
import { applySecurity } from "./middleware/security.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";
import { salaryRouter } from "./routes/salary.routes.js";
import { companiesRouter } from "./routes/companies.routes.js";

export function createApp() {
  const app = express();

  applySecurity(app);
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("tiny"));

  app.get("/health", (_req, res) => {
    res.json({ success: true, status: "ok" });
  });

  app.use("/api", salaryRouter);
  app.use("/api", companiesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
