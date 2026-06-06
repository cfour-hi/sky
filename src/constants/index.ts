export const CLOUD_TYPE = {
  text: 'text',
  image: 'image',
  group: 'clouds',
} as const;

export type CloudType = (typeof CLOUD_TYPE)[keyof typeof CLOUD_TYPE];

export const MIME = {
  gif: 'image/gif',
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
} as const;

export type MimeType = (typeof MIME)[keyof typeof MIME];

export const DEFAULT_FONT_FAMILY = 'SourceHanSansSC-Regular';

export const WRITING_MODE = {
  h: 'horizontal-tb',
  v: 'vertical-rl',
} as const;

export type WritingMode = (typeof WRITING_MODE)[keyof typeof WRITING_MODE];
