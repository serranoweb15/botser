import { Request, Response } from 'express';
import Evento from '../models/Evento'; // Importe o modelo de dados Evento ou o modelo que você está usando
import * as eventService from '../services/eventService/eventService'; // Importe o serviço de eventos

// Função para criar um novo evento
export const criarEvento = async (req: Request, res: Response) => {
  try {
    // Extrair os dados do evento do corpo da requisição
    const { title, description, start, end } = req.body;

    // Valide os dados, se necessário
    if (!title || !start || !end) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
    }

    // Obtenha o companyId do objeto req.user (se o campo existir)
    const companyId = req.user.companyId;

    // Crie o novo evento no banco de dados
    const novoEvento = new Evento({
      title,
      description,
      start: new Date(start),
      end: new Date(end),
      companyId, // Associe o evento à empresa
    });

    await novoEvento.save();

    // Retorne o novo evento como resposta
    return res.status(201).json(novoEvento);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Função para listar todos os eventos
export const listarEventos = async (req: Request, res: Response) => {
  try {
    // Consulte todos os eventos no banco de dados usando o serviço
    const eventos = await eventService.listarEventos();

    // Responda com os eventos encontrados
    return res.status(200).json(eventos);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const marcarEventoConcluido = async (req: Request, res: Response) => {
  try {
    // Obtenha o ID do evento a ser marcado como concluído dos parâmetros da URL
    const { id } = req.params;

    // Marque o evento como concluído usando o serviço
    const evento = await eventService.marcarEventoConcluido(id);

    // Responda com o evento atualizado
    return res.status(200).json(evento);
  } catch (error) {
    console.error('Erro ao marcar evento como concluído:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const excluirEvento = async (req: Request, res: Response) => {
  try {
    // Obtenha o ID do evento a ser excluído dos parâmetros da URL
    const { id } = req.params;

    // Encontre o evento pelo ID e exclua
    const evento = await Evento.findByPk(id);

    if (!evento) {
      throw new Error('Evento não encontrado');
    }

    await evento.destroy();

    // Responda com uma mensagem de sucesso ou outro objeto apropriado
    return res.status(200).json({ message: 'Evento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};