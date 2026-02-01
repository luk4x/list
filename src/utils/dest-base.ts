import { note } from '@clack/prompts';

export function getDestBase(destInput: string | symbol) {
  const destPath = String(destInput).trim();

  if (!destPath.startsWith('/')) {
    return destPath;
  }

  const relativeDestPath = destPath.slice(1);

  note(
    [
      'Absolute paths are not recommended.',
      '',
      'The provided path:',
      `→ ${destPath}`,
      'Was converted to a relative path:',
      `→ ${relativeDestPath}`,
      '',
      'Installation will continue.',
    ].join('\n'),
    'Path normalized',
  );

  return relativeDestPath;
}
