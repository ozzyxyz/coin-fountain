<script lang="ts">
    import ButtonChain from "$lib/components/ButtonChain.svelte";
    import ButtonWallet from "$lib/components/ButtonWallet.svelte";
    import { injectedWallets } from "$lib/stores/injected-wallets";
    import { onMount } from "svelte";

    onMount(() => {
        injectedWallets.exploreInjectedWallets();
    });
</script>

<header class="sticky top-0 flex items-center justify-between h-16 px-4">
    <a href="/" class="text-xl font-bold">Coin Fountain</a>

    <div class="flex gap-4">
        <ButtonWallet />
        <ButtonChain />
    </div>
</header>
