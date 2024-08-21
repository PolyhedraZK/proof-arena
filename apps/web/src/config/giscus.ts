// apps/web/src/config/giscus.ts

export const giscusConfig = {
  repo: import.meta.env.VITE_APP_GISCUS_REPO_NAME as `${string}/${string}`,
  repoId: import.meta.env.VITE_APP_GISCUS_REPO_ID,
  category: import.meta.env.VITE_APP_GISCUS_CATEGORY,
  categoryId: import.meta.env.VITE_APP_GISCUS_CATEGORY_ID,
  mapping: 'url',
  reactionsEnabled: '0',
  emitMetadata: '1',
  inputPosition: 'top',
  lang: 'en',
  loading: 'lazy',
} as const;

export type GiscusProps = typeof giscusConfig;
