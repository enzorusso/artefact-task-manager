export const taskMessages = {
  app: {
    title: 'TaskManager',
  },
  validation: {
    titleRequired: 'Enter a title.',
    titleMaxLength: 'Use up to 120 characters.',
    descriptionMaxLength: 'Use up to 2,000 characters.',
    invalidTask: 'Check the task details.',
  },
  form: {
    titleLabel: 'Task title',
    titlePlaceholder: 'Enter a title',
    descriptionLabel: 'Task description (optional)',
    descriptionPlaceholder: 'Description (optional)',
    add: 'Add',
    adding: 'Adding…',
    added: 'Task added.',
  },
  list: {
    label: 'Task list',
    empty: 'Your tasks will appear here.',
    loadingMore: 'Loading more tasks…',
    loadError: (message: string) => `Unable to load tasks: ${message}`,
  },
  card: {
    updated: 'Task updated.',
    deleted: 'Task deleted.',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving…',
    createdOn: 'Created on',
    editLabel: (title: string) => `Edit: ${title}`,
    deleteLabel: (title: string) => `Delete: ${title}`,
  },
  notFound: 'Task not found.',
} as const;
