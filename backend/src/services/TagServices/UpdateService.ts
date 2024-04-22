import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";
import ShowService from "./ShowService";

interface TagData {
  id?: number;
  name?: string;
  color?: string;
  kanban?: number; // Adicionado o campo "kanban" à interface
}

interface Request {
  tagData: TagData;
  id: string | number;
}

const UpdateUserService = async ({
  tagData,
  id
}: Request): Promise<Tag | undefined> => {
  const tag = await ShowService(id);

  const schema = Yup.object().shape({
    name: Yup.string().min(3),
    kanban: Yup.number() // Adicionado validação para o campo "kanban"
  });

  const { name, color, kanban } = tagData;

  try {
    await schema.validate({ name, kanban });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await tag.update({
    name,
    color,
    kanban
  });

  await tag.reload();
  return tag;
};

export default UpdateUserService;
