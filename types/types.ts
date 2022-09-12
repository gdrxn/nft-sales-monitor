export interface MonitorParams {
	MAINNET_API: string;
	ABI: Object[];
	contractAddress: string;
	WEBHOOK_URL: string;
	collectionName: string;
}

export interface TransferredTokenInfo {
	seller: string;
	buyer: string;
	tokenId: number;
	marketplace: string;
	price: string;
	txHash: string;
	contractAddress: string;
	collectionName: string;
}
