/** JMAP settings (`com:linagora:params:jmap:settings`): per-user key-value settings. */
import type { Id } from '@linagora/jmap-client-ts';

/** Setting keys documented by tmail-backend or used by tmail-flutter. */
export type KnownSettingKey =
  | 'read.receipts.always'
  | 'display.sender.priority'
  | 'language'
  | 'timezone'
  | 'appearance.theme'
  | 'firebase.enabled'
  | 'trash.cleanup.enabled'
  | 'trash.cleanup.period'
  | 'spam.cleanup.enabled'
  | 'spam.cleanup.period'
  | 'inbox.archival.enabled'
  | 'inbox.archival.period'
  | 'inbox.archival.format'
  | 'ai.label-categorization.enabled';

/** The only Settings object of an account. Booleans are strings (`"true"`). */
export interface Settings {
  /** Always `singleton`. */
  id: Id;
  /** {@link KnownSettingKey} and keys of the client's own. */
  settings: Record<string, string>;
}
