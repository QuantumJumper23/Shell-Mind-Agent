import OpenAI, { RateLimitError } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import kleur from "kleur"
import {tools} from "./tools/tools.ts"
import {rl} from "./utils/util_func.ts"
import {Agentloop} from "./core/agent.ts"



let messages:ChatCompletionMessageParam[];
const osName=process.platform==="win32"?"Windows":process.platform==="darwin"?"macOS"
:"Linux";
async function main() {
  const flag = process.argv[2];
  const prompt = process.argv[3]
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL ?? "anthropic/claude-haiku-4.5";
  const baseURL =process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
     messages= [
      {role:"system",
        content:`Your are running on ${osName}.Use ${osName === "Windows" ? "Windows Command Prompt (cmd.exe)" : "Unix shell (sh)"} syntax for any Bash tool calls — for example, use ${osName === "Windows" ? "'dir', 'del', 'copy', backslash paths like C:\\Users\\...'" : "'ls', 'rm', 'cp', forward-slash paths like /home/user/...'"}. After writing or modifying a file, read it back to confirm the content is correct before finishing.`
      },
      {
        role: "user", content: prompt }, { role: "system", content: "After writing or modifying a file, read it back to confirm the content is correct before finishing." }]
  let counter=0;
  console.log(kleur.red("model used"),model)
 
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  if (flag !== "-p" || !prompt) {
    throw new Error("error: -p flag is required");
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  while(true)
  {counter=0;
    await Agentloop(client,model,messages,tools,counter);
         const user_input=await rl.question("Ask Model again Or type 'exit' to exit the program-->");
    if(user_input=="exit") {rl.close();break};
    messages.push({role:"user",content:user_input});
    
  
  }
  


   

  };
main();


 

   




 /*if (!response.choices || response.choices.length === 0) {
      throw new Error("no choices in response");
    }
  
  
    console.error("Logs from your program will appear here!");
    
    if(response.choices[0].message.content!=null)
     console.log(response.choices[0].message.content);*/
   