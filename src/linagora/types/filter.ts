/** JMAP filters (`com:linagora:params:jmap:filter`): the rules applied to incoming emails. */
import type { Id } from '@linagora/jmap-client-ts';

/**
 * Field a condition reads: `sentDate` takes `isNewerThan` / `isOlderThan`
 * and a duration (`2d`, `2 days`), `header:Name` a custom header.
 */
export type RuleConditionField =
  'from' | 'to' | 'cc' | 'recipient' | 'subject' | 'sentDate' | `header:${string}`;

/** `any` only for custom headers (the value is ignored), the last two for `sentDate`. */
export type RuleConditionComparator =
  | 'contains'
  | 'not-contains'
  | 'exactly-equals'
  | 'not-exactly-equals'
  | 'start-with'
  | 'any'
  | 'isNewerThan'
  | 'isOlderThan';

export interface RuleCondition {
  field: RuleConditionField;
  comparator: RuleConditionComparator;
  value: string;
}

export interface RuleConditionGroup {
  /** `AND`: every condition matches; `OR`: at least one. */
  conditionCombiner: 'AND' | 'OR';
  conditions: RuleCondition[];
}

export interface RuleAction {
  /** Mailboxes to put the email in (empty: stays where it was going). */
  appendIn: { mailboxIds: Id[] };
  markAsSeen?: boolean;
  markAsImportant?: boolean;
  /** Refuse the email. */
  reject?: boolean;
  /** Keywords to set on the email (labels among them). */
  withKeywords?: string[];
  forwardTo?: { addresses: string[]; keepACopy: boolean } | null;
  /** Mailbox to move the email to, by name; created when missing. */
  moveTo?: { mailboxName: string } | null;
}

/** A rule as `Filter/get` returns it (without `id`). */
export interface Rule {
  id?: Id;
  name: string;
  conditionGroup: RuleConditionGroup;
  /** Legacy single condition, the first of `conditionGroup`. */
  condition?: RuleCondition;
  action: RuleAction;
}

/**
 * A rule as `Filter/set` takes it: `id` is required (any string unique in
 * the list), and either `conditionGroup` or the legacy `condition`.
 */
export type RuleUpdate = {
  id: Id;
  name: string;
  action: RuleAction;
} & (
  | { conditionGroup: RuleConditionGroup; condition?: never }
  | { condition: RuleCondition; conditionGroup?: never }
);

/** The only Filter object of an account: its rules, applied in order. */
export interface RuleFilter {
  /** Always `singleton`. */
  id: Id;
  rules: Rule[];
}

/** `Filter/set` arguments: the whole list of rules replaces the previous one. */
export interface RuleFilterSetArgs {
  accountId: Id;
  ifInState?: string | null;
  update: { singleton: readonly RuleUpdate[] };
}
