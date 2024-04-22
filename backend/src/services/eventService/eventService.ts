import Evento from '../../models/Evento'; // Importe o modelo de dados Evento ou o modelo que você está usando

// Função para criar um novo evento
export const criarEvento = async (eventoData) => {
  try {
    // Crie o novo evento no banco de dados
    const novoEvento = await Evento.create(eventoData);
    return novoEvento;
  } catch (error) {
    throw new Error('Erro ao criar evento: ' + error.message);
  }
};

// Função para listar todos os eventos
export const listarEventos = async () => {
  try {
    // Consulte todos os eventos no banco de dados
    const eventos = await Evento.findAll();
    return eventos;
  } catch (error) {
    throw new Error('Erro ao listar eventos: ' + error.message);
  }
};

// Função para marcar um evento como concluído
export const marcarEventoConcluido = async (eventoId) => {
  try {
    // Encontre o evento pelo ID e marque como concluído
    const evento = await Evento.findByPk(eventoId);

    if (!evento) {
      throw new Error('Evento não encontrado');
    }

    evento.concluido = true;
    await evento.save();

    return evento;
  } catch (error) {
    throw new Error('Erro ao marcar evento como concluído: ' + error.message);
  }
};

// Função para excluir um evento
export const excluirEvento = async (eventoId) => {
  try {
    // Encontre o evento pelo ID e exclua
    const evento = await Evento.findByPk(eventoId);

    if (!evento) {
      throw new Error('Evento não encontrado');
    }

    await evento.destroy();

    return evento;
  } catch (error) {
    throw new Error('Erro ao excluir evento: ' + error.message);
  }
};