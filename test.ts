import { writeFileSync } from "fs";

const payload = `
I’ve been reassigned. War Priest Eschallus has returned, and not alone.
The Battlewagon is to be retrofitted for atmospheric work again - and our crusade is to be reignited.
No more piracy, no more crawling like rats under the floorboards: Eschallus has found a new Supreme Leader.
He claims his lineage from the War Priests of old, a line from Dukagesh.
His body markings corroborate: we have a genuine demigod walking amongst us.

Indeed, I no longer serve Eschallus. I have been asked to turn my magicks over to our leader’s new project.
He has in his possession a Witchlight Seed: one thought extinct for so many years after the end of the war.
More interesting still are his designs upon it: a path to smite all of elvenkind out of existence.
I, along with his other elite mages, know and are trusted with such secrets.

But I have been doing calculations, checking formulations and balances.
And despite it all, I cannot help but feel that I am missing s��
`.trim()

const alphabet = 'abcdefghijklmnopqrstuvwxyz'
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const output: string[] = [];

for (let i = 0; i < payload.length; i++) {
  const char = payload[i];
  if (alphabet.includes(char) && (i % 2)) {
    output[i] = alphabet[alphabet.length - alphabet.indexOf(char) - 1]
  } 
  else if (ALPHABET.includes(char) && (i % 2)) {
    output[i] = ALPHABET[ALPHABET.length - ALPHABET.indexOf(char) - 1]
  } else {
    output[i] = char
  }
}


writeFileSync('./output.txt', output.join(''))