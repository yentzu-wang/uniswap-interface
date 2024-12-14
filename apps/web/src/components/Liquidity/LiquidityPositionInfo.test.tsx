// eslint-disable-next-line no-restricted-imports
import { PositionStatus, ProtocolVersion } from '@uniswap/client-pools/dist/pools/v1/types_pb'
import { LiquidityPositionInfo } from 'components/Liquidity/LiquidityPositionInfo'
import { PositionInfo } from 'components/Liquidity/types'
import { TEST_TOKEN_1, TEST_TOKEN_2, toCurrencyAmount } from 'test-utils/constants'
import { render } from 'test-utils/render'

jest.mock('components/Liquidity/utils')

describe('LiquidityPositionInfo', () => {
  it('should render in range', () => {
    const positionInfo: PositionInfo = {
      chainId: TEST_TOKEN_1.chainId,
      currency0Amount: toCurrencyAmount(TEST_TOKEN_1, 1),
      currency1Amount: toCurrencyAmount(TEST_TOKEN_2, 1),
      status: PositionStatus.IN_RANGE,
      version: ProtocolVersion.V3,
      poolId: '1',
      tokenId: '1',
      v4hook: undefined,
    }
    const { getByText } = render(<LiquidityPositionInfo positionInfo={positionInfo} />)
    expect(getByText('In range')).toBeInTheDocument()
  })

  it('should render out of range', () => {
    const positionInfo: PositionInfo = {
      chainId: TEST_TOKEN_1.chainId,
      currency0Amount: toCurrencyAmount(TEST_TOKEN_1, 1),
      currency1Amount: toCurrencyAmount(TEST_TOKEN_2, 1),
      status: PositionStatus.OUT_OF_RANGE,
      version: ProtocolVersion.V3,
      poolId: '1',
      tokenId: '4',
      v4hook: undefined,
    }
    const { getByText } = render(<LiquidityPositionInfo positionInfo={positionInfo} />)
    expect(getByText('Out of range')).toBeInTheDocument()
  })

  it('should render closed', () => {
    const positionInfo: PositionInfo = {
      chainId: TEST_TOKEN_1.chainId,
      currency0Amount: toCurrencyAmount(TEST_TOKEN_1, 1),
      currency1Amount: toCurrencyAmount(TEST_TOKEN_2, 1),
      poolId: '1',
      status: PositionStatus.CLOSED,
      version: ProtocolVersion.V3,
      tokenId: '1',
      v4hook: undefined,
    }
    const { getByText } = render(<LiquidityPositionInfo positionInfo={positionInfo} />)
    expect(getByText('Closed')).toBeInTheDocument()
  })
})
