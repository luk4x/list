import { cancel } from '@clack/prompts';

export function exitCancel(message = 'Cancelled.') {
  cancel(message);
  process.exit(0);
}
