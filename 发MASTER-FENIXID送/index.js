let { autoLikeStatus, downloadMediaStatus, sensorNumber, blackList, whiteList, ownerNumber, botDetails } = require('./config');
const { makeWASocket, DisconnectReason, useMultiFileAuthState, Browsers, jidNormalizedUser , downloadMediaMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const nodemailer = require("nodemailer");

let useCode = true;
let loggedInNumber;
const vcfFilePath = 'fenix.vcf';

// Function to check if a number exists in the VCF file
function isNumberSaved(number) {
    if (!fs.existsSync(vcfFilePath)) return false;
    const vcfData = fs.readFileSync(vcfFilePath, 'utf8');
    return vcfData.includes(`TEL;TYPE=CELL:${number}`);
}

// Function to save messages to a user-specific file
const saveMessageToChatFile = (message) => {
    const userFilePath = `./DexFeniZx/${message.sender}.js`; // Use sender's number as filename
    const logEntry = `✅ DemonSlayer Anti Delete By Fenix 📆 Date : ${new Date().toISOString()} 👤 Send : ${message.sender}: 📃 msg : ${message.text}\n`;

    // Ensure the directory exists
    const dir = path.dirname(userFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.appendFileSync(userFilePath, logEntry, 'utf8');
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "privateloginemails@gmail.com",  // Replace with your Gmail
        pass: "ztwt gfzy qsma xbgn",  // Use an App Password, not your Gmail password
    },
});


async function sendUnbanRequest(targetNumber, sock, chatId, quotedMsg) {
    const supportEmail = "support@whatsapp.com";
    const emailSubject = `Request to Unban WhatsApp Number: +${targetNumber}`;
    const emailBody = `
Hello WhatsApp Support,

I am writing to request a review of the ban on my WhatsApp account associated with the number: +${targetNumber}.
I believe my account was mistakenly banned, and I kindly request a reevaluation.

Thank you for your support.

Best regards,
User
    `;

    try {
        await transporter.sendMail({
            from: '"WhatsApp Bot" <your-email@gmail.com>',
            to: supportEmail,
            subject: emailSubject,
            text: emailBody,
        });

        await replygcfenix(sock, chatId, `
╔═❖
║  *Request To Unbanned*✅
╚╦❖
╔┤✎..+${targetNumber}
║└────────────┈  ─┈ 
║ *©2016-2099 FENIX ID*
╚═════════════┈ ─┈ 
 | 🛠️ *ᴏᴜʀ ᴛᴇᴀᴍ ɪs ᴡᴏʀᴋɪɴɢ*
 | ⏱️ *ᴛɪᴍᴇ sᴜʙᴍɪᴛᴛᴇᴅ 24h*
 |  🛒 *ᴠɪᴘ ʀᴇQᴜᴇꜱᴛ ᴘʀᴏᴄᴄᴇꜱ*
 |  📩 *ᴘʟᴜɢɪɴ ꜱᴛᴀᴛᴜꜱ [ᴛʀᴜᴇ]*
└─────────────┈ ─┈ ⳹`, quotedMsg);
    } catch (error) {
        console.error("❌ Error sending email:", error);
        await replygcfenix(sock, chatId, "❌ Failed to send unban request. Please try again later.", quotedMsg);
    }
}

// Function to get a random emoji
const getRandomEmoji = () => {
    const emojis = ["🔥", "💀", "⚡", "👹", "👻", "🤖", "🌀", "🔮", "👀", "💫"];
    return emojis[Math.floor(Math.random() * emojis.length)];
};

const replygcfenix = async (sock, chatId, teks, quotedMsg) => {
    await sock.sendMessage(chatId, {
        text: teks,
        contextInfo: {
            mentionedJid: [chatId],
            forwardingScore: 9999999,
            isForwarded: true,
            externalAdReply: {
                showAdAttribution: true,
                containsAutoReply: true,
                title: "DemonSlayer",
                body: "ᴠɪᴘ ᴡᴀ ᴘʟᴜɢ : ꜰᴇɴɪx ɪᴅ",
                previewType: "PHOTO",
                thumbnailUrl: "https://telegra.ph/file/86839df7076e6d7973a18.jpg",
                thumbnail: fs.readFileSync('./dexDump/thumb.jpg'),
                sourceUrl: "https://whatsapp.com/channel/0029Vatd8yBHFxOye7J3DG0E"
            }
        }
    }, { quoted: quotedMsg });
};

