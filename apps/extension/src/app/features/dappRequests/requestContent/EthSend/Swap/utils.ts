/* eslint-disable max-depth */
/* eslint-disable complexity */
import { CommandType } from '@uniswap/universal-router-sdk'
import { BigNumber, BigNumberish } from 'ethers'
import { formatUnits as formatUnitsEthers } from 'ethers/lib/utils'
import { useDappLastChainId } from 'src/app/features/dapp/hooks'
import {
  CONTRACT_BALANCE,
  MAX_UINT160,
  MAX_UINT256,
} from 'src/app/features/dappRequests/requestContent/EthSend/Swap/constants'
import { SwapSendTransactionRequest } from 'src/app/features/dappRequests/types/DappRequestTypes'
import {
  AmountInMaxParam,
  AmountInParam,
  AmountOutMinParam,
  AmountOutParam,
  Param,
  UniversalRouterCall,
  UniversalRouterCommand,
  V4SwapExactInParamSchema,
  V4SwapExactInSingleParamSchema,
  V4SwapExactOutParamSchema,
  V4SwapExactOutSingleParamSchema,
  isAmountInMaxParam,
  isAmountInParam,
  isAmountOutMinParam,
  isAmountOutParam,
  isURCommandASwap,
} from 'src/app/features/dappRequests/types/UniversalRouterTypes'
import { buildCurrencyId } from 'uniswap/src/utils/currencyId'
import { assert } from 'utilities/src/errors'

export type MinimalToken = {
  address: string
  symbol: string
  decimals: number
}
export type TokenDetails = { [address: string]: MinimalToken }

export type V3TokenInPath = {
  tokenIn: string
  tokenOut: string
  fee: number
}

export function findErc20TokensToPrepare(urCall: UniversalRouterCall): string[] {
  const tokenAddresses: string[] = []
  urCall.commands.forEach((command) => {
    switch (command.commandType) {
      case CommandType.V2_SWAP_EXACT_IN:
      case CommandType.V2_SWAP_EXACT_OUT: {
        const tokensInPath: string[] | undefined = command.params.find((param) => param.name === 'path')?.value
        tokensInPath?.forEach((tokenAddr: string) => tokenAddresses.push(tokenAddr))
        break
      }
      case CommandType.V3_SWAP_EXACT_IN:
      case CommandType.V3_SWAP_EXACT_OUT: {
        const pools: V3TokenInPath[] | undefined = command.params.find((param) => param.name === 'path')?.value
        pools?.forEach(({ tokenIn, tokenOut }) => {
          tokenAddresses.push(tokenIn)
          tokenAddresses.push(tokenOut)
        })
        break
      }
      case CommandType.PAY_PORTION:
      case CommandType.SWEEP:
      case CommandType.TRANSFER: {
        const tokenAddr = command.params.find((param) => param.name === 'token')?.value
        if (tokenAddr) {
          tokenAddresses.push(tokenAddr)
        }
        break
      }
    }
  })

  return Array.from(new Set(tokenAddresses))
}

// Like ethers.formatUnits except it parses specific constants
export function formatUnits(amount: BigNumberish, units: number): string {
  if (BigNumber.from(CONTRACT_BALANCE).eq(amount)) {
    return 'CONTRACT_BALANCE'
  }
  if (BigNumber.from(MAX_UINT256).eq(amount)) {
    return 'MAX_UINT256'
  }
  if (BigNumber.from(MAX_UINT160).eq(amount)) {
    return 'MAX_UINT160'
  }

  return formatUnitsEthers(amount, units)
}

export function useSwapDetails(
  request: SwapSendTransactionRequest,
  dappUrl: string,
): {
  inputIdentifier: string | undefined
  outputIdentifier: string | undefined
  inputValue: string
  outputValue: string
} {
  const activeChain = useDappLastChainId(dappUrl)
  let inputAddress: string | undefined
  let outputAddress: string | undefined
  let inputValue: string = '0'
  let outputValue: string = '0'

  // Attempt to find a V4_SWAP command
  const v4Command = request.parsedCalldata.commands.find((command) => command.commandName.startsWith('V4_SWAP'))

  if (v4Command) {
    // Extract details using the V4 helper
    const v4Details = getTokenDetailsFromV4SwapCommands(v4Command)
    inputAddress = v4Details.inputAddress
    outputAddress = v4Details.outputAddress
    inputValue = v4Details.inputValue || '0'
    outputValue = v4Details.outputValue || '0'
  } else {
    // Fallback to V2/V3 extraction
    const addresses = extractTokenAddresses(request.parsedCalldata.commands)
    const amounts = getTokenAmounts(request.parsedCalldata.commands)

    inputAddress = addresses.inputAddress
    outputAddress = addresses.outputAddress
    inputValue = amounts.inputValue
    outputValue = amounts.outputValue
  }

  const inputIdentifier = activeChain && inputAddress ? buildCurrencyId(activeChain, inputAddress) : undefined

  const outputIdentifier = activeChain && outputAddress ? buildCurrencyId(activeChain, outputAddress) : undefined

  return { inputIdentifier, outputIdentifier, inputValue, outputValue }
}

// Existing Helper Function to Extract Token Addresses (for V2/V3)
function extractTokenAddresses(commands: UniversalRouterCommand[]): {
  inputAddress: string | undefined
  outputAddress: string | undefined
} {
  let inputAddress: string | undefined
  let outputAddress: string | undefined

  for (const command of commands) {
    const result = getTokenAddressesFromV2V3SwapCommands(command)
    if (result.inputAddress) {
      inputAddress = result.inputAddress
    }
    if (result.outputAddress) {
      outputAddress = result.outputAddress
    }
  }

  return { inputAddress, outputAddress }
}

