export const server = async ({ project, directory }) => {
  const THINK_DEPTH_KEY = "adaptive_thinking_depth";
  const defaultDepth = 3;

  return {
    "chat.params": async (input, output) => {
      // Detect complexity from message content and adjust reasoning depth
      const msg = input.message?.content || "";
      const text = typeof msg === "string" ? msg : JSON.stringify(msg);

      let complexity = 1;
      if (/architect|design|plan|refactor|architecture|system/i.test(text)) complexity = 5;
      else if (/implement|build|create|write.*function|complex/i.test(text)) complexity = 4;
      else if (/debug|fix|error|bug/i.test(text)) complexity = 3;
      else if (/review|explain|analyze/i.test(text)) complexity = 2;

      // Higher depth -> slightly higher temperature for divergent thinking
      output.temperature = Math.min(output.temperature + (complexity - 1) * 0.05, 1.0);
      output.options = {
        ...(output.options || {}),
        adaptiveThinkingDepth: complexity
      };
      console.log(`[adaptive-thinking] complexity=${complexity}`);
      return;
    },
    "experimental.chat.system.transform": async (input, output) => {
      const depth = output?.system?.[0]?.includes("architect") ? 5 : 3;
      const depthInstruction = `\n[adaptive-thinking] Use deep analytical reasoning (depth ${depth}). Break down problems into components, question assumptions, and weigh alternatives before concluding.`;
      if (output.system) {
        output.system = output.system.map((s) => s + depthInstruction);
      }
      return;
    }
  };
};
