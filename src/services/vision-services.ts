import OpenAI from "openai";

/**
 * Tipo para la respuesta de la función readImage
 */
export type ReadImageResponse = {
    description: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
};

/**
 * Analiza una imagen y genera una descripción utilizando la API de Vision de OpenAI
 * @param imageUrl URL de la imagen a analizar
 * @param prompt Instrucciones opcionales para el análisis (por defecto: "Describe esta imagen detalladamente")
 * @returns Objeto con la descripción generada de la imagen y la información de usage
 */
export async function readImage(imageUrl: string, prompt: string): Promise<ReadImageResponse> {
    console.log("Analizando imagen");
    console.log("imageUrl: ", imageUrl);
    
    // Inicializar el cliente de OpenAI
    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY_FOR_EMBEDDINGS,
    });
    
    try {
        // Llamar a la API de chat completions con la imagen
        const response = await client.chat.completions.create({
            model: "gpt-4.1",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { 
                            type: "image_url", 
                            image_url: {
                                url: imageUrl,
                                detail: "high" // Solicitar alta resolución para mejor análisis
                            } 
                        }
                    ],
                },
            ],
            max_tokens: 1000,
        });
        
        // Extraer la descripción generada
        const description = response.choices[0]?.message?.content || "No se pudo generar una descripción";
        
        // Extraer la información de usage
        const usage = {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0
        };
        
        return {
            description,
            usage
        };
    } catch (error) {
        console.error("Error al analizar la imagen:", error);
        throw new Error(`Error al analizar la imagen: ${error}`);
    }
} 