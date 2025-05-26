
// === THREADS CONFIGURATION ===

import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import cron from 'node-cron';

// === ENVIRONMENT SETUP ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === THREADS API CONFIG ===
const THREADS_USER_ID = '23931747676437236';
const ACCESS_TOKEN = `THAARUiyqfzCNBUVFQb1Vtb2pUX21ZAcHhTNmVOemwzLUxibEhzdVNFekVNYXhLWFo0X1lGWmpKNVRBV0ZA0T3ZA6cGVwdkR0R21UTjVyajZAaTVNCMm9nODdnR0ljVzJuZA3BMREJ5S0I5bk1RQ2tMSGJWNndfUThrVlJKVVF4T08tTGRIZAwZDZD`
// === TAGS ARRAY & ROTATION INDEX TRACKING ===
const tags = [
  "maid",
  "ass",
  "hentai",
  "milf",
  "oral",
  "paizuri",
  "ecchi",
  "ero"
];
const tagIndexFile = path.join(__dirname, 'tagIndex.json');

// === GET CURRENT TAG INDEX ===
async function getCurrentTagIndex() {
  try {
    const data = await fs.readFile(tagIndexFile, 'utf8');
    return JSON.parse(data).index || 0;
  } catch {
    return 0; // default if file missing or invalid
  }
}

// === SAVE NEXT TAG INDEX ===
async function saveNextTagIndex(index) {
  const nextIndex = (index + 1) % tags.length;
  await fs.writeFile(tagIndexFile, JSON.stringify({ index: nextIndex }));
}

// === DOWNLOAD IMAGE FROM WAIFU.IM ===
async function fetchImage(tag) {
  const apiUrl = `https://api.waifu.im/search?included_tags=${tag}&height=%3E%3D2000`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data || !data.images || data.images.length === 0) {
      throw new Error('No images found');
    }

    const imageUrl = data.images[0].url;
    const imageRes = await fetch(imageUrl);
    const buffer = await imageRes.arrayBuffer();

    const fileName = path.basename(new URL(imageUrl).pathname);
    const publicDir = path.join(__dirname, 'public');
    await fs.mkdir(publicDir, { recursive: true });

    const savePath = path.join(publicDir, fileName);
    await fs.writeFile(savePath, Buffer.from(buffer));

    console.log(`✅ Saved: ${savePath}`);
    return imageUrl; // return original HTTPS URL for Threads
  } catch (err) {
    console.error('❌ Error fetching image:', err.message);
    return null;
  }
}

// === POST IMAGE TO THREADS ===
async function postToThreads(imageUrl, tag) {
  const caption = ` #love 💫 #anime #art`;

  try {
    const createPostUrl = `https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads`;
    const postData = {
      media_type: "IMAGE",
      text: caption,
      image_url: imageUrl,
      access_token: ACCESS_TOKEN
    };

    const createRes = await axios.post(createPostUrl, postData);
    const creationId = createRes.data.id;

    if (!creationId) {
      console.error("⚠️ Failed to create media container.");
      return;
    }

    const publishUrl = `https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads_publish`;
    const publishRes = await axios.post(publishUrl, {
      creation_id: creationId,
      access_token: ACCESS_TOKEN
    });

    if (publishRes.status === 200) {
      console.log(`✅ Posted image to Threads: ${imageUrl}`);
    } else {
      console.error("❌ Failed to publish post:", publishRes.data);
    }
  } catch (err) {
    console.error("🚨 Threads API error:", err.message);
  }
}

// === MAIN FLOW ===
async function main() {
  const currentIndex = await getCurrentTagIndex();
  const currentTag = tags[currentIndex];

  console.log(`🔁 Current tag: ${currentTag}`);
  const imageUrl = await fetchImage(currentTag);

  if (imageUrl) {
    await postToThreads(imageUrl, currentTag);
    await saveNextTagIndex(currentIndex);
  }
}

// === CRON JOB: Every 2 hours ===
cron.schedule('0 */2 * * *', () => {
  console.log('🕑 Running scheduled Threads job...');
  main();
});

// Optional immediate run
main();
