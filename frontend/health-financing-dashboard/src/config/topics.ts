/**
 * Topic Configurations - Health Financing Themes
 * ======================================================
 * Based on: Statistical Product on Health Financing Gap in Africa (March 2026)
 *
 * These topics are the primary navigation structure for the platform,
 * organized by key thematic areas.
 *
 * Note: Cross-dimensional analysis topics have been moved to the dedicated
 * Cross-Dimensional Explorer page for more flexible analysis.
 */

export interface TopicConfig {
  id: string;
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  color: string;
  keyMessage: string;
  order: number;
}

export const TOPIC_CONFIGS: TopicConfig[] = [
  {
    id: 'public-health-financing',
    slug: 'public-health-financing',
    number: '1',
    title: 'Government Health Spending Adequacy',
    shortTitle: 'Government Health Spending',
    description: 'Assessment of domestic general government health expenditure per capita against internationally prescribed thresholds (LICs=$112; LMICs=$146; UMICs=$477), including financing gaps and inequality measures.',
    icon: '💰',
    color: '#1e40af',  // Deep blue for text
    keyMessage: 'As of 2023, only 3 of 54 countries meet minimum spending thresholds. Low-income countries average $8.92 per capita - 92% below the $112 target.',
    order: 1
  },
  {
    id: 'budget-priority',
    slug: 'budget-priority',
    number: '2',
    title: 'Health Budget Priority',
    shortTitle: 'Budget Priority',
    description: 'Progress toward the Abuja Declaration target of allocating at least 15% of government expenditure to health, including gap analysis and inequality measures.',
    icon: '📊',
    color: '#6d28d9',  // Deep purple for text
    keyMessage: 'Only 1 of 54 African countries met the 15% Abuja target in 2023 - a stark failure 22 years after the declaration.',
    order: 2
  },
  {
    id: 'financial-protection',
    slug: 'financial-protection',
    number: '3',
    title: 'Financial Protection',
    shortTitle: 'Financial Protection',
    description: 'Analysis of out-of-pocket health expenditure as a share of current health expenditure against the 20% benchmark, including financial hardship incidence.',
    icon: '🛡️',
    color: '#b91c1c',  // Deep red for text
    keyMessage: 'In 2023, 76% of African countries exceed the 20% out-of-pocket safety threshold, pushing millions into poverty through healthcare costs.',
    order: 3
  },
  {
    id: 'financing-structure',
    slug: 'financing-structure',
    number: '4',
    title: 'Health Financing Structure',
    shortTitle: 'Financing Structure',
    description: 'Sources of health financing including government share, voluntary prepaid insurance, out-of-pocket payments, other private spending, and development partner contributions.',
    icon: '🏛️',
    color: '#047857',  // Deep green for text
    keyMessage: 'In 2023, households pay more out-of-pocket (35.5%) than governments contribute (34.6%) - an unsustainable and inequitable structure.',
    order: 4
  },
  {
    id: 'uhc-index',
    slug: 'uhc-index',
    number: '5',
    title: 'Universal Health Coverage',
    shortTitle: 'UHC Coverage',
    description: 'Universal Health Coverage service coverage index, measuring access to essential health services across reproductive, maternal, child health, infectious diseases, and NCDs.',
    icon: '🏥',
    color: '#0e7490',  // Deep cyan for text
    keyMessage: 'Africa\'s UHC index improved from 32 to 52 points between 2000-2023, but remains far from the threshold of 75.',
    order: 5
  },
  {
    id: 'health-outcomes',
    slug: 'health-outcomes',
    number: '6',
    title: 'Maternal and Neonatal Mortality',
    shortTitle: 'Mortality Outcomes',
    description: 'Neonatal Mortality Rate (target: <12 per 1,000 live births) and Maternal Mortality Ratio (target: <70 per 100,000 live births) progress tracking.',
    icon: '👶',
    color: '#be185d',  // Deep pink for text
    keyMessage: 'Despite progress, most African countries remain off-track for SDG targets on neonatal and maternal mortality.',
    order: 6
  }
];

// Helper functions
export const getTopicBySlug = (slug: string): TopicConfig | undefined => {
  return TOPIC_CONFIGS.find(topic => topic.slug === slug);
};

export const getTopicById = (id: string): TopicConfig | undefined => {
  return TOPIC_CONFIGS.find(topic => topic.id === id);
};

export const getTopicByNumber = (number: string): TopicConfig | undefined => {
  return TOPIC_CONFIGS.find(topic => topic.number === number);
};

export const getAllTopics = (): TopicConfig[] => {
  return [...TOPIC_CONFIGS].sort((a, b) => a.order - b.order);
};

export const getTopicColor = (topicId: string): string => {
  const topic = getTopicById(topicId);
  return topic?.color || '#6b7280';
};
