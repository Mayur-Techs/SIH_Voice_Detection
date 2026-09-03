export const server = async ({ project, directory, client }) => {
  const activeSessions = new Map();

  return {
    "event": async ({ event }) => {
      if (event.type === "session.initialize") {
        const sessionID = event.properties?.sessionID || "unknown";
        activeSessions.set(sessionID, Date.now());
        console.log(`[orchestrator] session started: ${sessionID}`);
      }
      if (event.type === "session.idle" || event.type === "session.dispose") {
        const sessionID = event.properties?.sessionID || "unknown";
        activeSessions.delete(sessionID);
        console.log(`[orchestrator] session ended: ${sessionID}`);
      }
      return;
    },
    "tool": {
      "orchestrator_status": {
        "description": "Get the status of active sessions and the orchestrator",
        "parameters": {
          "type": "object",
          "properties": {}
        },
        "execute": async (args, context) => {
          const sessions = Array.from(activeSessions.entries()).map(([id, start]) => ({
            sessionID: id,
            ageMs: Date.now() - start
          }));
          return {
            activeSessions: sessions,
            totalActive: sessions.length,
            project: project?.id || "unknown"
          };
        }
      }
    }
  };
};
