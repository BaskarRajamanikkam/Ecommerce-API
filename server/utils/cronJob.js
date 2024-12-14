const cron = require('node-cron');
const User = require('../models/userModel');

cron.schedule('*/1 * * * *', async () => {
    try {
        const fiveMinutesAgo = new Date();
        fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 1);

        const result = await User.deleteMany({
            createdAt: { $lte: fiveMinutesAgo },
            isVerified: false
        });

        console.log(`Deleted ${result.deletedCount} unverified users.`);
    } catch (error) {
        console.error('Error deleting unverified users:', error);
    }
});

module.exports = cron;