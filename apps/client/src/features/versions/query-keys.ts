const versionsKeys = {
  all: ['versions'] as const,
  list: (designId: string) => [...versionsKeys.all, 'list', designId] as const,
  detail: (designId: string, versionId: string) =>
    [...versionsKeys.all, 'detail', designId, versionId] as const,
};

export { versionsKeys };
