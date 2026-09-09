let tools = [
    {
      "type": "function",
      "function": {
        "name": "Read",
        "description": "Read and return the content of a file",
        "parameters": {
          "type": "object",
          "properties": {
            "file_path": {
              "type": "string",
              "description": "the path to the file to read"
            }
          },
          "required": ["file_path"]
        },
      },


    },
    {
      "type": "function",
      "function": {
        "name": "Write",
        "description": "Write Content to a file",
        "parameters": {
          "type": "object",
          "required": ["file_path", "content"],
          "properties": {
            "file_path": {
              "type": "string",
              "description": "The path of the file to write to"
            },
            "content": {
              "type": "string",
              "description": "The content to write to the file"
            }


          }
        }
      }


    },
    {
      "type": "function",
      "function": {
        "name": "Bash",
        "description": "Execute a shell command. Use syntax appropriate for the user's operating system, as specified in the system message. Always use absolute paths when creating or modifying files. Do not rely on `cd` persisting between Bash calls",
        "parameters": {
          "type": "object",
          "required": ["command"],
          "properties": {
            "command": {
              "type": "string",
              "description": "The commands to execute"
            }
          }
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "Edit",
        "description": "Edit a word or old code snippet and replace with a new snippet and leave the rest of the file untouched ",
        "parameters": {
          "type": "object",
          "required": ["file_path", "old_string", "new_string", "replaceAll"],
          "properties": {
            "file_path": {
              "type": "string",
              "description": "The path of the file where you want to replace"
            },
            "old_string": {
              "type": "string",
              "description": "The old string which has to be replaced"
            },
            "new_string": {
              "type": "string",
              "description": "The new string which has to replace old string"
            },
            "replaceAll": {
              "type": "boolean",
              "description": "true=replace every occurence; false=replace only the first occurence"
            }

          }
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "Glob",
        "description": "return the list of matching file paths based on the pattern like **/*.py .pdf etc and also Prefer this tool over Bash for finding files by name or extension — faster and safer than shell commands like find or ls ",
        "parameters": {
          "type": "object",
          "required": ["pattern","directory"],
          "properties": {
            "directory": {
              "type": "string",
              "description": "which directory to search within"
            },
            "pattern": {
              "type": "string",
              "description": "the glob pattern string eg **/*.py "
            },
           
            },
            

          }
        }
      }
      ,
      {
        "type":"function",
        "function":{
          "name":"AskUser",
          "description":"Ask the user a clarifying quetion wehn uncertain about something risky,ambigous,or private before proceeding.Use this when a file looks sensitive/private, an action seems irreversible, or the request is ambiguous.",
          "parameters":{
            "type":"object",
            "required":["question"],
            "properties":{
              "question":{
                "type":"string",
                "description":"The question to ask the user"
              }
            }

          }
        }
      }
    


  ];
export {tools};