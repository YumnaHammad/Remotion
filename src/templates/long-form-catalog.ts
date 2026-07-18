import type { LongFormCategory } from "@/types/scene-video";
import { totalSceneDuration } from "@/types/scene-video";
import type { LongFormTemplateMeta } from "@/types/scene-video";
import type { TemplateCatalogItem } from "@/templates/catalog";
import { scenesWithIds } from "@/lib/scene-presets";

type SceneDef = LongFormTemplateMeta["defaultScenes"][number];

function scenes(...items: SceneDef[]): SceneDef[] {
  return items;
}

const intro = (title: string, subtitle: string): SceneDef => ({
  type: "intro",
  title,
  subtitle,
  animation: "fade",
  durationInFrames: 90,
  background: "gradient-hero",
});

const outro = (title: string, subtitle: string): SceneDef => ({
  type: "outro",
  title,
  subtitle,
  animation: "fade",
  durationInFrames: 90,
});

const stat = (title: string, value: string, label: string): SceneDef => ({
  type: "stats",
  title,
  statValue: value,
  statLabel: label,
  animation: "count-up",
  durationInFrames: 100,
});

const content = (title: string, body: string, animation: SceneDef["animation"] = "slide"): SceneDef => ({
  type: "content",
  title,
  body,
  animation,
  durationInFrames: 120,
});

const quote = (text: string, author: string): SceneDef => ({
  type: "quote",
  title: "Insight",
  quote: text,
  author,
  animation: "reveal",
  durationInFrames: 90,
});

const gallery = (title: string): SceneDef => ({
  type: "gallery",
  title,
  images: [],
  animation: "card-stack",
  durationInFrames: 150,
});

interface LongFormTemplateDef extends LongFormTemplateMeta {
  id: string;
  name: string;
  description: string;
  aspectRatio: "16:9" | "9:16" | "1:1";
  thumbnail: string;
  useCases: TemplateCatalogItem["useCases"];
}