function getTokenAmounts(commands: UniversalRouterCommand[]): {
  inputValue: string
  outputValue: string
} {
  const firstSwapCommand = commands.find(isURCommandASwap)
  const lastSwapCommand = commands.findLast(isURCommandASwap)

  assert(
    firstSwapCommand && lastSwapCommand,
    'SwapRequestContent: All swaps must have a defined input and output Universal Router command.',
  )

  const firstAmountInParam = firstSwapCommand?.params.find(isAmountInOrMaxParam)
  const lastAmountOutParam = lastSwapCommand?.params.find(isAmountOutMinOrOutParam)

  assert(
    firstAmountInParam && lastAmountOutParam,
    'SwapRequestContent: All swaps must have a defined input and output amount parameter.',
  )

  return {
    inputValue: firstAmountInParam?.value || '0', // Safe due to assert
    outputValue: lastAmountOutParam?.value || '0', // Safe due to assert
  }
}

// Predicate Functions
export function isAmountInOrMaxParam(param: Param): param is AmountInParam | AmountInMaxParam {
  return isAmountInParam(param) || isAmountInMaxParam(param)
}

export function isAmountOutMinOrOutParam(param: Param): param is AmountOutMinParam | AmountOutParam {
  return isAmountOutMinParam(param) || isAmountOutParam(param)
}

// Helper Function to Extract Addresses from V2 and V3 Swap Commands
function getTokenAddressesFromV2V3SwapCommands(command: UniversalRouterCommand): {
  inputAddress?: string
  outputAddress?: string
} {
  let inputAddress: string | undefined
  let outputAddress: string | undefined

  const pathParam = command.params.find(({ name }) => name === 'path')
  if (!pathParam) {
    return { inputAddress, outputAddress }
  }

  if (command.commandName.startsWith('V2_SWAP_EXACT')) {
    const path = pathParam.value as string[]
    if (path.length > 0) {
      inputAddress = path[0]
      outputAddress = path[path.length - 1]
    }
  } else if (command.commandName.startsWith('V3_SWAP_EXACT')) {
    const path = pathParam.value as { fee: number; tokenIn: string; tokenOut: string }[]
    if (path.length > 0) {
      const first = path[0]
      if (first) {
        inputAddress = first.tokenIn
      }
      const last = path[path.length - 1]
      if (last) {
        outputAddress = last.tokenOut
      }
    }
  }

  // Future handling for V4_SWAP can be added here

  return { inputAddress, outputAddress }
}

export function getTokenDetailsFromV4SwapCommands(command: UniversalRouterCommand): {
  inputAddress?: string
  outputAddress?: string
  inputValue?: string
  outputValue?: string
} {
  let inputAddress: string | undefined
  let outputAddress: string | undefined
  let inputValue: string | undefined
  let outputValue: string | undefined

  if (command.commandName !== 'V4_SWAP') {
    return { inputAddress, outputAddress, inputValue, outputValue }
  }

  for (const param of command.params) {
    switch (param.name) {
      case 'SWAP_EXACT_IN':
        {
          const parsed = V4SwapExactInParamSchema.safeParse(param)
          if (!parsed.success) {
            break
          }

          for (const p of parsed.data.value) {
            if (p.name === 'swap') {
              const swap = p.value

              inputAddress = swap.currencyIn
              inputValue = swap.amountIn
              outputValue = swap.amountOutMinimum

              const lastPath = swap.path[swap.path.length - 1]
              if (lastPath) {
                outputAddress = lastPath.intermediateCurrency
              }
            }
          }
        }
        break

      case 'SWAP_EXACT_OUT':
        {
          const parsed = V4SwapExactOutParamSchema.safeParse(param)
          if (!parsed.success) {
            break
          }

          for (const p of parsed.data.value) {
            if (p.name === 'swap') {
              const swap = p.value

              outputAddress = swap.currencyOut
              outputValue = swap.amountOut
              inputValue = swap.amountInMaximum

              const firstPath = swap.path[0]
              if (firstPath) {
                inputAddress = firstPath.intermediateCurrency
              }
            }
          }
        }
        break

      case 'SWAP_EXACT_IN_SINGLE':
        {
          const parsed = V4SwapExactInSingleParamSchema.safeParse(param)
          if (!parsed.success) {
            break
          }

          for (const p of parsed.data.value) {
            if (p.name === 'swap') {
              const swap = p.value

              inputValue = swap.amountIn
              outputValue = swap.amountOutMinimum

              if (swap.zeroForOne) {
                inputAddress = swap.poolKey.currency0
                outputAddress = swap.poolKey.currency1
              } else {
                inputAddress = swap.poolKey.currency1
                outputAddress = swap.poolKey.currency0
              }
            }
          }
        }
        break

      case 'SWAP_EXACT_OUT_SINGLE':
        {
          const parsed = V4SwapExactOutSingleParamSchema.safeParse(param)
          if (!parsed.success) {
            break
          }

          for (const p of parsed.data.value) {
            if (p.name === 'swap') {
              const swap = p.value

              outputValue = swap.amountOut
              inputValue = swap.amountInMaximum

              if (swap.zeroForOne) {
                inputAddress = swap.poolKey.currency0
                outputAddress = swap.poolKey.currency1
              } else {
                inputAddress = swap.poolKey.currency1
                outputAddress = swap.poolKey.currency0
              }
            }
          }
        }
        break

      default:
        break
    }
  }

  return { inputAddress, outputAddress, inputValue, outputValue }
}
