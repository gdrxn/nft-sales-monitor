import { ethers, Event, BigNumber } from "ethers";
import { sendCustomWebhook } from "../libraries/utils";
import { MonitorParams, TransferredTokenInfo } from "../types/types";

export default class Monitor {
	protected MAINNET_API: string;
	protected ABI: Object[];
	protected contractAddress: string;
	protected WEBHOOK_URL: string;
	protected provider: ethers.providers.JsonRpcProvider;
	protected contract: ethers.Contract;
	protected collectionName: string;
	protected webhooksQueue: object[] = [];
	protected queueIsOn: boolean = false;

	static OPENSEA = "0x00000000006c3852cbef3e08e8df289169ede581".toLowerCase();
	static LOOKSRARE = "0x59728544B08AB483533076417FbBB2fD0B17CE3a".toLowerCase();
	static X2Y2 = "0x74312363e45DCaBA76c59ec49a7Aa8A65a67EeD3".toLowerCase();
	static GEM = "0x83c8f28c26bf6aaca652df1dbbe0e1b56f8baba2".toLowerCase();
	static SUDOSWAP = "0x2b2e8cda09bba9660dca5cb6233787738ad68329".toLowerCase();

	constructor({
		MAINNET_API,
		ABI,
		contractAddress,
		WEBHOOK_URL,
		collectionName,
	}: MonitorParams) {
		//Object.assign(this, { MAINNET_API, ABI, contractAddress });
		this.MAINNET_API = MAINNET_API;
		this.ABI = ABI;
		this.contractAddress = contractAddress;
		this.WEBHOOK_URL = WEBHOOK_URL;
		this.collectionName = collectionName;

		this.provider = new ethers.providers.JsonRpcProvider(MAINNET_API);
		this.contract = new ethers.Contract(
			this.contractAddress,
			this.ABI,
			this.provider
		);
	}

	start() {
		this.contract.on(
			"Transfer",
			async (seller: string, buyer: string, value: BigNumber, event: Event) => {
				const txReceipt = await event.getTransactionReceipt();
				const tx = await event.getTransaction();
				const price = ethers.utils.formatUnits(tx.value);
				const txContract = txReceipt.to.toLowerCase();
				const txHash = txReceipt.transactionHash;

				const marketplace =
					txContract === Monitor.OPENSEA
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

					const data: TransferredTokenInfo = {
						seller: seller,
						buyer: buyer,
						tokenId: event.args
							? ethers.BigNumber.from(event.args?.tokenId).toNumber()
							: 0,
						marketplace: marketplace,
						price: price,
						txHash: txHash,
						contractAddress: this.contractAddress,
						collectionName: this.collectionName,
					};

					console.log(
						`Seller: ${data.seller} \nBuyer: ${data.buyer} \nToken ID: ${data.tokenId} \nPrice: ${data.price} \nTx: https://etherscan.io/tx/${data.txHash}`
					);
					console.log(
						`---------------------------------------------------------------------------`
					);

					this.webhooksQueue.push(data);
					if (!this.queueIsOn) {
						this.checkWebhookQueue();
					}
				}
			}
		);
	}

	async checkWebhookQueue() {
		if (this.webhooksQueue.length) {
			this.queueIsOn = true;
			const outComingWebhook: TransferredTokenInfo =
				this.webhooksQueue.shift() as TransferredTokenInfo;
			await sendCustomWebhook(outComingWebhook, this.WEBHOOK_URL, 1500);

			if (this.webhooksQueue.length) {
				this.checkWebhookQueue();
			} else {
				this.queueIsOn = false;
			}
		}
	}
}
