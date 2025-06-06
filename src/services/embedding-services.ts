import OpenAI from "openai";
import { getValue } from "./config-services";

/**
 * Tipo para la respuesta de la función generateEmbedding
 */
export type EmbeddingResponse = {
    vector: number[];
    dimensions: number;
    usageTokens: number;
};

/**
 * Genera un embedding vectorial de un texto utilizando la API de OpenAI
 * @param text Texto del cual generar el embedding
 * @returns Objeto con el vector generado, sus dimensiones y los tokens utilizados
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResponse> {
    console.log("Generando embedding para texto");
    console.log("text length: ", text.length);
    
    if (!text || text.trim().length === 0) {
        throw new Error("El texto no puede estar vacío");
    }
    
    // Obtener el modelo de embedding desde la configuración
    const embeddingModel = await getValue("EMBEDDING_MODEL") || "text-embedding-3-small";
    console.log("embedding model: ", embeddingModel);
    
    // Inicializar el cliente de OpenAI
    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY_FOR_EMBEDDINGS,
    });
    
    try {
        // Llamar a la API de embeddings
        const response = await client.embeddings.create({
            model: embeddingModel,
            input: text,
            encoding_format: "float"
        });
        
        // Extraer el vector generado
        const embedding = response.data[0]?.embedding;
        if (!embedding) {
            throw new Error("No se pudo generar el embedding");
        }
        
        // Extraer los tokens utilizados
        const usageTokens = response.usage?.total_tokens || 0;
        
        const dimensions = embedding.length;
        
        console.log("embedding generated successfully");
        console.log("usageTokens: ", usageTokens);
        
        return {
            vector: embedding,
            dimensions,
            usageTokens
        };
    } catch (error) {
        console.error("Error al generar el embedding:", error);
        throw new Error(`Error al generar el embedding: ${error}`);
    }
} 