import { mongoDBService } from './mongodb.service.js';
import { Lead, Contact } from '../types/index.js';

class CRMService {
    private readonly dbName = 'avila_crm';

    async createLead(leadData: Partial<Lead>): Promise<{ success: boolean; id?: string; error?: string }> {
        try {
            const db = mongoDBService.getDatabase(this.dbName);
            const leadsCollection = db.collection<Lead>('leads');

            // Validate required fields
            if (!leadData.name || !leadData.email || !leadData.phone) {
                return { success: false, error: 'Nome, email e telefone são obrigatórios' };
            }

            // Check for duplicates
            const existingLead = await leadsCollection.findOne({
                $or: [
                    { email: leadData.email },
                    { telefone: leadData.phone }
                ]
            });

            if (existingLead) {
                return { success: false, error: 'Cliente já cadastrado com este email ou telefone' };
            }

            // Create new lead
            const newLead: any = {
                nome: leadData.name,
                email: leadData.email,
                telefone: leadData.phone,
                empresa: leadData.company || '',
                fonte: leadData.source || 'site',
                status: leadData.status || 'novo',
                observacoes: leadData.notes || '',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await leadsCollection.insertOne(newLead);

            return { 
                success: true, 
                id: result.insertedId.toString() 
            };
        } catch (error) {
            console.error('Erro ao criar lead:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Erro desconhecido' 
            };
        }
    }

    async getLeads(limit: number = 100): Promise<Lead[]> {
        try {
            const db = mongoDBService.getDatabase(this.dbName);
            const leadsCollection = db.collection<Lead>('leads');
            
            const leads = await leadsCollection
                .find({})
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray();

            return leads as Lead[];
        } catch (error) {
            console.error('Erro ao buscar leads:', error);
            return [];
        }
    }

    async getContacts(limit: number = 100): Promise<Contact[]> {
        try {
            const db = mongoDBService.getDatabase(this.dbName);
            const contactsCollection = db.collection<Contact>('contacts');
            
            const contacts = await contactsCollection
                .find({})
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray();

            return contacts as Contact[];
        } catch (error) {
            console.error('Erro ao buscar contatos:', error);
            return [];
        }
    }

    async getContactsCount(): Promise<number> {
        try {
            const db = mongoDBService.getDatabase(this.dbName);
            const contactsCollection = db.collection('contacts');
            return await contactsCollection.countDocuments();
        } catch (error) {
            console.error('Erro ao contar contatos:', error);
            return 0;
        }
    }
}

export const crmService = new CRMService();
