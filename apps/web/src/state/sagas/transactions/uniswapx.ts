import { SwapEventName } from '@uniswap/analytics-events'
import { formatSwapSignedAnalyticsEventProperties } from 'lib/utils/analytics'
import { PopupType, addPopup } from 'state/application/reducer'
import {
  HandleSignatureStepParams,
  addTransactionBreadcrumb,
  getSwapTransactionInfo,
  handleSignatureStep,
} from 'state/sagas/transactions/utils'
import { addSignature } from 'state/signatures/reducer'
import { SignatureType, UnfilledUniswapXOrderDetails } from 'state/signatures/types'
import { call, put } from 'typed-redux-saga'
import { UniswapXOrderStatus } from 'types/uniswapx'
import { submitOrder } from 'uniswap/src/data/apiClients/tradingApi/TradingApiClient'
import { Routing } from 'uniswap/src/data/tradingApi/__generated__'
import { UniverseChainId } from 'uniswap/src/features/chains/types'
import { InterfaceEventNameLocal } from 'uniswap/src/features/telemetry/constants'
import { sendAnalyticsEvent } from 'uniswap/src/features/telemetry/send'
import { HandledTransactionInterrupt } from 'uniswap/src/features/transactions/errors'
import { getBaseTradeAnalyticsProperties } from 'uniswap/src/features/transactions/swap/analytics'
import { UniswapXSignatureStep } from 'uniswap/src/features/transactions/swap/types/steps'
import { UniswapXTrade } from 'uniswap/src/features/transactions/swap/types/trade'
import { percentFromFloat } from 'utilities/src/format/percent'

interface HandleUniswapXSignatureStepParams extends HandleSignatureStepParams<UniswapXSignatureStep> {
  trade: UniswapXTrade
  analytics: ReturnType<typeof getBaseTradeAnalyticsProperties>
}
export function* handleUniswapXSignatureStep(params: HandleUniswapXSignatureStepParams) {
  const { analytics, step, trade } = params
  const { quote, routing } = trade.quote
  const orderHash = quote.orderId
  const chainId = trade.inputAmount.currency.chainId
  const signatureDetails = getUniswapXSignatureInfo(step, trade, chainId, routing)

  const analyticsParams: Parameters<typeof formatSwapSignedAnalyticsEventProperties>[0] = {
    trade,
    allowedSlippage: percentFromFloat(trade.slippageTolerance),
    fiatValues: {
      amountIn: analytics.token_in_amount_usd,
      amountOut: analytics.token_out_amount_usd,
      feeUsd: analytics.fee_usd,
    },
    portfolioBalanceUsd: analytics.total_balances_usd,
    trace: { ...analytics },
  }

  sendAnalyticsEvent(
    InterfaceEventNameLocal.UniswapXSignatureRequested,
    formatSwapSignedAnalyticsEventProperties(analyticsParams),
  )

  const signature = yield* call(handleSignatureStep, params)

  if (Date.now() / 1000 > step.deadline) {
    throw new HandledTransactionInterrupt('User signed after deadline')
  }

  addTransactionBreadcrumb({ step, data: { routing, ...signatureDetails.swapInfo }, status: 'in progress' })
  sendAnalyticsEvent(
    SwapEventName.SWAP_SIGNED,
    formatSwapSignedAnalyticsEventProperties({
      trade,
      allowedSlippage: percentFromFloat(trade.slippageTolerance),
      fiatValues: {
        amountIn: analytics.token_in_amount_usd,
        amountOut: analytics.token_out_amount_usd,
        feeUsd: analytics.fee_usd,
      },
      portfolioBalanceUsd: analytics.total_balances_usd,
      trace: { ...analytics },
    }),
  )

  try {
    yield* call(submitOrder, { signature, quote, routing })
  } catch (error) {
    sendAnalyticsEvent(InterfaceEventNameLocal.UniswapXOrderPostError, {
      ...formatSwapSignedAnalyticsEventProperties(analyticsParams),
      detail: error.message,
    })
    throw error
  }

  sendAnalyticsEvent(
    InterfaceEventNameLocal.UniswapXOrderSubmitted,
    formatSwapSignedAnalyticsEventProperties(analyticsParams),
  )

  yield* put(addSignature(signatureDetails))

  yield* put(addPopup({ content: { type: PopupType.Order, orderHash }, key: orderHash }))
}

const ROUTING_TO_SIGNATURE_TYPE_MAP: { [key in Routing.DUTCH_V2 | Routing.PRIORITY]: SignatureType } = {
  [Routing.DUTCH_V2]: SignatureType.SIGN_UNISWAPX_V2_ORDER,
  [Routing.PRIORITY]: SignatureType.SIGN_PRIORITY_ORDER,
  // [Routing.LIMIT_ORDER]: SignatureType.SIGN_LIMIT,
}

function getUniswapXSignatureInfo(
  step: UniswapXSignatureStep,
  trade: UniswapXTrade,
  chainId: UniverseChainId,
  routing: Routing.DUTCH_V2 | Routing.PRIORITY,
): UnfilledUniswapXOrderDetails {
  const swapInfo = getSwapTransactionInfo(trade)

  return {
    type: ROUTING_TO_SIGNATURE_TYPE_MAP[routing],
    id: step.quote.orderId,
    addedTime: Date.now(),
    chainId,
    offerer: trade.quote.quote.orderInfo.swapper,
    orderHash: trade.quote.quote.orderId,
    status: UniswapXOrderStatus.OPEN,
    swapInfo,
  }
}
