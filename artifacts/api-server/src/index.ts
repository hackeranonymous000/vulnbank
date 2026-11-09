import app from "./app";
import { logger } from "./lib/logger";

const requested = Number(process.env.API_PORT ?? process.env.PORT ?? 0);
const port = Number.isFinite(requested) && requested > 0 ? requested : 8823;

app.listen(port, "127.0.0.1", (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info(
    { port, developedBy: "Alexis" },
    `VulnBank API listening on http://localhost:${port}/api`,
  );
});
