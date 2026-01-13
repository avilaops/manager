import { mongoDBService } from './mongodb.service.js';
import { CalendarEvent } from '../types/index.js';

class CalendarService {
    private readonly dbName = 'gerenciador_pessoal';

    async saveEvent(eventData: CalendarEvent): Promise<{ success: boolean; error?: string }> {
        try {
            const db = mongoDBService.getDatabase(this.dbName);
            const eventsCollection = db.collection<CalendarEvent>('calendar_events');

            if (eventData.id) {
                // Update existing event
                const { id, ...updateData } = eventData;
                await eventsCollection.updateOne(
                    { id: id },
                    { $set: { ...updateData, updatedAt: new Date().toISOString() } }
                );
            } else {
                // Create new event
                const newEvent = {
                    ...eventData,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                await eventsCollection.insertOne(newEvent as any);
            }

            return { success: true };
        } catch (error) {
            console.error('Erro ao salvar evento:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Erro desconhecido' 
            };
        }
    }

    async getEvents(startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
        try {
            const db = mongoDBService.getDatabase(this.dbName);
            const eventsCollection = db.collection<CalendarEvent>('calendar_events');

            let query: any = {};
            if (startDate && endDate) {
                query = {
                    startDate: {
                        $gte: startDate.toISOString(),
                        $lte: endDate.toISOString()
                    }
                };
            }

            const events = await eventsCollection
                .find(query)
                .sort({ startDate: 1 })
                .toArray();

            return events as CalendarEvent[];
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
            return [];
        }
    }

    async deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const db = mongoDBService.getDatabase(this.dbName);
            const eventsCollection = db.collection('calendar_events');

            await eventsCollection.deleteOne({ id: eventId });

            return { success: true };
        } catch (error) {
            console.error('Erro ao deletar evento:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Erro desconhecido' 
            };
        }
    }
}

export const calendarService = new CalendarService();
