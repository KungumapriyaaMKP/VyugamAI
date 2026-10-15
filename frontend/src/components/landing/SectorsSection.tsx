import React from 'react';
import { ArrowRight, Cpu, ShieldCheck, HeartPulse, Atom, Eye, Coins, Bot, Leaf, Wand2, Network } from 'lucide-react';
import { ScrollReveal } from '../common/ScrollReveal';

import { CoverflowCarousel, type CoverflowSlide } from '../ui/coverflow-carousel';

interface SectorItem {
  id: string;
  trackNum: string;
  name: string;
  category: string;
  focus: string;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTORS_DATA: SectorItem[] = [
  {
    id: 'agentic-ai',
    trackNum: 'TRACK 01',
    name: 'Autonomous Neural Agents',
    category: 'AGENTIC AI',
    focus: 'Multi-agent orchestration, self-correcting workflows & autonomous cognitive execution.',
    image: '/sectors/track01_agentic_ai.jpg',
    icon: Bot,
  },
  {
    id: 'quantum-ai',
    trackNum: 'TRACK 02',
    name: 'Quantum Machine Intelligence',
    category: 'QUANTUM COMPUTING',
    focus: 'Variational quantum algorithms, quantum neural networks & sub-atomic acceleration.',
    image: '/sectors/track02_quantum.jpg',
    icon: Atom,
  },
  {
    id: 'biomedical-ai',
    trackNum: 'TRACK 03',
    name: 'Bio-Neural Genomics & Health',
    category: 'HEALTHCARE & BIOTECH',
    focus: 'In-silico molecular synthesis, genomic sequence transformers & precision oncology.',
    image: '/sectors/track03_biomedical.jpg',
    icon: HeartPulse,
  },
  {
    id: 'cyber-defense',
    trackNum: 'TRACK 04',
    name: 'Cybernetic Defense & Zero-Trust AI',
    category: 'CYBERSECURITY',
    focus: 'Adversarial neural immunity, autonomous threat hunting & dark-web defense perimeters.',
    image: '/sectors/track04_cybersecurity.jpg',
    icon: ShieldCheck,
  },
  {
    id: 'spatial-intelligence',
    trackNum: 'TRACK 05',
    name: 'Spatial Intelligence & Vision',
    category: 'COMPUTER VISION',
    focus: '3D Gaussian splatting, real-time spatial depth, and holographic telepresence systems.',
    image: '/sectors/track05_spatial_vision.jpg',
    icon: Eye,
  },
  {
    id: 'fintech-neural',
    trackNum: 'TRACK 06',
    name: 'FinTech Neural Dynamics & Web3',
    category: 'ALGORITHMIC FINANCE',
    focus: 'High-frequency algorithmic forecasting, fraud-immune smart contracts & decentralized risk AI.',
    image: '/sectors/track06_fintech.jpg',
    icon: Coins,
  },
  {
    id: 'autonomous-swarms',
    trackNum: 'TRACK 07',
    name: 'Autonomous Swarms & Edge Robotics',
    category: 'EDGE ROBOTICS',
    focus: 'Decentralized drone swarms, edge neural controllers & cooperative search robotics.',
    image: '/sectors/track07_swarms_robotics.jpg',
    icon: Cpu,
  },
  {
    id: 'climate-ai',
    trackNum: 'TRACK 08',
    name: 'Eco-Neural Systems & Clean Energy',
    category: 'CLIMATE INTELLIGENCE',
    focus: 'Smart power grid optimization, agricultural hyperspectral AI & carbon modeling.',
    image: '/sectors/track08_climate_energy.jpg',
    icon: Leaf,
  },
  {
    id: 'generative-synthesis',
    trackNum: 'TRACK 09',
    name: 'Multimodal Generative Synthesis',
    category: 'GENERATIVE AI',
    focus: 'Cross-modal foundation models, real-time neural audio/video engines & world simulation.',
    image: '/sectors/track09_generative_synthesis.jpg',
    icon: Wand2,
  },
  {
    id: 'neuro-symbolic',
    trackNum: 'TRACK 10',
    name: 'Neuro-Symbolic Reasoning & Logic',
    category: 'REASONING SYSTEMS',
    focus: 'Deep deductive logic architectures, formal verification & explainable AI governance.',
    image: '/sectors/track10_neuro_symbolic.jpg',
    icon: Network,
  },
];

const SECTOR_SLIDES: CoverflowSlide[] = SECTORS_DATA.map((sector) => ({
  src: sector.image,
  alt: sector.name,
  title: sector.name,
  subtitle: `${sector.trackNum} • ${sector.category}`,
  meta: [
    { label: "Track", value: sector.trackNum },
    { label: "Category", value: sector.category },
    { label: "Focus", value: sector.focus },
  ],
}));

interface SectorsSectionProps {
  setActiveTab: (tab: string) => void;
}

export const SectorsSection: React.FC<SectorsSectionProps> = ({ setActiveTab }) => {
  return (
    <section id="sectors" className="py-20 bg-slate-50 border-b border-slate-200 relative overflow-hidden select-none scroll-mt-20">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <ScrollReveal direction="up" distance={20} duration={700} className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-sans">
            Innovation <span className="bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">Sectors</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 font-sans max-w-xl mx-auto">
            Key technology domains curating real-world problem statements for VyugamAI 2026. Swipe or use arrow keys to browse sectors.
          </p>
        </ScrollReveal>
      </div>

      {/* 3D Coverflow Carousel Showcase */}
      <div className="relative w-full max-w-6xl mx-auto px-4">
        <CoverflowCarousel
          slides={SECTOR_SLIDES}
          cardWidth="clamp(220px, 24vw, 320px)"
          rotate={44}
          depth={0.6}
          perspective={3}
          falloff={0.56}
          fade={0.15}
          showCaption={true}
          showNavigation={true}
          showPagination={true}
          cardClassName="border-2 border-purple-200/90 shadow-2xl hover:border-[#6D15C2] transition-colors"
        />

        {/* CTA Button to Explore Track Problems */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setActiveTab('problems')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#6D15C2] hover:bg-[#58119e] text-white font-mono text-xs sm:text-sm font-black tracking-wider uppercase shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer rounded-none border border-purple-400/40"
          >
            <span>EXPLORE SECTORS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </section>
  );
};

export default SectorsSection;
