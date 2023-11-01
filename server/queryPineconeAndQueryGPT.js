// 1. Import required modules
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";

// 2. Export the queryPineconeVectorStoreAndQueryLLM function
export const queryPineconeVectorStoreAndQueryLLM = async (
  client,
  indexName,
  nameSpace,
  question,
  openAIApiKey
) => {
  // 3. Start query process
  //console.log("Querying Pinecone vector store...");
  // 4. Retrieve the Pinecone index
  const index = client.Index(indexName);
  // 5. Create query embedding
  const queryEmbedding = await new OpenAIEmbeddings({ openAIApiKey: openAIApiKey }).embedQuery(question);
  //console.log('VEC>>>' + queryEmbedding + '---' + nameSpace + '--' + indexName + '---' + question);
  // 6. Query Pinecone index and return top 10 matches
  let queryResponse = await index.query({
    queryRequest: {
      topK: 10,
      vector: queryEmbedding,
      includeMetadata: true,
      includeValues: true,
      namespace: nameSpace
    }

  });
  // 7. Log the number of matches 
  //console.log(`Found ${queryResponse.matches.length} matches...`);
  //console.log(`Match ${JSON.stringify(queryResponse.matches)}`);
  // 8. Log the question being asked
  //console.log(`Asking question: ${question}...`);
  if (queryResponse.matches.length) {
    // 9. Create an OpenAI instance and load the QAStuffChain
    const llm = new OpenAI({ temperature: 0, modelName: "gpt-3.5-turbo", openAIApiKey: openAIApiKey });
    //const llm = new OpenAI({});
    const chain = loadQAStuffChain(llm);
    // 10. Extract and concatenate page content from matched documents
    const concatenatedPageContent = queryResponse.matches
      .map((match) => match.metadata.pageContent)
      .join(" ");
    // 11. Execute the chain with input documents and question
    const result = await chain.call({
      input_documents: [new Document({ pageContent: concatenatedPageContent })],
      question: question,

    });
    //await new Promise((resolve) => setTimeout(resolve, 80000));
    // 12. Log the answer
    //console.log(`Answer: ${JSON.stringify(result)}`);
    return result.text;
  } else {
    // 13. Log that there are no matches, so GPT-3 will not be queried
    console.error("Since there are no matches, GPT-3 will not be queried.");
  }
};
