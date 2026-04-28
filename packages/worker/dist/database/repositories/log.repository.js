"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLogRepository = makeLogRepository;
const COLLECTION = "logs";
function makeLogRepository(db) {
    return {
        async insertOne(entry) {
            await db.collection(COLLECTION).insertOne({
                ...entry,
                _id: entry.id,
            });
        },
        async insertMany(entries) {
            const docs = entries.map((entry) => ({
                ...entry,
                _id: entry.id,
            }));
            await db.collection(COLLECTION).insertMany(docs);
        },
        async createIndexes() {
            const col = db.collection(COLLECTION);
            await col.createIndex({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });
            await col.createIndex({ "service.name": 1, severity: 1, timestamp: -1 });
            await col.createIndex({ traceId: 1 }, { sparse: true });
        },
    };
}
