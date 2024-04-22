import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tags", "kanban", {
      type: DataTypes.INTEGER, // Mantenha o tipo como INTEGER
      allowNull: true
    });
    
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tags", "kanban");
  }
};
