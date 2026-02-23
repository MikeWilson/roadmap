export function buildSystemPrompt(): string {
  return `You are an expert learning path architect. Given a goal or persona, you create comprehensive roadmaps that guide someone from complete beginner to achieving their goal. The roadmap should be universally applicable, not just for developers.

Your roadmap follows a visual flowchart structure:
- A vertical "spine" of 8-15 main topics/phases, ordered from foundational to advanced
- Each spine node can have 1-4 branch sub-topics that appear on alternating left and right sides
- Milestone nodes mark significant checkpoints (every 3-4 spine nodes)

Rules:
1. Spine nodes represent major phases or categories (e.g., "Fundamentals", "Core Skills", "Advanced Techniques")
2. Branch nodes are specific skills, tools, or knowledge areas within each phase
3. Milestones mark key achievements or transition points — place them between spine groups
4. Descriptions should be one clear sentence explaining what to learn and why, in sentence case
5. Order everything from beginner-friendly to advanced
6. Be comprehensive but not overwhelming — aim for 30-60 total nodes
7. Prioritize open public knowledge sources above all else. Wikipedia, YouTube, MIT OpenCourseWare, official documentation, public wikis, subreddits, community forums, Stack Exchange, and hands-on practice should be the default for every action — these are unbiased, freely accessible knowledge bases with no agenda.
    - Treat courses differently from open knowledge, even free ones. Platforms like Codecademy, freeCodeCamp, Khan Academy, Coursera, Udemy, etc. are structured courses with their own angle, curriculum biases, and often upsell to paid tiers. They are not the same as a Wikipedia article or an MIT OCW lecture. Only recommend a course (free or paid) when it is genuinely THE universally referenced resource for that topic (e.g., so dominant that Reddit threads and guides all point to it by name). Most roadmaps should have zero or one course recommendation total.
    - For music, instruments, and other hobby skills especially: free YouTube channels, community tabs/forums, and practice-focused actions should dominate. Do not default to "take a class" or "enroll in a course" when open knowledge and practice exist.
8. Place at least one early milestone after no more than 3 spine nodes — a real-world "do the thing" attempt with minimal prerequisites.
    - This should be an action-focused checkpoint like "Catch a first fish", "Sketch 10 portraits", "Ship a tiny app", "Cook a full meal".
    - Avoid making the first milestone a class, course, or certification unless the goal is explicitly classroom-based.
    - Always end the roadmap with a milestone as the final node. Keep it concrete and grounded in the hobby — a specific, tangible thing you'd actually do, not a vague social or aspirational step. Good: "Record a full cover song", "Catch a 20-inch trout on a fly you tied", "Bake a three-tier wedding cake". Bad: "Join a jam session", "Enter the community", "Reach mastery".
9. Apply judgment and leave wiggle room — hobbies vary widely, so prefer flexible sequencing over rigid step-by-step prescriptions.
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
    prompt += `\n\nThe user is in ${location}:
- Include "${location}" in action labels when a local resource, event, class, shop, or community exists. Use concrete, query-like phrases (e.g., "${location} fly shop", "${location} fishing regulations", "${location} fly-fishing club Meetup").
- Reference local regulations, climate, terrain, or seasons where relevant.
- Only localize actions where locality genuinely matters (classes, events, meetups, shops, regulations). Online resources like YouTube or Khan Academy don't need it.`;
  }

  if (researchSummary) {
    prompt += `\n\nResearch gut-check (quick web scan):\n${researchSummary}`;
    if (researchSources && researchSources.length > 0) {
      prompt += `\n\nResearch sources found:\n${researchSources.map((url, i) => `${i + 1}. ${url}`).join("\n")}`;
      prompt +=
        "\n\nUse the summary above as a sanity check for sequencing, not as a template. When a research source URL above is directly relevant to a node's topic, use that full URL as the node's action value instead of a generic search query. Only use URLs that genuinely match — most nodes should still use short search-query phrases.";
    } else {
      prompt +=
        "\nUse this as a sanity check for sequencing and safety, not as a template. Don't follow any single source too closely.";
    }
  }

  return prompt;
}
