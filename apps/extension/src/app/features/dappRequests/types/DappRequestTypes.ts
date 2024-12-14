import { EthereumRpcErrorSchema } from 'src/app/features/dappRequests/types/ErrorTypes'
import {
  EthersTransactionRequestSchema,
  EthersTransactionResponseSchema,
} from 'src/app/features/dappRequests/types/EthersTypes'
import { NonfungiblePositionManagerCallSchema } from 'src/app/features/dappRequests/types/NonfungiblePositionManagerTypes'
import { UniversalRouterCallSchema } from 'src/app/features/dappRequests/types/UniversalRouterTypes'
import { HomeTabs } from 'src/app/navigation/constants'
import { MessageSchema } from 'src/background/messagePassing/messageTypes'
import { PermissionRequestSchema, PermissionSchema } from 'src/contentScript/WindowEthereumRequestTypes'
import { z } from 'zod'

// ENUMS

export enum DappRequestType {
  ChangeChain = 'ChangeChain',
  GetAccount = 'GetAccount',
  GetChainId = 'GetChainId',
  GetPermissions = 'GetPermissions',
  RequestAccount = 'RequestAccount',
  RequestPermissions = 'RequestPermissions',
  RevokePermissions = 'RevokePermissions',
  SendTransaction = 'SendTransaction',
  SignMessage = 'SignMessage',
  SignTransaction = 'SignTransaction',
  SignTypedData = 'SignTypedData',
  UniswapOpenSidebar = 'UniswapOpenSidebar',
}

export enum DappResponseType {
  AccountResponse = 'AccountResponse',
  ChainIdResponse = 'ChainIdResponse',
  ChainChangeResponse = 'ChainChangeResponse',
  ErrorResponse = 'ErrorResponse',
  GetPermissionsResponse = 'GetPermissions',
  RequestPermissionsResponse = 'RequestPermissions',
  RevokePermissionsResponse = 'RevokePermissions',
  SignTransactionResponse = 'SignTransactionResponse',
  SendTransactionResponse = 'SendTransactionResponse',
  SignTypedDataResponse = 'SignTypedDataResponse',
  SignMessageResponse = 'SignMessageResponse',
  UniswapOpenSidebarResponse = 'UniswapOpenSidebarResponse',
}

export enum UniswapOpenSidebarTab {
  Activity = 'activity',
  Tokens = 'tokens',
}

// SCHEMAS + TYPES

export const BaseDappRequestSchema = MessageSchema.extend({
  requestId: z.string(),
  type: z.nativeEnum(DappRequestType),
})

export const BaseDappResponseSchema = MessageSchema.extend({
  requestId: z.string(),
  type: z.nativeEnum(DappResponseType),
})

export const SignMessageRequestSchema = BaseDappRequestSchema.extend({
  type: z.literal(DappRequestType.SignMessage),
  messageHex: z.string(),
  address: z.string(),
})
export type SignMessageRequest = z.infer<typeof SignMessageRequestSchema>

export const SignTypedDataRequestSchema = BaseDappRequestSchema.extend({
  type: z.literal(DappRequestType.SignTypedData),
  typedData: z.string(),
  address: z.string(),
})
export type SignTypedDataRequest = z.infer<typeof SignTypedDataRequestSchema>

export const SignTransactionRequestSchema = BaseDappRequestSchema.extend({
  type: z.literal(DappRequestType.SignTransaction),
  transaction: EthersTransactionRequestSchema,
})
export type SignTransactionRequest = z.infer<typeof SignTransactionRequestSchema>

export const UniswapOpenSidebarRequestSchema = BaseDappRequestSchema.extend({
  type: z.literal(DappRequestType.UniswapOpenSidebar),
  tab: z.nativeEnum(HomeTabs).optional(),
})
export type UniswapOpenSidebarRequest = z.infer<typeof UniswapOpenSidebarRequestSchema>

// ENUMS
export enum EthSendTransactionRPCActions {
  Approve = 'Approve',
  ContractInteraction = 'ContractInteraction',
  Swap = 'Swap',
  Wrap = 'Wrap',
  LP = 'LP',
  Unknown = 'Unknown',
}