const LONG_FORM_DEFS: LongFormTemplateDef[] = [
  {
    id: "lf-monthly-report",
    name: "Monthly Business Report",
    description: "Executive summary with KPIs, highlights, and closing CTA",
    longFormCategory: "Business & Analytics",
    difficulty: "intermediate",
    estimatedDuration: "2 min",
    featured: true,
    trending: true,
    sceneCount: 12,
    aspectRatio: "16:9",
    thumbnail: "gradient-corporate",
    useCases: ["data", "manual"],
    defaultScenes: scenes(
      intro("Monthly Business Report", "Performance overview"),
      stat("Revenue", "+24%", "vs last month"),
      stat("Customers", "12.4K", "Active accounts"),
      content("Key wins", "New enterprise deals · 94% retention · Product launch success", "timeline"),
      quote("Our strongest month on record.", "CEO"),
      gallery("Team highlights"),
      content("Next month focus", "Expand APAC · Launch v2.0 · Hire 15 roles"),
      outro("Full report", "yourcompany.com/report")
    ),
  },
  {
    id: "lf-performance-review",
    name: "Company Performance Review",
    description: "Quarterly review with metrics, milestones, and outlook",
    longFormCategory: "Business & Analytics",
    difficulty: "advanced",
    estimatedDuration: "3 min",
    featured: true,
    sceneCount: 14,
    aspectRatio: "16:9",
    thumbnail: "gradient-cool",
    useCases: ["data", "manual"],
    defaultScenes: scenes(
      intro("Performance Review", "Q4 2025"),
      stat("ARR", "$4.2M", "Annual recurring revenue"),
      stat("NPS", "72", "Customer satisfaction"),
      content("Milestones", "SOC 2 certified · 3 new markets · Series B closed"),
      stat("Headcount", "+18%", "Team growth"),
      gallery("Quarter in pictures"),
      quote("We exceeded every target we set.", "COO"),
      content("2026 priorities", "Profitability · Platform expansion · Partner ecosystem"),
      outro("Questions?", "leadership@company.com")
    ),
  },
  {
    id: "lf-pitch-summary",
    name: "Startup Pitch Summary",
    description: "Investor-ready pitch with problem, solution, traction, and ask",
    longFormCategory: "Business & Analytics",
    difficulty: "intermediate",
    estimatedDuration: "90 sec",
    trending: true,
    sceneCount: 10,
    aspectRatio: "16:9",
    thumbnail: "gradient-hero",
    useCases: ["manual", "website"],
    defaultScenes: scenes(
      intro("Startup Name", "The future of your category"),
      content("Problem", "Teams waste 10+ hours/week on manual reporting"),
      content("Solution", "AI-powered video reports from your existing data"),
      stat("Traction", "500+", "Paying customers"),
      stat("MRR", "$85K", "Monthly recurring revenue"),
      gallery("Product screenshots"),
      quote("This changes how teams communicate data.", "Lead investor"),
      outro("Let's talk", "pitch@startup.com")
    ),
  },
  {
    id: "lf-sales-report",
    name: "Sales Report",
    description: "Pipeline, wins, and regional breakdown for sales teams",
    longFormCategory: "Business & Analytics",
    difficulty: "beginner",
    estimatedDuration: "2 min",
    sceneCount: 11,
    aspectRatio: "16:9",
    thumbnail: "gradient-warm",
    useCases: ["data", "manual"],
    defaultScenes: scenes(
      intro("Sales Report", "Weekly pipeline update"),
      stat("Closed won", "$340K", "This week"),
      stat("Pipeline", "$2.1M", "Qualified opportunities"),
      content("Top deals", "Acme Corp · Globex · Initech — all in final stage"),
      stat("Win rate", "34%", "Last 90 days"),
      gallery("Deal highlights"),
      outro("CRM dashboard", "sales.company.com")
    ),
  },
  {
    id: "lf-financial-dashboard",
    name: "Financial Dashboard",
    description: "P&L highlights, cash flow, and budget vs actual",
    longFormCategory: "Business & Analytics",
    difficulty: "advanced",
    estimatedDuration: "2.5 min",
    sceneCount: 13,
    aspectRatio: "16:9",
    thumbnail: "gradient-corporate",
    useCases: ["data"],
    defaultScenes: scenes(
      intro("Financial Dashboard", "Monthly close"),
      stat("Revenue", "$1.8M", "Net revenue"),
      stat("Gross margin", "68%", "Blended"),
      content("Expenses", "R&D 32% · Sales 28% · G&A 12%"),
      stat("Cash", "$6.2M", "Runway: 18 months"),
      content("Budget vs actual", "Marketing under by 8% · Engineering on plan"),
      quote("Disciplined growth with strong unit economics.", "CFO"),
      outro("Board deck", "finance.company.com")
    ),
  },
  {
    id: "lf-instagram-carousel",
    name: "Instagram Carousel Video",
    description: "Swipe-style vertical slides for Instagram and Stories",
    longFormCategory: "Social Media",
    difficulty: "beginner",
    estimatedDuration: "45 sec",
    trending: true,
    sceneCount: 8,
    aspectRatio: "9:16",
    thumbnail: "gradient-social",
    useCases: ["manual", "website"],
    defaultScenes: scenes(
      intro("5 Tips", "Swipe for more →"),
      content("Tip 1", "Start with a hook in the first 3 seconds", "slide"),
      content("Tip 2", "Use bold text and high contrast", "zoom"),
      content("Tip 3", "Add captions — 80% watch muted", "scale"),
      gallery("Visual examples"),
      quote("Consistency beats perfection.", "@yourhandle"),
      outro("Follow for more", "@yourhandle")
    ),
  },
  {
    id: "lf-youtube-explainer",
    name: "YouTube Explainer",
    description: "Chapter-based explainer for YouTube and LinkedIn",
    longFormCategory: "Social Media",
    difficulty: "intermediate",
    estimatedDuration: "3 min",
    featured: true,
    sceneCount: 15,
    aspectRatio: "16:9",
    thumbnail: "gradient-cool",
    useCases: ["manual", "website"],
    defaultScenes: scenes(
      intro("How It Works", "Complete guide in 3 minutes"),
      content("Chapter 1", "What problem does this solve?", "fade"),
      content("Chapter 2", "Step-by-step walkthrough", "timeline"),
      gallery("Screenshots & demos"),
      stat("Results", "3x", "Faster workflow"),
      content("Chapter 3", "Pro tips from power users"),
      quote("Game changer for our team.", "Customer review"),
      outro("Subscribe", "Link in description")
    ),
  },
  {
    id: "lf-podcast-highlights",
    name: "Podcast Highlights",
    description: "Best moments reel with quotes and episode branding",
    longFormCategory: "Social Media",
    difficulty: "beginner",
    estimatedDuration: "60 sec",
    sceneCount: 9,
    aspectRatio: "9:16",
    thumbnail: "gradient-warm",
    useCases: ["manual"],
    defaultScenes: scenes(
      intro("Podcast Name", "Episode 42 — Highlights"),
      quote("The best advice I ever got was...", "Guest name"),
      quote("We grew from zero to millions by...", "Host"),
      content("Topics covered", "Growth · Fundraising · Culture"),
      gallery("Episode moments"),
      outro("Full episode", "link.bio/podcast")
    ),
  },
  {
    id: "lf-portfolio",
    name: "Personal Portfolio",
    description: "Showcase work, skills, and contact for creatives",
    longFormCategory: "Social Media",
    difficulty: "intermediate",
    estimatedDuration: "90 sec",
    sceneCount: 10,
    aspectRatio: "16:9",
    thumbnail: "gradient-social",
    useCases: ["manual", "website"],
    defaultScenes: scenes(
      intro("Your Name", "Designer · Developer · Creator"),
      gallery("Selected work"),
      content("About", "5+ years building brands and products for startups"),
      stat("Projects", "40+", "Delivered worldwide"),
      content("Skills", "Brand · UI/UX · Motion · Code"),
      quote("Design is how it works.", "Steve Jobs"),
      outro("Let's connect", "yourname.com")
    ),
  },
  {
    id: "lf-influencer-recap",
    name: "Influencer Recap",
    description: "Weekly recap with stats, highlights, and shoutouts",
    longFormCategory: "Social Media",
    difficulty: "beginner",
    estimatedDuration: "45 sec",
    trending: true,
    sceneCount: 8,
    aspectRatio: "9:16",
    thumbnail: "gradient-social",
    useCases: ["manual", "data"],
    defaultScenes: scenes(
      intro("This Week", "@yourhandle recap"),
      stat("Views", "1.2M", "Total reach"),
      stat("Followers", "+8.4K", "New this week"),
      gallery("Top posts"),
      content("Shoutouts", "Thanks to our community & collaborators"),
      outro("Next week", "Follow for more")
    ),
  },
  {
    id: "lf-product-showcase",
    name: "Product Showcase",
    description: "Feature tour with benefits, demos, and social proof",
    longFormCategory: "Marketing",
    difficulty: "intermediate",
    estimatedDuration: "2 min",
    featured: true,
    sceneCount: 12,
    aspectRatio: "16:9",
    thumbnail: "gradient-hero",
    useCases: ["website", "manual"],
    defaultScenes: scenes(
      intro("Product Name", "Built for modern teams"),
      content("Overview", "Everything you need in one platform"),
      gallery("Product screens"),
      stat("Speed", "10x", "Faster than alternatives"),
      content("Features", "Automate · Collaborate · Export in 4K"),
      quote("We switched and never looked back.", "Happy customer"),
      outro("Try free", "product.com")
    ),
  },
  {
    id: "lf-feature-announcement",
    name: "Feature Announcement",
    description: "Launch new features with before/after and CTA",
    longFormCategory: "Marketing",
    difficulty: "beginner",
    estimatedDuration: "60 sec",
    sceneCount: 8,
    aspectRatio: "16:9",
    thumbnail: "gradient-cool",
    useCases: ["manual", "website"],
    defaultScenes: scenes(
      intro("New Feature", "Introducing Smart Export"),
      content("Before", "Manual exports took hours", "split-screen"),
      content("After", "One click — done in seconds", "reveal"),
      stat("Time saved", "95%", "Average per export"),
      outro("Available now", "Update today")
    ),
  },
  {
    id: "lf-testimonials",
    name: "Customer Testimonials",
    description: "Rotating quotes and logos from happy customers",
    longFormCategory: "Marketing",
    difficulty: "beginner",
    estimatedDuration: "90 sec",
    sceneCount: 10,
    aspectRatio: "16:9",
    thumbnail: "gradient-corporate",
    useCases: ["manual", "data"],
    defaultScenes: scenes(
      intro("Customers Love Us", "Real stories, real results"),
      quote("Cut our video production time in half.", "Sarah, Marketing Director"),
      quote("The ROI was visible in week one.", "James, CEO"),
      quote("Our team actually enjoys making videos now.", "Priya, Content Lead"),
      stat("Rating", "4.9★", "Average review score"),
      outro("Join them", "Start free trial")
    ),
  },
  {
    id: "lf-before-after",
    name: "Before/After Comparison",
    description: "Side-by-side transformation stories",
    longFormCategory: "Marketing",
    difficulty: "intermediate",
    estimatedDuration: "75 sec",
    sceneCount: 9,
    aspectRatio: "9:16",
    thumbnail: "gradient-warm",
    useCases: ["manual"],
    defaultScenes: scenes(
      intro("Transformation", "See the difference"),
      content("Before", "Scattered tools, slow exports, off-brand output", "split-screen"),
      content("After", "One platform, minutes to export, always on-brand", "reveal"),
      stat("Efficiency", "+300%", "Productivity gain"),
      gallery("Results gallery"),
      outro("Your turn", "Try it free")
    ),
  },
  {
    id: "lf-case-study",
    name: "Case Study Presentation",
    description: "Challenge, approach, results format for B2B marketing",
    longFormCategory: "Marketing",
    difficulty: "advanced",
    estimatedDuration: "3 min",
    sceneCount: 14,
    aspectRatio: "16:9",
    thumbnail: "gradient-corporate",
    useCases: ["data", "manual"],
    defaultScenes: scenes(
      intro("Case Study", "How Acme scaled video production"),
      content("Challenge", "Manual editing couldn't keep up with demand"),
      content("Approach", "Template-based workflow + brand kit"),
      stat("Output", "5x", "More videos per month"),
      stat("Cost", "-60%", "Production spend"),
      gallery("Sample outputs"),
      quote("Framekit became our creative engine.", "VP Marketing, Acme"),
      outro("Read full study", "company.com/case-studies")
    ),
  },
  {
    id: "lf-team-intro",
    name: "Team Introduction",
    description: "Meet the team with roles, values, and culture",
    longFormCategory: "Corporate",
    difficulty: "beginner",
    estimatedDuration: "2 min",
    sceneCount: 11,
    aspectRatio: "16:9",
    thumbnail: "gradient-corporate",
    useCases: ["manual"],
    defaultScenes: scenes(
      intro("Meet the Team", "The people behind the product"),
      content("Our mission", "Empower every team to tell their story"),
      gallery("Team photos"),
      content("Values", "Transparency · Craft · Customer obsession"),
      stat("Team size", "48", "Across 12 countries"),
      quote("We hire for curiosity and kindness.", "Head of People"),
      outro("We're hiring", "careers.company.com")
    ),
  },
  {
    id: "lf-company-presentation",
    name: "Company Presentation",
    description: "All-hands or investor deck in video format",
    longFormCategory: "Corporate",
    difficulty: "advanced",
    estimatedDuration: "4 min",
    featured: true,
    sceneCount: 16,
    aspectRatio: "16:9",
    thumbnail: "gradient-hero",
    useCases: ["manual", "data"],
    defaultScenes: scenes(
      intro("Company Name", "2025 Annual Presentation"),
      content("Vision", "Where we're headed in the next 3 years"),
      stat("Growth", "+140%", "YoY revenue"),
      content("Markets", "North America · EMEA · APAC expansion"),
      gallery("Office & culture"),
      content("Product roadmap", "Q1–Q4 milestones"),
      quote("We're building for the long term.", "Founder & CEO"),
      outro("Thank you", "company.com")
    ),
  },
  {
    id: "lf-project-timeline",
    name: "Project Timeline",
    description: "Milestone timeline for project updates and retros",
    longFormCategory: "Corporate",
    difficulty: "intermediate",
    estimatedDuration: "2 min",
    sceneCount: 12,
    aspectRatio: "16:9",
    thumbnail: "gradient-cool",
    useCases: ["manual", "data"],
    defaultScenes: scenes(
      intro("Project Timeline", "Launch initiative 2025"),
      content("Phase 1", "Discovery & research — Complete", "timeline"),
      content("Phase 2", "Design & prototype — Complete", "timeline"),
      content("Phase 3", "Build & test — In progress", "timeline"),
      content("Phase 4", "Launch & iterate — Q2 2026", "timeline"),
      stat("On track", "92%", "Milestone completion"),
      outro("Next sync", "project.company.com")
    ),
  },
  {
    id: "lf-annual-report",
    name: "Annual Report",
    description: "Year in review with financials, impact, and gratitude",
    longFormCategory: "Corporate",
    difficulty: "advanced",
    estimatedDuration: "5 min",
    sceneCount: 18,
    aspectRatio: "16:9",
    thumbnail: "gradient-corporate",
    useCases: ["data"],
    defaultScenes: scenes(
      intro("Annual Report", "2025 Year in Review"),
      stat("Revenue", "$22M", "Full year"),
      stat("Customers", "2,400+", "Worldwide"),
      content("Impact", "Carbon neutral ops · 1% pledge · 500 volunteer hours"),
      gallery("Year highlights"),
      content("By the numbers", "12 product releases · 4 awards · 3 new offices"),
      quote("Thank you to our team, customers, and partners.", "Chairman"),
      outro("Full report PDF", "investors.company.com")
    ),
  },
  {
    id: "lf-event-highlights",
    name: "Event Highlights",
    description: "Conference or event recap with sessions and speakers",
    longFormCategory: "Corporate",
    difficulty: "intermediate",
    estimatedDuration: "2 min",
    trending: true,
    sceneCount: 11,
    aspectRatio: "16:9",
    thumbnail: "gradient-warm",
    useCases: ["manual"],
    defaultScenes: scenes(
      intro("Event Name", "2025 Highlights"),
      stat("Attendees", "3,200", "In person + virtual"),
      gallery("Event photos"),
      content("Top sessions", "Keynote · Workshops · Networking"),
      quote("Best conference I've attended in years.", "Attendee"),
      outro("Save the date", "event.com/2026")
    ),
  },
  {
    id: "lf-csv-charts",
    name: "CSV to Animated Charts",
    description: "Turn spreadsheet columns into animated chart scenes",
    longFormCategory: "Data to Video",
    difficulty: "intermediate",
    estimatedDuration: "2 min",
    featured: true,
    sceneCount: 12,
    aspectRatio: "16:9",
    thumbnail: "gradient-cool",
    useCases: ["data"],
    defaultScenes: scenes(
      intro("Data Report", "From your CSV"),
      stat("Metric A", "↑ 18%", "Primary KPI"),
      stat("Metric B", "$2.4M", "Secondary KPI"),
      content("Trend analysis", "Upload CSV to populate each slide automatically"),
      gallery("Chart previews"),
      outro("Refresh data", "Re-export anytime")
    ),
  },
  {
    id: "lf-excel-report",
    name: "Excel to Business Report",
    description: "Workbook rows become executive report scenes",
    longFormCategory: "Data to Video",
    difficulty: "intermediate",
    estimatedDuration: "2.5 min",
    sceneCount: 13,
    aspectRatio: "16:9",
    thumbnail: "gradient-corporate",
    useCases: ["data"],
    defaultScenes: scenes(
      intro("Business Report", "Generated from Excel"),
      content("Summary", "Each sheet row maps to a content scene"),
      stat("Rows processed", "50", "Max per export"),
      content("Department breakdown", "Auto-detected columns"),
      outro("Source file", "Last synced today")
    ),
  },
  {
    id: "lf-json-analytics",
    name: "JSON to Analytics Video",
    description: "API or JSON metrics as animated dashboard video",
    longFormCategory: "Data to Video",
    difficulty: "advanced",
    estimatedDuration: "90 sec",
    sceneCount: 10,
    aspectRatio: "16:9",
    thumbnail: "gradient-hero",
    useCases: ["data"],
    defaultScenes: scenes(
      intro("Analytics Video", "Live JSON feed"),
      stat("Users", "48.2K", "Daily active"),
      stat("Conversion", "3.8%", "Funnel rate"),
      content("Segments", "Mobile · Desktop · API clients"),
      outro("Dashboard", "analytics.company.com")
    ),
  },
  {
    id: "lf-stock-summary",
    name: "Stock Summary",
    description: "Market recap with price, change, and sector highlights",
    longFormCategory: "Data to Video",
    difficulty: "beginner",
    estimatedDuration: "60 sec",
    trending: true,
    sceneCount: 9,
    aspectRatio: "16:9",
    thumbnail: "gradient-warm",
    useCases: ["data"],
    defaultScenes: scenes(
      intro("Market Summary", "Today's close"),
      stat("S&P 500", "+0.8%", "Daily change"),
      stat("NASDAQ", "+1.2%", "Daily change"),
      content("Top movers", "Upload CSV with ticker data"),
      outro("Disclaimer", "Not financial advice")
    ),
  },
  {
    id: "lf-sports-stats",
    name: "Sports Statistics",
    description: "Game recap with scores, stats, and player highlights",
    longFormCategory: "Data to Video",
    difficulty: "beginner",
    estimatedDuration: "75 sec",
    sceneCount: 10,
    aspectRatio: "16:9",
    thumbnail: "gradient-social",
    useCases: ["data", "manual"],
    defaultScenes: scenes(
      intro("Game Recap", "Final score & stats"),
      stat("Final", "98–92", "Home vs Away"),
      stat("MVP", "34 pts", "Top scorer"),
      content("Key plays", "Upload stats JSON or CSV"),
      gallery("Highlight reel"),
      outro("Next game", "Schedule at league.com")
    ),
  },
];

