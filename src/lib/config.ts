export const config = {
    contractMethodData: '0x0dbe671f',
    contractMethodGas: '0x52C2',
    chains: [
        {
            name: 'Arbitrum One',
            chainId: '0xa4b1',
            color: '#4a9eed',
            contractAddress: '0x49AA4de7E6d99A2F7EFf1d1eaDE14404F5ae2E97',
            rpcNodeLink: 'https://arb1.arbitrum.io/rpc',
            explorerLink: 'https://arbiscan.io'
        },
        {
            name: 'Base',
            chainId: '0x2105',
            color: '#3d50f1',
            contractAddress: '0xAe6861A6E376b0544C44E41A038b797afBA06eE6',
            rpcNodeLink: 'https://mainnet.base.org',
            explorerLink: 'https://basescan.org'
        },
        {
            name: 'Linea',
            chainId: '0xe708',
            color: '#000000',
            contractAddress: '0xCDFC607407AC05C2B0241e433f8Ff749589385B7',
            rpcNodeLink: 'https://rpc.linea.build',
            explorerLink: 'https://lineascan.build'
        },
        {
            name: 'Optimism',
            chainId: '0xa',
            color: '#f4292e',
            contractAddress: '0x320D382496641cCb20e31b09572EeC33e90f574C',
            rpcNodeLink: 'https://mainnet.optimism.io',
            explorerLink: 'https://optimistic.etherscan.io'
        },
        {
            name: 'Polygon zkEVM',
            chainId: '0x44d',
            color: '#8348e2',
            contractAddress: '0x0edB7a72593B57bC94766373aFCCc2AB039EfF25',
            rpcNodeLink: 'https://zkevm-rpc.com',
            explorerLink: 'https://zkevm.polygonscan.com'
        },
        {
            name: 'Scroll',
            chainId: '0x82750',
            color: '#e6b166',
            contractAddress: '0x0edB7a72593B57bC94766373aFCCc2AB039EfF25',
            rpcNodeLink: 'https://rpc.scroll.io',
            explorerLink: 'https://scrollscan.com'
        }
    ],
} satisfies {
    contractMethodData: `0x${string}`
    contractMethodGas: `0x${string}`
    chains: Array<{
        name: string
        chainId: `0x${string}`
        color: `#${string}`
        contractAddress: `0x${string}`
        rpcNodeLink: `https://${string}.${string}`
        explorerLink: `https://${string}.${string}`
    }>
}