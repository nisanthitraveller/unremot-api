import express from 'express';
import axios from 'axios';
import { PineconeClient } from "@pinecone-database/pinecone";
import User from '../models/user.js';
import APIProducts from '../models/api_products.js';
import { pipeline } from "stream";
import { promisify } from "util";
import { getJson } from 'serpapi';
import PDFDocument from 'pdfkit';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import fs from 'fs';
import { createWriteStream, promises as fsPromises } from "fs";
const streamPipeline = promisify(pipeline);

import * as dotenv from "dotenv";
import Category from '../models/category.js';
import { updatePinecone } from '../updatePinecone.js';
dotenv.config();

const router = express.Router();

router.post('/search-online/:api_key', async (req, res) => {
    const api_key = req.params.api_key;
    console.log(api_key);
    const APIDetails = await APIProducts.findOne({ where: { api_key: api_key } });
    const env = JSON.parse(APIDetails.env);
    console.log(env);

    const apiKey = env.SERP_API_KEY;

    const query = req.body.question;
    const serpApiData = await fetchFromSerpApi(query, apiKey);
    const jsonData = serpApiData.related_questions;


    const indexName = env.index;
    const nameSpace = req.body.session;

    const LOCAL_DIR = "./" + nameSpace.toString().replace('.', '-');
    await ensureDirectoryExists(LOCAL_DIR);

    jsonToPDF(jsonData, LOCAL_DIR + '/' + generateUniqueId(query) + `.pdf`);

    const client = new PineconeClient();
    await client.init({
        apiKey: env.PINECONE_API_KEY,
        environment: env.PINECONE_ENVIRONMENT,
    });

    const loader = new DirectoryLoader('./' + nameSpace, {
        ".pdf": (path) => new PDFLoader(path)
    })

    const docs = await loader.load();

    const index = client.Index(indexName);
    const openAIApiKey = env.OPENAI_API_KEY;
    const result = await updatePinecone(client, indexName, nameSpace, docs, openAIApiKey, true);
    deleteAllFilesInDir(LOCAL_DIR);
    //const result = await insertIntoPinecone(index, serpApiData, nameSpace);

    res.json({ message: 'Hello from server!', result: result });
});

async function fetchFromSerpApi(query, key) {
    /// a20ba6a57bc80f4c066ed4c2310f06e6829db130d2d746f6dca367fd66567e92
    const params = {
        api_key: key,
        q: query,
        engine: "google"
    };

    try {
        const data = await getJson(params);
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching data from SerpAPI:', error);
        throw error;
    }
}


function generateUniqueId(question) {
    // Create a unique ID using a combination of fields, or use an existing unique field
    return question.replace(/\s+/g, '_').toLowerCase() + "_" + Math.random().toString(36).slice(2, 11);
}

function jsonToPDF(jsonData, outputFilename) {
    // Create a document
    const doc = new PDFDocument();

    // Pipe its output somewhere, like to a file or HTTP response
    doc.pipe(fs.createWriteStream(outputFilename));

    // Add JSON data to the document
    doc.fontSize(12).text(JSON.stringify(jsonData, null, 2), {
        wrap: true
    });

    // Finalize the PDF and end the stream
    doc.end();
}

async function ensureDirectoryExists(dirPath) {
    try {
        //console.log(`Directory ${dirPath} exists.`);
        await fsPromises.access(dirPath);
    } catch (error) {
        // If directory does not exist, create it
        if (error.code === "ENOENT") {
            await fsPromises.mkdir(dirPath, { recursive: true });
            ///console.log(`Directory ${dirPath} created.`);
        } else {
            throw error;
        }
    }
}
async function deleteAllFilesInDir(dirPath) {
    try {
        const files = await fsPromises.readdir(dirPath);

        for (const file of files) {
            const filePath = `${dirPath}/${file}`;
            await fsPromises.unlink(filePath);
            //console.log(`Deleted file: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error deleting files in ${dirPath}:`, error);
    }
}
export default router;