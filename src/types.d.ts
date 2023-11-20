type InjectedWallet = {
    name: string
    icon: string
    provider: Provider
}

type ProviderRequestMethods =
    | 'eth_requestAccounts'
    | 'wallet_switchEthereumChain'
    | 'wallet_addEthereumChain'
    | 'eth_chainId'
    | 'eth_sendTransaction'

type ProviderRequestParams<M extends ProviderRequestMethods> =
    M extends 'eth_requestAccounts' ? [] :
    M extends 'wallet_switchEthereumChain' ? [
        { chainId: string }
    ] :
    M extends 'wallet_addEthereumChain' ? [
        {
            chainId: string
            chainName: string
            rpcUrls: [string]
            blockExplorerUrls: [string]
            nativeCurrency: {
                name: string
                symbol: 'ETH'
                decimals: 18
            }
        }
    ] :
    M extends 'eth_chainId' ? [] :
    M extends 'eth_sendTransaction' ? [{
        from: string
        to: string
        gas: string
        value: string
        data: string
    }] :
    never

type ProviderRequestReturnValue<M extends ProviderRequestMethods> =
    M extends 'eth_requestAccounts' ? Array<string> :
    M extends 'wallet_switchEthereumChain' ? unknown :
    M extends 'wallet_addEthereumChain' ? unknown :
    M extends 'eth_chainId' ? string :
    M extends 'eth_sendTransaction' ? string :
    never

type ProviderEventNames = 'accountsChanged' | 'chainChanged'

type ProviderEventCallbackParams<N extends ProviderEventNames> =
    N extends 'accountsChanged' ? Array<string> :
    N extends 'chainChanged' ? string :
    never

export type Provider = {
    request: <M extends ProviderRequestMethods>(payload: { method: M, params: ProviderRequestParams<M> }) => Promise<ProviderRequestReturnValue<M>>
    on: <N extends ProviderEventNames>(eventName: N, callback: (params: ProviderEventCallbackParams<N>) => void) => void
    removeAllListeners: () => void
}




type AnnounceProviderEvent = {
    detail: {
        info: {
            name: string
            icon: string
        }
        provider: Provider
    }
}

declare global {
    interface Window {
        addEventListener(type: "eip6963:announceProvider", listener: (this: Document, ev: AnnounceProviderEvent) => void): void
    }
}


export type ApiResponse = {
    result?: Array<{
        timeStamp?: string
    }>
}