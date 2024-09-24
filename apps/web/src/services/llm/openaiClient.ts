import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const ASSISTANT_ID = 'asst_Tybkst3To19f9KaAkhYWNfoo'; // Replace with your actual Assistant ID
let threadId: string | null = null; // Variable to store the thread ID

export async function getChatCompletion(messages: Array<{ role: string; content: string }>) {
  // Create a new thread only if it doesn't exist
  if (!threadId) {
    const thread = await openai.beta.threads.create();
    threadId = thread.id; // Store the thread ID
  }

  // Add user messages to the thread
  for (const message of messages.filter(m => m.role === 'user')) {
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message.content,
    });
  }

  // Run the Assistant
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID,
  });

  // Wait for the run to complete
  let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
  while (runStatus.status !== 'completed') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
  }

  // Retrieve the latest message from the Assistant
  const msgs = await openai.beta.threads.messages.list(threadId);
  const latestMessage = msgs.data
    .filter(m => m.role === 'assistant')
    .sort((a, b) => b.created_at - a.created_at)[0];

  return { role: 'assistant', content: latestMessage.content[0].text.value };
}
