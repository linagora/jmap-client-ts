/**
 * Calendar invitations (`com:linagora:params:calendar:event`): parse the
 * `.ics` blobs of an email and reply to them.
 */
import type { Id, SetError } from '@linagora/jmap-client-ts';

export interface CalendarEventOrganizer {
  name?: string | null;
  mailto?: string | null;
}

export interface CalendarEventParticipant {
  name?: string | null;
  mailto?: string | null;
  /** `individual`, `group`, `resource`, `room`… */
  kind?: string | null;
  /** `chair`, `requested-participant`, `optional-participant`… */
  role?: string | null;
  /** `needs-action`, `accepted`, `declined`, `tentative`, `delegated` */
  participationStatus?: string | null;
  expectReply?: boolean | null;
}

export interface CalendarEventRecurrenceRule {
  frequency: string;
  interval?: number | null;
  rscale?: string | null;
  skip?: string | null;
  firstDayOfWeek?: string | null;
  byDay?: string[] | null;
  byMonthDay?: number[] | null;
  byMonth?: string[] | null;
  byYearDay?: number[] | null;
  byWeekNo?: number[] | null;
  byHour?: number[] | null;
  byMinute?: number[] | null;
  bySecond?: number[] | null;
  bySetPosition?: number[] | null;
  count?: number | null;
  until?: string | null;
}

/**
 * A parsed event (JSCalendar, draft-ietf-jmap-calendars). `id`,
 * `baseEventId`, `calendarIds`, `isDraft` and `isOrigin` are always null.
 */
export interface CalendarEvent {
  id?: Id | null;
  baseEventId?: Id | null;
  calendarIds?: Record<Id, true> | null;
  isDraft?: boolean | null;
  isOrigin?: boolean | null;
  uid?: string | null;
  title?: string | null;
  description?: string | null;
  /** Local date-time, in `timeZone`. */
  start?: string | null;
  /** ISO 8601 duration, e.g. `PT2H0M0S`. */
  duration?: string | null;
  end?: string | null;
  /** `start` in UTC, e.g. `2026-10-12T08:00:00Z` (tmail-backend). */
  utcStart?: string | null;
  /** `end` in UTC (tmail-backend). */
  utcEnd?: string | null;
  timeZone?: string | null;
  location?: string | null;
  /** iTIP method: `REQUEST`, `REPLY`, `CANCEL`, `COUNTER`… */
  method?: string | null;
  sequence?: number | null;
  /** `confirmed`, `tentative` or `cancelled`. */
  status?: string | null;
  priority?: number | null;
  freeBusyStatus?: string | null;
  privacy?: string | null;
  organizer?: CalendarEventOrganizer | null;
  participants?: CalendarEventParticipant[] | null;
  /** `X-` properties of the event, e.g. `X-VIDEOCONFERENCE`. */
  extensionFields?: Record<string, string[]> | null;
  recurrenceRules?: CalendarEventRecurrenceRule[] | null;
  excludedRecurrenceRules?: CalendarEventRecurrenceRule[] | null;
  recurrenceId?: string | null;
  recurrenceOverrides?: Record<string, unknown> | null;
}

export interface CalendarEventParseArgs {
  accountId: Id;
  blobIds: readonly Id[];
  properties?: readonly Exclude<keyof CalendarEvent, symbol>[] | null;
}

export interface CalendarEventParseResponse {
  accountId: Id;
  /** Events of each parsed blob. */
  parsed?: Record<Id, CalendarEvent[]> | null;
  notFound?: Id[] | null;
  notParsable?: Id[] | null;
}

export interface CalendarEventReplyArgs {
  accountId: Id;
  blobIds: readonly Id[];
  /** Language of the reply email, among `replySupportedLanguage` (default `en`). */
  language?: string | null;
}

export interface CalendarEventAcceptResponse {
  accountId: Id;
  accepted?: Id[] | null;
  notFound?: Id[] | null;
  notAccepted?: Record<Id, SetError> | null;
}

export interface CalendarEventRejectResponse {
  accountId: Id;
  rejected?: Id[] | null;
  notFound?: Id[] | null;
  notRejected?: Record<Id, SetError> | null;
}

export interface CalendarEventMaybeResponse {
  accountId: Id;
  maybe?: Id[] | null;
  notFound?: Id[] | null;
  notMaybe?: Record<Id, SetError> | null;
}

export type CalendarEventAttendanceStatus =
  'accepted' | 'rejected' | 'tentativelyAccepted' | 'needsAction' | (string & {});

export interface CalendarEventAttendance {
  blobId: Id;
  /** Named `attendanceStatus` in the tmail-backend documentation. */
  eventAttendanceStatus: CalendarEventAttendanceStatus;
  /** With `supportFreeBusyQuery`: no other event at that time. */
  isFree?: boolean;
}

export interface CalendarEventAttendanceGetArgs {
  accountId: Id;
  /** At most 16. */
  blobIds: readonly Id[];
}

export interface CalendarEventAttendanceGetResponse {
  accountId: Id;
  list: CalendarEventAttendance[];
  notFound?: Id[] | null;
  notDone?: Record<Id, SetError> | null;
}

/** Accepts the `METHOD:COUNTER` events of the given blobs. */
export interface CalendarEventCounterAcceptArgs {
  accountId: Id;
  blobIds: readonly Id[];
}

export interface CalendarEventCounterAcceptResponse {
  accountId: Id;
  accepted?: Id[] | null;
  notFound?: Id[] | null;
  notAccepted?: Record<Id, SetError> | null;
}
