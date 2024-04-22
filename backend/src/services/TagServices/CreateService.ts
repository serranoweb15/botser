import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";

interface Request {
  name: string;
  color: string;
  companyId: number;
  kanban: string; // Adicionado o campo kanban ao Request
}

const CreateService = async ({
  name,
  color = "#A4CCCC",
  companyId,
  kanban, // Adicionado o campo kanban aos parâmetros
}: Request): Promise<Tag> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(3),
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const [tag] = await Tag.findOrCreate({
    where: { name, color, kanban, companyId },
    defaults: { name, color, kanban, companyId },
  });

  await tag.reload();

  return tag;
};

export default CreateService;
