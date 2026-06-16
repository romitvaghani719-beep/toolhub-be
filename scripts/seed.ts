import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@toolvault.io";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
const ADMIN_NAME = "Admin User";

const SAMPLE_USERS = [
  { key: "john", email: "john@toolvault.io", name: "John Carter", role: "user" as const },
  { key: "sarah", email: "sarah@toolvault.io", name: "Sarah Nguyen", role: "user" as const },
  { key: "mike", email: "mike@toolvault.io", name: "Mike Alvarez", role: "user" as const },
  { key: "alex", email: "alex@toolvault.io", name: "Alex Petrov", role: "user" as const },
  { key: "priya", email: "priya@toolvault.io", name: "Priya Shah", role: "user" as const },
];

const SAMPLE_TOOLS = [
  {
    key: "t1",
    addedBy: "john",
    created_at: "2026-06-15T14:22:00Z",
    name: "Orion Chat",
    description: "Conversational assistant for drafting, summarizing and reasoning across long documents with citations.",
    website_url: "https://orionchat.ai",
    category: "chat",
    logo_color: "oklch(0.62 0.17 46)",
    tags: ["LLM", "Assistant", "Summarize"],
    votes: 342,
    api_available: true,
    free_plan: true,
    open_source: false,
    pricing: "Freemium · $20/mo Pro",
    automation: "Webhooks + Zapier",
    community: "Active Discord",
    models: ["GPT-4o", "Claude 3.5", "Gemini 1.5"],
    features: ["Long-context document chat", "Inline citations & sources", "Custom assistants / personas", "Team workspaces"],
    ai_capabilities: ["Reasoning", "Summarization", "Code help", "Vision (image input)"],
    use_cases: ["Summarize research papers", "Draft customer replies", "Analyze meeting notes"],
    featured: true,
  },
  {
    key: "t2",
    addedBy: "sarah",
    created_at: "2026-06-15T11:08:00Z",
    name: "Quillstream",
    description: "AI writing workspace with tone control, brand voice memory and one-click long-form drafting.",
    website_url: "https://quillstream.io",
    category: "writing",
    logo_color: "oklch(0.62 0.15 155)",
    tags: ["Writing", "Marketing", "SEO"],
    votes: 271,
    api_available: true,
    free_plan: true,
    open_source: false,
    pricing: "Freemium · $15/mo",
    automation: "Zapier + API",
    community: "Community forum",
    models: ["GPT-4o", "Claude 3.5"],
    features: ["Brand voice profiles", "Long-form outlines", "Plagiarism check", "Multi-language output"],
    ai_capabilities: ["Generation", "Rewriting", "Tone adjustment"],
    use_cases: ["Blog posts", "Ad copy", "Email campaigns"],
    featured: false,
  },
  {
    key: "t3",
    addedBy: "mike",
    created_at: "2026-06-14T16:30:00Z",
    name: "Forge IDE",
    description: "AI pair-programmer in your editor — multi-file edits, repo-aware chat and inline test generation.",
    website_url: "https://forge.dev",
    category: "code",
    logo_color: "oklch(0.6 0.15 250)",
    tags: ["Coding", "IDE", "Agent"],
    votes: 418,
    api_available: true,
    free_plan: false,
    open_source: false,
    pricing: "$20/mo · Team $40/seat",
    automation: "CLI + CI hooks",
    community: "GitHub + Discord",
    models: ["GPT-4o", "Claude 3.5 Sonnet"],
    features: ["Repo-aware completions", "Multi-file refactors", "Inline test generation", "Terminal command suggestions"],
    ai_capabilities: ["Code generation", "Debugging", "Refactoring", "Agentic edits"],
    use_cases: ["Refactor legacy code", "Write unit tests", "Explain unfamiliar repos"],
    featured: true,
  },
  {
    key: "t4",
    addedBy: "alex",
    created_at: "2026-06-14T13:12:00Z",
    name: "Lumen Vision",
    description: "Text-to-image studio with consistent characters, style presets and high-res upscaling.",
    website_url: "https://lumenvision.art",
    category: "image",
    logo_color: "oklch(0.6 0.16 300)",
    tags: ["Image", "Design", "Generative"],
    votes: 305,
    api_available: true,
    free_plan: true,
    open_source: false,
    pricing: "Credits · from $10",
    automation: "REST API",
    community: "Showcase gallery",
    models: ["Diffusion XL", "In-house v3"],
    features: ["Character consistency", "Style reference upload", "4K upscaling", "Batch generation"],
    ai_capabilities: ["Image generation", "Inpainting", "Style transfer"],
    use_cases: ["Marketing visuals", "Concept art", "Product mockups"],
    featured: false,
  },
  {
    key: "t5",
    addedBy: "john",
    created_at: "2026-06-13T15:48:00Z",
    name: "Cadence Flow",
    description: "Visual automation builder that wires LLM steps between your apps with human-in-the-loop approvals.",
    website_url: "https://cadenceflow.com",
    category: "auto",
    logo_color: "oklch(0.6 0.15 200)",
    tags: ["Automation", "Workflow", "No-code"],
    votes: 198,
    api_available: true,
    free_plan: true,
    open_source: false,
    pricing: "Freemium · $29/mo",
    automation: "Native — it IS automation",
    community: "Templates library",
    models: ["Bring your own key"],
    features: ["Drag-and-drop flows", "200+ app connectors", "Human approval steps", "Scheduled runs"],
    ai_capabilities: ["Orchestration", "Routing", "Data extraction"],
    use_cases: ["Lead enrichment", "Ticket triage", "Report generation"],
    featured: false,
  },
  {
    key: "t6",
    addedBy: "priya",
    created_at: "2026-06-13T12:20:00Z",
    name: "Echo Transcribe",
    description: "Speech-to-text and meeting intelligence with speaker labels, summaries and action items.",
    website_url: "https://echo.audio",
    category: "audio",
    logo_color: "oklch(0.6 0.16 20)",
    tags: ["Audio", "Transcription", "Meetings"],
    votes: 156,
    api_available: true,
    free_plan: true,
    open_source: true,
    pricing: "Free tier · $12/mo",
    automation: "Webhooks",
    community: "Open-source core",
    models: ["Whisper v3", "In-house diarizer"],
    features: ["Speaker diarization", "Auto summaries", "Action-item extraction", "40+ languages"],
    ai_capabilities: ["Transcription", "Summarization", "Translation"],
    use_cases: ["Meeting notes", "Podcast captions", "Interview analysis"],
    featured: false,
  },
  {
    key: "t7",
    addedBy: "mike",
    created_at: "2026-06-12T17:02:00Z",
    name: "Insight Grid",
    description: "Chat with your databases and spreadsheets — natural-language queries, charts and scheduled digests.",
    website_url: "https://insightgrid.io",
    category: "data",
    logo_color: "oklch(0.58 0.14 270)",
    tags: ["Data", "SQL", "BI"],
    votes: 224,
    api_available: true,
    free_plan: false,
    open_source: false,
    pricing: "$25/mo · Team $50",
    automation: "Slack + email digests",
    community: "Slack community",
    models: ["GPT-4o", "In-house SQL model"],
    features: ["Natural-language SQL", "Auto chart selection", "Scheduled digests", "Row-level security"],
    ai_capabilities: ["Query generation", "Data analysis", "Visualization"],
    use_cases: ["Ad-hoc analytics", "KPI dashboards", "Exec summaries"],
    featured: false,
  },
  {
    key: "t8",
    addedBy: "sarah",
    created_at: "2026-06-12T09:30:00Z",
    name: "Scout Research",
    description: "Answer engine that searches the web and private docs.",
    website_url: "https://scout.so",
    category: "search",
    logo_color: "oklch(0.6 0.15 130)",
    tags: ["Search", "Research", "RAG"],
    votes: 289,
    api_available: true,
    free_plan: true,
    open_source: false,
    pricing: "Freemium · $18/mo",
    automation: "API + browser ext",
    community: "Public roadmap",
    models: ["GPT-4o", "Claude 3.5"],
    features: ["Live web + private docs", "Structured citations", "Follow-up threads", "Browser extension"],
    ai_capabilities: ["Retrieval (RAG)", "Synthesis", "Citation"],
    use_cases: ["Market research", "Competitive analysis", "Literature review"],
    featured: true,
  },
  {
    key: "t9",
    addedBy: "alex",
    created_at: "2026-06-11T15:10:00Z",
    name: "Mosaic Deck",
    description: "Turn a prompt or doc into a polished slide deck with on-brand layouts and speaker notes.",
    website_url: "https://mosaicdeck.app",
    category: "writing",
    logo_color: "oklch(0.62 0.16 70)",
    tags: ["Slides", "Presentation", "Design"],
    votes: 167,
    api_available: false,
    free_plan: true,
    open_source: false,
    pricing: "Free · $14/mo Pro",
    automation: "Export to PPTX",
    community: "Template gallery",
    models: ["GPT-4o"],
    features: ["Doc-to-deck", "Brand themes", "Speaker notes", "PPTX export"],
    ai_capabilities: ["Generation", "Layout", "Summarization"],
    use_cases: ["Pitch decks", "Internal reviews", "Lecture slides"],
    featured: false,
  },
  {
    key: "t10",
    addedBy: "mike",
    created_at: "2026-06-11T10:05:00Z",
    name: "Sentinel Guard",
    description: "AI code-security reviewer that flags vulnerabilities and secrets in pull requests automatically.",
    website_url: "https://sentinelguard.dev",
    category: "code",
    logo_color: "oklch(0.58 0.15 30)",
    tags: ["Security", "DevOps", "Review"],
    votes: 143,
    api_available: true,
    free_plan: false,
    open_source: true,
    pricing: "$15/seat/mo",
    automation: "GitHub Actions",
    community: "Open-source rules",
    models: ["In-house security model"],
    features: ["PR vulnerability scan", "Secret detection", "Fix suggestions", "SOC2 reports"],
    ai_capabilities: ["Static analysis", "Pattern detection", "Remediation"],
    use_cases: ["Secure code review", "Compliance", "Secret scanning"],
    featured: false,
  },
  {
    key: "t11",
    addedBy: "priya",
    created_at: "2026-06-10T09:50:00Z",
    name: "Nova Assistant",
    description: "Voice-first personal assistant that books, drafts and schedules across your connected accounts.",
    website_url: "https://novaassistant.ai",
    category: "chat",
    logo_color: "oklch(0.6 0.16 330)",
    tags: ["Assistant", "Voice", "Productivity"],
    votes: 132,
    api_available: true,
    free_plan: true,
    open_source: false,
    pricing: "Freemium · $16/mo",
    automation: "Calendar + email",
    community: "Beta community",
    models: ["GPT-4o", "In-house voice"],
    features: ["Voice commands", "Calendar booking", "Email drafting", "Cross-app memory"],
    ai_capabilities: ["Reasoning", "Speech", "Task automation"],
    use_cases: ["Schedule meetings", "Triage inbox", "Daily briefings"],
    featured: false,
  },
  {
    key: "t12",
    addedBy: "alex",
    created_at: "2026-06-10T11:30:00Z",
    name: "Pixel Motion",
    description: "Generate and edit short videos from scripts with AI voiceover, captions and stock footage.",
    website_url: "https://pixelmotion.video",
    category: "audio",
    logo_color: "oklch(0.6 0.16 350)",
    tags: ["Video", "Generative", "Editing"],
    votes: 211,
    api_available: true,
    free_plan: true,
    open_source: false,
    pricing: "Credits · from $12",
    automation: "REST API",
    community: "Creator showcase",
    models: ["In-house video v2", "ElevenVoice"],
    features: ["Script-to-video", "AI voiceover", "Auto captions", "Stock library"],
    ai_capabilities: ["Video generation", "Voice synthesis", "Editing"],
    use_cases: ["Social clips", "Explainers", "Ads"],
    featured: false,
  },
];

