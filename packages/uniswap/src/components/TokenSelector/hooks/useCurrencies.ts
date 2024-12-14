import { ApolloError } from '@apollo/client'
import { useMemo } from 'react'
import { BRIDGED_BASE_ADDRESSES } from 'uniswap/src/constants/addresses'
import { GqlResult } from 'uniswap/src/data/types'
import { useTokenProjects } from 'uniswap/src/features/dataApi/tokenProjects'
import { CurrencyInfo } from 'uniswap/src/features/dataApi/types'
import { usePersistedError } from 'uniswap/src/features/dataApi/utils'
import { areAddressesEqual } from 'uniswap/src/utils/addresses'

export function useCurrencies(currencyIds: string[]): GqlResult<CurrencyInfo[]> {
  const { data: baseCurrencyInfos, loading, error, refetch } = useTokenProjects(currencyIds)
  const persistedError = usePersistedError(loading, error instanceof ApolloError ? error : undefined)

  // TokenProjects returns tokens on every network, so filter out native assets that have a
  // bridged version on other networks
  const filteredBaseCurrencyInfos = useMemo(() => {
    return baseCurrencyInfos?.filter((currencyInfo) => {
      if (currencyInfo.currency.isNative) {
        return true
      }

      const { address } = currencyInfo.currency
      const bridgedAsset = BRIDGED_BASE_ADDRESSES.find((bridgedAddress) => areAddressesEqual(bridgedAddress, address))

      if (!bridgedAsset) {
        return true
      }

      return false
    })
  }, [baseCurrencyInfos])

  return { data: filteredBaseCurrencyInfos, loading, error: persistedError, refetch }
}
