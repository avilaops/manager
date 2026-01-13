import { mongoDBService } from './mongodb.service.js';
import { GmailStats } from '../types/index.js';

class GmailService {
    private readonly dbName = 'avila_gmail';

    async getStats(): Promise<GmailStats> {
        try {
            const db = mongoDBService.getDatabase(this.dbName);
            const emailsCollection = db.collection('emails');

            const stats = await emailsCollection.aggregate([
                {
                    $group: {
                        _id: '$account',
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            const totalEmails = stats.reduce((sum: number, item: any) => sum + item.count, 0);
            const accountsCount = stats.length;

            return {
                totalEmails,
                accountsCount,
                byAccount: stats.map((item: any) => ({
                    account: item._id,
                    count: item.count
                }))
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas do Gmail:', error);
            return {
                totalEmails: 0,
                accountsCount: 0,
                byAccount: []
            };
        }
    }

    async getEmailsByAccount(account: string, limit: number = 50): Promise<any[]> {
        try {
            const db = mongoDBService.getDatabase(this.dbName);
            const emailsCollection = db.collection('emails');

            const emails = await emailsCollection
                .find({ account })
                .sort({ date: -1 })
                .limit(limit)
                .toArray();

            return emails;
        } catch (error) {
            console.error('Erro ao buscar emails por conta:', error);
            return [];
        }
    }
}

export const gmailService = new GmailService();
