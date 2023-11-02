// 1. Import required modules
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// 2. Export updatePinecone function
export const updatePinecone = async (client, indexName, nameSpace, docs, openAIApiKey) => {


  //console.log(indexName);
  console.log("Retrieving Pinecone index...");
  // 3. Retrieve Pinecone index
  const index = client.Index(indexName);

  // 4. Log the retrieved index name
  console.log(`Pinecone index retrieved: ${indexName}`);
  //console.log('DOCS --> ' + docs);
  // 5. Process each document in the docs array
  for (const doc of docs) {
    //if (doc.metadata && doc.metadata.source) {
    console.log(`Processing document: ${doc.metadata?.source}`);
    const txtPath = doc.metadata.source;
    const text = doc.pageContent;
    //const metaKey = doc.metaKey;
    // 6. Create RecursiveCharacterTextSplitter instance
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    //console.log("Splitting text into chunks...");
    // 7. Split text into chunks (documents)
    const chunks = await textSplitter.createDocuments([text]);
    console.log(`Text split into ${chunks.length} chunks`);
    console.log(
      `Calling OpenAI's Embedding endpoint documents with ${chunks.length} text chunks ...`
    );
    // 8. Create OpenAI embeddings for documents
    const embeddingsArrays = await new OpenAIEmbeddings({ openAIApiKey: openAIApiKey }).embedDocuments(
      chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
    );
    console.log("Finished embedding documents");
    console.log(
      `Creating ${chunks.length} vectors array with id, values, and metadata...`
    );
    // 9. Create and upsert vectors in batches of 100
    const batchSize = 100;
    let batch = [];
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      console.log(`ID-->${txtPath}_${idx}`);
      const vector = {
        id: `${txtPath}_${idx}`,
        values: embeddingsArrays[idx],
        metadata: {
          ...chunk.metadata,
          loc: JSON.stringify(chunk.metadata.loc),
          pageContent: chunk.pageContent,
          txtPath: txtPath,
        },
      };
      batch.push(vector);
      // When batch is full or it's the last item, upsert the vectors
      if (batch.length === batchSize || idx === chunks.length - 1) {
        const upsertRequest = { vectors: batch, namespace: nameSpace };
        await index.upsert({ upsertRequest });
        //const ns1 = index.namespace(nameSpace);
        //await ns1.upsert({
        //  upsertRequest: {
        //    vectors: batch,
        //  },
        //});

        // Empty the batch
        batch = [];
      }
    }
    // 10. Log the number of vectors updated
    console.log(`Pinecone index updated with ${chunks.length} vectors`);
    //return chunks;

    //} else {
    //  console.error(`Missing metadata or source for document: ${doc.metaKey}`);
    //}
  }
  return 'success';
};
