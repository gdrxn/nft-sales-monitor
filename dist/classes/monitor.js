"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const utils_1 = require("../libraries/utils");
class Monitor {
    constructor({ MAINNET_API, ABI, contractAddress, WEBHOOK_URL, collectionName, }) {
        this.webhooksQueue = [];
        this.queueIsOn = false;
        //Object.assign(this, { MAINNET_API, ABI, contractAddress });
        this.MAINNET_API = MAINNET_API;
        this.ABI = ABI;
        this.contractAddress = contractAddress;
        this.WEBHOOK_URL = WEBHOOK_URL;
        this.collectionName = collectionName;
        this.provider = new ethers_1.ethers.providers.JsonRpcProvider(MAINNET_API);
        this.contract = new ethers_1.ethers.Contract(this.contractAddress, this.ABI, this.provider);
    }
    start() {
        this.contract.on("Transfer", (seller, buyer, value, event) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const txReceipt = yield event.getTransactionReceipt();
            const tx = yield event.getTransaction();
            const price = ethers_1.ethers.utils.formatUnits(tx.value);
            const txContract = txReceipt.to.toLowerCase();
            const txHash = txReceipt.transactionHash;
            const marketplace = txContract === Monitor.OPENSEA
                ? "OpenSea"
                : txContract === Monitor.LOOKSRARE
                    ? "LooksRare"
                    : txContract === Monitor.X2Y2
                        ? "X2Y2"
                        : txContract === Monitor.GEM
                            ? "Gem"
                            : txContract === Monitor.SUDOSWAP
                                ? "Sudoswap"
                                : null;
            if (marketplace) {
                if (buyer.toLowerCase() === Monitor.GEM) {
                    //OMIT GEM TRANSFER TO AVOID DUPLICATION
                    return;
                }
                const data = {
                    seller: seller,
                    buyer: buyer,
                    tokenId: event.args
                        ? ethers_1.ethers.BigNumber.from((_a = event.args) === null || _a === void 0 ? void 0 : _a.tokenId).toNumber()
                        : 0,
                    marketplace: marketplace,
                    price: price,
                    txHash: txHash,
                    contractAddress: this.contractAddress,
                    collectionName: this.collectionName,
                };
                console.log(`Seller: ${data.seller} \nBuyer: ${data.buyer} \nToken ID: ${data.tokenId} \nPrice: ${data.price} \nTx: https://etherscan.io/tx/${data.txHash}`);
                console.log(`---------------------------------------------------------------------------`);
                this.webhooksQueue.push(data);
                if (!this.queueIsOn) {
                    this.checkWebhookQueue();
                }
            }
        }));
    }
    checkWebhookQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.webhooksQueue.length) {
                this.queueIsOn = true;
                const outComingWebhook = this.webhooksQueue.shift();
                yield (0, utils_1.sendCustomWebhook)(outComingWebhook, this.WEBHOOK_URL, 1500);
                if (this.webhooksQueue.length) {
                    this.checkWebhookQueue();
                }
                else {
                    this.queueIsOn = false;
                }
            }
        });
    }
}
exports.default = Monitor;
Monitor.OPENSEA = "0x00000000006c3852cbef3e08e8df289169ede581".toLowerCase();
Monitor.LOOKSRARE = "0x59728544B08AB483533076417FbBB2fD0B17CE3a".toLowerCase();
Monitor.X2Y2 = "0x74312363e45DCaBA76c59ec49a7Aa8A65a67EeD3".toLowerCase();
Monitor.GEM = "0x83c8f28c26bf6aaca652df1dbbe0e1b56f8baba2".toLowerCase();
Monitor.SUDOSWAP = "0x2b2e8cda09bba9660dca5cb6233787738ad68329".toLowerCase();
