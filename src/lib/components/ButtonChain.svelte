<script lang="ts">
    import { config } from "$lib/config";
    import { wallet } from "$lib/stores/wallet";

    let isOpen: boolean = false;

    function togglePopup() {
        isOpen = !isOpen;
    }

    $: isSupportedChainId = Boolean(
        config.chains.find(({ chainId }) => chainId === $wallet.chainId)
    );

    let currentChain = config.chains[0];

    wallet.subscribe(({ chainId: chainIdFromWallet }) => {
        const chainFromWallet = config.chains.find(
            ({ chainId }) => chainId === chainIdFromWallet
        );

        if (!chainFromWallet) return;

        currentChain = chainFromWallet;

        document.body.style.background = `${currentChain.color}20`;
        // @ts-ignore
        document.getElementById("button-wallet").style.background =
            currentChain.color;
    });
</script>

<div class="relative">
    <button
        disabled={!$wallet.isConnected}
        on:click={togglePopup}
        class="hover:opacity-80 disabled:cursor-not-allowed"
    >
        <img
            src="/{currentChain.name.replaceAll(' ', '-').toLowerCase()}.svg"
            alt="chain icon"
        />
    </button>

    {#if isOpen}
        <div class="absolute right-0 py-2">
            <div class="p-0.5 bg-white border rounded-xl">
                {#each config.chains as chain}
                    <button
                        class="flex items-center w-full gap-2 px-3 h-9 rounded-xl min-w-max hover:bg-neutral-100"
                        on:click={async () => {
                            await wallet.changeNetwork(
                                chain.chainId,
                                chain.name,
                                chain.rpcNodeLink,
                                chain.explorerLink
                            );
                            currentChain = chain;
                            togglePopup();

                            document.body.style.background = `${chain.color}20`;
                            // @ts-ignore
                            document.getElementById(
                                "button-wallet"
                            ).style.background = chain.color;
                        }}
                    >
                        <img
                            src="/{chain.name
                                .replaceAll(' ', '-')
                                .toLowerCase()}.svg"
                            alt="chain icon"
                            height="24"
                            width="24"
                        />
                        <div class="font-semibold">{chain.name}</div>
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>
