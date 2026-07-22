const { WebcastPushConnection } = require('tiktok-live-connector');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Serve the frontend game files from a folder called "public"
app.use(express.static('public'));

// IMPORTANT: Replace this with your actual TikTok Username!
const tiktokUsername = "YOUR_TIKTOK_USERNAME"; 
const tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

// Connect to TikTok
tiktokLiveConnection.connect().then(state => {
    console.info(`Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error('Failed to connect', err);
});

// Listen for Gifts
tiktokLiveConnection.on('gift', data => {
    // If a viewer sends a combo (e.g., rapidly tapping the Rose gift), 
    // we wait until repeatEnd is true so we don't double-count.
    if (data.giftType === 1 && !data.repeatEnd) {
        return; 
    }
    
    console.log(`${data.uniqueId} sent ${data.repeatCount}x ${data.giftName}!`);
    
    // Send the data to the frontend game
    io.emit('tiktok-gift', {
        user: data.uniqueId,
        giftName: data.giftName,
        amount: data.repeatCount
    });
});

// Start the server using Render's assigned environment port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Game server running on port ${PORT}`);
});
