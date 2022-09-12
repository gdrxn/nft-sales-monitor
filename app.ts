import dotenv from "dotenv";
dotenv.config();
import Monitor from "./classes/monitor";

const params = {
	MAINNET_API: process.env.MAINNET_API as string, // your own mainnet api
	ABI: [], // contract ABI of the collection
	contractAddress: "", // contract address of the collection
	WEBHOOK_URL: process.env.WEBHOOK_URI as string, // discord webhook
	collectionName: "", // name of the collection
};
const monitor1 = new Monitor(params);

monitor1.start();
