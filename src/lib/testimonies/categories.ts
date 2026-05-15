export const TESTIMONY_CATEGORIES = [
  { value: 'salvation',       label: 'Salvation' },
  { value: 'healing',         label: 'Healing' },
  { value: 'deliverance',     label: 'Deliverance' },
  { value: 'provision',       label: 'Provision' },
  { value: 'restoration',     label: 'Restoration' },
  { value: 'miracle',         label: 'Miracle' },
  { value: 'answered_prayer', label: 'Answered Prayer' },
  { value: 'other',           label: 'Other' },
] as const;

export type TestimonyCategory = (typeof TESTIMONY_CATEGORIES)[number]['value'];

export const TESTIMONY_CATEGORY_VALUES: readonly TestimonyCategory[] =
  TESTIMONY_CATEGORIES.map((c) => c.value);
