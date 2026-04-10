const allowedCategories = ['Coding', 'Design', 'Homework', 'Other'];
const allowedPriorities = ['low', 'medium', 'high'];

const codingTerms = [
  'bug',
  'fix',
  'api',
  'deploy',
  'react',
  'endpoint',
  'refactor',
  'code',
  'coding',
  'sql',
  'database',
  'typescript',
  'javascript',
  'backend',
  'frontend',
  'git',
  'commit',
  'pull request',
  'pull-request',
  'build',
  'unit test',
  'unittest',
  'ci',
  'cd',
  'docker',
  'kubernetes',
  'k8s',
  'server',
  'microservice',
  'oauth',
  'login',
  'auth',
  'middleware',
  'schema',
  'migration',
  'lint',
  'webpack',
  'vite',
  'npm',
  'json',
  'graphql',
  'rest',
  'websocket',
  'redis',
  'mongodb',
  'postgres'
];

const designTerms = [
  'figma',
  'ui',
  'ux',
  'mockup',
  'wireframe',
  'layout',
  'brand',
  'typography',
  'icon',
  'icons',
  'illustration',
  'prototype',
  'visual',
  'palette',
  'spacing',
  'responsive',
  'mobile design',
  'banner',
  'logo',
  'style guide',
  'design system'
];

const homeworkTerms = [
  'assignment',
  'essay',
  'study',
  'studying',
  'exam',
  'midterm',
  'final',
  'chapter',
  'homework',
  'course',
  'class',
  'professor',
  'textbook',
  'thesis',
  'lecture',
  'quiz',
  'problem set',
  'read chapter',
  'paper due'
];

const priorityHighTerms = [
  'urgent',
  'asap',
  'a.s.a.p',
  'critical',
  'production',
  'blocker',
  'blocked',
  'security',
  'immediately',
  'hotfix',
  'outage',
  'sev-0',
  'sev0',
  'sev 0',
  'p0',
  'emergency',
  'drop everything',
  'today only',
  'eod today',
  'regression',
  'data loss'
];

const priorityLowTerms = [
  'nice to have',
  'nice-to-have',
  'someday',
  'trivial',
  'optional',
  'whenever',
  'low priority',
  'backlog',
  'polish',
  'cleanup later',
  'minor tweak',
  'cosmetic',
  'if time',
  'no rush'
];

const countTermHits = (text, terms) => {
  let n = 0;
  for (const term of terms) {
    if (text.includes(term)) n += 1;
  }
  return n;
};

const normalizeText = (draftTitle, draftDescription) => {
  const raw = `${String(draftTitle || '').trim()} ${String(draftDescription || '').trim()}`.trim();
  return raw.toLowerCase();
};

const pickCategory = (text) => {
  const scores = {
    Coding: countTermHits(text, codingTerms),
    Design: countTermHits(text, designTerms),
    Homework: countTermHits(text, homeworkTerms)
  };
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [top, topScore] = best[0];
  const secondScore = best[1][1];
  if (topScore === 0) return 'Other';
  if (topScore === secondScore && topScore > 0) return 'Other';
  return top;
};

const pickPriority = (text) => {
  const high = countTermHits(text, priorityHighTerms);
  const low = countTermHits(text, priorityLowTerms);
  if (high > 0 && low > 0) return 'high';
  if (high > 0) return 'high';
  if (low > 0) return 'low';
  return 'medium';
};

const buildReason = (category, priority, text) => {
  const parts = [];
  if (category !== 'Other') {
    parts.push(`Matched keywords suggest "${category}".`);
  } else {
    parts.push('No strong category keywords; using Other.');
  }
  if (priority === 'high') {
    parts.push('Urgency or risk keywords suggest high priority.');
  } else if (priority === 'low') {
    parts.push('Language suggests low priority.');
  } else {
    parts.push('Default priority is medium.');
  }
  return parts.join(' ');
};

const classifyTaskFields = (input) => {
  const text = normalizeText(input?.draftTitle, input?.draftDescription);
  let category = pickCategory(text);
  let priority = pickPriority(text);

  if (!allowedCategories.includes(category)) category = 'Other';
  if (!allowedPriorities.includes(priority)) priority = 'medium';

  return {
    category,
    priority,
    reason: buildReason(category, priority, text),
    source: 'heuristic'
  };
};

module.exports = {
  classifyTaskFields,
  allowedCategories,
  allowedPriorities
};
