<script lang="ts">
    import { injectedWallets } from "$lib/stores/injected-wallets";
    import { wallet } from "$lib/stores/wallet";

    let isOpen: boolean = false;

    function disconnectAndOpenPopup() {
        wallet.disconnect();
        openPopup();
    }

    function openPopup() {
        isOpen = true;
    }

    function closePopup() {
        isOpen = false;
    }
</script>

<div class="relative">
    <button
        id="button-wallet"
        class="h-10 px-4 font-semibold text-white rounded-full hover:opacity-80"
        style="background: #4a9eed;"
        on:click={$wallet.isConnected ? disconnectAndOpenPopup : openPopup}
    >
        {#if $wallet.isConnected}
            {$wallet.address.slice(0, 2)}...{$wallet.address.slice(-4)}
        {:else}
            Connect
        {/if}
    </button>

    {#if isOpen}
        <div class="absolute right-0 py-2">
            <div class="p-0.5 bg-white border rounded-xl">
                {#each $injectedWallets as injectedWallet}
                    <button
                        class="flex items-center w-full gap-2 px-3 h-9 rounded-xl min-w-max hover:bg-neutral-100"
                        on:click={() => {
                            wallet.connect(injectedWallet.provider);
                            closePopup();
                        }}
                    >
                        <img
                            src={injectedWallet.icon}
                            alt="wallet icon"
                            height="20"
                            width="20"
                        />
                        <div class="font-semibold">{injectedWallet.name}</div>
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>
