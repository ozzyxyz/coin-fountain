import coinFountain from 'coin-fountain.json'
import type { AnnounceProviderEvent, Provider } from "./types"

class App {
    address: string | null
    chainId: string | null
    provider: Provider | null

    static elements = {
        buttonChains: document.getElementById('button-chains') as HTMLButtonElement,
        buttonWallets: document.getElementById('button-wallets') as HTMLButtonElement,
        popupChains: document.getElementById('popup-chains') as HTMLDivElement,
        popupWallets: document.getElementById('popup-wallets') as HTMLDivElement,
        popupCover: document.getElementById('popup-cover') as HTMLDivElement,
        noWalletIsFound: document.getElementById('no-wallet-is-found') as HTMLButtonElement,
        buttonThrow: document.getElementById('button-throw') as HTMLButtonElement,
    }

    static onNewWallet = (handler: (e: AnnounceProviderEvent) => void) => {
        window.addEventListener('eip6963:announceProvider', handler)
        window.dispatchEvent(new Event("eip6963:requestProvider"))
    }

    changeAddress(address: string | undefined) {
        if (address === undefined) {
            this.address = null
            this.provider = null
            App.elements.buttonWallets.innerText = 'Connect'
            App.elements.buttonThrow.disabled = true
        } else {
            this.address = address
            App.elements.buttonWallets.innerText = `${address.slice(0, 2)}...${address.slice(-4)}`
            App.elements.buttonThrow.disabled = false
        }
    }

    changeNetwork(chain: typeof coinFountain.chains extends Array<infer T> ? T | undefined : never) {
        if (chain === undefined) {
            this.chainId = null
            App.elements.buttonThrow.disabled = true
            alert('Switch chains before using!')
        } else {
            this.chainId = chain.id
            if (this.address) App.elements.buttonThrow.disabled = false
            document.body.style.background = `${chain.color}30`
            App.elements.buttonWallets.style.background = chain.color
            App.elements.buttonThrow.style.background = chain.color

            const img = App.elements.buttonChains.childNodes[1] as HTMLImageElement
            img.src = `/${chain.name.replaceAll(' ', '-').toLowerCase()}.svg`
            img.alt = `${chain.name} icon`
        }
    }

    changeProvider(provider: Provider) {
        this.provider?.removeAllListeners()

        this.provider = provider

        this.provider.on('accountsChanged', addresses => {
            this.changeAddress(addresses[0])
        })

        this.provider.on('chainChanged', chainId => {
            const chain = coinFountain.chains.find(chain => chain.id === chainId)
            this.changeNetwork(chain)
        })
    }

    async throwCoin() {
        if (!this.address || !this.provider || !this.chainId) return
        try {
            const hash = await this.provider.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: this.address,
                    to: coinFountain.chains.find(chain => chain.id === this.chainId)?.contract as string,
                    gas: coinFountain.gas,
                    data: coinFountain.data,
                    value: '0x0'
                }]
            })
            return hash
        } catch (error) {
            if (error.code === 4001) return
            console.error('throwing coin error')
            console.error(error)
            return
        }
    }

    constructor() {
        // Initializing properties.
        this.address = null
        this.chainId = null
        this.provider = null

        // Adding click event handlers.
        coinFountain.chains.forEach(chain => {
            const id = chain.name.replaceAll(' ', '-').toLowerCase()
            const element = document.getElementById(id) as HTMLButtonElement
            element.addEventListener('click', async () => {
                App.elements.popupChains.hidden = true
                App.elements.popupCover.hidden = true
                try {
                    await this.provider?.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{
                            chainId: chain.id
                        }]
                    })
                    this.changeNetwork(chain)
                } catch (error) {
                    if (error.code === 4001) return
                    await this.provider?.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: chain.id,
                            chainName: chain.name,
                            nativeCurrency: {
                                name: 'Ethereum',
                                decimals: 18,
                                symbol: 'ETH'
                            },
                            rpcUrls: [chain.rpc],
                            blockExplorerUrls: [chain.explorer],
                        }]
                    })
                    await this.provider?.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{
                            chainId: chain.id
                        }]
                    })
                    this.changeNetwork(chain)
                }
            })
        })

        App.elements.buttonChains.addEventListener('click', () => {
            App.elements.popupChains.hidden = false
            App.elements.popupCover.hidden = false
        })

        App.elements.buttonWallets.addEventListener('click', () => {
            App.elements.popupWallets.hidden = false
            App.elements.popupCover.hidden = false
        })

        App.elements.noWalletIsFound.addEventListener('click', () => {
            App.elements.popupWallets.hidden = true
            App.elements.popupCover.hidden = true
        })

        App.elements.popupCover.addEventListener('click', () => {
            App.elements.popupChains.hidden = true
            App.elements.popupWallets.hidden = true
            App.elements.popupCover.hidden = true
        })

        App.elements.buttonThrow.addEventListener('click', async () => {
            await this.throwCoin()
        })


        let aintNoWallet = true

        App.onNewWallet(event => {
            if (!/data:(image\/[-+\w.]+)(;?\w+=[-\w]+)*(;base64)?,.*/gu.test(
                event.detail.info.icon,
            )) return

            const ulWallets = document.getElementById('ul-wallets') as HTMLUListElement
            const template = document.getElementById('template-wallet') as HTMLTemplateElement
            const clone = template.content.cloneNode(true)

            if (aintNoWallet) {
                ulWallets.childNodes[1]?.remove()
            }

            const button = clone.childNodes[1]?.childNodes[1] as HTMLButtonElement
            const img = button.childNodes[1] as HTMLImageElement
            const text = button.childNodes[2] as Text

            button.id = event.detail.info.name.replaceAll(' ', '-').toLowerCase()
            img.src = event.detail.info.icon
            img.alt = `${event.detail.info.name} icon`
            text.data = event.detail.info.name

            ulWallets.appendChild(clone)

            button.addEventListener('click', async () => {
                try {
                    const addresses = await event.detail.provider.request({
                        method: 'eth_requestAccounts',
                        params: []
                    })

                    const chainId = await event.detail.provider.request({
                        method: 'eth_chainId',
                        params: []
                    })

                    const chain = coinFountain.chains.find(chain => chain.id === chainId)
                    this.changeAddress(addresses[0])
                    this.changeNetwork(chain)
                    this.changeProvider(event.detail.provider)
                } catch (error) {
                    if (error.code === 4001) return
                    console.error('connect wallet error')
                    console.error(error)
                }
                App.elements.popupWallets.hidden = true
                App.elements.popupCover.hidden = true
            })

            aintNoWallet = false
        })

    }
}

// Start the application.
new App()