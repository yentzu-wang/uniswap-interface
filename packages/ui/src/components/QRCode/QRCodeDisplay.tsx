import { QRCodeErrorCorrectionLevel } from 'qrcode'
import { PropsWithChildren, memo } from 'react'
import { ColorTokens } from 'tamagui'
import { QRCode } from 'ui/src/components/QRCode/QRCode'
import { Flex } from 'ui/src/components/layout'
import { useSporeColors } from 'ui/src/hooks/useSporeColors'

export type BaseQRProps = {
  ecl?: QRCodeErrorCorrectionLevel
  size: number
  color: string
}

type AddressQRCodeProps = BaseQRProps & {
  address: Address
  ecl: QRCodeErrorCorrectionLevel
  backgroundColor?: string
}

function AddressQRCode({ address, ecl, size, backgroundColor, color }: AddressQRCodeProps): JSX.Element {
  const colors = useSporeColors()

  return (
    <QRCode
      backgroundColor={backgroundColor}
      color={color}
      ecl={ecl}
      overlayColor={colors.neutral1.val}
      size={size}
      value={address}
    />
  )
}

type QRCodeDisplayProps = BaseQRProps & {
  encodedValue: string
  containerBackgroundColor?: ColorTokens
}

const _QRCodeDisplay = ({
  encodedValue,
  ecl = 'H',
  size,
  color,
  containerBackgroundColor,
  children,
}: PropsWithChildren<QRCodeDisplayProps>): JSX.Element => {
  return (
    <Flex alignItems="center" backgroundColor={containerBackgroundColor} justifyContent="center" position="relative">
      <AddressQRCode
        address={encodedValue}
        backgroundColor={containerBackgroundColor}
        color={color}
        ecl={ecl}
        size={size}
      />
      <Flex
        alignItems="center"
        backgroundColor="$transparent"
        borderRadius="$roundedFull"
        overflow="visible"
        pl="$spacing2"
        position="absolute"
        pt="$spacing2"
      >
        {children}
      </Flex>
    </Flex>
  )
}

export const QRCodeDisplay = memo(_QRCodeDisplay)
