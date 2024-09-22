import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncProvers() {
  try {
    // Read README.md
    const readmePath = path.join(__dirname, '..', '..', '..', 'README.md');
    const readme = await fs.readFile(readmePath, 'utf8');

    // Extract prover information
    const proverSection = readme.match(
      /## Current Proof Systems([\s\S]*?)(?=\n##|$)/
    )[1];
    const proverLines = proverSection.trim().split('\n').slice(2); // Skip header lines

    const provers = proverLines
      .filter(line => !line.trim().startsWith('<!--')) // Ignore markdown comments
      .map(line => {
        const [, name, inventor, status, type] = line.match(
          /\|\s*\d+\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/
        );
        return { name, inventor, status, type };
      });

    // Write to supportedProvers.json
    const outputPath = path.join(
      __dirname,
      '..',
      'public',
      'supportedProvers.json'
    );
    await fs.writeFile(outputPath, JSON.stringify(provers, null, 2));

    console.log('Supported provers synced successfully!');
  } catch (error) {
    console.error('Error syncing provers:', error);
  }
}

syncProvers();
