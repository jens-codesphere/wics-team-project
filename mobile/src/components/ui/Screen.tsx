import type { ReactElement, ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { colors, layout, spacing } from '@/theme/tokens';
import { IconButton } from './IconButton';
import { Text } from './Text';

export type ScreenProps = {
  children: ReactNode;
  /** Scroll the content. Defaults to `true`. */
  scroll?: boolean;
  /** Custom header node. Overrides `title` / `showBack`. */
  header?: ReactNode;
  /** Title rendered in the default header row. */
  title?: string;
  /** Render a back affordance in the default header row. */
  showBack?: boolean;
  headerRight?: ReactNode;
  /** Pinned below the scroll area (e.g. a primary CTA). */
  footer?: ReactNode;
  /** Reserve bottom space for the floating tab bar. */
  withTabBar?: boolean;
  /** Horizontal padding (24). Defaults to `true`. */
  padded?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
  contentStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
};

/**
 * Base screen: canvas background, safe-area handling, editorial header,
 * scroll container with correct bottom clearance for the floating tab bar.
 */
export function Screen({
  children,
  scroll = true,
  header,
  title,
  showBack,
  headerRight,
  footer,
  withTabBar = false,
  padded = true,
  refreshControl,
  contentStyle,
  backgroundColor = colors.canvas,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const bottomPadding =
    (withTabBar ? layout.tabBarContentPadding : layout.scrollBottomPadding) +
    insets.bottom;

  const hasDefaultHeader = Boolean(showBack || title || headerRight);

  const headerNode =
    header ??
    (hasDefaultHeader ? (
      <View style={[styles.header, padded && styles.paddedRow]}>
        <View style={styles.headerSide}>
          {showBack ? (
            <IconButton
              name="back"
              variant="soft"
              size={44}
              accessibilityLabel="Go back"
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace('/groups');
              }}
            />
          ) : null}
        </View>
        <View style={styles.headerCenter}>
          {title ? (
            <Text variant="label" color={colors.textSecondary}>
              {title}
            </Text>
          ) : null}
        </View>
        <View style={[styles.headerSide, styles.headerSideRight]}>
          {headerRight}
        </View>
      </View>
    ) : null);

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[
        padded && styles.padded,
        { paddingBottom: bottomPadding },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor }]}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.flex}>
        {headerNode}
        {body}
        {footer ? (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            {footer}
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: layout.screenPadding,
  },
  paddedRow: {
    paddingHorizontal: layout.screenPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingTop: 4,
    paddingBottom: 8,
  },
  headerSide: {
    width: 88,
    alignItems: 'flex-start',
  },
  headerSideRight: {
    alignItems: 'flex-end',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    backgroundColor: colors.canvas,
  },
});
