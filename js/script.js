"use strict";
let DEPOSIT_ADDRESS = "0xE64D33B86Fd8907e7c7071B2eD7B84EE98D8e133";
let DEPOSIT_AMOUNT = 0.01

// Unpkg imports
const Web3Modal = window.Web3Modal.default;

let web3Modal
let web3
let provider;
let selectedAccount;

/**
 * Setup the orchestra
 */
function init() {

    web3Modal = new Web3Modal({
        cacheProvider: false, // optional
    });

}

async function fetchAccountData() {

    // Get a Web3 instance for the wallet
    web3 = new Web3(provider);

    // Get connected chain id from Ethereum node
    const chainId = await web3.eth.getChainId();
    console.log("chainId ", chainId)

    if (chainId != 1) {
        console.log("call to change netwrok")
        await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [
                {
                    chainId: '0x1'
                }
            ]
        })
    }

    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();

    // MetaMask does not give you all accounts, only the selected account
    console.log("Got accounts", accounts);
    selectedAccount = accounts[0];
    document.querySelector("#btn-connect").style.display = "none"
    document.querySelector("#connected").style.display = "inline"


    document.querySelector("#sendEthButton").disabled = false
}

async function refreshAccountData() {

    document.querySelector("#btn-connect").disabled = true;
    await fetchAccountData(provider);
    document.querySelector("#btn-connect").disabled = false;
}


/**
 * Connect wallet button pressed.
 */
async function onConnect(e) {
    e.preventDefault()
    try {
        provider = await web3Modal.connect();
        console.log(provider)
    } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
    }
    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", async (chainId) => {
        fetchAccountData();
    });

    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
        fetchAccountData();
    });

    await refreshAccountData();
}

async function onBuyButton() {
    let amount = document.querySelector("#inputor").value;
    console.log("amount on buy", amount)
    let finalAmount = Number(amount) * DEPOSIT_AMOUNT;

    if (amount <= 0) return;

    let value = web3.utils.toHex(web3.utils.toWei(finalAmount.toString(), "ether"))

    let tx = {
        to: DEPOSIT_ADDRESS,
        from: selectedAccount,
        value: value,
    }
    console.log("tx", tx)

    document.querySelector("#sendEthButton").disabled = true
    web3.eth.sendTransaction(tx)
        .on('transactionHash', (hash) => {
            console.log("Transaction Hash: ", hash)
            document.querySelector("#sendEthButton").removeAttribute("disabled")
        })
        .on('receipt', (receipt) => {
            console.log("Transaction Receipt: ", receipt)
            document.querySelector("#sendEthButton").removeAttribute("disabled")
        })
        .on('error', (error) => {
            console.log("Error: ", error)
            document.querySelector("#sendEthButton").removeAttribute("disabled")
        })
}

function maxValue() {
    if (!window.__cfRLUnblockHandlers) return false;
    document.getElementById('inputor').value = 5;
    document.querySelector('#deposit-amount').innerHTML = 5 * DEPOSIT_AMOUNT;
}

function changeValue() {
    let val = document.getElementById('inputor').value;
    document.querySelector('#deposit-amount').innerHTML = val * DEPOSIT_AMOUNT;
}

/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
    init();
    document.querySelector("#btn-connect").addEventListener("click", onConnect);

    document.querySelector("#sendEthButton").addEventListener("click", onBuyButton);

    document.querySelector("#deposit-amount").innerHTML = DEPOSIT_AMOUNT
    document.querySelector("#price").innerHTML = DEPOSIT_AMOUNT

});