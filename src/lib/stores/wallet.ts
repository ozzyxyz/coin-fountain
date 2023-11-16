import { writable } from "svelte/store"
import type { Provider } from "./injected-wallets"
import { config } from "$lib/config"

type Wallet =
    | {
        isConnected: false
        address: null
        chainId: null
        provider: null
    }
    | {
        isConnected: true
        address: string
        chainId: string
        provider: Provider
    }

const notConnected: Wallet = {
    isConnected: false,
    address: null,
    chainId: null,
    provider: null,
}


const createWalletStore = () => {
    const { subscribe, set, update } = writable<Wallet>(notConnected)

    const throwCoin = () => {
        try {
            update(wallet => {
                wallet.provider?.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        data: config.contractMethodData,
                        gas: config.contractMethodGas,
                        from: wallet.address as any,
                        to: (config.chains.find(({ chainId }) => chainId === wallet.chainId) as any)?.contractAddress,
                        value: '0x0',
                    }]
                })

                return wallet
            })

        } catch (error) {
            if (error.code === 4001) return
            console.error('error while connecting:')
            console.error('error code:', error.code || 'not given')
            console.error(error)
        }
    }

    const connect = async (provider: Provider) => {
        try {
            const addresses = await provider.request({
                method: 'eth_requestAccounts',
                params: []
            })

            if (!addresses[0]) return


            const chainId = await provider.request({
                method: 'eth_chainId',
                params: []
            })

            provider.on('accountsChanged', (addresses) => {
                if (addresses[0]) {
                    update(wallet => wallet.isConnected ? {
                        ...wallet,
                        address: addresses[0]
                    } : notConnected)
                } else {
                    set(notConnected)
                }
            })

            provider.on('chainChanged', (chainId) => {
                update(wallet => wallet.isConnected ? {
                    ...wallet,
                    chainId,
                } : notConnected)
            })

            set({
                isConnected: true,
                address: addresses[0],
                provider: provider,
                chainId,
            })
        } catch (error) {
            if (error.code === 4001) return
            console.error('error while connecting:')
            console.error('error code:', error.code || 'not given')
            console.error(error)
        }
    }

    const disconnect = () => {
        update(wallet => {
            wallet.provider?.removeAllListeners()
            return notConnected
        })
    }

    const changeNetwork = (chainId: string, chainName: string, chainRpcUrl: string, chainExplorerUrl: string) => {
        return new Promise<void>((resolve, reject) => {
            update(wallet => {
                wallet.provider?.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{
                        chainId,
                    }]
                }).then(() => {
                    set({ ...wallet, chainId })
                    resolve()
                }).catch((e) => {
                    if (e.code === 4001) return reject()
                    wallet.provider?.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId,
                            chainName,
                            rpcUrls: [chainRpcUrl],
                            blockExplorerUrls: [chainExplorerUrl],
                            nativeCurrency: {
                                decimals: 18,
                                name: 'Ethereum',
                                symbol: 'ETH'
                            }
                        }]
                    }).then(() => {
                        wallet.provider?.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{
                                chainId,
                            }]
                        }).then(() => {
                            set({ ...wallet, chainId })
                            resolve()
                        })
                    })
                }).catch(reject)

                return wallet
            })

        })
    }

    return {
        subscribe,
        connect,
        disconnect,
        changeNetwork,
        throwCoin,
    }
}

export const wallet = createWalletStore()