export const BaseSendTransactionRequestSchema = BaseDappRequestSchema.extend({
  type: z.literal(DappRequestType.SendTransaction),
  transaction: EthersTransactionRequestSchema,
  functionSignature: z.string().optional(),
  contractInteractions: z.nativeEnum(EthSendTransactionRPCActions).optional(),
})
export type BaseSendTransactionRequest = z.infer<typeof BaseSendTransactionRequestSchema>

const ApproveSendTransactionRequestSchema = BaseSendTransactionRequestSchema.extend({
  contractInteractions: z.literal(EthSendTransactionRPCActions.Approve),
})
export type ApproveSendTransactionRequest = z.infer<typeof ApproveSendTransactionRequestSchema>

const ContractInteractionSendTransactionRequestSchema = BaseSendTransactionRequestSchema.extend({
  contractInteractions: z.literal(EthSendTransactionRPCActions.ContractInteraction),
})
export type ContractInteractionSendTransactionRequest = z.infer<typeof ContractInteractionSendTransactionRequestSchema>

const SwapSendTransactionRequestSchema = BaseSendTransactionRequestSchema.extend({
  contractInteractions: z.literal(EthSendTransactionRPCActions.Swap),
  parsedCalldata: UniversalRouterCallSchema,
})
export type SwapSendTransactionRequest = z.infer<typeof SwapSendTransactionRequestSchema>

const WrapSendTransactionRequestSchema = BaseSendTransactionRequestSchema.extend({
  contractInteractions: z.literal(EthSendTransactionRPCActions.Wrap),
})
export type WrapSendTransactionRequest = z.infer<typeof WrapSendTransactionRequestSchema>

const LPSendTransactionRequestSchema = BaseSendTransactionRequestSchema.extend({
  contractInteractions: z.literal(EthSendTransactionRPCActions.LP),
  parsedCalldata: NonfungiblePositionManagerCallSchema,
})
export type LPSendTransactionRequest = z.infer<typeof LPSendTransactionRequestSchema>

const UnknownContractInteractionSendTransactionRequestSchema = BaseSendTransactionRequestSchema.extend({
  contractInteractions: z.literal(EthSendTransactionRPCActions.Unknown).optional(),
})
export type UnknownContractInteractionSendTransactionRequest = z.infer<
  typeof UnknownContractInteractionSendTransactionRequestSchema
>

export const SendTransactionRequestSchema = z.union([
  ApproveSendTransactionRequestSchema,
  ContractInteractionSendTransactionRequestSchema,
  SwapSendTransactionRequestSchema,
  WrapSendTransactionRequestSchema,
  LPSendTransactionRequestSchema,
  UnknownContractInteractionSendTransactionRequestSchema,
])

export type SendTransactionRequest = z.infer<typeof SendTransactionRequestSchema>

export const ChangeChainRequestSchema = BaseDappRequestSchema.extend({
  type: z.literal(DappRequestType.ChangeChain),
  chainId: z.string(),
})
export type ChangeChainRequest = z.infer<typeof ChangeChainRequestSchema>

export const GetAccountRequestSchema = BaseDappRequestSchema.extend({
  type: z.literal(DappRequestType.GetAccount),
})
export type GetAccountRequest = z.infer<typeof GetAccountRequestSchema>

export const RequestAccountRequestSchema = BaseDappRequestSchema.extend({
  type: z.literal(DappRequestType.RequestAccount),
})
export type RequestAccountRequest = z.infer<typeof RequestAccountRequestSchema>

export const GetChainIdRequestSchema = BaseDappRequestSchema.extend({
  type: z.literal(DappRequestType.GetChainId),
})
export type GetChainIdRequest = z.infer<typeof GetChainIdRequestSchema>

export const GetPermissionsRequestSchema = BaseDappRequestSchema.extend({
  type: z.literal(DappRequestType.GetPermissions),
})

export type GetPermissionsRequest = z.infer<typeof GetPermissionsRequestSchema>

export const RequestPermissionsRequestSchema = BaseDappRequestSchema.extend({
  type: z.literal(DappRequestType.RequestPermissions),
  permissions: PermissionRequestSchema,
})

export type RequestPermissionsRequest = z.infer<typeof RequestPermissionsRequestSchema>

