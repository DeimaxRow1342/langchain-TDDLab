import { Ollama } from "@langchain/community/llms/ollama";
import { BufferMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

const mistralConfig = {
    baseUrl: "http://localhost:11434",
    model: "mistral",
    temperature: 0.7
};

const chatModel = new Ollama(mistralConfig);

const chatPrompt = PromptTemplate.fromTemplate(`
Eres un asistente de TDD llamado "TDDHelper". Responde preguntas técnicas sobre Test-Driven Development.

Historial relevante:
{history}

Pregunta: {input}
Respuesta concisa:`);

const chatMemory = new BufferMemory({
    memoryKey: "history",
    returnMessages: true
});

const chatChain = new LLMChain({
    llm: chatModel,
    prompt: chatPrompt,
    memory: chatMemory
});

const retroModel = new Ollama({
    ...mistralConfig,
    temperature: 0.4  
});

const retroPrompt = PromptTemplate.fromTemplate(`
Analiza estos datos de commits y genera una retrospectiva técnica en markdown:

Datos:
{metrics}

Estructura requerida:
## 📊 Resumen Ejecutivo
## ✅ 3 Fortalezas Clave
## 📉 3 Áreas de Mejora
## 🚀 Recomendaciones Accionables

Usa emojis y sé técnico pero claro:`);

export async function generateRetrospective(metrics) {
    const chain = new LLMChain({
        llm: retroModel,
        prompt: retroPrompt
    });
    
    const response = await chain.call({ 
        metrics: JSON.stringify(metrics) 
    });
    return response.text;
}

export async function chat(input) {
    const response = await chatChain.call({ input });
    return response.text;
}

// Ejemplo de uso
/* 
generateRetrospective(commitMetrics).then(console.log);
chat("¿Cómo mejorar cobertura de tests?").then(console.log); 
*/