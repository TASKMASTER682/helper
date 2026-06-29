export const HOME_FEATURES = [
  {
    title: "Smart Test Series",
    desc: "AI-integrated mock tests with real-time ranking, detailed pillar-wise analysis, and automated answer key generation.",
    detail: "Adaptive Difficulty • Real-time Rank • Pillar Analysis",
    accentKey: "teal" as const,
  },
  {
    title: "Premium Academy",
    desc: "High-impact video modules covering the entire UPSC syllabus, from core GS to specialized current affairs modules.",
    detail: "HD Streaming • Offline Resources • Expert Curated",
    accentKey: "crimson" as const,
  },
  {
    title: "Strategic Missions",
    desc: "Break down the massive syllabus into actionable daily missions with precise deadline monitoring and tracking.",
    detail: "Daily Targets • Streak Tracking • Milestone Rewards",
    accentKey: "gold" as const,
  },
  {
    title: "Intelligent Analytics",
    desc: "Detailed performance mapping that identifies your weak pillars and calculates your exact examination readiness.",
    detail: "Pillar Mapping • Time Analytics • Growth Projection",
    accentKey: "teal" as const,
  },
];

export const HOME_REVIEWS = [
  {
    name: "Ananya Sharma",
    role: "IRS (P), 2024 Batch",
    text: "UPSC-POS changed how I perceived the syllabus. The Mission Control feature kept me disciplined when motivation failed.",
    avatar: "AS",
  },
  {
    name: "Vikram Malhotra",
    role: "UPSC Aspirant",
    text: "The Smart Test Series is a game changer. The pillar-wise analysis helped me identify that my Economy was lagging behind my Polity.",
    avatar: "VM",
  },
  {
    name: "Siddharth Verma",
    role: "IPS (P), 2024 Batch",
    text: "The most beautiful interface for preparation. No clutter, just high-performance tools that get the job done efficiently.",
    avatar: "SV",
  },
];

export type AnnouncementLike = {
  _id: string;
  title: string;
  content: string;
};
