import { callWithRetry } from './callWithRetry.js';

let counter = 0;

// Simula una llamada a la API de Azure que falla 2 veces y luego funciona
async function fakeAzureCall(): Promise<string> {
  counter++;

  console.log(`fakeAzureCall - attempt ${counter}`);

  if (counter < 3) {
    const error = {
      statusCode: 500,
      message: 'Temporary Azure failure',
    };
    throw error;
  }

  return 'OK: transcription result';
}

async function run() {
  try {
    const result = await callWithRetry(fakeAzureCall, {
      maxAttempts: 3,
      baseDelayMs: 500, // para no esperar tanto en pruebas
      logger: console,
    });

    console.log('Final result:', result);
  } catch (err: any) {
    console.error('Final error:', err.message);
    console.error('Attempts detail:', err.attempts);
  }
}

run();
