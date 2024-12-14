import React from 'react'
import { SearchWalletItemBase } from 'src/components/explore/search/items/SearchWalletItemBase'
import { Flex, Text } from 'ui/src'
import { imageSizes } from 'ui/src/theme'
import { useENSAvatar, useENSName } from 'uniswap/src/features/ens/api'
import { SearchContext } from 'uniswap/src/features/search/SearchContext'
import { WalletByAddressSearchResult } from 'uniswap/src/features/search/SearchResult'
import { sanitizeAddressText } from 'uniswap/src/utils/addresses'
import { shortenAddress } from 'utilities/src/addresses'
import { AccountIcon } from 'wallet/src/components/accounts/AccountIcon'

type SearchWalletByAddressItemProps = {
  searchResult: WalletByAddressSearchResult
  searchContext?: SearchContext
}

export function SearchWalletByAddressItem({
  searchResult,
  searchContext,
}: SearchWalletByAddressItemProps): JSX.Element {
  const { address } = searchResult
  const formattedAddress = sanitizeAddressText(shortenAddress(address))
  const { data: ensName } = useENSName(address)
  const { data: avatar } = useENSAvatar(address)

  return (
    <SearchWalletItemBase searchContext={searchContext} searchResult={searchResult}>
      <Flex row alignItems="center" gap="$spacing12" px="$spacing24" py="$spacing12">
        <AccountIcon address={address} avatarUri={avatar} size={imageSizes.image40} />
        <Flex shrink>
          <Text ellipsizeMode="tail" numberOfLines={1} testID={`address-display/name/${ensName}`} variant="body1">
            {ensName || formattedAddress}
          </Text>
          {ensName ? (
            <Text color="$neutral2" ellipsizeMode="tail" numberOfLines={1} variant="subheading2">
              {formattedAddress}
            </Text>
          ) : null}
        </Flex>
      </Flex>
    </SearchWalletItemBase>
  )
}