export const RevokePermissionsRequestSchema = BaseDappRequestSchema.extend({
  type: z.literal(DappRequestType.RevokePermissions),
  permissions: PermissionRequestSchema,
})

export type RevokePermissionsRequest = z.infer<typeof RevokePermissionsRequestSchema>

export const SignMessageResponseSchema = BaseDappResponseSchema.extend({
  type: z.literal(DappResponseType.SignMessageResponse),
  signature: z.string().optional(),
})
export type SignMessageResponse = z.infer<typeof SignMessageResponseSchema>

export const SignTypedDataResponseSchema = BaseDappResponseSchema.extend({
  type: z.literal(DappResponseType.SignTypedDataResponse),
  signature: z.string(),
})
export type SignTypedDataResponse = z.infer<typeof SignTypedDataResponseSchema>

export const SignTransactionResponseSchema = BaseDappResponseSchema.extend({
  type: z.literal(DappResponseType.SignTransactionResponse),
  signedTransactionHash: z.string().optional(),
})
export type SignTransactionResponse = z.infer<typeof SignTransactionResponseSchema>

export const SendTransactionResponseSchema = BaseDappResponseSchema.extend({
  type: z.literal(DappResponseType.SendTransactionResponse),
  transactionResponse: EthersTransactionResponseSchema,
})
export type SendTransactionResponse = z.infer<typeof SendTransactionResponseSchema>

export const ChangeChainResponseSchema = BaseDappResponseSchema.extend({
  type: z.literal(DappResponseType.ChainChangeResponse),
  chainId: z.string(),
  providerUrl: z.string(),
})
export type ChangeChainResponse = z.infer<typeof ChangeChainResponseSchema>

export const AccountResponseSchema = BaseDappResponseSchema.extend({
  type: z.literal(DappResponseType.AccountResponse),
  connectedAddresses: z.array(z.string()),
  chainId: z.string(),
  providerUrl: z.string(),
})
export type AccountResponse = z.infer<typeof AccountResponseSchema>

export const ChainIdResponseSchema = BaseDappResponseSchema.extend({
  type: z.literal(DappResponseType.ChainIdResponse),
  chainId: z.string(),
})
export type ChainIdResponse = z.infer<typeof ChainIdResponseSchema>

export const GetPermissionsResponseSchema = BaseDappResponseSchema.extend({
  type: z.literal(DappResponseType.GetPermissionsResponse),
  permissions: z.array(PermissionSchema),
})
export type GetPermissionsResponse = z.infer<typeof GetPermissionsResponseSchema>

export const RequestPermissionsResponseSchema = BaseDappResponseSchema.extend({
  type: z.literal(DappResponseType.RequestPermissionsResponse),
  permissions: z.array(PermissionSchema),
  accounts: z.optional(AccountResponseSchema.omit({ requestId: true, type: true })),
})
export type RequestPermissionsResponse = z.infer<typeof RequestPermissionsResponseSchema>

export const RevokePermissionsResponseSchema = BaseDappResponseSchema.extend({
  type: z.literal(DappResponseType.RevokePermissionsResponse),
})
export type RevokePermissionsResponse = z.infer<typeof RevokePermissionsResponseSchema>

export const UniswapOpenSidebarResponseSchema = BaseDappResponseSchema.extend({
  type: z.literal(DappResponseType.UniswapOpenSidebarResponse),
})
export type UniswapOpenSidebarResponse = z.infer<typeof UniswapOpenSidebarResponseSchema>

export const ErrorResponseSchema = BaseDappResponseSchema.extend({
  type: z.literal(DappResponseType.ErrorResponse),
  error: EthereumRpcErrorSchema,
})
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

export const DappRequestSchema = z.union([
  ChangeChainRequestSchema,
  GetAccountRequestSchema,
  GetChainIdRequestSchema,
  GetPermissionsRequestSchema,
  RequestAccountRequestSchema,
  RequestPermissionsRequestSchema,
  RevokePermissionsRequestSchema,
  SendTransactionRequestSchema,
  SignMessageRequestSchema,
  SignTypedDataRequestSchema,
  SignTransactionRequestSchema,
  UniswapOpenSidebarRequestSchema,
])

