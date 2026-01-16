import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority';

export interface Campanha {
  id: string;
  nome: string;
  plataforma: string;
  status: 'ativa' | 'pausada' | 'finalizada';
  orcamento: number;
  orcamentoGasto: number;
  dataInicio: string;
  dataFim: string;
  kpis: {
    impressoes: number;
    cliques: number;
    conversoes: number;
    cpc: number;
    ctr: number;
    cpa: number;
    roas: number;
  };
  metas: {
    cpa: number;
    roas: number;
    conversoes: number;
  };
  alertas: Alerta[];
  historico: HistoricoKPIs[];
}

export interface Alerta {
  id: string;
  tipo: 'cpa_alto' | 'roas_baixo' | 'orcamento_alto' | 'conversoes_baixas';
  mensagem: string;
  severidade: 'baixa' | 'media' | 'alta';
  data: string;
  resolvido: boolean;
}

export interface HistoricoKPIs {
  data: string;
  kpis: Campanha['kpis'];
}

export class CampanhasService {
  private client: MongoClient;

  constructor() {
    this.client = new MongoClient(uri);
  }

  async conectar() {
    try {
      await this.client.connect();
      console.log('✅ Conectado ao MongoDB para campanhas');
    } catch (error) {
      console.error('❌ Erro ao conectar:', error);
    }
  }

  async criarCampanha(campanha: Omit<Campanha, 'id' | 'alertas' | 'historico'>) {
    const novaCampanha: Campanha = {
      ...campanha,
      id: `camp-${Date.now()}`,
      alertas: [],
      historico: []
    };

    const db = this.client.db('avila_crm');
    const collection = db.collection('campanhas');

    await collection.insertOne(novaCampanha);
    return novaCampanha;
  }

  async atualizarKPIs(campanhaId: string, novosKPIs: Partial<Campanha['kpis']>) {
    const db = this.client.db('avila_crm');
    const collection = db.collection('campanhas');

    const campanha = await collection.findOne({ id: campanhaId });
    if (!campanha) throw new Error('Campanha não encontrada');

    // Atualizar KPIs
    const kpisAtualizados = { ...campanha.kpis, ...novosKPIs };

    // Calcular métricas derivadas
    if (novosKPIs.cliques && novosKPIs.impressoes) {
      kpisAtualizados.ctr = (novosKPIs.cliques / novosKPIs.impressoes) * 100;
    }
    if (novosKPIs.conversoes && novosKPIs.cliques) {
      kpisAtualizados.cpa = campanha.orcamentoGasto / novosKPIs.conversoes;
    }
    if (novosKPIs.conversoes && campanha.orcamentoGasto) {
      kpisAtualizados.roas = (novosKPIs.conversoes * 50) / campanha.orcamentoGasto; // Assumindo ticket médio de R$50
    }

    // Verificar alertas
    const alertas = this.verificarAlertas(campanha as unknown as Campanha, kpisAtualizados);

    // Adicionar ao histórico
    const historicoEntry: HistoricoKPIs = {
      data: new Date().toISOString(),
      kpis: kpisAtualizados
    };

    await collection.updateOne(
      { id: campanhaId },
      {
        $set: { kpis: kpisAtualizados },
        $push: {
          alertas: { $each: alertas } as any,
          historico: historicoEntry as any
        }
      } as any
    );

    return { kpis: kpisAtualizados, alertas };
  }

  private verificarAlertas(campanha: Campanha, kpis: Campanha['kpis']): Alerta[] {
    const alertas: Alerta[] = [];

    // Verificar CPA alto
    if (kpis.cpa > campanha.metas.cpa * 1.2) {
      alertas.push({
        id: `alert-${Date.now()}-cpa`,
        tipo: 'cpa_alto',
        mensagem: `CPA atual (R$ ${kpis.cpa.toFixed(2)}) está ${((kpis.cpa / campanha.metas.cpa - 1) * 100).toFixed(1)}% acima da meta (R$ ${campanha.metas.cpa.toFixed(2)})`,
        severidade: kpis.cpa > campanha.metas.cpa * 1.5 ? 'alta' : 'media',
        data: new Date().toISOString(),
        resolvido: false
      });
    }

    // Verificar ROAS baixo
    if (kpis.roas < campanha.metas.roas * 0.8) {
      alertas.push({
        id: `alert-${Date.now()}-roas`,
        tipo: 'roas_baixo',
        mensagem: `ROAS atual (${kpis.roas.toFixed(2)}) está ${((1 - kpis.roas / campanha.metas.roas) * 100).toFixed(1)}% abaixo da meta (${campanha.metas.roas.toFixed(2)})`,
        severidade: kpis.roas < campanha.metas.roas * 0.6 ? 'alta' : 'media',
        data: new Date().toISOString(),
        resolvido: false
      });
    }

    // Verificar conversões baixas
    if (kpis.conversoes < campanha.metas.conversoes * 0.7) {
      alertas.push({
        id: `alert-${Date.now()}-conv`,
        tipo: 'conversoes_baixas',
        mensagem: `Conversões atuais (${kpis.conversoes}) estão ${((1 - kpis.conversoes / campanha.metas.conversoes) * 100).toFixed(1)}% abaixo da meta (${campanha.metas.conversoes})`,
        severidade: 'media',
        data: new Date().toISOString(),
        resolvido: false
      });
    }

    // Verificar orçamento gasto
    const progressoCampanha = (new Date().getTime() - new Date(campanha.dataInicio).getTime()) / (new Date(campanha.dataFim).getTime() - new Date(campanha.dataInicio).getTime());
    if (campanha.orcamentoGasto > campanha.orcamento * progressoCampanha * 1.2) {
      alertas.push({
        id: `alert-${Date.now()}-budget`,
        tipo: 'orcamento_alto',
        mensagem: `Orçamento gasto (R$ ${campanha.orcamentoGasto.toFixed(2)}) está ${((campanha.orcamentoGasto / (campanha.orcamento * progressoCampanha) - 1) * 100).toFixed(1)}% acima do planejado`,
        severidade: 'alta',
        data: new Date().toISOString(),
        resolvido: false
      });
    }

    return alertas;
  }

  async listarCampanhas() {
    const db = this.client.db('avila_crm');
    const collection = db.collection('campanhas');
    return await collection.find({}).toArray();
  }

  async buscarCampanha(id: string) {
    const db = this.client.db('avila_crm');
    const collection = db.collection('campanhas');
    return await collection.findOne({ id });
  }

  async alertasPendentes() {
    const db = this.client.db('avila_crm');
    const collection = db.collection('campanhas');

    const campanhas = await collection.find({}).toArray();
    const alertasPendentes: any[] = [];

    campanhas.forEach(campanha => {
      campanha.alertas.forEach((alerta: Alerta) => {
        if (!alerta.resolvido) {
          alertasPendentes.push({
            campanha: campanha.nome,
            ...alerta
          });
        }
      });
    });

    return alertasPendentes;
  }

  async fechar() {
    await this.client.close();
  }
}

// Função para inicializar o serviço
export async function inicializarCampanhasService() {
  const service = new CampanhasService();
  await service.conectar();
  return service;
}