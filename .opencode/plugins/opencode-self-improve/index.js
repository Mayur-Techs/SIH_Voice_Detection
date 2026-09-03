import fs from "node:fs";
import path from "node:path";

export const server = async ({ project, directory }) => {
  const patternsFile = path.join(directory, ".opencode", "patterns.json");
  const patterns = loadPatterns();

  function loadPatterns() {
    try {
      if (fs.existsSync(patternsFile)) {
        return JSON.parse(fs.readFileSync(patternsFile, "utf8"));
      }
    } catch (e) {}
    return { patterns: [], lastUpdated: null };
  }

  function savePatterns() {
    try {
      fs.mkdirSync(path.dirname(patternsFile), { recursive: true });
      fs.writeFileSync(patternsFile, JSON.stringify(patterns, null, 2), "utf8");
    } catch (e) {
      console.error("[self-improve] failed to save patterns:", e);
    }
  }

  return {
    "tool": {
      "self_improve_extract_pattern": {
        "description": "Extract and store a reusable pattern, convention, or lesson learned from this project",
        "parameters": {
          "type": "object",
          "properties": {
            "name": { "type": "string", "description": "Short name for the pattern" },
            "category": { "type": "string", "description": "Category (code-pattern, convention, lesson-learned, architecture)" },
            "description": { "type": "string", "description": "Description of the pattern" },
            "file": { "type": "string", "description": "File or location where the pattern applies" }
          },
          "required": ["name", "category", "description"]
        },
        "execute": async (args) => {
          const pattern = {
            name: args.name,
            category: args.category || "code-pattern",
            description: args.description,
            file: args.file || null,
            capturedAt: new Date().toISOString()
          };
          patterns.patterns.push(pattern);
          patterns.lastUpdated = new Date().toISOString();
          savePatterns();
          return { ok: true, pattern, totalPatterns: patterns.patterns.length };
        }
      },
      "self_improve_list_patterns": {
        "description": "List all captured patterns and lessons learned",
        "parameters": {
          "type": "object",
          "properties": {
            "category": { "type": "string", "description": "Filter by category" }
          }
        },
        "execute": async (args) => {
          const filtered = args?.category
            ? patterns.patterns.filter((p) => p.category === args.category)
            : patterns.patterns;
          return { patterns: filtered, total: filtered.length, lastUpdated: patterns.lastUpdated };
        }
      }
    }
  };
};
