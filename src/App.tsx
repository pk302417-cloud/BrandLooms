import { useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import ApprovalView from '@/components/ApprovalView';
import PageHero, { type HeroImage } from '@/components/PageHero';
import ReviewView from '@/components/ReviewView';
import SourcesView from '@/components/SourcesView';
import { useReviewWorkflow } from '@/hooks/useReviewWorkflow';
import { applyPageMeta, type PageMeta } from '@/lib/pageMeta';
import type { Tab } from '@/types';

interface TabContent extends PageMeta {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: HeroImage;
}

const TAB_IDS: Tab[] = ['review', 'approval', 'sources'];

const CONTENT: Record<Tab, TabContent> = {
  review: {
    title: 'Catch brand issues before your audience does',
    description:
      'Check marketing copy against brand guidelines, terminology and approved facts before you publish. Every finding cites its source.',
    eyebrow: 'Pre-publication review',
    subtitle:
      'Paste a draft and get findings that each point to the guideline or fact behind them. Nothing changes unless you accept it.',
    image: {
      src: 'https://images.pexels.com/photos/35746663/pexels-photo-35746663.jpeg?auto=compress&cs=tinysrgb&w=1600',
      alt: 'Hiker in a red jacket walking along a foggy mountain trail',
      credit: 'Ali Alcántara',
    },
  },
  approval: {
    title: 'Every publishing decision has a named owner',
    description:
      'Route brand-checked drafts to a manager or reviewer. Every request, comment and approval is logged with who decided and when.',
    eyebrow: 'Approval workflow',
    subtitle:
      'Risky claims go to a reviewer automatically. Each request, comment and approval is logged, so you always know who decided what and when.',
    image: {
      src: 'https://images.pexels.com/photos/4956502/pexels-photo-4956502.jpeg?auto=compress&cs=tinysrgb&w=1600',
      alt: 'Group of hikers in bright raincoats walking through misty mountains',
      credit: 'Yu Lin Chen',
    },
  },
  sources: {
    title: 'Every finding traces back to an approved source',
    description:
      'Browse the guidelines, terminology and approved facts behind every brand check, with versions, owners and expiry dates.',
    eyebrow: 'Source library',
    subtitle:
      'Guidelines, terminology and approved facts, each with an owner and an expiry date. Keep them current and the checks stay accurate.',
    image: {
      src: 'https://images.pexels.com/photos/8728418/pexels-photo-8728418.jpeg?auto=compress&cs=tinysrgb&w=1600',
      alt: 'Hiker with a backpack on a rocky forest path',
      credit: 'Katya Wolf',
    },
  },
};

const PAGE_TITLES: Record<Tab, string> = {
  review: 'Review a draft',
  approval: 'Approval workflow',
  sources: 'Source library',
};

const tabFromHash = (): Tab => {
  const id = window.location.hash.replace('#', '');
  return TAB_IDS.find((item) => item === id) ?? 'review';
};

export default function App() {
  const [tab, setTab] = useState<Tab>(tabFromHash);
  const workflow = useReviewWorkflow();
  const content = CONTENT[tab];

  useEffect(() => {
    const onHashChange = () => setTab(tabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    applyPageMeta({
      title: `${PAGE_TITLES[tab]} | BrandLoom`,
      description: content.description,
    });
  }, [tab, content.description]);

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <AppHeader tab={tab} role={workflow.role} onRoleChange={workflow.setRole} />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-5 sm:space-y-10 sm:px-6 sm:py-10 lg:px-8">
        <PageHero
          key={tab}
          eyebrow={content.eyebrow}
          title={content.title}
          subtitle={content.subtitle}
          image={content.image}
        />

        {tab === 'review' && <ReviewView workflow={workflow} />}
        {tab === 'approval' && <ApprovalView workflow={workflow} />}
        {tab === 'sources' && <SourcesView />}
      </main>
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>BrandLoom is a prototype built by Team Alpha for the Inkloom AI Brand-Governance Challenge.</p>
          <p>The demo brand, Northwind Outdoor, is fictional. No real customer data is used.</p>
        </div>
      </footer>
    </div>
  );
}
