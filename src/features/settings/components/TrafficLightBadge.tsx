import type { TrafficLightLevel } from '@/types/domain';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { cn } from '@/utils/cn';
import styles from '@/features/settings/components/TrafficLightBadge.module.css';

const LEVEL_TITLE: Record<TrafficLightLevel, string> = {
  green: UI_MESSAGES_PT_BR.settingsFarolGreen,
  yellow: UI_MESSAGES_PT_BR.settingsFarolYellow,
  red: UI_MESSAGES_PT_BR.settingsFarolRed,
};

type TrafficLightBadgeProps = {
  level: TrafficLightLevel;
  className?: string;
};

export function TrafficLightBadge({ level, className }: TrafficLightBadgeProps) {
  return (
    <span className={cn(styles.wrap, className)} title={LEVEL_TITLE[level]}>
      <span className={cn(styles.dot, styles[level])} aria-hidden />
      <span className={styles.label}>{LEVEL_TITLE[level]}</span>
    </span>
  );
}