const ACTIVITY_EVENTS = [
  { member: "john", tool: "t1", action: "created", at: "2026-06-15T14:22:00Z" },
  { member: "sarah", tool: "t2", action: "created", at: "2026-06-15T11:08:00Z" },
  { member: "john", tool: "t1", action: "updated", at: "2026-06-15T09:45:00Z" },
  { member: "mike", tool: "t3", action: "created", at: "2026-06-14T16:30:00Z" },
  { member: "alex", tool: "t4", action: "created", at: "2026-06-14T13:12:00Z" },
  { member: "mike", tool: "t10", action: "updated", at: "2026-06-14T10:05:00Z" },
  { member: "john", tool: "t5", action: "created", at: "2026-06-13T15:48:00Z" },
  { member: "priya", tool: "t6", action: "created", at: "2026-06-13T12:20:00Z" },
  { member: "mike", tool: "t7", action: "created", at: "2026-06-12T17:02:00Z" },
  { member: "sarah", tool: "t8", action: "created", at: "2026-06-12T09:30:00Z" },
];

async function seed() {
  const poolerUrl = process.env.SUPABASE_POOLER_URL;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!poolerUrl || !supabaseUrl || !serviceKey) {
    console.error("SUPABASE_POOLER_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY required");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const sql = postgres(poolerUrl, { max: 1, prepare: false });

  try {
    async function ensureUser(
      email: string,
      password: string,
      name: string,
      role: "admin" | "user",
    ) {
      const existing = await sql<{ id: string }[]>`
        SELECT id FROM public.users WHERE email = ${email} LIMIT 1
      `;
      if (existing[0]) return existing[0].id;

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role },
      });
      if (error || !data.user) {
        throw new Error(error?.message ?? `Failed to create ${email}`);
      }

      await sql`
        INSERT INTO public.users (id, email, name, role)
        VALUES (${data.user.id}, ${email}, ${name}, ${role})
        ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, name = EXCLUDED.name
      `;
      return data.user.id;
    }

    const adminId = await ensureUser(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, "admin");
    console.log(`Admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

    const userIdByKey: Record<string, string> = {};
    for (const u of SAMPLE_USERS) {
      const id = await ensureUser(u.email, "User123!", u.name, u.role);
      userIdByKey[u.key] = id;
      console.log(`User: ${u.email}`);
    }

    const toolIdByKey: Record<string, string> = {};
    for (const tool of SAMPLE_TOOLS) {
      const creator = userIdByKey[tool.addedBy] ?? adminId;

      const existing = await sql<{ id: string }[]>`
        SELECT id FROM public.tools WHERE name = ${tool.name} LIMIT 1
      `;
      if (existing[0]) {
        toolIdByKey[tool.key] = existing[0].id;
        await sql`
          UPDATE public.tools
          SET
            description = ${tool.description},
            website_url = ${tool.website_url},
            category = ${tool.category},
            logo_color = ${tool.logo_color ?? null},
            tags = ${tool.tags ?? []},
            votes = ${tool.votes ?? 0},
            api_available = ${tool.api_available ?? false},
            free_plan = ${tool.free_plan ?? false},
            open_source = ${tool.open_source ?? false},
            pricing = ${tool.pricing ?? null},
            automation = ${tool.automation ?? null},
            community = ${tool.community ?? null},
            models = ${tool.models ?? []},
            features = ${tool.features ?? []},
            ai_capabilities = ${tool.ai_capabilities ?? []},
            use_cases = ${tool.use_cases ?? []},
            featured = ${tool.featured ?? false},
            created_by = ${creator}
          WHERE id = ${existing[0].id}
        `;
        continue;
      }

      const rows = await sql<{ id: string }[]>`
        INSERT INTO public.tools (
          name, description, website_url, category, logo_color, tags, votes,
          api_available, free_plan, open_source, pricing, automation, community,
          models, features, ai_capabilities, use_cases, featured, created_by
        )
        VALUES (
          ${tool.name}, ${tool.description}, ${tool.website_url}, ${tool.category}, ${tool.logo_color ?? null}, ${tool.tags ?? []}, ${tool.votes ?? 0},
          ${tool.api_available ?? false}, ${tool.free_plan ?? false}, ${tool.open_source ?? false}, ${tool.pricing ?? null}, ${tool.automation ?? null}, ${tool.community ?? null},
          ${tool.models ?? []}, ${tool.features ?? []}, ${tool.ai_capabilities ?? []}, ${tool.use_cases ?? []}, ${tool.featured ?? false}, ${creator}
        )
        RETURNING id
      `;
      toolIdByKey[tool.key] = rows[0].id;
      console.log(`Tool: ${tool.name}`);
    }

    for (const ev of ACTIVITY_EVENTS) {
      const userId = userIdByKey[ev.member];
      const toolId = toolIdByKey[ev.tool];
      if (!userId || !toolId) continue;
      const dup = await sql<{ id: string }[]>`
        SELECT id FROM public.activities
        WHERE user_id = ${userId}
          AND tool_id = ${toolId}
          AND action = ${ev.action}
          AND created_at = ${ev.at}::timestamptz
        LIMIT 1
      `;
      if (dup[0]) continue;
      await sql`
        INSERT INTO public.activities (user_id, tool_id, action, created_at)
        VALUES (${userId}, ${toolId}, ${ev.action}, ${ev.at}::timestamptz)
      `;
    }

    console.log("Seed complete.");
  } finally {
    await sql.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
