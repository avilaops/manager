import { mongoDBService } from './mongodb.service.js';
import { ReadingStatistics, DiaryEntry, Book } from '../types/index.js';

class EReaderService {
    private readonly dbName = 'ereader_data';

    async getStatistics(): Promise<ReadingStatistics> {
        try {
            const db = mongoDBService.getDatabase(this.dbName);
            
            // Get diary entries count
            const diaryCollection = db.collection<DiaryEntry>('diary');
            const diaryEntries = await diaryCollection.countDocuments();

            // Get total pages read
            const booksCollection = db.collection<Book>('books');
            const books = await booksCollection.find({}).toArray();
            const totalPagesRead = books.reduce((sum: number, book: any) => sum + (book.currentPage || 0), 0);

            // Calculate consecutive reading days (simplified)
            const recentEntries = await diaryCollection
                .find({})
                .sort({ date: -1 })
                .limit(30)
                .toArray();

            let consecutiveDays = 0;
            let lastDate: Date | null = null;

            for (const entry of recentEntries) {
                const entryDate = new Date(entry.date);
                if (!lastDate) {
                    consecutiveDays = 1;
                    lastDate = entryDate;
                } else {
                    const daysDiff = Math.floor((lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysDiff === 1) {
                        consecutiveDays++;
                        lastDate = entryDate;
                    } else {
                        break;
                    }
                }
            }

            return {
                consecutiveDays,
                totalPagesRead,
                diaryEntries,
                booksRead: books.filter((b: any) => b.currentPage >= b.totalPages).length,
                currentBooks: books.filter((b: any) => b.currentPage < b.totalPages).length
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas do e-reader:', error);
            return {
                consecutiveDays: 0,
                totalPagesRead: 0,
                diaryEntries: 0,
                booksRead: 0,
                currentBooks: 0
            };
        }
    }

    async getDiaryEntries(limit: number = 50): Promise<DiaryEntry[]> {
        try {
            const db = mongoDBService.getDatabase(this.dbName);
            const diaryCollection = db.collection<DiaryEntry>('diary');

            const entries = await diaryCollection
                .find({})
                .sort({ date: -1 })
                .limit(limit)
                .toArray();

            return entries as DiaryEntry[];
        } catch (error) {
            console.error('Erro ao buscar entradas do diário:', error);
            return [];
        }
    }

    async saveDiaryEntry(entry: DiaryEntry): Promise<{ success: boolean; error?: string }> {
        try {
            const db = mongoDBService.getDatabase(this.dbName);
            const diaryCollection = db.collection<DiaryEntry>('diary');

            await diaryCollection.insertOne(entry as any);

            return { success: true };
        } catch (error) {
            console.error('Erro ao salvar entrada do diário:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Erro desconhecido' 
            };
        }
    }
}

export const ereaderService = new EReaderService();