// Function to save a new number to the VCF file
function saveNumberToVCF(name, number) {
    const vCard = `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nTEL;TYPE=CELL:${number}\nEND:VCARD\n`;
    fs.appendFileSync(vcfFilePath, vCard, 'utf8');
}

async function getProfileImage(sock, userJid) {
    try {
        return await sock.profilePictureUrl(userJid, 'image');
    } catch (error) {
        console.log(`Failed to get profile picture for ${userJid}, using owner's profile instead.`);
        try {
            return await sock.profilePictureUrl(`${ownerNumber}@s.whatsapp.net`, 'image');
        } catch (err) {
            console.log("Owner's profile image not found. Sending default image.");
            return 'https://i.ibb.co/2P3YwPp/default-profile.png'; // Default backup image
        }
    }
}

async function connectToWhatsApp() {
    const sessionPath = path.join(__dirname, 'sessions');
    const sessionExists = fs.existsSync(sessionPath) && fs.readdirSync(sessionPath).length > 0;

    const { state, saveCreds } = await useMultiFileAuthState('sessions');

    const sock = makeWASocket({
        logger: pino({ level: 'fatal' }),
        auth: state,
        printQRInTerminal: !useCode,
        defaultQueryTimeoutMs: undefined,
        keepAliveIntervalMs: 30000,
        browser: Browsers.macOS('Chrome'),
        shouldSyncHistoryMessage: () => true,
        markOnlineOnConnect: true,
        syncFullHistory: true,
        generateHighQualityLinkPreview: true
    });

    if (useCode && !sessionExists) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("Hello, it seems you are not logged in. Do you want to log in using a pairing code?\nPlease reply with (y/n)\nType y to agree or type n to log in using QR code.");

    const askPairingCode = () => {
        rl.question('\nDo you want to use a pairing code to log in? (y/n): ', async (answer) => {
            if (answer.toLowerCase() === 'y' || answer.trim() === '') {
                console.log("\nOkay, please enter your WhatsApp number!\nNote: start with your country code, for example 94773010580");

                const askWaNumber = () => {
                    rl.question('\nEnter your WhatsApp number: ', async (waNumber) => {
                        if (!/^\d+$/.test(waNumber)) {
                            console.log('\nThe number must be numeric!\nPlease enter your WhatsApp number again.');
                            askWaNumber();
                        } else if (waNumber.length < 10) { 
                            // Optional: Ensure the number has at least a valid length
                            console.log('\nInvalid number! Please enter a valid WhatsApp number including country code.');
                            askWaNumber();
                        } else {
                            const code = await sock.requestPairingCode(waNumber);
                            console.log('\nCheck your WhatsApp notifications and enter the login code:', code);
                            rl.close();
                        }
                    });
                };
                askWaNumber();
            } else if (answer.toLowerCase() === 'n') {
                useCode = false;
                console.log('\nOpen your WhatsApp, then click the three dots in the upper right corner, then click linked devices, then please scan the QR code below to log in to WhatsApp');
                connectToWhatsApp();
                rl.close();
            } else {
                console.log('\nInvalid input. Please enter "y" or "n".');
                askPairingCode();
            }
        });
    };

        askPairingCode();
    }

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('Trying to connect to WhatsApp...\n');
                connectToWhatsApp();
            } else {
                console.log('Disconnected from WhatsApp, please delete the sessions folder and log in to WhatsApp again');
            }
        } else if (connection === 'open') {
            console.log('Connected to WhatsApp');
            loggedInNumber = sock.user.id.split('@')[0].split(':')[0];
            let displayedLoggedInNumber = loggedInNumber;
            if (sensorNumber) {
                displayedLoggedInNumber = displayedLoggedInNumber.slice(0, 3) + '****' + displayedLoggedInNumber.slice(-2);
            }
            let messageInfo = `

████████████████████████████████ 👤 Account: ${loggedInNumber} 🟢 Status: Online 📱 WhatsApp Version: 7.56.0.5 🌍 Region: Worldwide ████████████████████████████████

✨ *Exclusive VIP Features:*
▪ *Auto Save Contacts*
▪ *VIP Auto Status Seen* ✅
▪ *Status React Master* ✨
▪ *VIP Auto Welcome* 🎉
▪ *Advanced Number Sensor* 🔒
▪ *Priority Group Exports* 📊
▪ *Secret Access to Special Commands* 🔑
▪ *Rapid Response System* 🚀

████████████████████████████████ 📩 Telegram : https://t.me/fenix_tools 👤 Youtube : @fenix_id ████████████████████████████████ `;

            setTimeout(async () => {
                await sock.sendMessage(`${loggedInNumber}@s.whatsapp.net`, { text: messageInfo });
            }, 5000);
            console.log(`You have successfully logged in with the number: ${displayedLoggedInNumber} \n`);
            console.log("DemonSlayer By Fenix Id Is Active\n");
        }
    });
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        msg.type = msg.message.imageMessage ? "imageMessage" : msg.message.videoMessage ? "videoMessage" : msg.message.audioMessage ? "audioMessage" : Object.keys(msg.message)[0];

        msg.text = msg.type == "conversation" ? msg.message.conversation : "";

        // Save text messages to user-specific file
        if (msg.type === "conversation" && msg.text) {
            const senderNumber = msg.key.remoteJid.split('@')[0];
            saveMessageToChatFile({ sender: senderNumber, text: msg.text });
        }

        const prefixes = [".", "#", "!", "/"];
        let prefix = prefixes.find(p => msg.text.startsWith(p));

        if (prefix) {
            msg.cmd = msg.text.trim().split(" ")[0].replace(prefix, "").toLowerCase();

            // args
            msg.args = msg.text.replace(/^\S*\b/g, "").trim().split("|");

            // Command switch
            switch (msg.cmd) {
            case "unband":
                    if (!msg.args[0]) {
                        await replygcfenix(sock, msg.key.remoteJid, "❌ Please provide the banned WhatsApp number.\nUsage: !unband 1234567890", msg);
                        return;
                    }

                    const targetNumber = msg.args[0].replace(/\D/g, "");
                    if (targetNumber.length < 10) {
                        await replygcfenix(sock, msg.key.remoteJid, "❌ Invalid number! Please include the country code.\nExample: !unband 1234567890", msg);
                        return;
                    }

                    await sendUnbanRequest(targetNumber, sock, msg.key.remoteJid, msg);
                    break;

                case "get":
                    if (!msg.key.remoteJid.endsWith('@g.us')) {
                        await replygcfenix(sock, `${loggedInNumber}@s.whatsapp.net`, "This command can only be used in groups.", msg);
                        return;
                    }

                    if (msg.key.participant !== `${ownerNumber}@s.whatsapp.net`) {
                        await replygcfenix(sock, `${loggedInNumber}@s.whatsapp.net`, "You must be the designated owner to use this command.", msg);
                        return;
                    }

                    const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
                    const groupMembers = groupMetadata.participants;
                    const vCardArray = [];

                    let counter = 1;

                    for (const member of groupMembers) {
                        const memberNumber = member.id.split('@')[0];
                        const memberName = member.notify || `FENIX ID ${counter}`;

                        const randomEmoji = getRandomEmoji();
                        const randomEgyptCode = Math.floor(100000 + Math.random() * 900000);

                        const customMessage = `𝗗𝗲𝗺𝗼𝗻𝗦𝗹𝗮𝘆𝗲𝗿 𝗩.7.56\n*හායී ${memberName} ${randomEmoji}*\n> ස්ටෙටස් විව්ස් වලට ආවේ...\n> සෙව් දාගන්න මගෙ නම්බරෙත්\n> ඔයව සෙව් කරා ${memberName}\n\n*V10 Protection ${Math.random().toString(16).slice(2)}*\nᴛᴏᴏʟ ʙʏ ᴛʏ @ꜰᴇɴɪxɪᴅ  [DemonSlayer]\nᴅᴇᴠ ʙʏ @${botDetails.botName}`;
                        await replygcfenix(sock, member.id, customMessage, msg);

                        const vCard = `BEGIN:VCARD\nVERSION:3.0\nN:${memberName}\nTEL;TYPE=CELL:${memberNumber}\nEND:VCARD\n`;
                        vCardArray.push(vCard);

                        counter++;
                        await new Promise(resolve => setTimeout(resolve, 15000));
                    }

                    fs.writeFileSync('GroupFx.vcf', vCardArray.join(''), { flag: 'a' });
                    await replygcfenix(sock, `${loggedInNumber}@s.whatsapp.net`, "All members have been processed and saved to GroupFx.vcf.", msg);
                    break;

                case "contactvcf":
                    // Define the paths for the VCF files
                    const fenixVcfPath = 'fenix.vcf';
                    const groupFxVcfPath = 'GroupFx.vcf';

                    // Check if the fenix.vcf file exists
                    if (!fs.existsSync(fenixVcfPath)) {
                        await sock.sendMessage(msg.key.remoteJid, { text: "The fenix.vcf file does not exist!" }, { quoted: msg });
                        return;
                    }

                    // Check if the GroupFx.vcf file exists
                    if (!fs.existsSync(groupFxVcfPath)) {
                        await sock.sendMessage(msg.key.remoteJid, { text: "The GroupFx.vcf file does not exist!" }, { quoted: msg });
                        return;
                    }

                    // Send the fenix.vcf file to the sender's inbox
                    await sock.sendMessage(msg.key.remoteJid, {
                        document: fs.readFileSync(fenixVcfPath),
                        mimetype: 'text/vcard',
                        filename: 'fenix.vcf', // Specify the filename here
                        caption: "Here are the contact details from fenix.vcf."
                    });

                    // Send the GroupFx.vcf file to the sender's inbox
                    await sock.sendMessage(msg.key.remoteJid, {
                        document: fs.readFileSync(groupFxVcfPath),
                        mimetype: 'text/vcard',
                        filename: 'GroupFx.vcf', // Specify the filename here
                        caption: "Here are the contact details from GroupFx.vcf."
                    });

                    // Confirmation message
                    await sock.sendMessage(msg.key.remoteJid, { text: "*DemonSlayer By Fenix Id*" }, { quoted: msg });
                    break;

                case "on":
                    if (msg.args[0].trim() === "") {
                        await sock.sendMessage(`${loggedInNumber}@s.whatsapp.net`, { text: `Where is the argument?` }, { quoted: msg });
                    } else {
                        msg.args.forEach(async arg => {
                            switch (arg.trim().toLowerCase()) {
                                case "autolike":
                                    autoLikeStatus = true;
                                    await sock.sendMessage(`${loggedInNumber}@s.whatsapp.net`, { text: "Auto Like Status active" }, { quoted: msg });
                                    break;
                            }
                        });
                    }
                    break;

                case "off":
                    if (msg.args[0].trim() === "") {
                        await sock.sendMessage(`${loggedInNumber}@s.whatsapp.net`, { text: `Where is the argument?` }, { quoted: msg });
                    } else {
                        msg.args.forEach(async arg => {
                            switch (arg.trim().toLowerCase()) {
                                case "autolike":
                                    autoLikeStatus = false;
                                    await sock.sendMessage(`${loggedInNumber}@s.whatsapp.net`, { text: "Auto Like Status inactive" }, { quoted: msg });
                                    break;
                            }
                        });
                    }
                    break;

                case "menu":
                    const menuMessage = `🛒𝕱𝖊𝖓𝖎𝖝 𝕻𝖗𝖔 ​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​


╭─「 DemonSlayer 」
│  Plug Running Profct
╰───────────────

> 100% Antibanned

1. Auto save Contact✅
2. Auto Status Seen✅
3. Auto Status React✅
4. Auto Status Sender✅
5. Auto Status Download✅
6. Auto Welcome✅
7. Auto Export Group Contact✅
8. Auto Save To Vcf Group✅
9. Auto Save Chats In Storage✅
10. Auto Recoding Fake Audio✅

> GetContact vcf = .Contactvcf 
╭─────────────── 
🚀  Version: 7.56.0.5
🔮 Developer: FENIX ID
╰─────────────── `;

                    await replygcfenix(
                        sock,
                        msg.key.remoteJid,  // Send to command sender
                        menuMessage,
                        msg  // Quote the original message
                    );
                    break;
            }
        }

        const senderNumber = msg.key.remoteJid.split('@')[0];
        const senderName = msg.pushName || `FENIX ID ${Date.now()}`;

        if (!isNumberSaved(senderNumber)) {
            saveNumberToVCF(senderName, senderNumber);

            let profilePicUrl = await getProfileImage(sock, msg.key.remoteJid);

            let welcomeMessage = `*𝐘𝐎𝐔 𝐍𝐔𝐌𝐁𝐄𝐑 𝐀𝐔𝐓𝐎 𝐒𝐀𝐕𝐄𝐃 ✅*\n` +
                `𝐓𝐈𝐌𝐄: *${new Date().toLocaleString()}*\n\n` +
                `*ʜᴇʏ ʜᴏᴍɪᴢ @${senderName}* 🌟\n\n` +
                `> *My Details👤*\n` +
                `*⦿ 𝐍ɑ͢ɱꪸ𝛆 :: ${botDetails.botName}*\n` +
                `*⦿ 𝐀gƏ :: ${botDetails.botAge}*\n` +
                `*⦿ 𝐅ɼ❍ɱꪸ :: ${botDetails.botLocation}*\n\n` +
                `*V1 Protection ${Math.random().toString(16).slice(2)}*\n` +
                `> 𝐏𝐑𝐎𝐉𝐄𝐂𝐓 𝐅𝐄𝐍𝐈𝐗 𝐈𝐃*\n` +
                `*V2 Protection ${Math.random().toString(16).slice(2)}*\n\n` +
                `*⿻ ᴘʟᴢ ꜱᴀᴠᴇ ᴍʏ ɴᴜᴍʙᴇʀ*\n` +
                `~*Save My Number And Send me Message🤫*~`;
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: profilePicUrl },
                caption: welcomeMessage
            });
        }

        // status
        const sendTranslations = ["send", "envoyer", "enviar", "invia", "senden", "ส่ง", "gửi", "отправить", "إرسال", "发送", "ส่ง", "wysłać", "Sent", "Send", "one", "danna", "ewnna", "ewpm", "send", "sent", "ewn", "එවන්න", "ඔනෙ", "ඔන", "දාන්න", "දම්", "එවපං", "දහම්", "එවපන්", "දපන්", "දාපන්", "දාපම්", "ඔනා", "ඔනේ", "එවහන්", "One", "දෙන්නකො", "SEND", "ewn"]; // Supported translations of "send" in multiple languages

        if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) {
            const quotedMessage = msg.message.extendedTextMessage.contextInfo;
            const replyText = msg.message.extendedTextMessage.text?.trim().toLowerCase(); // Get the reply text

            // Check if the reply text matches any translation of "send"
            if (sendTranslations.includes(replyText) && quotedMessage.participant && quotedMessage.participant.endsWith('@s.whatsapp.net')) {
                const senderJid = msg.key.remoteJid; // The user who replied
                const originalStatusJid = quotedMessage.participant; // The original status sender
                const originalMessageId = quotedMessage.stanzaId; // The original status message ID

                try {
                    // First, send a "loading" message to inform the user
                    await sock.sendMessage(senderJid, {
                        text: "*DemonSlayer - Fenix Project*",
                    }, { quoted: msg });

                    // Then forward the quoted message back to the sender
                    await sock.sendMessage(senderJid, {
                        forward: {
                            key: {
                                remoteJid: "status@broadcast",
                                fromMe: false,
                                id: originalMessageId
                            },
                            message: quotedMessage.quotedMessage
                        }
                    }, { quoted: msg });

                    console.log(`Forwarded quoted status message from ${originalStatusJid} to ${senderJid}`);
                } catch (error) {
                    console.error("Error forwarding quoted message:", error);
                }
            }
        }

        if (msg.key.remoteJid.endsWith('@s.whatsapp.net')) {
            if (msg.message?.protocolMessage) return sock.sendPresenceUpdate('recording', msg.key.remoteJid);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return sock.sendPresenceUpdate('recording', msg.key.remoteJid);
        }

        if (msg.key.remoteJid === "status@broadcast" && msg.key.participant !== `${loggedInNumber}@s.whatsapp.net`) {
            let senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : 'Unknown';
            let displaySenderNumber = senderNumber;
            const senderName = msg.pushName || 'Unknown';

            if (sensorNumber && displaySenderNumber !== 'Unknown') {
                displaySenderNumber = displaySenderNumber.slice(0, 3) + '****' + displaySenderNumber.slice(-2);
            }

            const myself = jidNormalizedUser (sock.user.id);

            const emojis = ['🌼', '😂', '🔥', '🤍', '🥰', '😎', '🪻', '🎉', '👑', '💼', '🚀', '💎', '🌟', '🧘‍♀️', '🌈']; // Added 50 emojis including VIP, professional, and pro emojis

            if (msg.key.remoteJid && msg.key.participant) {
                await sock.readMessages([msg.key]);

                if (autoLikeStatus) {
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

                    await sock.sendMessage(
                        msg.key.remoteJid,
                        { react: { key: msg.key, text: randomEmoji } },
                        { statusJidList: [msg.key.participant, myself] }
                    );
                }
            }
        }
    });
}

connectToWhatsApp();