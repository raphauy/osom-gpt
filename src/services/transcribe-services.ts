import OpenAI from "openai";
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Función para verificar si ffprobe está disponible en el sistema
async function isFFprobeAvailable(): Promise<boolean> {
  try {
    await execAsync('which ffprobe');
    return true;
  } catch (error) {
    console.warn("ffprobe no está disponible en el sistema");
    return false;
  }
}

// Función para obtener la duración del audio usando el ffprobe del sistema
async function getAudioDurationWithSystemFFprobe(filePath: string): Promise<number> {
  try {
    const { stdout } = await execAsync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`);
    const duration = parseFloat(stdout.trim());
    if (isNaN(duration)) {
      throw new Error('La duración obtenida no es un número válido');
    }
    return duration;
  } catch (error) {
    console.error("Error al ejecutar ffprobe:", error);
    throw error;
  }
}

/**
 * Obtiene la duración del audio
 * @param audioArrayBuffer Buffer del archivo de audio
 * @returns Promesa con la duración en segundos o undefined si hay error
 */
async function getAudioDuration(audioArrayBuffer: ArrayBuffer): Promise<number | undefined> {
  // Verificar si ffprobe está disponible en el sistema
  const ffprobeAvailable = await isFFprobeAvailable();
  
  if (!ffprobeAvailable) {
    console.warn("No se puede obtener la duración exacta del audio. ffprobe no está disponible.");
    return undefined;
  }
  
  // Crear un archivo temporal para obtener la duración
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `audio-${Date.now()}.ogg`);
  
  try {
    // Escribir el buffer al archivo temporal
    await fs.writeFile(tempFilePath, new Uint8Array(audioArrayBuffer));
    
    // Obtener la duración exacta del audio usando ffprobe del sistema
    const durationInSeconds = await getAudioDurationWithSystemFFprobe(tempFilePath);
    console.log("Audio duration in seconds (exact): ", durationInSeconds);
    
    return durationInSeconds;
  } catch (error) {
    console.error("Error getting audio duration:", error);
    return undefined;
  } finally {
    // Eliminar el archivo temporal
    try {
      await fs.unlink(tempFilePath);
    } catch (error) {
      // Ignorar errores si el archivo no existe
    }
  }
}

/**
 * Transcribe un archivo de audio a texto
 * @param audioUrl URL del archivo de audio a transcribir
 * @returns Objeto con el texto transcrito y la duración del audio
 */
export async function transcribeAudio(audioUrl: string): Promise<{ text: string; durationInSeconds?: number }> {
    console.log("transcribing audio");
    console.log("audioUrl: ", audioUrl);
    
    // Inicializar el cliente de OpenAI
    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY_FOR_EMBEDDINGS,
    });
    
    // Hacer una solicitud fetch para el audio
    const response = await fetch(audioUrl);
    const audioBlob = await response.blob();
    const audioArrayBuffer = await audioBlob.arrayBuffer();
    
    // Obtener la duración del audio
    const durationInSeconds = await getAudioDuration(audioArrayBuffer);
    
    // Crear el archivo para la transcripción
    const file = new File([audioArrayBuffer], 'audio.ogg', { type: 'audio/ogg' });

    // Realizar la transcripción
    const transcription = await client.audio.transcriptions.create({
        model: "gpt-4o-transcribe",
        file: file,
        language: "es"
    });
    
    return { 
        text: transcription.text,
        durationInSeconds 
    };
}

