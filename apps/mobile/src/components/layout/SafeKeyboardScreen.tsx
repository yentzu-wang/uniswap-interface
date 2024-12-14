import React, { PropsWithChildren, useState } from 'react'
import { KeyboardAvoidingView, ScrollView, ScrollViewProps, StyleSheet } from 'react-native'
import { Screen, ScreenProps } from 'src/components/layout/Screen'
import { Flex, flexStyles } from 'ui/src'
import { spacing } from 'ui/src/theme'
import { useKeyboardLayout } from 'uniswap/src/utils/useKeyboardLayout'
import { isIOS } from 'utilities/src/platform'

type OnboardingScreenProps = ScreenProps & {
  header?: JSX.Element
  footer?: JSX.Element
  minHeightWhenKeyboardExpanded?: boolean
  keyboardDismissMode?: ScrollViewProps['keyboardDismissMode']
}

export function SafeKeyboardScreen({
  children,
  header,
  footer,
  minHeightWhenKeyboardExpanded = false,
  keyboardDismissMode,
  ...screenProps
}: PropsWithChildren<OnboardingScreenProps>): JSX.Element {
  const [footerHeight, setFooterHeight] = useState(0)
  const keyboard = useKeyboardLayout()

  const compact = keyboard.isVisible && keyboard.containerHeight !== 0
  const containerStyle = compact ? styles.compact : styles.expand

  // This makes sure this component behaves just like `behavior="padding"` when
  // there's enough space on the screen to show all components.
  const minHeight = minHeightWhenKeyboardExpanded && compact ? keyboard.containerHeight - footerHeight : 0

  return (
    <Screen {...screenProps}>
      <KeyboardAvoidingView
        behavior={isIOS ? 'padding' : 'height'}
        contentContainerStyle={containerStyle}
        style={styles.base}
      >
        {header}
        <ScrollView
          keyboardDismissMode={keyboardDismissMode}
          bounces={false}
          contentContainerStyle={flexStyles.grow}
          keyboardShouldPersistTaps="handled"
        >
          <Flex minHeight={minHeight} px="$spacing16" style={[containerStyle, styles.container]}>
            {children}
          </Flex>
        </ScrollView>
        <Flex
          onLayout={({
            nativeEvent: {
              layout: { height },
            },
          }) => {
            setFooterHeight(height)
          }}
        >
          {footer}
        </Flex>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  compact: {
    flexGrow: 0,
  },
  container: {
    paddingBottom: spacing.spacing12,
  },
  expand: {
    flexGrow: 1,
  },
})
