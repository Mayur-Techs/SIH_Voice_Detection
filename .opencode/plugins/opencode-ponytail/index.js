export const server = async ({ project, directory }) => {
  return {
    "event": async ({ event }) => {
      if (event.type === "message.part.updated" || event.type === "message.updated") {
        return;
      }
      console.log(`[ponytail] event: ${event.type}`);
    },
    "chat.params": async (input, output) => {
      // Lazy efficiency: reduce verbosity, keep responses focused
      output.temperature = Math.min(output.temperature, 0.4);
      return;
    },
    "chat.message": async (input, output) => {
      const text = output.parts?.filter((p) => p.type === "text").map((p) => p.text).join(" ") || "";
      if (text.length > 0) {
        console.log(`[ponytail] message.length=${text.length} chars`);
      }
      return;
    },
    "tool.execute.before": async (input, output) => {
      // Lazy dev rule: question necessity - flag tool calls that might be redundant
      console.log(`[ponytail] executing tool: ${input.tool} (session=${input.sessionID})`);
      return;
    }
  };
};
