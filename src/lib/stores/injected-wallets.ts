import { writable } from "svelte/store"

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
        from: `0x${string}`
        to: `0x${string}`
        gas: `0x${string}`
        value: `0x${string}`
        data: `0x${string}`
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


type EIP6963Event = {
    detail: {
        info: {
            name: string
            icon: string
        }
        provider: Provider
    }
}

const createInjectedWalletsStore = () => {
    const { subscribe, update } = writable<Array<InjectedWallet>>([])

    const exploreInjectedWallets = () => {
        const eventListener = (e: EIP6963Event) => {
            if (!/data:(image\/[-+\w.]+)(;?\w+=[-\w]+)*(;base64)?,.*/gu.test(e.detail.info.icon)) return

            update(wallets => [...wallets, {
                name: e.detail.info.name,
                icon: e.detail.info.icon,
                provider: e.detail.provider
            }])
        }

        window.addEventListener('eip6963:announceProvider', eventListener as any)

        window.dispatchEvent(new Event('eip6963:requestProvider'))
    }

    return {
        subscribe,
        exploreInjectedWallets,
    }
}


export const injectedWallets = createInjectedWalletsStore()