import { app } from "@azure/functions";

app.http("healthcheck", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "healthcheck",
  handler: async (request, context) => {
    context.log("Healthcheck called");

    return {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "ok",
        timestamp: new Date().toISOString(),
      }),
    };
  },
});
