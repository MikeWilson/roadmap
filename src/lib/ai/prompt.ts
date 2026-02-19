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
12. Every spine and branch node MUST include a concise "action" — a short, clickable label pointing the learner to a specific resource. Actions are displayed as links, so keep them short and name-oriented:
    - Format as a resource name or search-query noun phrase, not a full sentence or command. Examples: "YouTube: soldering basics", "Ohm's Law (Khan Academy)", "r/electronics beginner FAQ", "freeCodeCamp JavaScript course", "LED blinker mini-project"
    - Avoid vague filler like "local spots" or "some nearby places" — include a concrete resource type
    - Keep under 40 characters when possible — these are link labels, not instructions
    - Reference freely available resources: YouTube, Khan Academy, Codecademy, freeCodeCamp, Coursera free tiers, Wikipedia, subreddits, or specific beginner projects
    - For milestone nodes, action should be null UNLESS there is a genuinely useful, specific resource to link to (e.g., a project tutorial or assessment guide). Most milestones are self-explanatory checkpoints — don't force an action link that would just repeat the milestone label as a search query.
13. Ensure at least one early milestone is a real-world "do the thing" attempt with minimal prerequisites (within the first 1-3 spine nodes).
    - This should be an action-focused checkpoint like "Catch a first fish", "Sketch 10 portraits", "Ship a tiny app", "Cook a full meal".
    - Avoid making the first milestone a class, course, or certification unless the goal is explicitly classroom-based.
14. Apply judgment and leave wiggle room — hobbies vary widely, so prefer flexible sequencing over rigid step-by-step prescriptions.
    - When in doubt, bias toward "get out and do it" experiences rather than more prep or coursework.`;
}

export function buildUserPrompt(
  goal: string,
  goalDescription?: string,
  context?: string,
  location?: string,
  researchSummary?: string,
  researchSources?: string[],
): string {
  let prompt = `Create a complete learning roadmap for: "${goal}"`;

  if (goalDescription) {
    prompt += `\nWhat success looks like: ${goalDescription}`;
  }

  if (location) {
    prompt += `\nThe user is located in: ${location}`;
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

  if (location) {
    prompt += `\n\nSince the user is in ${location}:
- ACTIONS MUST be localized — include "${location}" in action labels whenever a local resource, event, class, shop, or community exists.
- Localized actions should be specific and query-like: include a concrete resource type + location. Examples: "${location} fly shop", "fly fishing access map ${location}", "${location} fishing regulations", "${location} fly-fishing club Meetup".
- Avoid vague phrasing like "local spots" or "some nearby places". If the location is a county or ZIP, prefer a nearby city/metro name when possible, or use "near ${location}" plus a resource type.
- Reference local regulations, climate, terrain, or seasons where relevant (e.g., growing zones for gardening, local permits, weather considerations).
- Prefer naming real local resources when obvious (e.g., community colleges, parks, known local shops) but generic localized searches are fine too.
- Keep it natural — not every action needs the location, only the ones where locality genuinely matters (classes, events, meetups, shops, communities, regulations). Online resources like YouTube or Khan Academy don't need it.`;
  }

  if (researchSummary) {
    prompt += `\n\nResearch gut-check (quick web scan):\n${researchSummary}`;
    if (researchSources && researchSources.length > 0) {
      prompt += `\nSources: ${researchSources.join(", ")}`;
    }
    prompt +=
      "\nUse this only to validate high-level sequencing and safety. Do not overfit to any single source.";
  }

  return prompt;
}