export const DappResponseSchema = z.union([
  AccountResponseSchema,
  ChangeChainResponseSchema,
  ChainIdResponseSchema,
  ErrorResponseSchema,
  GetPermissionsResponseSchema,
  RequestPermissionsResponseSchema,
  SignMessageResponseSchema,
  SignTypedDataResponseSchema,
  SignTransactionResponseSchema,
  SendTransactionResponseSchema,
  UniswapOpenSidebarResponseSchema,
])

export type DappRequest = z.infer<typeof DappRequestSchema>
export type DappResponse = z.infer<typeof DappResponseSchema>

// VALIDATORS / UTILS

export function isValidDappRequest(message: unknown): message is DappRequest {
  return DappRequestSchema.safeParse(message).success
}

export function isValidDappResponse(message: unknown): message is DappResponse {
  return DappResponseSchema.safeParse(message).success
}

export function isErrorResponse(response: unknown): response is ErrorResponse {
  return ErrorResponseSchema.safeParse(response).success
}

export function isValidSendTransactionResponse(response: unknown): response is SendTransactionResponse {
  return SendTransactionResponseSchema.safeParse(response).success
}

export function isValidSignTransactionResponse(response: unknown): response is SignTransactionResponse {
  return SignTransactionResponseSchema.safeParse(response).success
}

export function isValidSignMessageResponse(response: unknown): response is SignMessageResponse {
  return SignMessageResponseSchema.safeParse(response).success
}

export function isValidSignTypedDataResponse(response: unknown): response is SignTypedDataResponse {
  return SignTypedDataResponseSchema.safeParse(response).success
}

export function isValidChangeChainResponse(response: unknown): response is ChangeChainResponse {
  return ChangeChainResponseSchema.safeParse(response).success
}

export function isValidChainIdResponse(response: unknown): response is ChainIdResponse {
  return ChainIdResponseSchema.safeParse(response).success
}

export function isValidAccountResponse(response: unknown): response is AccountResponse {
  return AccountResponseSchema.safeParse(response).success
}

export function isValidGetPermissionsResponse(response: unknown): response is GetPermissionsResponse {
  return GetPermissionsResponseSchema.safeParse(response).success
}

export function isValidRequestPermissionsResponse(response: unknown): response is RequestPermissionsResponse {
  return RequestPermissionsResponseSchema.safeParse(response).success
}

export function isApproveRequest(request: SendTransactionRequest): request is ApproveSendTransactionRequest {
  return ApproveSendTransactionRequestSchema.safeParse(request).success
}

export function isSwapRequest(request: SendTransactionRequest): request is SwapSendTransactionRequest {
  return SwapSendTransactionRequestSchema.safeParse(request).success
}

export function isSignTypedDataRequest(request: DappRequest): request is SignTypedDataRequest {
  return SignTypedDataRequestSchema.safeParse(request).success
}

export function isChangeChainRequest(request: DappRequest): request is ChangeChainRequest {
  return ChangeChainRequestSchema.safeParse(request).success
}

export function isSignMessageRequest(request: DappRequest): request is SignMessageRequest {
  return SignMessageRequestSchema.safeParse(request).success
}

export function isLPRequest(request: SendTransactionRequest): request is LPSendTransactionRequest {
  return LPSendTransactionRequestSchema.safeParse(request).success
}

export function isSendTransactionRequest(request: DappRequest): request is SendTransactionRequest {
  return SendTransactionRequestSchema.safeParse(request).success
}

export function isGetAccountRequest(request: DappRequest): request is GetAccountRequest {
  return GetAccountRequestSchema.safeParse(request).success
}

export function isRequestAccountRequest(request: DappRequest): request is RequestAccountRequest {
  return RequestAccountRequestSchema.safeParse(request).success
}

export function isRequestPermissionsRequest(request: DappRequest): request is RequestPermissionsRequest {
  return RequestPermissionsRequestSchema.safeParse(request).success
}

export function isConnectionRequest(request: DappRequest): boolean {
  return (
    isGetAccountRequest(request) ||
    isRequestAccountRequest(request) ||
    isRequestPermissionsRequest(request)
  )
}

