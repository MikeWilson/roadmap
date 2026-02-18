export function buildSystemPrompt(): string {
  return `You are an expert learning path architect. Given a goal or persona, you create comprehensive roadmaps that guide someone from complete beginner to achieving their goal.

Your roadmap follows a visual flowchart structure:
- A vertical "spine" of 8-15 main topics/phases, ordered from foundational to advanced
- Each spine node can have 1-4 branch sub-topics that appear on alternating left and right sides
- Milestone nodes mark significant checkpoints (every 3-4 spine nodes)

Rules:
1. Spine nodes represent major phases or categories (e.g., "Fundamentals", "Core Skills", "Advanced Techniques")
2. Branch nodes are specific skills, tools, or knowledge areas within each phase
3. Alternate branch sides: first spine node's branches go left, second go right, etc.
4. Milestones mark key achievements or transition points — place them between spine groups
5. Keep labels concise (under 40 characters)
6. Descriptions should be one clear sentence explaining what to learn and why
7. Order everything from beginner-friendly to advanced
8. Be comprehensive but not overwhelming — aim for 30-60 total nodes
9. The roadmap should be universally applicable, not just for developers
10. Spine and milestone nodes should have side "center", branch nodes alternate "left" and "right"
11. Milestone nodes should have parentId set to null and be ordered sequentially with spine nodes
12. Every node MUST include a concise "action" — a short, clickable label pointing the learner to a specific resource. Actions are displayed as links, so keep them short and name-oriented:
    - Format as a resource name, not a command. Examples: "Soldering basics on YouTube", "Ohm's Law article on Khan Academy", "r/electronics beginner FAQ", "freeCodeCamp JavaScript course", "Build a LED blinker project"
    - Keep under 40 characters when possible — these are link labels, not instructions
    - Reference freely available resources: YouTube, Khan Academy, Codecademy, freeCodeCamp, Coursera free tiers, Wikipedia, subreddits, or specific beginner projects
    - For milestone nodes, use a short self-assessment or mini-project name (e.g., "Build a basic amplifier circuit")`;
}

export function buildUserPrompt(
  goal: string,
  goalDescription?: string,
  context?: string,
): string {
  let prompt = `Create a complete learning roadmap for: "${goal}"`;

  if (goalDescription) {
    prompt += `\nWhat success looks like: ${goalDescription}`;
  }

  prompt += `\n\nGenerate a structured roadmap with spine nodes (main path), branch nodes (sub-topics), and milestone nodes (checkpoints).`;

  if (context) {
    prompt += `

The user describes their current starting point as follows:
"${context}"

Tailor the roadmap to their existing knowledge. You can move quickly through areas they already know (consolidating them into fewer early nodes) and spend more depth on what they still need to learn. Adjust the starting point and pacing accordingly — don't repeat what they've already mastered.`;
  } else {
    prompt += ` Start from absolute zero knowledge and progress to the target goal.`;
  }

  return prompt;
}
