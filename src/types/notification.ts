import type { Severity } from './common';

export type NotificationKind =
  | 'threat'
  | 'incident'
  | 'authentication'
  | 'scan'
  | 'intelligence'
  | 'system';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  severity: Severity;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  /** Optional deep link, e.g. /incidents/INC-2048 */
  href?: string;
  actionLabel?: string;
}

export interface NotificationPreferences {
  criticalAlerts: boolean;
  highAlerts: boolean;
  mediumAlerts: boolean;
  desktopToasts: boolean;
  emailNotifications: boolean;
  soundOnCritical: boolean;
}
