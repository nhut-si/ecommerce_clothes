const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

// Load complete API documentation from YAML file
const swaggerDocument = YAML.load(path.join(__dirname, "./docs/swagger.yaml"));

module.exports = { swaggerUi, swaggerSpec: swaggerDocument };
