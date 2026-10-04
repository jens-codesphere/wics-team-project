import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ClipboardList,
  House,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';

import { colors, layout, radii, shadows, spacing } from '@/theme/tokens';

const TAB_ICONS: Record<string, { Icon: LucideIcon; label: string }> = {
  index: { Icon: House, label: 'Home' },
  groups: { Icon: Users, label: 'Groups' },
  plans: { Icon: ClipboardList, label: 'Plans' },
  profile: { Icon: User, label: 'Profile' },
};

/**
 * Floating bottom navigation capsule (spec §12): white 92% surface,
 * radius 28, ink rounded-square active state with white icon.
 * Respects safe areas; never a full-width navy bar.
 */
export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        { bottom: insets.bottom + layout.tabBarBottomInset },
      ]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const options = descriptor?.options;
          const isActive = state.index === index;
          const entry = TAB_ICONS[route.name];
          const Icon = entry?.Icon;
          const label =
            options?.tabBarAccessibilityLabel ??
            options?.title ??
            entry?.label ??
            route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={isActive ? { selected: true } : {}}
              accessibilityLabel={label}
              testID={route.name}
              hitSlop={6}
              style={({ pressed }) => [
                styles.item,
                isActive && styles.itemActive,
                pressed && !isActive && styles.itemPressed,
              ]}
            >
              {Icon ? (
                <Icon
                  size={25}
                  color={isActive ? colors.surface : colors.ink}
                  strokeWidth={isActive ? 2 : 1.8}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: layout.tabBarSideInset,
    right: layout.tabBarSideInset,
  },
  bar: {
    height: layout.tabBarHeight,
    borderRadius: radii.cardLarge,
    backgroundColor: colors.tabSurface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: spacing.sm,
    ...shadows.floating,
  },
  item: {
    width: layout.tabItemSize,
    height: layout.tabItemSize,
    borderRadius: layout.tabItemRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemActive: {
    backgroundColor: colors.ink,
  },
  itemPressed: {
    opacity: 0.65,
  },
});
