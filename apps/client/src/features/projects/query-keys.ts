const designsKeys = {
  all: ['designs'] as const,
  myProjects: () => [...designsKeys.all, 'mine', 'projects'] as const,
  myTemplates: () => [...designsKeys.all, 'mine', 'templates'] as const,
  publicTemplates: () => [...designsKeys.all, 'templates'] as const,
  community: () => [...designsKeys.all, 'community'] as const,
  detail: (id: string) => [...designsKeys.all, 'detail', id] as const,
  shared: (token: string) => ['shared-designs', token] as const,
};

export { designsKeys };
