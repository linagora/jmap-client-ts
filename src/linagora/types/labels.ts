/**
 * JMAP Labels (`com:linagora:params:jmap:labels`): user labels, set on
 * emails as keywords.
 */
import type { Id } from '@linagora/jmap-client-ts';

/** `#RRGGBB` (tmail-flutter also accepts `#AARRGGBB`). */
export type LabelColor = string;

export interface Label {
  id: Id;
  displayName: string;
  /** Server-set: the keyword to put on emails (`Email/set`, `hasKeyword`). */
  keyword: string;
  color: LabelColor | null;
  description?: string | null;
  /** Version 2: the label cannot be changed or destroyed through JMAP. */
  readOnly?: boolean;
}

/** Properties a client may send when creating a Label. */
export interface LabelCreate {
  displayName: string;
  color?: LabelColor | null;
  description?: string | null;
}