export function buildLongFormCatalogItems(): TemplateCatalogItem[] {
  const fps = 30;

  return LONG_FORM_DEFS.map((def) => {
    const scenes = scenesWithIds(def.defaultScenes);
    const durationInFrames = totalSceneDuration(scenes);
    const isVertical = def.aspectRatio === "9:16";

    return {
      id: def.id,
      name: def.name,
      description: def.description,
      category: mapCategory(def.longFormCategory),
      compositionId: "LongFormVideo",
      aspectRatio: def.aspectRatio,
      durationInFrames,
      fps,
      width: isVertical ? 1080 : def.aspectRatio === "1:1" ? 1080 : 1920,
      height: isVertical ? 1920 : def.aspectRatio === "1:1" ? 1080 : 1080,
      thumbnail: def.thumbnail,
      popular: def.trending,
      premium: def.difficulty === "advanced" || def.id === "lf-annual-report",
      useCases: def.useCases,
      longForm: true,
      longFormCategory: def.longFormCategory,
      difficulty: def.difficulty,
      estimatedDuration: def.estimatedDuration,
      featured: def.featured,
      trending: def.trending,
      sceneCount: def.sceneCount,
      defaultScenes: def.defaultScenes,
    };
  });
}

function mapCategory(cat: LongFormCategory): TemplateCatalogItem["category"] {
  const map: Record<LongFormCategory, TemplateCatalogItem["category"]> = {
    "Business & Analytics": "Business",
    "Social Media": "Social",
    Marketing: "Product",
    Corporate: "Business",
    "Data to Video": "Business",
  };
  return map[cat];
}

export const LONG_FORM_CATEGORIES: LongFormCategory[] = [
  "Business & Analytics",
  "Social Media",
  "Marketing",
  "Corporate",
  "Data to Video",
];

export { LONG_FORM_DEFS };
