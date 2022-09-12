"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCustomWebhook = exports.getDateTime = void 0;
const axios_1 = __importDefault(require("axios"));
function getDateTime() {
    const date = new Date();
    const day = date.toLocaleDateString().replace(/\s/g, "");
    const hourNumber = date.getHours();
    const hourString = (hourNumber < 10 ? "0" : "") + hourNumber;
    const minNumber = date.getMinutes();
    const minString = (minNumber < 10 ? "0" : "") + minNumber;
    const secNumber = date.getSeconds();
    const secString = (secNumber < 10 ? "0" : "") + secNumber;
    const milliNumber = date.getMilliseconds();
    let milliString = milliNumber.toString();
    if (milliNumber < 10) {
        milliString = "00" + milliNumber;
    }
    else if (milliNumber < 100) {
        milliString = "0" + milliNumber;
    }
    return (day +
        " " +
        hourString +
        ":" +
        minString +
        ":" +
        secString +
        ":" +
        milliString);
}
exports.getDateTime = getDateTime;
function sendCustomWebhook(item, WEBHOOK_URL, INTERVAL = 1000) {
    return new Promise((resolve, reject) => {
        axios_1.default
            .post(WEBHOOK_URL, {
            embeds: [
                {
                    author: {
                        name: `${item.collectionName}`,
                    },
                    title: `${item.tokenId}`,
                    url: `https://opensea.io/assets/ethereum/${item.contractAddress}/${item.tokenId}`,
                    fields: [
                        {
                            name: "Seller",
                            value: `[${item.seller}](https://opensea.io/${item.seller}?tab=activity)`,
                            inline: true,
                        },
                        {
                            name: "Buyer",
                            value: `[${item.buyer}](https://opensea.io/${item.buyer}?tab=activity)`,
                            inline: true,
                        },
                        {
                            name: `Transaction ID`,
                            value: `[Here](https://etherscan.io/tx/${item.txHash})`,
                            inline: true,
                        },
                        {
                            name: "Price",
                            value: item.price,
                            inline: true,
                        },
                        {
                            name: "Marketplace",
                            value: item.marketplace,
                            inline: true,
                        },
                    ],
                    color: "59110",
                    timestamp: new Date().toISOString(),
                },
            ],
        }, {
            timeout: 4000,
            validateStatus: () => true,
        })
            .then((res) => {
            if (res.status === 204) {
                console.log(`[${getDateTime()}][CUSTOM WEBHOOK][SUCCESS]`);
                setTimeout(() => {
                    resolve();
                }, INTERVAL);
            }
            else if (res.status === 400) {
                console.log(`[${getDateTime()}][CUSTOM WEBHOOK][BAD REQUEST]`);
                resolve();
            }
            else if (res.status === 401) {
                console.log(`[${getDateTime()}][CUSTOM WEBHOOK][INVALID URL]`);
                resolve();
            }
            else if (res.status === 429) {
                console.log(`[${getDateTime()}][CUSTOM WEBHOOK][RATE LIMIT]`);
                setTimeout(() => {
                    resolve();
                }, INTERVAL);
            }
            else {
                console.log(`[${getDateTime()}][CUSTOM WEBHOOK][FAILED][${res.status} - ${res.statusText}]`);
                console.log(res.data);
                setTimeout(() => {
                    resolve();
                }, INTERVAL);
            }
        });
    }).catch((error) => {
        console.log(`[${getDateTime()}][CUSTOM WEBHOOK][CRASH]`);
        if (error.message.includes("timeout") ||
            error.message.includes("ECONNREFUSED") ||
            error.message.includes("ETIMEDOUT") ||
            error.message.includes("ECONNRESET") ||
            error.message.includes("aborted")) {
        }
        else {
            console.log(error);
        }
        sendCustomWebhook(item, WEBHOOK_URL, INTERVAL);
    });
}
exports.sendCustomWebhook = sendCustomWebhook;
