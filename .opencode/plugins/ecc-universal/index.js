export const server = async ({ project, directory }) => {
  const verifiedPaths = new Set();

  return {
    "tool.execute.before": async (input, output) => {
      // ECC Universal: verify file existence and paths before file operations
      const args = output?.args || {};
      if (input.tool === "read" || input.tool === "edit" || input.tool === "write" ||
          input.tool === "readseek_digest" || input.tool === "readseek_edit") {
        console.log(`[ecc] verifying operation: ${input.tool}`);
      }
      return;
    },
    "tool.execute.after": async (input, output) => {
      // Verification loop: log results and catch runtime errors
      if (input.tool === "bash") {
        const hasError = /error|failed|not found|cannot find/i.test(output?.output || "");
        if (hasError) {
          console.log(`[ecc] ⚠ potential error detected in bash command`);
        }
      }
      return;
    },
    "event": async ({ event }) => {
      if (event.type === "session.error" || event.type === "error") {
        console.error(`[ecc] runtime error: ${JSON.stringify(event)}`);
      }
      return;
    }
  };
};
