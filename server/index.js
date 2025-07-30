require('dotenv').config();
const { httpServer } = require('./server');

const PORT = process.env.PORT;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
});