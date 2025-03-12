const mongoose=require('mongoose');
const dbURL = process.env.MONGO_URI;

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

const connectToDatabase = async () => {
    try {
        await mongoose.connect(dbURL, connectionParams);
        console.log('✅ Connected to the database');
    } catch (err) {
        console.error(`❌ Error connecting to the database: ${err}`);
    }
};

module.exports = connectToDatabase;