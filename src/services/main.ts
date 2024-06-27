import { Parameters, Property, generateFunctionDefinition } from "./repository-services"

async function main() {

    console.log("main")

    const name= "registrarPhone"
    const description= "Cuando el usuario solicita registrar un teléfono, se debe utilizar esta función para registrar el teléfono."
    const property1: Property= {
      name: "conversationId",
      type: "string",
      description: "ConversationId proporcionado en el prompt",
    }
    const property2: Property= {
      name: "phone",
      type: "string",
      description: "Se debe preguntar al usuario el phone",
    }
    const property3: Property= {
        name: "nombre",
        type: "string",
        description: "Opcionialmente, se puede preguntar al usuario el nombre",
    }
    const parameters: Parameters= {
        type: "object",
        properties: [property1, property2, property3],
        required: ["conversationId", "phone"],
    }
    const functionDefinition= generateFunctionDefinition(name, description, parameters)
    console.log("functionDefinition: ", functionDefinition)

}
  
main()
  
