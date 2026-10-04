import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  House,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  UserPlus,
  Users,
  ClipboardList,
  User,
  MapPin,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';

import { colors, layout, radii, shadows } from '@/theme/tokens';

export type IconName =
  | 'back'
  | 'forward'
  | 'arrow-right'
  | 'plus'
  | 'refresh'
  | 'share'
  | 'home'
  | 'groups'
  | 'plans'
  | 'profile'
  | 'map-pin'
  | 'sparkles'
  | 'user-plus'
  | 'wallet';

const ICONS: Record<IconName, LucideIcon> = {
  back: ArrowLeft,
  forward: ChevronRight,
  'arrow-right': ArrowRight,
  plus: Plus,
  refresh: RefreshCw,
  share: Share2,
  home: House,
  groups: Users,
  plans: ClipboardList,
  profile: User,
  'map-pin': MapPin,
  sparkles: Sparkles,
  'user-plus': UserPlus,
  wallet: Wallet,
};

export type IconButtonProps = {
  name: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  /** `solid` = ink circle, `soft` = pastel/white circle, `ghost` = transparent. */
  variant?: 'solid' | 'soft' | 'ghost';
  size?: number;
  color?: string;
  iconColor?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Circular 48x48 action button (spec §8). Minimum 44px touch target.
 */
export function IconButton({
  name,
  onPress,
  accessibilityLabel,
  variant = 'soft',
  size = layout.tabItemSize,
  color,
  iconColor,
  strokeWidth = 1.9,
  style,
}: IconButtonProps) {
  const Icon = ICONS[name];

  const background =
    variant === 'solid'
      ? (color ?? colors.ink)
      : variant === 'soft'
        ? (color ?? colors.surface)
        : 'transparent';

  const stroke =
    iconColor ?? (variant === 'solid' ? colors.surface : colors.ink);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: variant === 'soft' ? size / 2 : radii.pill,
          backgroundColor: background,
        },
        variant === 'soft' ? shadows.soft : null,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View pointerEvents="none">
        <Icon size={Math.round(size * 0.5)} color={stroke} strokeWidth={strokeWidth} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});
