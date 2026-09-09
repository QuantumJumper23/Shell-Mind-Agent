import kleur from "kleur"
 import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
 import  {Read,Write,executes,Edit,Glob,toToolContent,AskUser} from "../tools/toolHandler" 
 import {rl} from "../utils/util_func"

 export async function Agentloop(client:any,model:string,messages:ChatCompletionMessageParam[],tools:any,counter:number)
 {

    while (true) {
      const response = await client.chat.completions.create({
        model: model,
        messages,
        tools: tools,
      });
      if (!response.choices || response.choices.length == 0) {
        throw new Error("no choices in response");
      }
      const choice = response.choices[0];
      const message = choice.message;

      messages.push(response.choices[0].message);
      const willInvokeFunction = response.choices[0].finish_reason == 'tool_calls';
      if (!willInvokeFunction) {
        console.log(response.choices[0].message.content)
        break;
      }

      const toolCalls = response.choices[0].message.tool_calls;
      if (toolCalls) {
        for (let toolcall of toolCalls) {
          const tool_id = toolcall.id;
          const toolName = toolcall.function.name
          const argument = toolcall.function.arguments;
          const obj = JSON.parse(argument);
          try {
            if (toolName == 'Read') {


              let content = await Read(obj.file_path);
              let mod_obj = {
                role: "tool",
                tool_call_id: tool_id,
                content: toToolContent(content)
              }
              messages.push(mod_obj);



            }
            else if (toolName == 'Write') {
              console.log("write calledddddddddddddd");
              await Write(obj.content, obj.file_path);
              let mod_obj = {
                role: "tool",
                tool_call_id: tool_id,
                content: "File written successfully"
              }
              messages.push(mod_obj)
            }
            else if (toolName == 'Bash') {
              console.log(obj);
              let content = await executes(obj.command);
              let mod_obj = {
                role: "tool",
                tool_call_id: tool_id,
                content: toToolContent(content)
              }
              messages.push(mod_obj);

            }
            else if (toolName == 'Edit') {
              let content = await Edit(obj.file_path, obj.old_string, obj.new_string, obj.replaceAll);
              messages.push({
                role: "tool",
                tool_call_id: tool_id,
                content: toToolContent(content)
              })

            }
            else if(toolName=='Glob')
            {
              let content=await Glob(obj.directory,obj.pattern);
              messages.push({
                role:"tool",
                tool_call_id:tool_id,
                content:toToolContent(content)
              })
            }
            else if(toolName=='AskUser')
            {
              let content=await AskUser(obj.question);
              
              messages.push({
                role:"tool",
                tool_call_id:tool_id,
                content:toToolContent(content)

              })
            }
          }
          catch (error) {
            messages.push({
              role: "tool",
              tool_call_id: toolcall.id,
              content: `Error: ${error}`
            });
          }
        }
      }
    
    counter++; //A Counter so that model don't fall into infinite loop 
    if(counter%10==0)
    {
      const user_input=await rl.question(kleur.red("The model Just performed 10 loop do you still want to continue ? (y/n)"));
      if(user_input.trim().toLowerCase()=='n')
      {
        rl.close();
        break;
      }
    }
    }

 


  }
